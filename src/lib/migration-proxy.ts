import type { NextApiRequest, NextApiResponse } from 'next';
import { migrationBackendOrigin } from './migration-config';
export default async function migrationProxy(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control','private, no-store');
  const origin = migrationBackendOrigin();
  if (!origin) return res.status(503).json({success:false,error:'Окружение миграции не настроено.'});
  const incoming = new URL(req.url || '/', 'http://localhost');
  const method = req.method || 'GET';
  const headers: Record<string,string> = {};
  for (const name of ['cookie','origin','x-csrf-token','sec-fetch-site']) {
    const value = req.headers[name];
    if(typeof value === 'string') headers[name] = value;
  }
  if(incoming.pathname === "/api/kinescope/authorize" && typeof req.headers.authorization === "string") headers.authorization=req.headers.authorization;
  let body: string | undefined;
  if(!['GET','HEAD'].includes(method)) {
    if(typeof req.body === 'string') { body=req.body; headers['content-type']=String(req.headers['content-type']||'application/json'); }
    else {body=JSON.stringify(req.body||{});headers['content-type']='application/json';}
  }
  try {
    const upstream = await fetch(`${origin}${incoming.pathname}${incoming.search}`, {
      method,headers,...(body?{body}:{}),redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(10000),
    });
    const cookieHeaders = upstream.headers as Headers & { getSetCookie?: () => string[] };
    const cookies = cookieHeaders.getSetCookie?.() || upstream.headers.get('set-cookie')?.split(/,(?=\s*[^;,\s]+=)/) || [];
    if(cookies.length)res.setHeader('Set-Cookie',cookies);
    res.setHeader('Content-Type',upstream.headers.get('content-type')||'text/plain');
    const retry=upstream.headers.get('retry-after');if(retry)res.setHeader('Retry-After',retry);
    res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
  }catch {res.status(503).json({success:false,error:'Сервис временно недоступен.'});}
}
