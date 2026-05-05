import { createClient } from '@supabase/supabase-js';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    bucket: 'videos',
    local: null,
    remote: null,
    cacheControl: '31536000',
    upsert: true,
    mode: 'rest',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--bucket') args.bucket = argv[++i] || args.bucket;
    else if (a === '--local') args.local = argv[++i] || null;
    else if (a === '--remote') args.remote = argv[++i] || null;
    else if (a === '--cacheControl') args.cacheControl = argv[++i] || args.cacheControl;
    else if (a === '--no-upsert') args.upsert = false;
    else if (a === '--mode') args.mode = argv[++i] || args.mode;
  }
  return args;
}

function getContentType(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (lower.endsWith('.ts')) return 'video/mp2t';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (ent.isFile()) {
      files.push(full);
    }
  }
  return files;
}

const { bucket, local, remote, cacheControl, upsert, mode } = parseArgs(process.argv);
if (!local || !remote) {
  console.error(
    'Usage: node scripts/supabase-upload.mjs --local <path> --remote <remotePrefix> [--bucket videos] [--cacheControl 31536000] [--mode rest|client]'
  );
  process.exit(1);
}

// Старый вариант (оставлен для истории): ожидали только SUPABASE_URL
// const url = process.env.SUPABASE_URL;
const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    'SUPABASE_URL (или NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY is missing in env'
  );
  process.exit(1);
}

const localAbs = path.resolve(local);
const st = await stat(localAbs).catch(() => null);
if (!st) {
  console.error('Local path not found:', localAbs);
  process.exit(1);
}

function encodeStoragePath(objectPath) {
  return String(objectPath)
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
}

async function uploadViaRest({
  url,
  serviceKey,
  bucket,
  remotePath,
  body,
  contentType,
  cacheControl,
  upsert,
}) {
  const endpoint = `${String(url).replace(/\/$/, '')}/storage/v1/object/${bucket}/${encodeStoragePath(
    remotePath
  )}`;

  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': contentType,
          'Cache-Control': `max-age=${String(cacheControl)}`,
          'x-upsert': upsert ? 'true' : 'false',
        },
        body,
      });

      if (response.ok) return;

      const text = await response.text().catch(() => '');
      throw new Error(
        `${response.status} ${response.statusText}${
          text ? `: ${text.slice(0, 500)}` : ''
        }`
      );
    } catch (err) {
      lastErr = err;
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 750 * attempt));
        continue;
      }
      throw lastErr;
    }
  }
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const remotePrefix = remote.replace(/^\//, '').replace(/\/$/, '');
const files = st.isDirectory() ? await walk(localAbs) : [localAbs];

for (const file of files) {
  const rel = st.isDirectory()
    ? path.relative(localAbs, file).split(path.sep).join('/')
    : path.basename(file);
  const remotePath = `${remotePrefix}/${rel}`.replace(/\/{2,}/g, '/');
  const body = await readFile(file);
  const contentType = getContentType(file);

  if (mode === 'client') {
    const { error } = await supabase.storage.from(bucket).upload(remotePath, body, {
      contentType,
      cacheControl: String(cacheControl),
      upsert,
    });

    if (error) {
      throw new Error(`${remotePath}: ${error.message}`);
    }
  } else {
    await uploadViaRest({
      url,
      serviceKey,
      bucket,
      remotePath,
      body,
      contentType,
      cacheControl,
      upsert,
    });
  }

  process.stdout.write(`Uploaded: ${remotePath}\n`);
}
