import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты - МиненковRehab',
  description:
    'Свяжитесь с нами для записи на консультацию или получения дополнительной информации о наших услугах.',
  openGraph: {
    title: 'Контакты - МиненковRehab',
    description:
      'Свяжитесь с нами для записи на консультацию или получения дополнительной информации о наших услугах.',
    images: [
      {
        url: '/images/og/contacts-og.svg',
        width: 1200,
        height: 630,
        alt: 'Контакты - МиненковRehab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Контакты - МиненковRehab',
    description:
      'Свяжитесь с нами для записи на консультацию или получения дополнительной информации о наших услугах.',
    images: ['/images/og/contacts-og.svg'],
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
