import type { Metadata } from 'next';
import { preload } from 'react-dom';
import HomeClient from './HomeClient';
import { pageMetadata } from '@/lib/seo';
import { organization, person, website } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Реабилитация после травм и операций онлайн — Вадим Миненков',
  description:
    'Онлайн-реабилитация и тренировки с инструктором-методистом ЛФК Вадимом Миненковым: консультации, программа «Формула Движения», программы после травм и операций.',
  path: '/',
  socialTitle: 'Вадим Миненков — реабилитолог',
});

export default function Home() {
  // Фон первого экрана — CSS background, поэтому подгружаем его заранее (и на десктопе, и на телефоне).
  preload('/images/hero/hero-banner.jpg', {
    as: 'image',
    fetchPriority: 'high',
    media: '(min-width: 769px)',
  });
  preload('/images/hero/section-banner.jpg', {
    as: 'image',
    fetchPriority: 'high',
    media: '(max-width: 768px)',
  });

  return (
    <>
      <JsonLd nodes={[website, organization, person]} />
      <HomeClient />
    </>
  );
}
