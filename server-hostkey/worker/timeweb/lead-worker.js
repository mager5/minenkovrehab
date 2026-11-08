// Уведомления о заявках с сайта (rehab.lead_outbox): почта и Telegram.
// Почта — на MIGRATION_LEADS_NOTIFY_EMAIL (если не задан — MIGRATION_ADMIN_NOTIFY_EMAIL, сейчас info@minenkovrehab.ru).
// Telegram — бот MIGRATION_LEADS_TELEGRAM_TOKEN в чат MIGRATION_LEADS_TELEGRAM_CHAT_ID; без них канал пропускается (skipped).
// Сбой доставки: повтор с паузой (delivery.failed), в лог — только код ошибки, без данных заявки.
const { failed } = require('./delivery');
const { DeliveryError } = require('./providers/templates');
const ADDRESS = /^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[^\s@<>]{2,24}$/;

function leadConfig(env) {
  const mail = [env.MIGRATION_LEADS_NOTIFY_EMAIL, env.MIGRATION_ADMIN_NOTIFY_EMAIL]
    .map(v => String(v || '').trim())
    .find(v => ADDRESS.test(v)) || null;
  const token = String(env.MIGRATION_LEADS_TELEGRAM_TOKEN || '').trim();
  const chat = String(env.MIGRATION_LEADS_TELEGRAM_CHAT_ID || '').trim();
  const telegram = /^\d{5,15}:[A-Za-z0-9_-]{30,60}$/.test(token) && /^-?\d{3,20}$/.test(chat) ? { token, chat } : null;
  return { mail, telegram };
}

const SOURCE = { home: 'форма на главной', contacts: 'страница «Контакты»', modal: 'окно «Записаться»' };

function telegramText(lead) {
  const one = v => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim();
  const test = lead.site === 'test' ? '[ТЕСТ new] ' : '';
  const when = new Date(lead.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  return [
    `${test}Заявка с сайта`,
    `Имя: ${one(lead.name)}`,
    `Телефон: ${one(lead.phone)}`,
    lead.service ? `Услуга: ${one(lead.service)}` : null,
    lead.message ? `Сообщение: ${String(lead.message).trim()}` : null,
    `Откуда: ${SOURCE[lead.source] || one(lead.source)}${lead.page ? ` (${one(lead.page)})` : ''}`,
    `Время: ${when} МСК`,
  ].filter(Boolean).join('\n').slice(0, 4000);
}

async function sendTelegram({ token, chat }, lead, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: telegramText(lead), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new DeliveryError('telegram_unreachable', { retryable: true, retryAfter: 60 });
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    if (response.status === 429) throw new DeliveryError('telegram_rate_limited', { retryable: true, retryAfter: Number(payload?.parameters?.retry_after) || 60 });
    // 400/401/403 — неверный токен или чат: повторять бессмысленно.
    throw new DeliveryError('telegram_rejected', { retryable: response.status >= 500 });
  }
  return { messageId: String(payload.result?.message_id || '') || null };
}

async function deliverLead(pool, sender, config, fetchImpl) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [job] } = await client.query(`SELECT o.*, l.source, l.site, l.name, l.phone, l.service, l.message, l.page, l.created_at AS lead_created_at
      FROM rehab.lead_outbox o JOIN rehab.leads l ON l.id = o.lead_id
      WHERE o.status = 'pending' AND o.available_at <= now()
      ORDER BY o.created_at, o.id FOR UPDATE OF o SKIP LOCKED LIMIT 1`);
    if (!job) { await client.query('COMMIT'); return false; }
    const lead = { ...job, created_at: job.lead_created_at };
    const target = job.channel === 'mail' ? config.mail : config.telegram;
    if (!target) {
      await client.query("UPDATE rehab.lead_outbox SET status='skipped', last_error='not_configured' WHERE id=$1", [job.id]);
      await client.query('COMMIT');
      return true;
    }
    let receipt;
    try {
      receipt = job.channel === 'mail'
        ? await sender.send({
            idempotencyKey: job.id, to: target, kind: 'lead',
            lead: { source: lead.source, site: lead.site, name: lead.name, phone: lead.phone, service: lead.service,
              message: lead.message, page: lead.page, createdAt: lead.created_at },
          })
        : await sendTelegram(target, lead, fetchImpl);
    } catch (error) {
      console.error(`lead_${job.channel}_delivery_failed ${error?.code || 'unknown'}`);
      await failed(client, 'lead_outbox', job, error);
      await client.query('COMMIT');
      return false;
    }
    await client.query(
      "UPDATE rehab.lead_outbox SET status='sent', attempts=attempts+1, sent_at=now(), last_error=NULL, provider_message_id=$2 WHERE id=$1",
      [job.id, receipt?.messageId || null]
    );
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { deliverLead, leadConfig, telegramText };
