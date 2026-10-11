// Synthetic configuration only. Never reads .env, connects to PG or builds images.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync,spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const root=path.resolve(__dirname,'../../..');
const env={PATH:process.env.PATH,HOME:process.env.HOME,
 MIGRATION_SITE_ORIGIN:'https://synthetic.example.invalid',
 MIGRATION_DATABASE_URL:'postgresql://gen_user:synthetic@192.168.10.4:5432/default_db',
 MIGRATION_RESET_KEY:'0'.repeat(64)};
function compose(file){return spawnSync('docker',['compose','--env-file','/dev/null','-f',file,'config','--format','json'],{cwd:root,env,encoding:'utf8'});}

test('fca4429 reproduces missing callback key before any image build',()=>{
 const old=spawnSync('git',['show','fca4429:docker-compose.yml'],{cwd:root,encoding:'utf8'});
 assert.equal(old.status,0);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rehab-compose-regression-'));
 try{
  const file=path.join(dir,'docker-compose.yml');fs.writeFileSync(file,old.stdout);
  const result=compose(file);assert.notEqual(result.status,0);
  assert.match(result.stderr,/STAGE1_TEST_PASSWORD2.*missing a value/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('fixed root Compose resolves with no callback key and keeps private gates',()=>{
 const result=compose(path.join(root,'docker-compose.yml'));
 assert.equal(result.status,0,'Compose configuration must resolve');
 const config=JSON.parse(result.stdout);
 assert.deepEqual(Object.keys(config.services).sort(),['backend','frontend','worker']);
 for(const role of ['backend','worker']){
  const service=config.services[role];
  assert.equal(service.environment.STAGE1_TEST_PASSWORD2,'');
  assert.equal(service.environment.MIGRATION_DB_READY_CONFIRM,'');
  assert.equal(service.environment.MIGRATION_ENV,'private');
  assert.ok(service.command.includes('timeweb/private-boot.js'));
  assert.equal(service.ports,undefined);
 }
 // This fix intentionally does not claim root Compose consumes local images.
 for(const service of Object.values(config.services))assert.ok(service.build);
 assert.equal(config.services.frontend.ports[0].published,'3000');
 const forbidden=new Set(['cap_add','cgroup','cgroup_parent','devices','privileged','device_cgroup_rules','volumes','ipc','pid','security_opt','userns_mode','sysctls','volumes_from','uts','extra_hosts','use_api_socket','include','extends','external','name','driver_opts']);
 function check(value){if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)){
   assert.ok(!forbidden.has(key),'Unsupported Timeweb directive: '+key);
   assert.ok(key!=='network_mode'||child!=='host'&&!String(child).startsWith('container:'));
   check(child);
  }
 }
 // Compose config adds an automatic project/network name; inspect service options only.
 for(const service of Object.values(config.services))check(service);
});

test('activation still refuses an absent callback key without a default secret',()=>{
 const {loadConfig}=require('../config');
 assert.throws(()=>loadConfig({...env,MIGRATION_ENV:'private',
  MIGRATION_PRIVATE_CONFIRM:'Friendly-Halimede-default_db-gen_user',
  MIGRATION_PG_TLS:'disabled-private'}),/Explicit synthetic payment and encryption configuration required/);
});

for(const role of ['api','worker'])test('waiting '+role+' needs no callback key or DB connection',async()=>{
 const socket=net.createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
 const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
 const child=spawn(process.execPath,[path.join(root,'robokassa-api/timeweb/private-boot.js'),role],{
  env:{PATH:process.env.PATH,MIGRATION_ENV:'private',STAGE1_PORT:String(port),MIGRATION_WORKER_PORT:String(port)},stdio:'ignore'});
 try{
  let response;
  for(let i=0;i<50;i++){
   try{response=await fetch('http://127.0.0.1:'+port+'/health/live');break;}
   catch{await new Promise(resolve=>setTimeout(resolve,50));}
  }
  assert.equal(response?.status,200);
  assert.equal((await fetch('http://127.0.0.1:'+port+'/health/ready')).status,503);
 }finally{
  child.kill('SIGTERM');await new Promise(resolve=>child.exitCode!==null||child.signalCode!==null?resolve():child.once('exit',resolve));
 }
});
