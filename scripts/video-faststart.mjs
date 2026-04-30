import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';
import path from 'node:path';

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') args.input = argv[++i] || null;
    else if (a === '--output') args.output = argv[++i] || null;
  }
  return args;
}

const { input, output } = parseArgs(process.argv);
if (!input) {
  console.error('Usage: node scripts/video-faststart.mjs --input <input.mp4> [--output <output.mp4>]');
  process.exit(1);
}

const inputAbs = path.resolve(input);
const st = await stat(inputAbs).catch(() => null);
if (!st || !st.isFile()) {
  console.error('Input file not found:', inputAbs);
  process.exit(1);
}

const outAbs = path.resolve(
  output || inputAbs.replace(/\.mp4$/i, '.faststart.mp4')
);

await run('ffmpeg', ['-y', '-i', inputAbs, '-c', 'copy', '-movflags', '+faststart', outAbs]);
