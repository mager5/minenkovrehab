const crypto = require('node:crypto');
const { parseCookies } = require('../utils/cookies');

async function sessionUser(pool, req) {
  let token;
  try { token = parseCookies(req.headers.cookie).mr_session; } catch (_error) { return null; }
  if (!token || !/^[a-f\d]{64}$/.test(token)) return null;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const { rows: [user] } = await pool.query(`SELECT u.id, u.email, p.full_name FROM rehab.sessions s
    JOIN rehab.users u ON u.id = s.user_id LEFT JOIN rehab.profiles p ON p.id=u.id WHERE s.token_hash = $1
    AND u.email_confirmed_at IS NOT NULL AND s.revoked_at IS NULL AND s.expires_at > now() AND u.deleted_at IS NULL
    AND (u.banned_until IS NULL OR u.banned_until <= now())`, [hash]);
  return user || null;
}

async function accessibleVideo(pool, userId, productSlug, lessonKey, mode) {
  const { rows: [video] } = await pool.query(`SELECT cv.video_id, cv.provider_id, cv.ready
    FROM rehab.course_videos cv JOIN rehab.products p ON p.id = cv.product_id
    WHERE p.slug = $1 AND cv.lesson_key = $2 AND EXISTS (
      SELECT 1 FROM rehab.purchases buy JOIN rehab.users u ON u.id = buy.user_id
      WHERE buy.user_id = $3 AND buy.product_id = p.id AND buy.status = 'active'
      AND (buy.mode = $4 OR (buy.mode IS NULL AND buy.source='legacy migration')) AND (buy.expires_at IS NULL OR buy.expires_at > now())
      AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until <= now())
    )`, [productSlug, lessonKey, userId, mode]);
  return video || null;
}

module.exports = { sessionUser, accessibleVideo };
