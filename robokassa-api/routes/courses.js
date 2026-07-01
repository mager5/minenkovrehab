const express = require('express');
const { verifyJwt } = require('../utils/jwt');
const { parseCookies } = require('../utils/cookies');

const router = express.Router();

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'mr_auth';
const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
const ALLOWED_VIDEO_PATH_PREFIXES = [`${INSTRUCTOR_USER_ID}/`, 'My Bucket/'];
const WEEKLY_TEST_PREFERRED_PATHS = [
  'My Bucket/Resection/test-razgibaniya-2.kf2s.mp4',
];
const STAGE_PREFERRED_PATHS = {
  1: ['My Bucket/Resection/ostry-etap-0-2-nedeli.kf2s.mp4'],
  2: [
    'My Bucket/Resection/ranniy-vosstanovitelnyy-etap-2-4-nedeli.kf2s.mp4',
    'My Bucket/Resection/ranniy-etap-2-4-nedeli.kf2s.mp4',
  ],
  3: ['My Bucket/Resection/pozdniy-vosstanovitelnyy-etap-4-8-nedel.kf2s.mp4'],
};

const STAGE_VIDEO_PATHS = {
  1: '6639a601-4007-46d8-a058-fe2cd2086fa1/1771875320518_1_HLh9prrm_mp4.mp4',
  2: '6639a601-4007-46d8-a058-fe2cd2086fa1/1774614743708_mHTR6x8C_mp4.mp4',
  3: '6639a601-4007-46d8-a058-fe2cd2086fa1/1774895893009________________________________________________4_8________.mp4',
};
const PRESENTATION_VIDEO_PATH = 'My Bucket/Resection/Presentation.mp4';

function applyCors(req, res) {
  const origin = req.get('origin');
  const allowedOrigins = [
    'https://minenkovrehab.ru',
    'https://www.minenkovrehab.ru',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Range'
  );
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
}

router.options('/meniscus/*', (req, res) => {
  applyCors(req, res);
  return res.status(204).send('');
});

router.options('/products/*', (req, res) => {
  applyCors(req, res);
  return res.status(204).send('');
});

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL is not set');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return { url, serviceRoleKey };
}

function authFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return null;
  return verifyJwt(token);
}

function requireAuth(req, res) {
  try {
    const payload = authFromRequest(req);
    if (!payload?.sub) {
      res
        .status(401)
        .json({ success: false, message: 'Auth session missing!' });
      return null;
    }
    return payload;
  } catch (error) {
    res.status(401).json({ success: false, message: 'Auth session missing!' });
    return null;
  }
}

async function supabaseRestGet(pathWithQuery) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}${pathWithQuery}`, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

async function storageObjectExists(bucket, objectPath) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const encodedPath = encodeStoragePath(objectPath);

  const response = await fetch(
    `${url}/storage/v1/object/info/${bucket}/${encodedPath}`,
    {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );

  if (response.ok) return true;
  return false;
}

function encodeStoragePath(objectPath) {
  return String(objectPath)
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
}

function buildPublicUrl(bucket, objectPath) {
  const { url } = getSupabaseConfig();
  const encodedPath = encodeStoragePath(objectPath);
  return `${url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

async function createSignedUrl(bucket, objectPath, expiresInSeconds) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const encodedPath = encodeStoragePath(objectPath);

  const response = await fetch(
    `${url}/storage/v1/object/sign/${bucket}/${encodedPath}`,
    {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.msg ||
      `Storage sign error: ${response.status}`;
    throw new Error(String(message));
  }

  const signed =
    data?.signedUrl || data?.signedURL || data?.signed_url || data?.signedURL;

  if (!signed || typeof signed !== 'string') {
    throw new Error('Не удалось получить signed URL');
  }

  if (signed.startsWith('http://') || signed.startsWith('https://')) {
    return signed;
  }

  return `${url.replace(/\/$/, '')}${signed.startsWith('/') ? '' : '/'}${signed}`;
}

async function fetchStorageObjectText(bucket, objectPath) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const encodedPath = encodeStoragePath(objectPath);
  const response = await fetch(
    `${url.replace(/\/$/, '')}/storage/v1/object/${bucket}/${encodedPath}`,
    {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Storage object fetch error: ${response.status}`);
  }
  return await response.text();
}

function getSelfBaseUrl(req) {
  // Старый вариант (оставлен для истории):
  // const host = req.get('host');
  // return `${req.protocol}://${host}`;

  const host = req.get('host');
  const forwardedProtoHeader = req.get('x-forwarded-proto') || '';
  const forwardedProto = String(forwardedProtoHeader).split(',')[0]?.trim();
  const proto =
    forwardedProto || (req.secure ? 'https' : '') || req.protocol || 'https';
  return `${proto}://${host}`;
}

function getDirname(objectPath) {
  const parts = String(objectPath).split('/');
  parts.pop();
  return parts.join('/');
}

function joinStoragePath(dir, relativePath) {
  if (!dir) return relativePath;
  return `${dir.replace(/\/$/, '')}/${String(relativePath).replace(/^\//, '')}`;
}

function isAllowedVideoPath(objectPath) {
  return ALLOWED_VIDEO_PATH_PREFIXES.some(prefix =>
    String(objectPath || '').startsWith(prefix)
  );
}

function deriveHlsMasterPathFromMp4Path(mp4Path) {
  const p = String(mp4Path);
  if (!/\.mp4(\?|#|$)/i.test(p)) return null;
  return p.replace(/\.mp4(\?|#|$)/i, '_hls/master.m3u8');
}

async function isHlsReady(bucket, masterPath) {
  if (!masterPath) return false;
  const existsMaster = await storageObjectExists(bucket, masterPath);
  if (!existsMaster) return false;
  const baseDir = getDirname(masterPath);
  const variants = ['v0/prog.m3u8', 'v1/prog.m3u8', 'v2/prog.m3u8'].map(rel =>
    joinStoragePath(baseDir, rel)
  );
  for (const p of variants) {
    const ok = await storageObjectExists(bucket, p);
    if (!ok) return false;
  }
  return true;
}

async function pickLatestVideoPathByTitleLike(titleLikePattern) {
  const { response, data } = await supabaseRestGet(
    `/rest/v1/videos?select=file_path,title,created_at&user_id=eq.${encodeURIComponent(
      INSTRUCTOR_USER_ID
    )}&title=ilike.${encodeURIComponent(titleLikePattern)}&order=created_at.desc&limit=1`
  );

  if (!response.ok) {
    const message =
      (data && data.message) ||
      (data && data.error) ||
      `Supabase videos query error: ${response.status}`;
    throw new Error(String(message));
  }

  const row = Array.isArray(data) ? data[0] : null;
  const filePath = row?.file_path || null;
  return typeof filePath === 'string' ? filePath : null;
}

async function resolveStagePath(stage) {
  const bucket = 'videos';
  const candidates = [];

  if (stage === '1') {
    candidates.push(...(STAGE_PREFERRED_PATHS['1'] || []));
    candidates.push(await pickLatestVideoPathByTitleLike('*острый*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*0-2*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*0–2*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*0 2*'));
    candidates.push(STAGE_VIDEO_PATHS['1'] || null);
  } else if (stage === '2') {
    candidates.push(...(STAGE_PREFERRED_PATHS['2'] || []));
    candidates.push(await pickLatestVideoPathByTitleLike('*ранний восстанов*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*ранний*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*2-4*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*2–4*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*2 4*'));

    // Старый вариант (оставлен для истории): всегда возвращали захардкоженный путь для stage=2
    // candidates.push(STAGE_VIDEO_PATHS['2'] || null);

    candidates.push(STAGE_VIDEO_PATHS['2'] || null);
  } else if (stage === '3') {
    candidates.push(...(STAGE_PREFERRED_PATHS['3'] || []));
    candidates.push(await pickLatestVideoPathByTitleLike('*поздний*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*4-8*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*4–8*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*4 8*'));
    candidates.push(STAGE_VIDEO_PATHS['3'] || null);
  } else {
    candidates.push(STAGE_VIDEO_PATHS[stage] || null);
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (!isAllowedVideoPath(candidate)) continue;
    const exists = await storageObjectExists(bucket, candidate);
    if (exists) return candidate;
  }

  return null;
}

router.get('/meniscus/stage-video', async (req, res) => {
  try {
    applyCors(req, res);

    const stage = typeof req.query.stage === 'string' ? req.query.stage : '';
    const fallbackPath = STAGE_VIDEO_PATHS[stage];
    if (!fallbackPath) {
      return res
        .status(400)
        .json({ success: false, message: 'Неизвестный этап' });
    }

    const auth = requireAuth(req, res);
    if (!auth) return;

    const path = (await resolveStagePath(stage)) || null;
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Видео не найдено',
      });
    }

    const publicUrl = buildPublicUrl('videos', path);
    let signedUrl = null;
    try {
      signedUrl = await createSignedUrl(
        'videos',
        path,
        SIGNED_URL_EXPIRES_IN_SECONDS
      );
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('object not found')) {
        return res.status(404).json({
          success: false,
          message: 'Видео не найдено',
        });
      }
      throw e;
    }

    const hlsMasterPath = deriveHlsMasterPathFromMp4Path(path);
    let hlsMasterUrl = null;
    if (hlsMasterPath) {
      const exists = await isHlsReady('videos', hlsMasterPath);
      if (exists) {
        hlsMasterUrl = `${getSelfBaseUrl(
          req
        )}/api/courses/meniscus/hls/master?path=${encodeURIComponent(
          hlsMasterPath
        )}`;
      }
    }

    const proxyUrl = `${getSelfBaseUrl(
      req
    )}/api/courses/meniscus/hls/segment?path=${encodeURIComponent(path)}`;

    // Старый вариант (оставлен для истории): publicUrl мог быть недоступен при private bucket
    // const url = publicUrl || signedUrl;
    //
    // Старый вариант (оставлен для истории): отдавали прямой signedUrl на Supabase,
    // но в некоторых браузерах это приводит к ORB/CORP блокировке mp4.
    // const url = signedUrl;
    const url = proxyUrl;
    return res.status(200).json({
      success: true,
      data: {
        url,
        proxyUrl,
        publicUrl,
        signedUrl,
        filePath: path,
        hlsMasterUrl,
        hlsMasterPath,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Внутренняя ошибка сервера',
    });
  }
});

router.get('/meniscus/weekly-test', async (req, res) => {
  try {
    applyCors(req, res);

    const auth = requireAuth(req, res);
    if (!auth) return;

    // Старый приоритет (оставлен для истории): искали по "еженедель"
    // const path = await pickLatestVideoPathByTitleLike('*еженедель*');

    const candidates = [
      ...WEEKLY_TEST_PREFERRED_PATHS,
      await pickLatestVideoPathByTitleLike('*разгиб*'),
      await pickLatestVideoPathByTitleLike('*еженедель*'),
      await pickLatestVideoPathByTitleLike('*тест*'),
    ].filter(Boolean);

    let path = null;
    for (const candidate of candidates) {
      if (!isAllowedVideoPath(candidate)) continue;
      const exists = await storageObjectExists('videos', candidate);
      if (exists) {
        path = candidate;
        break;
      }
    }

    if (!path) {
      return res
        .status(404)
        .json({ success: false, message: 'Видео не найдено' });
    }

    const publicUrl = buildPublicUrl('videos', path);
    let signedUrl = null;
    try {
      signedUrl = await createSignedUrl(
        'videos',
        path,
        SIGNED_URL_EXPIRES_IN_SECONDS
      );
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('object not found')) {
        return res
          .status(404)
          .json({ success: false, message: 'Видео не найдено' });
      }
      throw e;
    }

    const hlsMasterPath = deriveHlsMasterPathFromMp4Path(path);
    let hlsMasterUrl = null;
    if (hlsMasterPath) {
      const exists = await isHlsReady('videos', hlsMasterPath);
      if (exists) {
        hlsMasterUrl = `${getSelfBaseUrl(
          req
        )}/api/courses/meniscus/hls/master?path=${encodeURIComponent(
          hlsMasterPath
        )}`;
      }
    }

    const proxyUrl = `${getSelfBaseUrl(
      req
    )}/api/courses/meniscus/hls/segment?path=${encodeURIComponent(path)}`;

    // Старый вариант (оставлен для истории): publicUrl мог быть недоступен при private bucket
    // const url = publicUrl || signedUrl;
    //
    // Старый вариант (оставлен для истории): отдавали прямой signedUrl на Supabase,
    // но в некоторых браузерах это приводит к ORB/CORP блокировке mp4.
    // const url = signedUrl;
    const url = proxyUrl;
    return res.status(200).json({
      success: true,
      data: {
        url,
        proxyUrl,
        publicUrl,
        signedUrl,
        filePath: path,
        hlsMasterUrl,
        hlsMasterPath,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Внутренняя ошибка сервера',
    });
  }
});

router.get('/products/presentation-video', async (req, res) => {
  try {
    applyCors(req, res);

    const exists = await storageObjectExists('videos', PRESENTATION_VIDEO_PATH);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Видео не найдено',
      });
    }

    const publicUrl = buildPublicUrl('videos', PRESENTATION_VIDEO_PATH);
    let signedUrl = null;
    try {
      signedUrl = await createSignedUrl(
        'videos',
        PRESENTATION_VIDEO_PATH,
        SIGNED_URL_EXPIRES_IN_SECONDS
      );
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('object not found')) {
        return res.status(404).json({
          success: false,
          message: 'Видео не найдено',
        });
      }
      throw e;
    }

    const url = `${getSelfBaseUrl(req)}/api/courses/products/presentation-video/stream`;

    return res.status(200).json({
      success: true,
      data: {
        url,
        proxyUrl: url,
        publicUrl,
        signedUrl,
        filePath: PRESENTATION_VIDEO_PATH,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Внутренняя ошибка сервера',
    });
  }
});

router.get('/products/presentation-video/stream', async (req, res) => {
  try {
    applyCors(req, res);

    const exists = await storageObjectExists('videos', PRESENTATION_VIDEO_PATH);
    if (!exists) {
      return res.status(404).send('Not Found');
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    const encodedPath = encodeStoragePath(PRESENTATION_VIDEO_PATH);
    const upstreamUrl = `${url.replace(/\/$/, '')}/storage/v1/object/videos/${encodedPath}`;

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };
    const range = req.get('range');
    if (range) {
      headers.Range = range;
    }

    const upstream = await fetch(upstreamUrl, { method: 'GET', headers });
    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).send('Upstream Error');
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    const acceptRanges = upstream.headers.get('accept-ranges');
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(buffer);
  } catch (_error) {
    return res.status(500).send('Internal Server Error');
  }
});

router.get('/meniscus/hls/master', async (req, res) => {
  try {
    applyCors(req, res);

    const auth = requireAuth(req, res);
    if (!auth) return;

    const masterPath = typeof req.query.path === 'string' ? req.query.path : '';
    if (!masterPath || !isAllowedVideoPath(masterPath)) {
      return res.status(400).send('Bad Request');
    }

    const exists = await storageObjectExists('videos', masterPath);
    if (!exists) {
      return res.status(404).send('Not Found');
    }

    const text = await fetchStorageObjectText('videos', masterPath);
    const baseDir = getDirname(masterPath);

    const playlistUrlBase = `${getSelfBaseUrl(req)}/api/courses/meniscus/hls/playlist?path=`;
    const rewritten = text
      .split(/\r?\n/)
      .map(line => {
        if (!line || line.startsWith('#')) return line;
        const variantPath = joinStoragePath(baseDir, line);
        return `${playlistUrlBase}${encodeURIComponent(variantPath)}`;
      })
      .join('\n');

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(rewritten);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

router.get('/meniscus/hls/playlist', async (req, res) => {
  try {
    applyCors(req, res);

    const auth = requireAuth(req, res);
    if (!auth) return;

    const playlistPath =
      typeof req.query.path === 'string' ? req.query.path : '';
    if (!playlistPath || !isAllowedVideoPath(playlistPath)) {
      return res.status(400).send('Bad Request');
    }

    const exists = await storageObjectExists('videos', playlistPath);
    if (!exists) {
      return res.status(404).send('Not Found');
    }

    const text = await fetchStorageObjectText('videos', playlistPath);
    const baseDir = getDirname(playlistPath);

    const rewrittenLines = await Promise.all(
      text.split(/\r?\n/).map(async line => {
        if (!line || line.startsWith('#')) return line;
        if (/^https?:\/\//i.test(line)) return line;
        const segmentPath = joinStoragePath(baseDir, line);
        try {
          // Старый вариант (оставлен для истории): отдавали прямые signed URL на Supabase,
          // но в некоторых браузерах это приводит к ORB/CORS блокировке сегментов.
          // return await createSignedUrl(
          //   'videos',
          //   segmentPath,
          //   SIGNED_URL_EXPIRES_IN_SECONDS
          // );

          return `${getSelfBaseUrl(
            req
          )}/api/courses/meniscus/hls/segment?path=${encodeURIComponent(
            segmentPath
          )}`;
        } catch (_e) {
          return line;
        }
      })
    );

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(rewrittenLines.join('\n'));
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

router.get('/meniscus/hls/segment', async (req, res) => {
  try {
    applyCors(req, res);

    const auth = requireAuth(req, res);
    if (!auth) return;

    const objectPath = typeof req.query.path === 'string' ? req.query.path : '';
    if (!objectPath || !isAllowedVideoPath(objectPath)) {
      return res.status(400).send('Bad Request');
    }

    const exists = await storageObjectExists('videos', objectPath);
    if (!exists) {
      return res.status(404).send('Not Found');
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    const encodedPath = encodeStoragePath(objectPath);
    const upstreamUrl = `${url.replace(/\/$/, '')}/storage/v1/object/videos/${encodedPath}`;

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };
    const range = req.get('range');
    if (range) {
      headers.Range = range;
    }

    const upstream = await fetch(upstreamUrl, { method: 'GET', headers });
    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).send('Upstream Error');
    }

    const lower = String(objectPath).toLowerCase();
    if (lower.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (lower.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
    } else if (lower.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    const acceptRanges = upstream.headers.get('accept-ranges');
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(buffer);
  } catch (_error) {
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
