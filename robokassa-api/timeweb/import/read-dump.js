const {spawnSync}=require('node:child_process');
const path=require('node:path');
const tables=['auth.users','auth.identities','public.profiles','public.products','public.purchases','public.videos'];
function decode(value){
 if(value==='\\N')return null;
 return value.replace(/\\([0-7]{1,3}|x[0-9a-fA-F]{1,2}|.)/g,(_,c)=>{
  if(/^[0-7]/.test(c))return String.fromCharCode(parseInt(c,8));
  if(c[0]==='x')return String.fromCharCode(parseInt(c.slice(1),16));
  return ({b:'\b',f:'\f',n:'\n',r:'\r',t:'\t',v:'\v','\\':'\\'})[c]??c;
 });
}
function parseCopy(text,expected){
 let columns=null,inside=false,found=false;const rows=[];
 for(const line of text.split('\n')){
  const m=line.match(/^COPY ([a-z_]+\.[a-z_]+) \(([^)]+)\) FROM stdin;$/);
  if(m){if(found||m[1]!==expected)throw new Error('unexpected_copy');columns=m[2].split(', ');inside=true;found=true;continue;}
  if(!inside)continue;if(line==='\\.'){inside=false;continue;}
  const values=line.split('\t');if(values.length!==columns.length)throw new Error('invalid_copy_width');
  rows.push(Object.fromEntries(columns.map((k,i)=>[k,decode(values[i])])));
 }
 if(!found||inside)throw new Error('incomplete_copy');return rows;
}
function readDump(file,bin='/opt/homebrew/opt/postgresql@17/bin'){
 const data={};
 for(const table of tables){const [schema,name]=table.split('.');
  const result=spawnSync(path.join(bin,'pg_restore'),['--data-only','--schema='+schema,'--table='+name,'--file=-',file],
   {encoding:'utf8',maxBuffer:64*1024*1024,env:{PATH:process.env.PATH,LANG:'C',LC_ALL:'C'}});
  if(result.status!==0)throw new Error('dump_read_failed');
  data[table]=parseCopy(result.stdout,table);
 }
 return data;
}
module.exports={readDump,parseCopy,decode,tables};
