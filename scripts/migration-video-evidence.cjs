// Read-only archive analysis. Output excludes identities and UUID-containing path segments.
const fs=require('node:fs');const {readDump}=require('../robokassa-api/timeweb/import/read-dump');
const file=process.argv[2];if(!file)throw Error('archive_required');const data=readDump(file);
const privateNames=data['public.profiles'].flatMap(x=>(x.full_name||'').split(/\s+/)).filter(x=>x.length>=3);
function safe(value){let s=String(value||'—').replace(/[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}/gi,'[UUID скрыт]').replace(/[^\s/@]+@[^\s/]+/g,'[email скрыт]');
 for(const name of privateNames)s=s.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'[имя скрыто]');return s.replace(/\|/g,'/').replace(/[\r\n]/g,' ');}
function localMetadata(relative){
 const path=require('path');const root=path.resolve(path.dirname(file),'storage/videos');let target=path.resolve(root,relative||'');let match='exact';
 if(!target.startsWith(root+path.sep))return {present:false,duration:null};
 if(!fs.existsSync(target)){
  const candidates=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name===path.basename(relative))candidates.push(p);}}walk(root);
  if(candidates.length!==1)return {present:false,duration:null};target=candidates[0];match='basename-only';
 }
 const stat=fs.statSync(target);if(!stat.isFile())return {present:false,duration:null};
 const fd=fs.openSync(target,'r');
 function read(pos,length){const b=Buffer.alloc(length);if(fs.readSync(fd,b,0,length,pos)!==length)throw Error('incomplete');return b;}
 function scan(start,end,child=false){for(let pos=start;pos+8<=end;){const head=read(pos,8);let size=head.readUInt32BE(0),header=8;const type=head.toString('ascii',4,8);
  if(size===1){const value=read(pos+8,8).readBigUInt64BE();if(value>BigInt(Number.MAX_SAFE_INTEGER))return null;size=Number(value);header=16;}
  if(size===0)size=end-pos;if(size<header||pos+size>end)return null;
  if(type==='moov'){const duration=scan(pos+header,pos+size,true);if(duration!==null)return duration;}
  if(child&&type==='mvhd'){const b=read(pos+header,Math.min(40,size-header));const v=b[0];if(v!==0&&v!==1)return null;const scale=b.readUInt32BE(v===1?20:12);const ticks=v===1?Number(b.readBigUInt64BE(24)):b.readUInt32BE(16);return scale?Number((ticks/scale).toFixed(3)):null;}
  pos+=size;
 }return null;}
 try{return {present:true,duration:scan(0,stat.size),bytes:stat.size,match,target};}catch{return {present:true,duration:null,bytes:stat.size};}finally{fs.closeSync(fd);}
}
const rows=data['public.videos'].sort((a,b)=>a.id.localeCompare(b.id));
const code=fs.readFileSync('robokassa-api/routes/courses.js','utf8');const client=fs.readFileSync('src/components/dashboard/courses/MeniscusStagesDetails.tsx','utf8');
const text=['# Обезличенная таблица видео — 10.10.2026','', 'V1–V6: порядок UUID в указанном архиве; реальные UUID остаются только в памяти импортера. Назначение курса/урока для всех записей: НЕ СОГЛАСОВАНО. Все метаданные сохраняются.','', '| Запись | Название (обезличено) | Длительность dump / локальная mvhd, с | Создано | Путь (обезличен) | Прямое упоминание |','|---|---|---:|---|---|---|'];
for(let i=0;i<rows.length;i++){const r=rows[i];const local=localMetadata(r.file_path);const full=(r.file_path||'').includes('My Bucket/Resection/pozdniy-vosstanovitelnyy-etap-4-8-nedel.kf2s.mp4');text.push(`| V${i+1} | ${safe(r.title)} | ${safe(r.duration)} / ${local.duration===null?"не определена":local.duration}${local.match==='basename-only'?' (кандидат по имени)':''} | ${safe(r.created_at)} | ${safe(r.file_path)} | ${full?'preferred stage-3':code.includes(r.file_path)?'legacy backend explicit path':''}${client.includes(r.file_path)?'; клиент videoPath':''} |`);}
text.push('','Фактический порядок legacy resolver: preferred exact path → поиск по названию среди видео инструктора с сортировкой created_at.desc → hardcoded fallback. Метаданные не доказывают равенство содержимого. Клиент запрашивает stage-video?stage=N, а его videoPath больше не определяет URL. В migration/timeweb API использует только rehab.course_videos, сейчас пустую; перечисленные ссылки не дают доступ автоматически.','', 'V1: preferred stage-3; V3: explicit stage-3 fallback + клиентская ссылка. Владелец должен посмотреть оба и выбрать содержимое, либо определить два самостоятельных урока. V4: legacy reference stage-2, но назначение пока не подтверждено владельцем. V2/V5/V6: назначения не доказаны; fuzzy title не является решением. V2: название содержит 0-2 и попадает в legacy titleLike candidate stage-1; проверка storageObjectExists определяет фактическое использование. Это доказательство кандидата по правилу выбора, а не утверждённого урока.');
text.push('','## Preferred paths из legacy кода и локального Storage','','| Ссылка в коде | Точный файл в backup | Строк videos с таким file_path |','|---|---|---:|');
for(const match of new Set([...code.matchAll(/'(My Bucket\/[^']+)'/g)].map(m=>m[1]))){const path=require('path');const exact=fs.existsSync(path.join(path.dirname(file),'storage/videos',match));text.push(`| ${safe(match)} | ${exact?'да':'нет'} | ${rows.filter(r=>r.file_path===match).length} |`);}
text.push('','Наличие preferred path в локальном backup подтверждает asset/candidate resolver, но не назначает ему UUID строки videos и не доказывает текущий production ответ. Не импортировать такие объекты как новые уроки без решения владельца.');
text.push('','Во всех шести строках duration в dump=NULL. Локальная длительность вычисляется только чтением ISO-BMFF mvhd (не просмотр содержимого); — означает отсутствие/неподдерживаемый контейнер. Файлы/архив не изменяются, ffprobe отсутствует. Для V2–V6 точного file_path в storage нет; найден единственный файл с тем же basename внутри My Bucket. Эти длительности относятся к кандидатам, совпадение имени не доказывает совпадение байтов с утраченным исходным объектом. Перед переносом нужен явный разбор этих storage paths.');
async function sameFiles(a,b){if(!a.target||!b.target||a.bytes!==b.bytes)return false;const crypto=require('crypto');const hash=async target=>{const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(target))h.update(chunk);return h.digest();};return (await hash(a.target)).equals(await hash(b.target));}
(async()=>{const equal=await sameFiles(localMetadata(rows[0].file_path),localMetadata(rows[2].file_path));text.push('',`Сравнение всех байтов двух локальных кандидатов stage-3 (размер + SHA-256, значения digest не выводятся): ${equal?'совпадают':'не совпадают'}. Для V3 это файл, найденный по basename, а не объект по исходному UUID-пути; название и одинаковая длительность не подтверждают выбор урока или переназначение source metadata без решения владельца.`);fs.writeFileSync('reports/MIGRATION_VIDEO_MAPPING.md',text.join('\n')+'\n');})().catch(()=>{console.error('local_video_comparison_failed');process.exitCode=1;});
