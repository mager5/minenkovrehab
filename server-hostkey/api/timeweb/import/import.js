const fs=require('node:fs');const path=require('node:path');
const {supportedHash}=require('../auth');
const specs=[
 ['auth.users','users',['id','email','email_confirmed_at','banned_until','deleted_at','created_at']],
 ['public.profiles','profiles',['id','email','full_name','created_at']],
 ['public.products','products',['id','slug','title','description','price','created_at']],
 ['public.purchases','purchases',['id','user_id','product_id','status','robokassa_invoice_id','created_at']],
 ['public.videos','videos',['id','user_id','title','description','file_path','thumbnail_path','size','duration','mime_type','views','created_at','updated_at']],
 ['auth.identities','identities',['id','user_id','provider','provider_id','identity_data','created_at','updated_at','last_sign_in_at']],
];
const safeUserAttributes=['updated_at','last_sign_in_at','invited_at','phone','phone_confirmed_at','is_sso_user','is_anonymous','is_super_admin','aud','role','raw_user_meta_data','raw_app_meta_data'];
class ImportError extends Error { constructor(code){super(code);this.code=code;} }
function preflight(data){
 const summary={counts:{},duplicateIds:0,duplicateIdentitySubjects:0,duplicateEmails:0,duplicateInvoices:0,duplicateUserProductPurchases:0,missingLinks:0,
  profilesAbsent:0,profileEmailMismatches:0,unconfirmedUsers:0,ssoUsers:0,anonymousUsers:0,unknownPurchaseModes:data['public.purchases'].length,unmappedVideos:data['public.videos'].length,
  courseMappings:0,unsupportedHashes:0,providers:{},hashes:0};
 const sets={};
 for(const [source]of specs){const rows=data[source];summary.counts[source]=rows.length;sets[source]=new Set(rows.map(r=>r.id));summary.duplicateIds+=rows.length-sets[source].size;}
 const duplicates=values=>values.length-new Set(values).size;
 summary.duplicateIdentitySubjects=duplicates(data['auth.identities'].map(r=>r.provider+':'+r.provider_id));
 summary.duplicateEmails=duplicates(data['auth.users'].map(r=>(r.email||'').trim().toLowerCase()));
 summary.duplicateInvoices=duplicates(data['public.purchases'].map(r=>r.robokassa_invoice_id).filter(Boolean));
 summary.duplicateUserProductPurchases=duplicates(data['public.purchases'].map(r=>r.user_id+':'+r.product_id));
 for(const r of data['public.profiles']){if(!sets['auth.users'].has(r.id))summary.missingLinks++;else if(r.email!==data['auth.users'].find(u=>u.id===r.id).email)summary.profileEmailMismatches++;}
 for(const r of data['public.videos'])if(!sets['auth.users'].has(r.user_id))summary.missingLinks++;
 for(const r of data['public.purchases'])if(!sets['public.profiles'].has(r.user_id)||!sets['public.products'].has(r.product_id))summary.missingLinks++;
 for(const r of data['auth.identities']){
  if(!sets['auth.users'].has(r.user_id))summary.missingLinks++;
  const provider=/^[a-z0-9_-]{1,40}$/.test(r.provider||'')?r.provider:'other';summary.providers[provider]=(summary.providers[provider]||0)+1;
 }
 for(const r of data['auth.users']){
  if(!r.email_confirmed_at)summary.unconfirmedUsers++;
  if(r.is_sso_user==='t')summary.ssoUsers++;if(r.is_anonymous==='t')summary.anonymousUsers++;
  if(!sets['public.profiles'].has(r.id))summary.profilesAbsent++;
  if(r.encrypted_password){summary.hashes++;if(!supportedHash(r.encrypted_password))summary.unsupportedHashes++;}
 }
 return summary;
}
async function guard(client,config){
 if(config.privateTarget){await require("../private-target").requireEmpty(client,config.ownerConfirmation);return;}
 if(config.host!=='127.0.0.1'||!/^rehab_import_[a-f0-9]{16}$/.test(config.database)||!config.nonce||!config.directory)throw new ImportError('target_rejected');
 const {rows:[server]}=await client.query("SELECT current_database() db,host(inet_server_addr()) address,current_setting('data_directory') directory");
 if(server.db!==config.database||server.address!=='127.0.0.1'||fs.realpathSync(server.directory)!==fs.realpathSync(path.join(config.directory,'data'))||!path.basename(config.directory).startsWith('rehab-import-'))throw new ImportError('target_server_rejected');
 const {rows}=await client.query('SELECT 1 FROM public.rehearsal_guard WHERE nonce=$1',[config.nonce]);
 if(rows.length!==1)throw new ImportError('target_guard_rejected');
}
async function importData(client,data,config,{failAfter=null}={}){
 await guard(client,config);const summary=preflight(data);
 if(summary.duplicateIds||summary.duplicateIdentitySubjects||summary.missingLinks||summary.unsupportedHashes)throw new ImportError('source_requires_resolution');
 await client.query('BEGIN');
 try{
  await client.query("SELECT pg_advisory_xact_lock(72648301)");
  if(config.privateTarget)await require("../private-target").requireEmpty(client,config.ownerConfirmation);
  const {rows:[existing]}=await client.query("SELECT to_regclass('rehab.import_runs') present");
  if(existing.present)throw new ImportError('already_imported_or_target_not_empty');
  for(const name of ['001_payment_core.sql','002_auth.sql','003_import.sql','004_providers.sql','005_legacy_and_confirmation.sql']){
   const sql=fs.readFileSync(path.join(__dirname,'../migrations',name),'utf8').replace(/^BEGIN;\s*|\bCOMMIT;\s*$/gm,'');
   await client.query(sql);
  }
  for(const [source,target,columns]of specs){
   for(const row of data[source]){
    const names=[...columns];const values=names.map(k=>{if(!(k in row))throw new ImportError('source_column_missing');return row[k];});
    if(target==='users'){names.push('legacy_attributes');values.push(JSON.stringify(Object.fromEntries(safeUserAttributes.filter(k=>k in row).map(k=>[k,row[k]]))));}
    // Historical mode stays NULL; no orders, payments, sessions or reset tokens invented.
    await client.query(`INSERT INTO rehab.${target} (${names.join(',')}) VALUES (${names.map((_,i)=>'$'+(i+1)).join(',')})`,values);
   }
   if(failAfter===target)throw new ImportError('injected_failure');
  }
  // Explicit owner decision, not evidence of a live payment. No payment or mail created.
  if(config.preserveLegacyGrants === true) {
   const approved=data['public.purchases'].filter(b=>b.status==='active'&&data['public.products'].some(p=>p.id===b.product_id&&p.slug==='personal-program'));
   if(approved.length!==5||data['public.purchases'].length!==5)throw new ImportError('owner_decision_does_not_cover_source');
   await client.query("UPDATE rehab.purchases b SET source='legacy migration' FROM rehab.products p WHERE b.product_id=p.id AND p.slug='personal-program' AND b.status='active' AND b.mode IS NULL AND b.order_id IS NULL");
   summary.legacyGrantDecision='owner-2026-10-10: active personal-program; unknown payment mode; no payment verification';
   summary.ownerApprovedLegacyGrants=Number((await client.query("SELECT count(*) n FROM rehab.purchases WHERE source='legacy migration'")).rows[0].n);
  }
  for(const row of data['auth.users'])if(row.encrypted_password)await client.query("INSERT INTO rehab.credentials VALUES ($1,$2,'bcrypt')",[row.id,row.encrypted_password]);
  let verified=0;
  for(const [source,target,columns]of specs){
   const {rows:[count]}=await client.query(`SELECT count(*)::int n FROM rehab.${target}`);
   if(count.n!==data[source].length)throw new ImportError('count_mismatch');
   for(const row of data[source]){
    const {rows}=await client.query(`SELECT 1 FROM rehab.${target} WHERE ${columns.map((k,i)=>`${k} IS NOT DISTINCT FROM $${i+1}`).join(' AND ')}`,columns.map(k=>row[k]));
    if(rows.length!==1)throw new ImportError('field_mismatch');verified++;
   }
  }
  for(const row of data['auth.users']){
   const attrs=JSON.stringify(Object.fromEntries(safeUserAttributes.filter(k=>k in row).map(k=>[k,row[k]])));
   if((await client.query('SELECT 1 FROM rehab.users WHERE id=$1 AND legacy_attributes=$2::jsonb',[row.id,attrs])).rows.length!==1)throw new ImportError('metadata_mismatch');
  }
  for(const row of data['auth.users'])if(row.encrypted_password){
   const {rows}=await client.query('SELECT 1 FROM rehab.credentials WHERE user_id=$1 AND password_hash=$2',[row.id,row.encrypted_password]);
   if(rows.length!==1)throw new ImportError('hash_mismatch');
  }
  const {rows:[unexpected]}=await client.query(`SELECT
   (SELECT count(*) FROM rehab.sessions)+(SELECT count(*) FROM rehab.password_resets)+
   (SELECT count(*) FROM rehab.orders)+(SELECT count(*) FROM rehab.payments)+(SELECT count(*) FROM rehab.course_videos) n`);
  if(Number(unexpected.n)!==0)throw new ImportError('unexpected_auth_or_access');
  let maxInvoice=0n;summary.unreservableInvoiceNumbers=0;
  for(const row of data['public.purchases'])if(/^[0-9]+$/.test(row.robokassa_invoice_id||'')){
   const value=BigInt(row.robokassa_invoice_id);
   if(value>=9223372036854775807n){summary.unreservableInvoiceNumbers++;continue;}
   if(value>maxInvoice)maxInvoice=value;
  }
  if(summary.unreservableInvoiceNumbers)throw new ImportError('invoice_range_requires_resolution');
  await client.query("SELECT setval('rehab.orders_invoice_id_seq',$1::bigint,false)",[(maxInvoice+1n).toString()]);
  summary.invoiceSequenceReseeded=true;
  summary.verifiedRows=verified;summary.exactHashes=summary.hashes;summary.after={};
  for(const [source,target]of specs)summary.after[target]=data[source].length;
  if(config.privateTarget){
   await client.query('CREATE TABLE public.rehab_schema_versions(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
   await client.query('REVOKE ALL ON public.rehab_schema_versions FROM PUBLIC');
   for(const name of ['001_payment_core.sql','002_auth.sql','003_import.sql','004_providers.sql','005_legacy_and_confirmation.sql']){
    const checksum=require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../migrations',name),'utf8')).digest('hex');
    await client.query('INSERT INTO public.rehab_schema_versions(name,checksum) VALUES($1,$2)',[name,checksum]);
   }
  }
  await client.query('INSERT INTO rehab.import_runs(id,summary) VALUES(1,$1)',[JSON.stringify(summary)]);
  await client.query('COMMIT');return summary;
 }catch(error){await client.query('ROLLBACK').catch(()=>{});if(error instanceof ImportError)throw error; const sanitized=new ImportError('import_failed_rolled_back'); sanitized.sqlCode=error.code; throw sanitized;}
}
module.exports={importData,preflight,guard,ImportError};
