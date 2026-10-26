const express = require('express');
const { PaymentError, processResult, createOrder } = require('./payments');
const { sessionUser, accessibleVideo } = require('./access');
const { createAuth } = require('./auth');
const { buildPaymentUrl } = require('./robokassa-url');

function createApp({ pool, paymentConfig, videoProvider = null, authPool = pool, authConfig = null }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use((_req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });
  if (authConfig) {
    const auth = createAuth(authPool, { ...authConfig, mode: paymentConfig.mode });
    app.use('/api/auth', auth.router);
    const checkout = async (req,res,next) => {
      try {
        // Покупка без входа: заказ на email гостя; после оплаты аккаунт с этим email находится или создаётся сам.
        const user = await sessionUser(pool,req);
        const guestEmail = typeof req.body.email==='string' ? req.body.email.trim().toLowerCase() : '';
        if(!user && (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(guestEmail) || guestEmail.length>254)) return res.status(400).json({success:false,error:'Укажите email, на который отправить доступ.'});
        const buyer = user ? {email:user.email,id:user.id} : {email:guestEmail,id:null};
        if(req.body.agreement !== true) return res.status(400).json({success:false,error:'Подтвердите согласие с условиями.'});
        let slug = req.body.productSlug || req.body.productId;
        if(slug === 'formula-movement') {
          if(![1,2,3,4].includes(Number(req.body.level))) return res.sendStatus(400);
          slug=`formula-movement-level-${Number(req.body.level)}`;
        }
        if(typeof slug!=='string'||! /^[a-z0-9-]{1,100}$/.test(slug)) return res.sendStatus(400);
        const client = await pool.connect();
        let order;
        try {
          await client.query('BEGIN');
          order = await createOrder(client,{productSlug:slug,buyerEmail:buyer.email,userId:buyer.id,mode:paymentConfig.mode});
          await client.query('UPDATE rehab.orders SET terms_version=$2 WHERE id=$1',[order.id,'2026-10-10']);
          await client.query('COMMIT');
        } catch(error) {
          await client.query('ROLLBACK').catch(()=>{});
          throw error;
        } finally { client.release(); }
        // Robokassa link is built only from the stored order; without merchant config the order stays pending locally.
        const url=paymentConfig.robokassa?buildPaymentUrl(paymentConfig.robokassa,order,slug):`/payment/success?InvId=${order.invoice_id}`;
        res.json({success:true,data:{invoiceId:order.invoice_id,amount:order.amount,productSlug:slug,paymentUrl:url,status:'pending'}});
      } catch(error){ if(error instanceof PaymentError)return res.status(error.status).json({success:false,error:error.code});next(error); }
    };
    app.post('/api/checkout',auth.guard,checkout);
    app.post('/api/robokassa/generate-payment-url',auth.guard,checkout);
  }
  const result = async (req, res) => {
    try {
      const paid = await processResult(pool, req.method === 'POST' ? req.body : req.query, paymentConfig);
      res.type('text/plain').send(`OK${paid.invoiceId}`);
    } catch (error) {
      // No raw body/signature/account logging and no Supabase fallback.
      res.status(error instanceof PaymentError ? error.status : 503)
        .type('text/plain').send(error instanceof PaymentError ? error.code : 'payment_storage_unavailable');
    }
  };
  app.get('/api/robokassa/result', result);
  app.post('/api/robokassa/result', result);
  // Browser redirects cannot grant access or mutate an account.
  app.all('/api/robokassa/complete-personal-program', (_req, res) => res.sendStatus(410));

  app.get('/api/robokassa/orders/:invoice/status', async (req, res, next) => {
    try {
      const user = await sessionUser(pool, req);
      if (!user) return res.sendStatus(401);
      if (!/^[1-9]\d{0,18}$/.test(req.params.invoice) || BigInt(req.params.invoice) > 9223372036854775807n) {
        return res.sendStatus(400);
      }
      const { rows: [order] } = await pool.query(`SELECT status FROM rehab.orders
        WHERE invoice_id = $1 AND user_id = $2 AND mode = $3`,
      [req.params.invoice, user.id, paymentConfig.mode]);
      if (!order) return res.sendStatus(404);
      res.json({ success: true, data: { status: order.status } });
    } catch (error) { next(error); }
  });

  const video = (product, lesson) => async (req, res, next) => {
    try {
      const user = await sessionUser(pool, req);
      if (!user) return res.sendStatus(401);
      const grant = await accessibleVideo(pool, user.id, product(req), lesson(req), paymentConfig.mode);
      if (!grant) return res.sendStatus(403);
      if (!grant.ready || !grant.provider_id || !videoProvider) return res.sendStatus(503);
      // Provider IDs come from the trusted catalogue, never a requested URL/path.
      const playback = await videoProvider.playback(grant.provider_id,{user,req});
      res.json({ success: true, data: playback });
    } catch (error) { next(error); }
  };
  app.get('/api/courses/:slug/videos/:lesson', video(r => r.params.slug, r => r.params.lesson));
  app.get('/api/courses/meniscus/stage-video', video(() => 'personal-program', r => `stage-${r.query.stage}`));
  app.get('/api/courses/meniscus/weekly-test', video(() => 'personal-program', () => 'weekly-test'));
  app.get('/api/courses/:slug/access',async(req,res,next)=>{
    try{
      const user=await sessionUser(pool,req);if(!user)return res.sendStatus(401);
      const slug=req.params.slug==='meniscus-resection-rehab'?'personal-program':req.params.slug;
      const {rows}=await pool.query(`SELECT 1 FROM rehab.purchases b JOIN rehab.products p ON p.id=b.product_id
        WHERE b.user_id=$1 AND p.slug=$2 AND b.status='active' AND (b.mode=$3 OR (b.mode IS NULL AND b.source='legacy migration'))
        AND (b.expires_at IS NULL OR b.expires_at>now()) LIMIT 1`,[user.id,slug,paymentConfig.mode]);
      if(!rows.length)return res.sendStatus(403);res.json({success:true});
    }catch(error){next(error);}
  });
  app.post('/api/kinescope/authorize',async(req,res,next)=>{
    try{if(!videoProvider?.authorize)return res.sendStatus(503);res.sendStatus(await videoProvider.authorize(pool,req,paymentConfig.mode));}catch(error){next(error);}
  });
  app.get('/health/live',(_req,res)=>res.json({ok:true}));
  app.get('/health/ready',async(_req,res)=>{try{await pool.query('SELECT 1 FROM rehab.course_videos LIMIT 1');const {rows:[schema]}=await pool.query("SELECT to_regclass('rehab.confirmation_mail_outbox') confirmations,to_regclass('rehab.worker_heartbeat') heartbeat");if(!schema.confirmations||!schema.heartbeat)throw Error('schema_incomplete');if(authConfig)await authPool.query('SELECT 1 FROM rehab.csrf_challenges LIMIT 1');res.json({ok:true});}catch{res.sendStatus(503);}});
  // Raw legacy HLS paths are deliberately not a provider-access bypass.
  app.all('/api/courses/meniscus/hls/*', (_req, res) => res.sendStatus(410));
  app.use((_req, res) => res.sendStatus(404));
  app.use((_error, _req, res, _next) => res.sendStatus(503));
  return app;
}

module.exports = { createApp };
