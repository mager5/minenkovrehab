const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'rehab-next-build-'));
for(const file of ['src','package.json','next.config.js','tsconfig.json','tailwind.config.js','postcss.config.js','postcss.config.mjs','global.d.ts','eslint.config.mjs','.eslintrc.json']){
 const source=path.join(root,file);if(fs.existsSync(source))fs.cpSync(source,path.join(directory,file),{recursive:true});
}
for(const file of ['node_modules','public','content'])if(fs.existsSync(path.join(root,file)))fs.symlinkSync(path.join(root,file),path.join(directory,file),'dir');
const environment={PATH:process.env.PATH,HOME:directory,LANG:'en_US.UTF-8',NEXT_TELEMETRY_DISABLED:'1',NODE_ENV:'production',
 MIGRATION_ENV:'local',MIGRATION_SITE_ORIGIN:'http://127.0.0.1:3100',MIGRATION_API_INTERNAL_URL:'http://127.0.0.1:3101'};
const result=spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd:directory,env:environment,stdio:'inherit'});
if(result.status===0){fs.writeFileSync('/private/tmp/rehab-next-build-path',directory);console.log('Isolated migration build completed.');}else {fs.rmSync(directory,{recursive:true,force:true});}
process.exitCode=result.status===null?1:result.status;
