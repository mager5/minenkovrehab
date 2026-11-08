// Заявки с форм сайта: POST /api/leads (через сайт, с CSRF как у входа).
// Сохраняет заявку и ставит уведомления (почта, Telegram) в очередь worker; ответ — сразу после записи в базу.
// Защита от спама: скрытое поле website (honeypot) — молча «успех» без записи; не больше 3 заявок с одного IP за 10 минут.
const crypto = require('node:crypto');

const SOURCES = ['home', 'contacts', 'modal'];
const LIMIT = 3;
const WINDOW_MINUTES = 10;

const text = (v, max) => {
  if (typeof v !== 'string') return null;
  const t = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  return t ? t.slice(0, max) : null;
};

/** +7XXXXXXXXXX из «+7 (999) 123-45-67», «8 999 …», «9991234567». */
function normalisePhone(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length === 11 && (d[0] === '7' || d[0] === '8')) return `+7${d.slice(1)}`;
  if (d.length === 10 && d[0] === '9') return `+7${d}`;
  return null;
}

function createLeadHandler(pool, { salt }) {
  return async (req, res, next) => {
    try {
      const body = req.body || {};
      // Honeypot: людям поле не видно; заполнил — значит бот. Отвечаем как обычно, ничего не сохраняем.
      if (typeof body.website === 'string' && body.website.trim()) return res.json({ success: true });

      const errors = {};
      const name = text(body.name, 100);
      const phone = normalisePhone(body.phone);
      const source = SOURCES.includes(body.source) ? body.source : null;
      if (!name || name.length < 2) errors.name = 'Введите имя';
      if (!phone) errors.phone = 'Введите номер полностью';
      if (body.consent !== true) errors.consent = 'Нужно согласие на обработку персональных данных';
      if (!source) return res.sendStatus(400);
      if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });

      const service = text(body.service, 200);
      const message = text(body.message, 2000);
      const pageRaw = text(body.page, 300);
      const page = pageRaw && pageRaw.startsWith('/') && !pageRaw.startsWith('//') ? pageRaw : null;
      const site = req.get('x-lead-site') === 'test' ? 'test' : 'prod';
      const ip = String(req.get('x-lead-client-ip') || req.ip || '').slice(0, 64);
      const ipHash = crypto.createHash('sha256').update(`${salt}:lead:${ip}`).digest('hex');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Один IP — по очереди, чтобы параллельные запросы не обошли лимит.
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [ipHash]);
        const { rows: [recent] } = await client.query(
          `SELECT count(*)::int n FROM rehab.leads WHERE ip_hash = $1 AND created_at > now() - $2 * interval '1 minute'`,
          [ipHash, WINDOW_MINUTES]
        );
        if (recent.n >= LIMIT) {
          await client.query('ROLLBACK');
          res.set('Retry-After', String(WINDOW_MINUTES * 60));
          return res.status(429).json({
            success: false,
            error: 'Слишком много заявок подряд. Попробуйте через несколько минут или позвоните.',
          });
        }
        const { rows: [lead] } = await client.query(
          `INSERT INTO rehab.leads (source, site, name, phone, service, message, page, ip_hash)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [source, site, name, phone, service, message, page, ipHash]
        );
        await client.query(
          `INSERT INTO rehab.lead_outbox (lead_id, channel) VALUES ($1,'mail'), ($1,'telegram')`,
          [lead.id]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { createLeadHandler, normalisePhone };
