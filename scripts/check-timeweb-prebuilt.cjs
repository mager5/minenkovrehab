// Run prepared images through the actual root Compose. Synthetic config only.
// No image builds/pulls, DB service, migrations, imports or external integrations.
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),project='rehab-image-only-'+process.pid;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rehab-image-only-'));
const env={PATH:process.env.PATH,HOME:process.env.HOME,
 FRONTEND_IMAGE:'rehab-frontend:prebuilt-amd64',API_IMAGE:'rehab-api:prebuilt-amd64',WORKER_IMAGE:'rehab-worker:prebuilt-amd64',
 MIGRATION_SITE_ORIGIN:'https://synthetic.example.invalid',
 MIGRATION_DATABASE_URL:'postgresql://gen_user:synthetic@192.168.10.4:5432/default_db',MIGRATION_RESET_KEY:'0'.repeat(64)};
// The URL above is deliberately unreachable from an internal-only Docker network;
// private waiting boot must never use it. No credentials are supplied to frontend.
const override=path.join(dir,'isolated.compose.yml');
fs.writeFileSync(override,JSON.stringify({services:{frontend:{ports:['127.0.0.1:3347:3000'],networks:['isolated']},backend:{networks:['isolated']},worker:{networks:['isolated']}},networks:{isolated:{internal:true}}}));
const args=['compose','--env-file','/dev/null','--project-name',project,'-f',path.join(root,'docker-compose.yml'),'-f',override];
function run(command){const r=spawnSync('docker',command,{cwd:root,env,encoding:'utf8',maxBuffer:2e6});if(r.status!==0)throw Error('isolated_compose_command_failed_'+command.at(-1));return r.stdout;}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 try{
  // !override is unnecessary here: this script modifies the parsed local test
  // configuration to replace the root host port before execution.
  const parsed=JSON.parse(run([...args,'config','--format','json']));
  for(const service of Object.values(parsed.services)){assert.equal(service.build,undefined);}
  parsed.services.frontend.ports=[{target:3000,published:'3347',host_ip:'127.0.0.1',protocol:'tcp'}];
  const resolved=path.join(dir,'resolved.compose.json');fs.writeFileSync(resolved,JSON.stringify(parsed));
  const isolatedArgs=['compose','--env-file','/dev/null','--project-name',project,'-f',resolved];
  const build=spawnSync('docker',[...isolatedArgs,'build'],{env,cwd:root,encoding:'utf8'});
  assert.equal(build.status,0);assert.doesNotMatch(build.stdout+build.stderr,/next build|npm (ci|run)|Creating an optimized production build|load build definition/);
  run([...isolatedArgs,'up','-d','--pull','never','--no-build']);
  // Docker Desktop internal networks may not forward a published host port.
  // Probe inside the frontend container, preserving outbound isolation.
  const frontendId=run([...isolatedArgs,'ps','-q','frontend']).trim();
  const frontendProbe=['exec',frontendId,'node','-e',"fetch('http://127.0.0.1:3000/api/health/live').then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"];
  let healthy=false;
  for(let i=0;i<60;i++){
   try{run(frontendProbe);healthy=true;break;}catch{}
   await delay(250);
  }
  assert.ok(healthy,'prepared frontend must start');
  run(['exec',frontendId,'node','-e',"fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.status===503?0:1)).catch(()=>process.exit(1))"]);
  const metrics=[];
  for(const service of ['frontend','backend','worker']){
   const id=run([...isolatedArgs,'ps','-q',service]).trim();assert.ok(id);
   const info=JSON.parse(run(['inspect','--format','{{json .State}}',id]));assert.equal(info.Running,true);assert.equal(info.OOMKilled,false);
   if(service!=='frontend'){
    const port=service==='backend'?3101:3102;
    run(['exec',id,'node','-e',`Promise.all(['/health/live','/health/ready'].map(p=>fetch('http://127.0.0.1:${port}'+p).then(r=>r.status))).then(s=>{if(s[0]!==200||s[1]!==503)process.exit(1)})`]);
   }
   metrics.push({service,memoryMiB:Number(run(['exec',id,'cat','/sys/fs/cgroup/memory.current']))/1048576});
  }
  const report={passed:true,noBuild:true,noPull:true,networkInternal:true,syntheticOnly:true,frontendLive:200,frontendReady:503,apiAndWorker:'live200/ready503',memoryMiB:metrics,totalMiB:metrics.reduce((n,m)=>n+m.memoryMiB,0),limitsMiB:{frontend:512,api:128,worker:96},systemReserveEstimateMiB:256};
  fs.writeFileSync(path.join(root,'reports/timeweb-image-only-start.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
 }finally{
  // Only this unique local test project; no global prune or production resources.
  spawnSync('docker',[...args,'down','--remove-orphans'],{env,cwd:root,stdio:'ignore'});
  fs.rmSync(dir,{recursive:true,force:true});
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
