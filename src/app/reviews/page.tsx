import type { Metadata } from 'next';
import ReviewsClient from './ReviewsClient';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbs } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Отзывы клиентов | Вадим Миненков',
  description:
    'Отзывы клиентов о занятиях с Вадимом Миненковым: восстановление после травм и операций, коррекция осанки и онлайн-тренировки.',
  path: '/reviews',
  socialTitle: 'Отзывы клиентов',
});

export default function ReviewsPage() {
  return (
    <>
      <JsonLd nodes={[breadcrumbs([{ name: 'Отзывы', path: '/reviews' }])]} />
      <ReviewsClient />
    </>
  );
}
