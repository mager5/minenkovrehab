const {test}=require('node:test');const assert=require('node:assert/strict');const net=require('node:net');const {spawn}=require('node:child_process');const path=require('node:path');const fs=require('node:fs');
test('Compose API and worker stay behind manual initialization gate; no startup migrations',()=>{
 const manifest=fs.readFileSync(path.resolve(__dirname,'../../../docker-compose.yml'),'utf8');
 assert.match(manifest,/command: \[node, timeweb\/private-boot.js, api\]/);assert.match(manifest,/command: \[node, timeweb\/private-boot.js, worker\]/);assert.doesNotMatch(manifest,/^  (migrate|import|seed):/m);
});
test('waiting worker serves liveness but denies readiness without reading any DB configuration',async()=>{
 const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
 const child=spawn(process.execPath,[path.resolve(__dirname,'../private-boot.js'),'worker'],{env:{PATH:process.env.PATH,MIGRATION_ENV:'private',MIGRATION_WORKER_PORT:String(port),MIGRATION_DATABASE_URL:'intentionally-invalid'},stdio:'ignore'});
 try{
  let response;for(let i=0;i<40;i++){try{response=await fetch('http://127.0.0.1:'+port+'/health/live');break;}catch{await new Promise(r=>setTimeout(r,50));}}
  assert.equal(response?.status,200);assert.equal((await fetch('http://127.0.0.1:'+port+'/health/ready')).status,503);
 }finally{child.kill('SIGTERM');await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));}
});
