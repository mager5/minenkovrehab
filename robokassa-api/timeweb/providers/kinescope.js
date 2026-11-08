const crypto=require('node:crypto');
const {parseCookies}=require('../../utils/cookies');
const {digest}=require('../auth');
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const uid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
function equal(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&crypto.timingSafeEqual(x,y);}
function createKinescope({secret,basicUser,basicPassword,issuer,ttl=120,strictAcknowledged=false},clock=()=>Date.now()){
 if(!/^[a-f\d]{64}$/.test(secret||'')||!basicUser||!basicPassword||!issuer||!Number.isInteger(ttl)||ttl<30||ttl>300||!strictAcknowledged)throw Error('kinescope_configuration_missing');
 const now=()=>Math.floor(clock()/1000);
 const sign=claims=>{const input=encode({alg:'HS256',typ:'JWT'})+'.'+encode(claims);return input+'.'+crypto.createHmac('sha256',Buffer.from(secret,'hex')).update(input).digest('base64url');};
 function verify(token){
  if(typeof token!=='string'||token.length>2048)throw Error('invalid');
  const [header,payload,signature,...extra]=token.split('.');if(extra.length||!header||!payload||!signature)throw Error('invalid');
  if(!equal(signature,crypto.createHmac('sha256',Buffer.from(secret,'hex')).update(header+'.'+payload).digest('base64url')))throw Error('invalid');
  const h=JSON.parse(Buffer.from(header,'base64url'));const c=JSON.parse(Buffer.from(payload,'base64url'));
  if(h.alg!=='HS256'||h.typ!=='JWT'||c.iss!==issuer||c.aud!=='kinescope-playback'||!Number.isInteger(c.exp)||!Number.isInteger(c.iat)||c.exp<=now()||c.iat>now()+5||c.exp-c.iat>ttl||!uid.test(c.video||'')||!uid.test(c.sub||'')||!/^[a-f\d]{64}$/.test(c.session||''))throw Error('invalid');
  return c;
 }
 return {
  async playback(providerId,{user,req}){
   if(!uid.test(providerId||''))throw Error('invalid_catalogue');
   const token=parseCookies(req.headers.cookie).mr_session;
   if(!/^[a-f\d]{64}$/.test(token||''))throw Error('missing_session');
   const issued=now();const jwt=sign({sub:user.id,video:providerId,session:digest(token),iss:issuer,aud:'kinescope-playback',iat:issued,exp:issued+ttl});
   return {provider:'kinescope',embedUrl:`https://kinescope.io/embed/${encodeURIComponent(providerId)}?drmauthtoken=${encodeURIComponent(jwt)}`,expiresAt:new Date((issued+ttl)*1000).toISOString()};
  },
  async authorize(pool,req,mode){
   const expected='Basic '+Buffer.from(basicUser+':'+basicPassword).toString('base64');
   if(!equal(req.get('authorization'),expected))return 403;
   let c;try{c=verify(req.body?.token);}catch{return 403;}
   if(req.body?.type!=='video'||req.body?.id!==c.video)return 403;
   const {rows}=await pool.query(`SELECT 1 FROM rehab.course_videos cv JOIN rehab.purchases p ON p.product_id=cv.product_id
    JOIN rehab.users u ON u.id=p.user_id JOIN rehab.sessions s ON s.user_id=u.id
    WHERE cv.provider_id=$1 AND cv.ready AND p.user_id=$2 AND p.status='active' AND (p.mode=$3 OR (p.mode IS NULL AND p.source='legacy migration'))
    AND (p.expires_at IS NULL OR p.expires_at>now()) AND s.token_hash=$4 AND s.revoked_at IS NULL AND s.expires_at>now()
    AND u.deleted_at IS NULL AND u.email_confirmed_at IS NOT NULL AND (u.banned_until IS NULL OR u.banned_until<=now()) LIMIT 1`,[c.video,c.sub,mode,c.session]);
   return rows.length?200:403;
  },
 };
}
module.exports={createKinescope};
