import DashboardClientPage from '@/components/dashboard/DashboardClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Личный кабинет | Миненков Вадим',
  description: 'Управление видеоматериалами и курсами',
};

export default function DashboardPage() {
  return <DashboardClientPage />;
}
