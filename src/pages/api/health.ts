import type {NextApiRequest,NextApiResponse} from 'next';
import {migrationBackendOrigin} from '@/lib/migration-config';
export default async function health(_req:NextApiRequest,res:NextApiResponse){
 res.setHeader('Cache-Control','no-store');const origin=migrationBackendOrigin();
 if(!origin)return res.status(503).json({ok:false});
 try{const upstream=await fetch(origin+'/health/ready',{cache:'no-store',signal:AbortSignal.timeout(3000)});return res.status(upstream.ok?200:503).json({ok:upstream.ok});}catch{return res.status(503).json({ok:false});}
}
