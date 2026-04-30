const express = require('express');
const { verifyJwt } = require('../utils/jwt');
const { parseCookies } = require('../utils/cookies');

const router = express.Router();

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'mr_auth';
const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';

const STAGE_VIDEO_PATHS = {
  1: '6639a601-4007-46d8-a058-fe2cd2086fa1/1771875320518_1_HLh9prrm_mp4.mp4',
  2: '6639a601-4007-46d8-a058-fe2cd2086fa1/1774614743708_mHTR6x8C_mp4.mp4',
  3: '6639a601-4007-46d8-a058-fe2cd2086fa1/1774895893009________________________________________________4_8________.mp4',
};

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
    candidates.push(await pickLatestVideoPathByTitleLike('*острый*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*0-2*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*0–2*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*0 2*'));
    candidates.push(STAGE_VIDEO_PATHS['1'] || null);
  } else if (stage === '2') {
    candidates.push(await pickLatestVideoPathByTitleLike('*ранний восстанов*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*ранний*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*2-4*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*2–4*'));
    candidates.push(await pickLatestVideoPathByTitleLike('*2 4*'));

    // Старый вариант (оставлен для истории): всегда возвращали захардкоженный путь для stage=2
    // candidates.push(STAGE_VIDEO_PATHS['2'] || null);

    candidates.push(STAGE_VIDEO_PATHS['2'] || null);
  } else if (stage === '3') {
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
    if (!String(candidate).startsWith(`${INSTRUCTOR_USER_ID}/`)) continue;
    const exists = await storageObjectExists(bucket, candidate);
    if (exists) return candidate;
  }

  return null;
}

router.get('/meniscus/stage-video', async (req, res) => {
  try {
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

    let signedUrl = null;
    try {
      signedUrl = await createSignedUrl('videos', path, 3600);
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
    return res.status(200).json({
      success: true,
      data: { signedUrl, filePath: path },
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
    const auth = requireAuth(req, res);
    if (!auth) return;

    // Старый приоритет (оставлен для истории): искали по "еженедель"
    // const path = await pickLatestVideoPathByTitleLike('*еженедель*');

    const candidates = [
      await pickLatestVideoPathByTitleLike('*разгиб*'),
      await pickLatestVideoPathByTitleLike('*еженедель*'),
      await pickLatestVideoPathByTitleLike('*тест*'),
    ].filter(Boolean);

    let path = null;
    for (const candidate of candidates) {
      if (!String(candidate).startsWith(`${INSTRUCTOR_USER_ID}/`)) continue;
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

    let signedUrl = null;
    try {
      signedUrl = await createSignedUrl('videos', path, 3600);
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('object not found')) {
        return res
          .status(404)
          .json({ success: false, message: 'Видео не найдено' });
      }
      throw e;
    }
    return res.status(200).json({
      success: true,
      data: { signedUrl, filePath: path },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Внутренняя ошибка сервера',
    });
  }
});

module.exports = router;
