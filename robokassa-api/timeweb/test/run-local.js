const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

// Never accepts DATABASE_URL/PGHOST/.env or an existing cluster.
const directory = mkdtempSync(join(tmpdir(), 'rehab-stage1-'));
const bin = process.env.STAGE1_POSTGRES_BIN || '/opt/homebrew/opt/postgresql@17/bin';
const environment = { PATH: process.env.PATH, HOME: directory, LANG: 'C', LC_ALL: 'C' };
function run(command, args) {
  const result = spawnSync(command, args, { env: environment, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result;
}
let started = false;
try {
  run(join(bin, 'initdb'), ['-D', join(directory, 'data'), '-U', 'stage1_owner', '--auth=trust', '--encoding=UTF8', '--locale=C']);
  run(join(bin, 'pg_ctl'), ['-D', join(directory, 'data'), '-l', join(directory, 'postgres.log'), '-o', `-k ${directory} -h 127.0.0.1 -p 55439`, '-w', 'start']);
  started = true;
  run(join(bin, 'createdb'), ['-h', directory, '-p', '55439', '-U', 'stage1_owner', 'rehab_stage1_test']);
  run(join(bin, 'createdb'), ['-h', directory, '-p', '55439', '-U', 'stage1_owner', 'rehab_stage2_test']);
  run(join(bin, 'createdb'), ['-h', directory, '-p', '55439', '-U', 'stage1_owner', 'rehab_stage4_test']);
  const tests=process.argv.includes('--changed-private')?['auth.test.js','import.test.js','migrations.test.js','private.test.js']:['payments.test.js','auth.test.js','import.test.js','providers.test.js','migrations.test.js'];
  const result = spawnSync(process.execPath, ['--test', ...tests.map(name=>resolve(__dirname,name))], {
    stdio: 'inherit', env: { ...environment, STAGE1_TEST_SOCKET: directory, ...(process.env.STAGE3_BROWSER ? {STAGE3_BROWSER:'1'}:{}), ...(process.env.STAGE2_NEXT_BUILD ? {STAGE2_NEXT_BUILD:process.env.STAGE2_NEXT_BUILD}:{}) },
  });
  if(result.status===0){if(process.argv.includes('--changed-private'))for(const name of ['001_payment_core.sql','002_auth.sql','003_import.sql','004_providers.sql','005_legacy_and_confirmation.sql'])run(join(bin,'psql'),['-h',directory,'-p','55439','-U','stage1_owner','-d','rehab_stage1_test','-v','ON_ERROR_STOP=1','-f',resolve(__dirname,'../migrations',name)]);const worker=spawnSync(process.execPath,[resolve(__dirname,'worker-smoke.js')],{stdio:'inherit',env:{...environment,STAGE1_TEST_SOCKET:directory}});if(worker.status!==0)throw new Error('worker_smoke_failed');}
  process.exitCode = result.status === null ? 1 : result.status;
} catch (error) {
  console.error(error.message);
  if (started) console.error(readFileSync(join(directory, 'postgres.log'), 'utf8'));
  process.exitCode = 1;
} finally {
  if (started) run(join(bin, 'pg_ctl'), ['-D', join(directory, 'data'), '-m', 'fast', '-w', 'stop']);
  rmSync(directory, { recursive: true, force: true });
}
