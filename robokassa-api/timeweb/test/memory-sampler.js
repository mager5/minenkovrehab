// Aggregate RSS only. No command lines, environment, URLs or process diagnostics.
const {spawnSync}=require('node:child_process');
function sample(roots){
 const result=spawnSync('/bin/ps',['-axo','pid=,ppid=,rss='],{encoding:'utf8'});if(result.status!==0)return null;
 const rows=result.stdout.trim().split('\n').map(line=>line.trim().split(/\s+/).map(Number));
 const total=root=>{const ids=new Set([root]);let changed=true;while(changed){changed=false;for(const [id,parent]of rows)if(ids.has(parent)&&!ids.has(id)){ids.add(id);changed=true;}}return rows.filter(([id])=>ids.has(id)).reduce((n,row)=>n+row[2],0);};
 return Object.fromEntries(Object.entries(roots).map(([name,pid])=>[name,total(pid)]));
}
function measure(roots){let samples=0;const peak={};let appPeak=0,last={};const started=Date.now();
 const tick=()=>{const current=sample(roots);if(!current)return;samples++;last=current;for(const [name,rss]of Object.entries(current))peak[name]=Math.max(peak[name]||0,rss);appPeak=Math.max(appPeak,(current.frontend||0)+(current.api||0)+(current.worker||0));};
 const timer=setInterval(tick,100);tick();return {stop(){clearInterval(timer);tick();return {platform:process.platform,node:process.version,metric:'RSS KiB; process trees; shared pages may be counted repeatedly',interval_ms:100,samples,duration_ms:Date.now()-started,peak_kib:peak,last_kib:last,combined_app_peak_kib:appPeak};}};
}
module.exports={measure};
