const express = require('express');
const { signJwt, verifyJwt } = require('../utils/jwt');
const { parseCookies } = require('../utils/cookies');

const router = express.Router();

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'mr_auth';

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAgeMs = 1000 * 60 * 60 * 24 * 30;

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('SUPABASE_URL is not set');
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY is not set');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

  return { url, anonKey, serviceRoleKey };
}

async function supabaseAuthRequest(path, body) {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function authFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return null;
  return verifyJwt(token);
}

router.post('/signin', async (req, res) => {
  try {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email и пароль обязательны' });
    }

    const { response, data } = await supabaseAuthRequest(
      '/auth/v1/token?grant_type=password',
      {
        email,
        password,
      }
    );

    if (!response.ok) {
      const errorDescription =
        data?.error_description ||
        data?.msg ||
        data?.error ||
        'Ошибка авторизации';
      const normalized = String(errorDescription);
      const message =
        normalized.toLowerCase().includes('invalid login credentials') ||
        normalized.toLowerCase().includes('invalid')
          ? 'Неверный email или пароль'
          : normalized;
      return res.status(401).json({ success: false, error: message });
    }

    const user = data?.user;
    if (!user?.id) {
      return res
        .status(500)
        .json({ success: false, error: 'Не удалось получить пользователя' });
    }

    const jwt = signJwt(
      {
        sub: user.id,
        email: user.email || email,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
      },
      60 * 60 * 24 * 30
    );

    res.cookie(AUTH_COOKIE_NAME, jwt, getCookieOptions());
    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email || email,
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name || null,
        },
      },
    });
  } catch (error) {
    console.error('Auth signin error:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email и пароль обязательны' });
    }

    const { response, data } = await supabaseAuthRequest('/auth/v1/signup', {
      email,
      password,
      data: name ? { full_name: name } : undefined,
    });

    if (!response.ok) {
      const message = String(
        data?.msg ||
          data?.error_description ||
          data?.error ||
          'Ошибка регистрации'
      );
      return res.status(400).json({ success: false, error: message });
    }

    const user = data?.user;
    const session = data?.session;

    if (session?.access_token && user?.id) {
      const jwt = signJwt(
        {
          sub: user.id,
          email: user.email || email,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            name ||
            null,
        },
        60 * 60 * 24 * 30
      );

      res.cookie(AUTH_COOKIE_NAME, jwt, getCookieOptions());
      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email || email,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              name ||
              null,
          },
        },
      });
    }

    return res.json({
      success: true,
      data: {
        requiresEmailConfirmation: true,
      },
    });
  } catch (error) {
    console.error('Auth signup error:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...getCookieOptions(),
      maxAge: 0,
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('Auth logout error:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const payload = authFromRequest(req);
    if (!payload?.sub) {
      return res.status(401).json({ success: false, error: 'Не авторизован' });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: payload.sub,
          email: payload.email || null,
          full_name: payload.full_name || null,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Не авторизован' });
  }
});

router.get('/purchases', async (req, res) => {
  try {
    const payload = authFromRequest(req);
    if (!payload?.sub) {
      return res.status(401).json({ success: false, error: 'Не авторизован' });
    }

    const { url, serviceRoleKey } = getSupabaseConfig();
    const purchasesUrl = new URL(`${url}/rest/v1/purchases`);
    purchasesUrl.searchParams.set('select', '*,products(title,description)');
    purchasesUrl.searchParams.set('user_id', `eq.${payload.sub}`);
    purchasesUrl.searchParams.set('status', 'eq.active');

    const response = await fetch(purchasesUrl.toString(), {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Supabase purchases error:', response.status, text);
      return res
        .status(500)
        .json({ success: false, error: 'Не удалось получить покупки' });
    }

    const data = await response.json().catch(() => []);
    return res.json({ success: true, data: { purchases: data } });
  } catch (error) {
    console.error('Auth purchases error:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
