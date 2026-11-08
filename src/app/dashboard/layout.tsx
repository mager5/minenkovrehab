import { requireSession } from '@/lib/session-server';
export const dynamic = 'force-dynamic';
export const metadata: import('next').Metadata = {
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({children}:{children:React.ReactNode}) {
  const user=await requireSession();
  return <div data-session-authenticated='true'><span className='sr-only'>Аккаунт: {user.email}</span>{children}</div>;
}
