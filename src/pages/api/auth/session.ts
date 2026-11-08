// Проверка входа для интерфейса (шапка, кабинет, кнопка «Купить»): гостю отвечает 200 и user: null,
// а не 401 — чтобы в консоли браузера не было ошибки на каждой странице.
// Сессию проверяет бэкенд тем же запросом /api/auth/me, что и раньше (readMigrationSession); бэкенд не менялся.
import type { NextApiRequest, NextApiResponse } from 'next';
import { readMigrationSession } from '@/lib/migration-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false });
  }
  const session = await readMigrationSession(req.headers.cookie || '');
  if (session.status === 503) {
    return res.status(503).json({ success: false, data: { user: null } });
  }
  return res.status(200).json({ success: true, data: { user: session.user } });
}
