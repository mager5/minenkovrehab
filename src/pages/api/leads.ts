// Заявки с форм сайта → бэкенд (POST /api/leads). Сайт добавляет к запросу:
// x-lead-client-ip — IP посетителя (от Caddy, X-Forwarded-For) для ограничения частоты;
// x-lead-site — 'test' на тестовой копии (LEADS_SITE=test в её окружении), чтобы уведомления шли с пометкой «[ТЕСТ new]».
import type { NextApiRequest, NextApiResponse } from 'next';
import { migrationBackendOrigin } from '@/lib/migration-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false });
  }
  const origin = migrationBackendOrigin();
  if (!origin) return res.status(503).json({ success: false, error: 'Сервис временно недоступен.' });

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  for (const name of ['cookie', 'origin', 'x-csrf-token', 'sec-fetch-site']) {
    const value = req.headers[name];
    if (typeof value === 'string') headers[name] = value;
  }
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0]?.trim();
  const ip = forwarded || req.socket.remoteAddress || '';
  if (ip) headers['x-lead-client-ip'] = ip.slice(0, 64);
  headers['x-lead-site'] = process.env.LEADS_SITE === 'test' ? 'test' : 'prod';

  try {
    const upstream = await fetch(`${origin}/api/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body || {}),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const retry = upstream.headers.get('retry-after');
    if (retry) res.setHeader('Retry-After', retry);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    return res.status(503).json({ success: false, error: 'Сервис временно недоступен.' });
  }
}
