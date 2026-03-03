import CoursesClientPage from '@/components/dashboard/courses/CoursesClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Курсы | Личный кабинет',
  description:
    'Все доступные курсы по восстановлению и тренировкам в личном кабинете.',
};

export default function CoursesPage() {
  return <CoursesClientPage />;
}
