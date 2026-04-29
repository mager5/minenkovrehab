import { NextRequest } from 'next/server';

const REMOTE_BASE =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'https://api.minenkovrehab.ru';

function rewriteSetCookie(setCookie: string, isHttps: boolean): string {
  // Старый вариант на regex (оставлен для истории):
  // let value = setCookie;
  // value = value.replace(/;\s*domain=[^;]+/gi, '');
  // if (!isHttps) {
  //   value = value.replace(/;\s*secure/gi, '');
  //   value = value.replace(/;\s*samesite=none/gi, '; SameSite=Lax');
  // }
  // return value;

  const parts = String(setCookie)
    .split(';')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return setCookie;

  const nameValue = parts[0] || '';
  const attrs = parts.slice(1);
  const kept: string[] = [nameValue];
  let hadSameSiteNone = false;

  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower.startsWith('domain=')) continue;
    if (!isHttps && lower === 'secure') continue;
    if (lower === 'samesite=none') {
      hadSameSiteNone = true;
      if (!isHttps) continue;
    }
    kept.push(attr);
  }

  if (!isHttps && hadSameSiteNone) {
    kept.push('SameSite=Lax');
  }

  return kept.join('; ');
}

async function proxyAuth(
  request: NextRequest,
  pathParts: string[] | undefined
): Promise<Response> {
  const path = (pathParts || []).join('/');
  const targetUrl = new URL(
    `/api/auth/${path}`,
    REMOTE_BASE.endsWith('/') ? REMOTE_BASE : `${REMOTE_BASE}/`
  );

  if (request.nextUrl.search) {
    targetUrl.search = request.nextUrl.search;
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'content-length') return;
    headers.set(key, value);
  });

  let body: ArrayBuffer | undefined;
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  const init: RequestInit = { method, headers, redirect: 'manual' };
  if (body !== undefined) {
    init.body = body;
  }
  const upstream = await fetch(targetUrl.toString(), init);

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'set-cookie') return;
    responseHeaders.set(key, value);
  });

  responseHeaders.delete('set-cookie');

  const isHttps = request.nextUrl.protocol === 'https:';
  // Старый код (в Node/undici часто возвращает null, из-за чего cookie не прокидывался):
  // const setCookie = upstream.headers.get('set-cookie');
  // if (setCookie) {
  //   responseHeaders.append('set-cookie', rewriteSetCookie(setCookie, isHttps));
  // }

  const headersAny = upstream.headers as unknown as {
    getSetCookie?: () => string[];
    get?: (name: string) => string | null;
  };

  // Старый код (ломался из-за потери this и приводил к "Illegal invocation"):
  // const getSetCookie = (upstream.headers as unknown as {
  //   getSetCookie?: () => string[];
  // }).getSetCookie;
  // const setCookies =
  //   typeof getSetCookie === 'function'
  //     ? getSetCookie()
  //     : upstream.headers.get('set-cookie')
  //       ? [upstream.headers.get('set-cookie') as string]
  //       : [];

  const setCookies =
    typeof headersAny.getSetCookie === 'function'
      ? headersAny.getSetCookie()
      : headersAny.get?.('set-cookie')
        ? [headersAny.get('set-cookie') as string]
        : [];

  for (const cookie of setCookies.filter(Boolean)) {
    responseHeaders.append('set-cookie', rewriteSetCookie(cookie, isHttps));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { path?: string[] } }
): Promise<Response> {
  return proxyAuth(request, context.params.path);
}

export async function POST(
  request: NextRequest,
  context: { params: { path?: string[] } }
): Promise<Response> {
  return proxyAuth(request, context.params.path);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: { path?: string[] } }
): Promise<Response> {
  return proxyAuth(request, context.params.path);
}
