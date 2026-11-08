import type { NextApiRequest } from 'next';
export function getPublicApiOrigin(_req?: NextApiRequest): string {
  const origin=process.env.MIGRATION_SITE_ORIGIN;
  if(!origin)throw new Error('Explicit migration site origin required');
  return new URL(origin).origin;
}
