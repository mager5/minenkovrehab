import { NextRequest } from 'next/server';

const REMOTE_BASE =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'https://api.minenkovrehab.ru';

function rewriteSetCookie(setCookie: string, isHttps: boolean): string {
  let value = setCookie;

  value = value.replace(/;\s*Domain=[^;]+/i, '');

  if (!isHttps) {
    value = value.replace(/;\s*Secure/i, '');
    value = value.replace(/;\s*SameSite=None/i, '; SameSite=Lax');
  }

  return value;
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

  const isHttps = request.nextUrl.protocol === 'https:';
  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) {
    responseHeaders.append('set-cookie', rewriteSetCookie(setCookie, isHttps));
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
