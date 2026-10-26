// Separate local stage-one entrypoint. Does not read .env or load legacy routes.
const { Pool } = require('pg');
const { createApp } = require('./app');
const { loadConfig } = require('./config');

const config=loadConfig(process.env);
if(['staging','vps'].includes(process.env.MIGRATION_ENV)&&(!process.env.MIGRATION_AUTH_DATABASE_URL||new URL(config.authDatabaseUrl).username===new URL(config.databaseUrl).username))throw Error('separate_auth_role_required');
const {videoProvider}=require('./providers/config');
const pool = new Pool({ connectionString: config.databaseUrl, ssl:config.ssl, connectionTimeoutMillis:5000, max: 10 });
const authPool=config.authDatabaseUrl!==config.databaseUrl ? new Pool({connectionString:config.authDatabaseUrl,ssl:config.ssl,connectionTimeoutMillis:5000,max:5}) : pool;
const {robokassaConfig}=require('./robokassa-url');
// ROBOKASSA_LINK_MODE=live only changes how the checkout link is signed (live password #1, no IsTest).
// Orders and ResultURL handling stay in the configured mode.
const linkMode=process.env.ROBOKASSA_LINK_MODE||config.payment.mode;
if(!['test','live'].includes(linkMode))throw Error('invalid_robokassa_link_mode');
const paymentConfig={...config.payment,robokassa:robokassaConfig(process.env,linkMode)};
const app = createApp({ pool, authPool, authConfig:config.auth, paymentConfig,videoProvider:videoProvider(process.env,config) });
const server = app.listen(Number(process.env.STAGE1_PORT || 3101), config.host);
async function stop() { server.close(); await pool.end(); if(authPool!==pool)await authPool.end(); }
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
