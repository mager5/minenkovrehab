import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { pageMetadata } from '@/lib/seo';
import { organization, person, website } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Физическая реабилитация после травм и операций онлайн — Вадим Миненков',
  description:
    'Онлайн-занятия по физической реабилитации и тренировки с инструктором-методистом ЛФК Вадимом Миненковым: консультации, программа «Формула Движения», программы после травм и операций.',
  path: '/',
  socialTitle: 'Вадим Миненков — специалист по физической реабилитации',
});

export default function Home() {
  // Фото первого экрана — next/image с priority (без lazy), поэтому отдельный preload не нужен.
  return (
    <>
      <JsonLd nodes={[website, organization, person]} />
      <HomeClient />
    </>
  );
}
