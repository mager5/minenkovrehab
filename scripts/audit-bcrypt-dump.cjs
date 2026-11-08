// Read-only aggregate inspection. Never emits COPY rows or credential values.
const {spawnSync}=require('node:child_process');
const result=spawnSync('/opt/homebrew/opt/postgresql@17/bin/pg_restore',['--data-only','--schema=auth','--table=users','--file=-',process.argv[2]||''],{encoding:'utf8',maxBuffer:16*1024*1024});
if(result.status!==0){console.error('Dump inspection failed; no data emitted.');process.exit(1);}
const totals={rows:0,empty:0,bcrypt:0,unsupported:0,versions:{'2a':0,'2b':0,'2y':0},costs:{},applicationSupported:0};
let column=-1,inCopy=false,found=false;
for(const line of result.stdout.split('\n')){
 const header=line.match(/^COPY auth\.users \(([^)]+)\) FROM stdin;$/);
 if(header){found=true;column=header[1].split(', ').indexOf('encrypted_password');inCopy=true;continue;}
 if(!inCopy)continue;if(line==='\\.'){inCopy=false;continue;}
 if(column<0)throw new Error('Expected credential column absent');
 const hash=line.split('\t')[column];totals.rows++;
 if(!hash||hash==='\\N'){totals.empty++;continue;}
 const match=hash.match(/^\$(2[aby])\$(\d\d)\$[./A-Za-z0-9]{53}$/);
 if(!match){totals.unsupported++;continue;}
 totals.bcrypt++;totals.versions[match[1]]++;const cost=Number(match[2]);totals.costs[cost]=(totals.costs[cost]||0)+1;
 if(cost>=4&&cost<=16)totals.applicationSupported++;
}
if(!found)throw new Error('Auth users COPY not found; no compatibility conclusion.');
console.log(JSON.stringify(totals));
