import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (
  execFileSync('git', ['branch', '--show-current'], {
    cwd: root,
    encoding: 'utf8',
  }).trim() !== 'ai-test'
)
  throw Error('Run this experiment only on ai-test.');
if (
  ['.env', '.env.local', '.env.development', '.env.development.local'].some(
    file => existsSync(path.join(root, file))
  )
)
  throw Error(
    'This isolated copy must not contain environment files. Configure the API key in the local UI.'
  );
const env = {};
for (const name of ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'SYSTEMROOT'])
  if (process.env[name]) env[name] = process.env[name];
Object.assign(env, {
  NODE_ENV: 'development',
  NEXT_TELEMETRY_DISABLED: '1',
  AI_TEST_ENABLED: '1',
  NEXT_PUBLIC_AI_TEST_ENABLED: '1',
  AI_TEST_ORIGIN: 'http://127.0.0.1:4310',
  OPENAI_MODEL: 'gpt-5-mini',
});
if (process.env.OPENAI_API_KEY) env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const child = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--webpack',
    '--hostname',
    '127.0.0.1',
    '--port',
    '4310',
  ],
  { cwd: root, env, stdio: 'inherit' }
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
child.on('exit', code => process.exit(code ?? 1));
