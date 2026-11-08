import type { Metadata } from 'next';
import ContactsClient from './ContactsClient';
import { CONTACTS_OG_IMAGE, pageMetadata } from '@/lib/seo';
import { breadcrumbs, organization } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Контакты и запись на консультацию | Вадим Миненков',
  description:
    'Запись на онлайн-консультацию к Вадиму Миненкову: телефон +7 928 328-70-52, почта minenkov.rehab@yandex.ru, Telegram @MV_Rehab. Работаю пн–сб с 10:00 до 19:00.',
  path: '/contacts',
  image: CONTACTS_OG_IMAGE,
  socialTitle: 'Контакты',
});

export default function ContactsPage() {
  return (
    <>
      <JsonLd
        nodes={[
          {
            '@type': 'ContactPage',
            url: 'https://minenkovrehab.ru/contacts',
            name: 'Контакты',
            about: organization,
          },
          breadcrumbs([{ name: 'Контакты', path: '/contacts' }]),
        ]}
      />
      <ContactsClient />
    </>
  );
}
