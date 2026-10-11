function loadConfig(env) {
  if(!['local','staging','private'].includes(env.MIGRATION_ENV)) throw new Error('Explicit local, staging or private configuration required');
  const parse=value=>{try{return new URL(value||'');}catch{throw new Error('Missing or invalid isolated configuration');}};
  const site = parse(env.MIGRATION_SITE_ORIGIN);
  if(site.origin!==env.MIGRATION_SITE_ORIGIN||site.username||site.password||/minenkovrehab\.(ru|github\.io)$|supabase\./i.test(site.hostname)) throw new Error('Invalid isolated site origin');
  if(!['http:','https:'].includes(site.protocol)||env.MIGRATION_ENV==='local'&&!['127.0.0.1','localhost','[::1]'].includes(site.hostname))throw new Error('Dedicated local site required');
  if(env.MIGRATION_ENV!=='local'&&site.protocol!=='https:')throw new Error('Remote site requires HTTPS');
  const database=parse(env.MIGRATION_DATABASE_URL);
  if(!['postgres:','postgresql:'].includes(database.protocol))throw new Error('Invalid database configuration');
  if(env.MIGRATION_ENV==='local'&&(!['127.0.0.1','localhost','[::1]'].includes(database.hostname)||database.pathname!=='/rehab_stage1_test'))throw new Error('Dedicated local test database required');
  if(env.MIGRATION_ENV==='staging'&&(database.pathname!=='/rehab_staging'||database.username!=='rehab_payment'||/supabase/i.test(database.hostname)||env.MIGRATION_STAGING_CONFIRM!=='synthetic-rehab-staging'))throw new Error('Separate synthetic staging database required');
  let ssl=false;
  if(env.MIGRATION_ENV==='private'&&(database.hostname!=='192.168.10.4'||database.port!=='5432'||database.pathname!=='/default_db'||database.username!=='gen_user'||database.search||env.MIGRATION_PG_TLS!=='disabled-private'||env.MIGRATION_PRIVATE_CONFIRM!=='Friendly-Halimede-default_db-gen_user'))throw new Error('Explicit pinned private database required');
  if(env.MIGRATION_ENV==='staging') {
    if(env.MIGRATION_PG_TLS!=='verify-full'||!env.MIGRATION_PG_CA?.includes('-----BEGIN CERTIFICATE-----')||database.search)throw new Error('Verified staging TLS and CA required; URL SSL overrides forbidden');
    ssl={rejectUnauthorized:true,ca:env.MIGRATION_PG_CA,
      checkServerIdentity:(_hostname,certificate)=>require('node:tls').checkServerIdentity(database.hostname,certificate)};
  }
  let authDatabaseUrl=database.toString();
  if(env.MIGRATION_AUTH_DATABASE_URL) {
    const auth=parse(env.MIGRATION_AUTH_DATABASE_URL);
    if(['protocol','hostname','port','pathname'].some(k=>auth[k]!==database[k]))throw new Error('Auth role must use the same isolated database');
    if(env.MIGRATION_ENV==='staging'&&(auth.username!=='rehab_auth'||auth.search))throw new Error('Restricted auth role without SSL overrides required');
    if(env.MIGRATION_ENV==='private'&&auth.toString()!==database.toString())throw new Error('Private auth must use the same gen_user connection');
    authDatabaseUrl=auth.toString();
  }
  if(!env.STAGE1_TEST_PASSWORD2||!/^[a-f\d]{64}$/.test(env.MIGRATION_RESET_KEY||''))throw new Error('Explicit synthetic payment and encryption configuration required');
  return { databaseUrl:database.toString(), authDatabaseUrl, ssl, auth:{siteOrigin:site.origin,resetKey:env.MIGRATION_RESET_KEY},
    payment:{mode:'test',password2:env.STAGE1_TEST_PASSWORD2},host:env.MIGRATION_ENV==='local'?'127.0.0.1':'0.0.0.0' };
}
module.exports={loadConfig};
