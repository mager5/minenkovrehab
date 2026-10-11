// Measures only a fresh isolated Next build tree. Aggregates contain no secrets.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');const output=fs.openSync('/private/tmp/rehab-measured-build.log','w');
const child=spawn(process.execPath,[path.join(root,'scripts/build-migration.cjs')],{cwd:root,env:{PATH:process.env.PATH,HOME:process.env.HOME},stdio:['ignore',output,output]});
const memory=require('../robokassa-api/timeweb/test/memory-sampler').measure({build:child.pid});
child.once('exit',code=>{const report={...memory.stop(),exit_code:code};fs.writeFileSync('/private/tmp/rehab-build-memory.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exitCode=code||0;});
