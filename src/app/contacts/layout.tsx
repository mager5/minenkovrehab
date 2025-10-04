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
        url: '/images/og/contacts-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Контакты - МиненковRehab',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Контакты - МиненковRehab',
    description:
      'Свяжитесь с нами для записи на консультацию или получения дополнительной информации о наших услугах.',
    images: ['/images/og/contacts-og.jpg'],
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
