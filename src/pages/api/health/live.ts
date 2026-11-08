import type {NextApiRequest,NextApiResponse} from 'next';
// Platform liveness must not depend on the database or external providers.
export default function live(_req:NextApiRequest,res:NextApiResponse){
 res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true});
}
