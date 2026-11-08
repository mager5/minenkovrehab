// Errors stored in PostgreSQL are fixed codes, never provider bodies or addresses.
async function failed(client,table,job,error){
 const attempts=job.attempts+1;
 const terminal=error?.retryable===false||attempts>=8;
 const seconds=Math.max(Math.min(86400,Number(error?.retryAfter)||0),Math.min(3600,60*2**Math.min(attempts-1,6)));
 await client.query(`UPDATE rehab.${table} SET status=$2,attempts=$3,last_error=$4,available_at=now()+$5*interval '1 second' WHERE id=$1`,
 [job.id,terminal?'failed':'pending',attempts,terminal?'delivery_terminal':'delivery_retry',seconds]);
}
module.exports={failed};
