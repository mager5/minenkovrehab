const {test}=require('node:test');const assert=require('node:assert/strict');
const {parseCopy,decode}=require('../import/read-dump');const {preflight,importData}=require('../import/import');
test('COPY parser preserves tabs, newlines, slashes, empty and NULL without executing dump SQL',()=>{
 assert.equal(decode('\\N'),null);assert.equal(decode(''), '');assert.equal(decode('a\\tb\\nc\\\\d'),'a\tb\nc\\d');
 const rows=parseCopy('SELECT malicious();\nCOPY public.profiles (id, full_name) FROM stdin;\nuuid\tA\\tB\n\\.\n','public.profiles');
 assert.equal(rows[0].full_name,'A\tB');
 assert.throws(()=>parseCopy('COPY public.other (id) FROM stdin;\nx\n\\.\n','public.profiles'));
 assert.throws(()=>parseCopy('COPY public.profiles (id) FROM stdin;\nx\n','public.profiles'));
});
test('import preflight reports ambiguity and dangling synthetic links without merging users',()=>{
 const data={'auth.users':[{id:'a',email:'X@example.invalid'},{id:'b',email:'x@example.invalid'}],
 'auth.identities':[],'public.profiles':[],'public.products':[{id:'p'}],
 'public.purchases':[{id:'i',user_id:'missing',product_id:'p',status:'active'}],'public.videos':[]};
 const result=preflight(data);assert.equal(result.duplicateEmails,1);assert.equal(result.missingLinks,1);
 assert.equal(result.profilesAbsent,2);assert.equal(result.unknownPurchaseModes,1);
});
test('import refuses arbitrary target before any database query',async()=>{
 let queried=false;const client={query:()=>{queried=true;throw Error('unexpected');}};
 await assert.rejects(()=>importData(client,{}, {host:'192.168.10.4',database:'default_db'}),e=>e.code==='target_rejected');
 assert.equal(queried,false);
});
