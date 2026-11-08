const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const express = require('express');
const { parseCookies } = require('../utils/cookies');
const { sessionUser } = require('./access');

const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const random = () => crypto.randomBytes(32).toString('hex');
function cookie(req, name) {
  try { return parseCookies(req.headers.cookie)[name] || ''; } catch { return ''; }
}
function options(config, seconds) {
  return { httpOnly: true, secure: new URL(config.siteOrigin).protocol === 'https:',
    sameSite: 'lax', path: '/', maxAge: seconds * 1000 };
}
function supportedHash(hash) { return typeof hash === 'string' && /^\$2[aby]\$(0[4-9]|1[0-6])\$[./A-Za-z0-9]{53}$/.test(hash); }
async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || Buffer.byteLength(password) > 72 || !supportedHash(hash)) return false;
  return bcrypt.compare(password, hash.replace(/^\$2y\$/, '$2b$'));
}
function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password) <= 72 &&
    /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}
function seal(token, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(b => b.toString('hex')).join('.');
}
function unseal(value, key) {
  const [iv, tag, ciphertext] = value.split('.').map(v => Buffer.from(v, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
async function limited(pool, key, maximum, windowSeconds) {
  const { rows: [row] } = await pool.query(`INSERT INTO rehab.auth_limits VALUES ($1, 1, now() + $2 * interval '1 second')
    ON CONFLICT (key_hash) DO UPDATE SET
      attempts = CASE WHEN rehab.auth_limits.reset_at <= now() THEN 1 ELSE rehab.auth_limits.attempts + 1 END,
      reset_at = CASE WHEN rehab.auth_limits.reset_at <= now() THEN EXCLUDED.reset_at ELSE rehab.auth_limits.reset_at END
    RETURNING attempts`, [digest(key), windowSeconds]);
  return row.attempts > maximum;
}
function csrfGuard(pool, config) {
  return async (req, res, next) => {
    try {
      const token = req.get('x-csrf-token');
      if (req.get('origin') !== config.siteOrigin || !token || !/^[a-f\d]{64}$/.test(token) ||
          cookie(req, 'mr_csrf') !== token || req.get('sec-fetch-site') === 'cross-site') return res.sendStatus(403);
      const session = cookie(req, 'mr_session');
      const { rows } = await pool.query(`SELECT 1 FROM rehab.csrf_challenges WHERE token_hash=$1
        AND session_hash IS NOT DISTINCT FROM $2 AND expires_at > now()`, [digest(token), session ? digest(session) : null]);
      if (!rows.length) return res.sendStatus(403);
      next();
    } catch (error) { next(error); }
  };
}
function createAuth(pool, config) {
  if (!config.siteOrigin || !/^[a-f\d]{64}$/.test(config.resetKey || '')) throw new Error('Explicit auth configuration required');
  const router = express.Router();
  const guard = csrfGuard(pool, config);
  const ttl = config.sessionSeconds || 86400;
  const resetTtl = config.resetSeconds || 1800;
  const windowSeconds = config.loginWindowSeconds || 900;
  // Constant work for unknown accounts; generated locally, never a real credential.
  const dummy = bcrypt.hashSync(random(), 10);
  const safe = handler => async (req, res, next) => { try { await handler(req, res); } catch (error) { next(error); } };
  router.get('/csrf', safe(async (req, res) => {
    if (req.get('origin') && req.get('origin') !== config.siteOrigin) return res.sendStatus(403);
    const token = random(), session = cookie(req, 'mr_session');
    await pool.query('INSERT INTO rehab.csrf_challenges VALUES ($1,$2,now()+interval \'1 hour\')', [digest(token), session ? digest(session) : null]);
    res.cookie('mr_csrf', token, options(config, 3600));
    res.json({ success: true, data: { csrfToken: token } });
  }));
  router.post('/signin', guard, safe(async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 254) : '';
    if (await limited(pool, `login:ip:${req.ip}`, config.ipLimit || 30, windowSeconds) ||
        await limited(pool, `login:email:${email}`, config.loginLimit || 5, windowSeconds)) {
      res.set('Retry-After', String(windowSeconds)); return res.status(429).json({ success: false, error: 'Слишком много попыток. Попробуйте позже.' });
    }
    const { rows } = await pool.query(`SELECT u.id,c.password_hash FROM rehab.users u JOIN rehab.credentials c ON c.user_id=u.id
      WHERE lower(u.email)=$1 AND c.algorithm='bcrypt'`, [email]);
    const hash = rows.length === 1 ? rows[0].password_hash : dummy;
    const correct = await verifyPassword(req.body.password, hash);
    if (!correct || rows.length !== 1) return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [user] } = await client.query(`SELECT u.id,c.password_hash FROM rehab.users u JOIN rehab.credentials c ON c.user_id=u.id
        WHERE u.id=$1 AND u.email_confirmed_at IS NOT NULL AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until <= now()) FOR UPDATE OF u`, [rows[0].id]);
      if (!user || user.password_hash !== hash) {
        await client.query('ROLLBACK'); return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
      }
      const token = random();
      await client.query(`INSERT INTO rehab.sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+$3*interval '1 second')`, [digest(token),user.id,ttl]);
      const old = cookie(req,'mr_session');
      if (old) await client.query('UPDATE rehab.sessions SET revoked_at=now() WHERE token_hash=$1', [digest(old)]);
      await client.query('COMMIT');
      res.cookie('mr_session', token, options(config,ttl));
      res.clearCookie('mr_csrf', options(config,0));
      res.json({ success: true });
    } catch(error) { await client.query('ROLLBACK').catch(()=>{}); throw error; }
    finally { client.release(); }
  }));
  router.get('/me', safe(async (req,res) => {
    const user = await sessionUser(pool, req);
    if (!user) return res.status(401).json({ success: false, data: { user: null } });
    res.json({success: true, data: {user}});
  }));
  router.post('/logout', guard, safe(async(req,res)=>{
    await pool.query('UPDATE rehab.sessions SET revoked_at=now() WHERE token_hash=$1',[digest(cookie(req,'mr_session'))]);
    res.clearCookie('mr_session',options(config,0)); res.clearCookie('mr_csrf',options(config,0));
    res.json({success:true});
  }));
  router.get('/purchases', safe(async(req,res)=>{
    const user=await sessionUser(pool,req); if(!user) return res.sendStatus(401);
    const {rows}=await pool.query(`SELECT b.id,b.product_id,b.status,p.slug,
      jsonb_build_object('title',p.title,'description',p.description) products
      FROM rehab.purchases b JOIN rehab.products p ON p.id=b.product_id
      WHERE b.user_id=$1 AND b.status='active' AND (b.mode=$2 OR (b.mode IS NULL AND b.source='legacy migration')) AND (b.expires_at IS NULL OR b.expires_at>now())`,[user.id,config.mode]);
    res.json({success:true,data:{purchases:rows}});
  }));
  router.post('/forgot-password',guard,safe(async(req,res)=>{
    const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase().slice(0,254):'';
    if(await limited(pool,`reset:ip:${req.ip}`,10,900)||await limited(pool,`reset:email:${email}`,3,900)) return res.sendStatus(429);
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      const {rows}=await client.query(`SELECT id FROM rehab.users WHERE lower(email)=$1 AND deleted_at IS NULL
        AND (banned_until IS NULL OR banned_until<=now()) FOR UPDATE`,[email]);
      if(rows.length===1) {
        const token=random(), hash=digest(token);
        await client.query('UPDATE rehab.password_resets SET used_at=now() WHERE user_id=$1 AND used_at IS NULL',[rows[0].id]);
        await client.query(`INSERT INTO rehab.password_resets VALUES ($1,$2,now()+$3*interval '1 second',NULL)`,[hash,rows[0].id,resetTtl]);
        await client.query('INSERT INTO rehab.auth_mail_outbox (recipient,reset_hash,ciphertext) VALUES ($1,$2,$3)',[email,hash,seal(token,config.resetKey)]);
      }
      await client.query('COMMIT');
    } catch(error) { await client.query('ROLLBACK').catch(()=>{}); throw error; } finally{client.release();}
    res.json({success:true,message:'Если аккаунт существует, инструкция поставлена в очередь.'});
  }));
  router.post('/request-confirmation',guard,safe(async(req,res)=>{
    const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase().slice(0,254):'';
    if(await limited(pool,`confirmation:ip:${req.ip}`,10,900)||await limited(pool,`confirmation:email:${email}`,3,900))return res.sendStatus(429);
    const client=await pool.connect();
    try{
      await client.query('BEGIN');
      const {rows}=await client.query("SELECT id FROM rehab.users WHERE lower(email)=$1 AND email_confirmed_at IS NULL AND deleted_at IS NULL AND (banned_until IS NULL OR banned_until<=now()) FOR UPDATE",[email]);
      if(rows.length===1){
        const token=random(),hash=digest(token);
        await client.query('UPDATE rehab.email_confirmations SET used_at=now() WHERE user_id=$1 AND used_at IS NULL',[rows[0].id]);
        await client.query("INSERT INTO rehab.email_confirmations VALUES($1,$2,now()+interval '30 minutes',NULL)",[hash,rows[0].id]);
        await client.query('INSERT INTO rehab.confirmation_mail_outbox(recipient,confirmation_hash,ciphertext) VALUES($1,$2,$3)',[email,hash,seal(token,config.resetKey)]);
      }
      await client.query('COMMIT');
    }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
    res.json({success:true});
  }));
  router.post('/confirm-email',guard,safe(async(req,res)=>{
    if(await limited(pool,`confirmation-consume:${req.ip}`,20,900))return res.sendStatus(429);
    if(typeof req.body.token!=='string'||!/^[a-f\d]{64}$/.test(req.body.token))return res.sendStatus(400);
    const client=await pool.connect();
    try{
      await client.query('BEGIN');
      const {rows:[candidate]}=await client.query('SELECT user_id FROM rehab.email_confirmations WHERE token_hash=$1',[digest(req.body.token)]);
      if(!candidate){await client.query('ROLLBACK');return res.sendStatus(400);}
      const {rows:[user]}=await client.query('SELECT id FROM rehab.users WHERE id=$1 AND deleted_at IS NULL AND (banned_until IS NULL OR banned_until<=now()) FOR UPDATE',[candidate.user_id]);
      const {rows:[confirmation]}=await client.query('SELECT user_id FROM rehab.email_confirmations WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE',[digest(req.body.token)]);
      if(!user||!confirmation){await client.query('ROLLBACK');return res.sendStatus(400);}
      await client.query('UPDATE rehab.users SET email_confirmed_at=COALESCE(email_confirmed_at,now()) WHERE id=$1',[user.id]);
      await client.query('UPDATE rehab.email_confirmations SET used_at=now() WHERE user_id=$1 AND used_at IS NULL',[user.id]);
      await client.query('COMMIT');res.json({success:true});
    }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
  }));
  router.post('/reset-password',guard,safe(async(req,res)=>{
    if(await limited(pool,`reset-consume:ip:${req.ip}`,20,900)) return res.sendStatus(429);
    const {token,password}=req.body;
    if(typeof token!=='string'||!/^[a-f\d]{64}$/.test(token)||!validPassword(password)) return res.sendStatus(400);
    const hash=digest(token), passwordHash=await bcrypt.hash(password,12);
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      const {rows:[candidate]}=await client.query('SELECT user_id FROM rehab.password_resets WHERE token_hash=$1',[hash]);
      if(!candidate) {await client.query('ROLLBACK');return res.sendStatus(400);}
      const {rows:[user]}=await client.query(`SELECT id FROM rehab.users WHERE id=$1 AND deleted_at IS NULL
        AND (banned_until IS NULL OR banned_until<=now()) FOR UPDATE`,[candidate.user_id]);
      const {rows:[reset]}=await client.query(`SELECT user_id FROM rehab.password_resets WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE`,[hash]);
      if(!user||!reset) {await client.query('ROLLBACK');return res.sendStatus(400);}
      await client.query(`INSERT INTO rehab.credentials VALUES ($1,$2,'bcrypt') ON CONFLICT(user_id) DO UPDATE SET password_hash=EXCLUDED.password_hash,algorithm='bcrypt'`,[user.id,passwordHash]);
      await client.query('UPDATE rehab.password_resets SET used_at=now() WHERE user_id=$1 AND used_at IS NULL',[user.id]);
      await client.query('UPDATE rehab.sessions SET revoked_at=now() WHERE user_id=$1',[user.id]);
      await client.query('COMMIT');
      res.clearCookie('mr_session',options(config,0));res.clearCookie('mr_csrf',options(config,0));res.json({success:true});
    } catch(error) {await client.query('ROLLBACK').catch(()=>{});throw error;} finally{client.release();}
  }));
  return { router, guard };
}
module.exports={createAuth,csrfGuard,verifyPassword,validPassword,supportedHash,digest,unseal};
