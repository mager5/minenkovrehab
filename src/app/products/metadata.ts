import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Услуги - МиненковRehab',
  description:
    'Выберите подходящую услугу для вашего восстановления и реабилитации. Онлайн-консультации, персональные программы, тренировки.',
  openGraph: {
    title: 'Услуги - МиненковRehab',
    description:
      'Выберите подходящую услугу для вашего восстановления и реабилитации. Онлайн-консультации, персональные программы, тренировки.',
    images: [
      {
        url: '/images/og/services-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Услуги - МиненковRehab',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Услуги - МиненковRehab',
    description:
      'Выберите подходящую услугу для вашего восстановления и реабилитации. Онлайн-консультации, персональные программы, тренировки.',
    images: ['/images/og/services-og.jpg'],
  },
};
