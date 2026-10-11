import { requireSession } from '@/lib/session-server';
export const dynamic = 'force-dynamic';
export default async function DashboardLayout({children}:{children:React.ReactNode}) {
  const user=await requireSession();
  return <div data-session-authenticated='true'><span className='sr-only'>Аккаунт: {user.email}</span>{children}</div>;
}
