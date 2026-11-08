// Validate/build locally using dummy values, never loads .env or connects to a DB.
const {spawnSync}=require('node:child_process');const path=require('node:path');
const env={PATH:process.env.PATH,HOME:process.env.HOME,
 MIGRATION_SITE_ORIGIN:'https://stage.example.invalid',MIGRATION_RESET_KEY:'a'.repeat(64),STAGE1_TEST_PASSWORD2:'synthetic',MIGRATION_SYNTHETIC_PASSWORD:'Synthetic-Only-Password!',
 MIGRATION_PG_CA:'-----BEGIN CERTIFICATE-----\nsynthetic fixture\n-----END CERTIFICATE-----',
 MIGRATION_DATABASE_URL:'postgresql://rehab_payment:synthetic@192.168.10.4:5432/rehab_staging',
 MIGRATION_AUTH_DATABASE_URL:'postgresql://rehab_auth:synthetic@192.168.10.4:5432/rehab_staging',
 MIGRATION_DATABASE_TARGET:'postgresql://rehab_payment@192.168.10.4:5432/rehab_staging',
 MIGRATION_WORKER_DATABASE_URL:'postgresql://rehab_worker:synthetic@192.168.10.4:5432/rehab_staging',
 MIGRATION_MIGRATOR_DATABASE_URL:'postgresql://rehab_migrator:synthetic@192.168.10.4:5432/rehab_staging'};
const args=['compose','--env-file','/dev/null','--project-directory',path.resolve(__dirname,'..'),'-f',process.argv.includes('--synthetic')?'deploy/timeweb/synthetic-tls.compose.yml':'docker-compose.yml'];
if(!process.argv.includes('--synthetic'))env.MIGRATION_DATABASE_URL='postgresql://gen_user:synthetic@192.168.10.4:5432/default_db';
if(process.argv.includes('--mailbox')){
 if(!process.argv.includes('--synthetic'))throw Error('mailbox_override_only_for_synthetic_tls_manifest');
 args.push('-f','deploy/timeweb/staging-mailbox.compose.yml');
 Object.assign(env,{MIGRATION_TEST_MAILBOX_CONFIRM:'dedicated-synthetic-mailbox',MIGRATION_TEST_MAILBOX:'mailbox@example.invalid',MIGRATION_MAIL_NAMESPACE:'synthetic',RUSENDER_API_TOKEN:'synthetic',RUSENDER_KEY_ID:'1',RUSENDER_FROM:'sender@example.invalid'});
}
function run(command){const result=spawnSync('docker',[...args,...command],{cwd:path.resolve(__dirname,'..'),env,stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
run(['config','--quiet']);console.log('App Platform manifest validation passed.');
if(process.argv.includes('--build')){run(['build']);console.log('App Platform image builds passed.');}
