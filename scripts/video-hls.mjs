import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
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
  const args = {
    input: null,
    outDir: null,
    segmentTime: '4',
    crf: '21',
    preset: 'veryfast',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') args.input = argv[++i] || null;
    else if (a === '--outDir') args.outDir = argv[++i] || null;
    else if (a === '--segmentTime') args.segmentTime = argv[++i] || args.segmentTime;
    else if (a === '--crf') args.crf = argv[++i] || args.crf;
    else if (a === '--preset') args.preset = argv[++i] || args.preset;
  }
  return args;
}

const { input, outDir, segmentTime, crf, preset } = parseArgs(process.argv);
if (!input) {
  console.error(
    'Usage: node scripts/video-hls.mjs --input <input.mp4> [--outDir <dir>] [--segmentTime 4] [--crf 21] [--preset veryfast]'
  );
  process.exit(1);
}

const inputAbs = path.resolve(input);
const st = await stat(inputAbs).catch(() => null);
if (!st || !st.isFile()) {
  console.error('Input file not found:', inputAbs);
  process.exit(1);
}

const defaultOutDir = inputAbs.replace(/\.mp4$/i, '_hls');
const outAbs = path.resolve(outDir || defaultOutDir);
await mkdir(outAbs, { recursive: true });

const segmentPattern = path.join(outAbs, 'v%v', 'seg_%06d.ts');
const variantPlaylistPattern = path.join(outAbs, 'v%v', 'prog.m3u8');
const masterName = 'master.m3u8';

const filterComplex =
  '[0:v]split=3[v0][v1][v2];' +
  '[v0]scale=w=1920:h=-2:flags=lanczos[v0out];' +
  '[v1]scale=w=1280:h=-2:flags=lanczos[v1out];' +
  '[v2]scale=w=854:h=-2:flags=lanczos[v2out]';

await run('ffmpeg', [
  '-y',
  '-i',
  inputAbs,
  '-filter_complex',
  filterComplex,
  '-map',
  '[v0out]',
  '-map',
  '0:a:0?',
  '-map',
  '[v1out]',
  '-map',
  '0:a:0?',
  '-map',
  '[v2out]',
  '-map',
  '0:a:0?',
  '-c:v:0',
  'libx264',
  '-preset',
  String(preset),
  '-crf',
  String(crf),
  '-profile:v:0',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-force_key_frames',
  'expr:gte(t,n_forced*2)',
  '-c:v:1',
  'libx264',
  '-preset',
  String(preset),
  '-crf',
  String(crf),
  '-profile:v:1',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-force_key_frames',
  'expr:gte(t,n_forced*2)',
  '-c:v:2',
  'libx264',
  '-preset',
  String(preset),
  '-crf',
  String(crf),
  '-profile:v:2',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-force_key_frames',
  'expr:gte(t,n_forced*2)',
  '-c:a',
  'aac',
  '-b:a',
  '128k',
  '-ar',
  '48000',
  '-f',
  'hls',
  '-hls_time',
  String(segmentTime),
  '-hls_playlist_type',
  'vod',
  '-hls_flags',
  'independent_segments',
  '-hls_segment_filename',
  segmentPattern,
  '-master_pl_name',
  masterName,
  '-var_stream_map',
  'v:0,a:0 v:1,a:1 v:2,a:2',
  variantPlaylistPattern,
]);
