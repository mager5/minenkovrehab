import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readMigrationSession } from './migration-config';
export async function requireSession() {
  const session = await readMigrationSession((await cookies()).toString());
  if(session.status === 503)throw new Error('Migration auth unavailable');
  if(!session.user)redirect('/login');
  return session.user;
}
