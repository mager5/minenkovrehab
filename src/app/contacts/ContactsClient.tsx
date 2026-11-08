'use client';

import { useState, useEffect } from 'react';
import { BookingModal, ContactForm } from '@/components';
import { getContactsContent } from '@/lib/content';
import {
  PageHead,
  ButtonLink,
  IconBox,
  Icon,
  formatPhone as dsFormatPhone,
} from '@/components/ds';
import { CONTACTS, SOCIAL_PROFILES } from '@/lib/seo';

interface ContactData {
  phone: string;
  email: string;
  social: {
    vk: string;
    telegram: string;
  };
}

export default function ContactsClient() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({
    phone: '+79283287052',
    email: 'minenkov.rehab@yandex.ru',
    social: {
      vk: 'https://vk.com/minenkov_rehab',
      telegram: 'https://t.me/MV_Rehab',
    },
  });

  // Попытка загрузить статический контент при рендере на клиенте
  useEffect(() => {
    async function loadContactData() {
      try {
        const data = await getContactsContent<ContactData>();
        setContactData(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Ошибка загрузки контактных данных:', error);
      }
    }

    loadContactData();
  }, []);

  // Форматирование телефона с префиксом +7
  const formatPhone = (phone: string) => {
    return phone.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 $1 $2-$3-$4');
  };

  const row = (icon: string, title: string, value: React.ReactNode) => (
    <div className='flex gap-4 items-center'>
      <IconBox name={icon} tone='sky' />
      <div className='leading-[1.4] min-w-0'>
        <span className='block text-[15px] text-muted'>{title}</span>
        {value}
      </div>
    </div>
  );

  return (
    <div className='ds'>
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]}
        title='Свяжитесь со мной'
        lead='Ответы на ваши вопросы и запись на онлайн-консультации'
      />

      <section className='ds-wrap ds-sec'>
        <div className='grid gap-6 dsk:gap-8 dsk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start'>
          <ContactForm />

          <div className='flex flex-col gap-6'>
            <div className='ds-card p-6 dsk:p-9 flex flex-col gap-[22px]'>
              <h2 className='m-0 text-[24px] dsk:text-[26px] font-extrabold text-navy'>
                Контактная информация
              </h2>
              {row(
                'phone',
                'Телефон',
                <a
                  href={`tel:${contactData.phone.replace(/[^+\d]/g, '')}`}
                  className='inline-flex items-center min-h-[44px] text-[20px] font-extrabold text-navy no-underline hover:text-brand'
                  aria-label={`Позвонить по телефону ${contactData.phone}`}
                >
                  {dsFormatPhone(contactData.phone)}
                </a>
              )}
              {row(
                'mail',
                'Email',
                <a
                  href={`mailto:${contactData.email}`}
                  className='inline-flex items-center min-h-[44px] text-[18px] font-bold text-brand hover:text-navy break-all'
                >
                  {contactData.email}
                </a>
              )}
              {row(
                'clock',
                'Часы работы',
                <span className='text-[18px] font-bold text-ink'>
                  {CONTACTS.workingHours.replace(/-/g, '–')}
                </span>
              )}
              <div>
                <p className='m-0 mb-3 text-[15px] text-muted'>
                  Мессенджеры и соцсети
                </p>
                <div className='flex flex-wrap gap-2.5'>
                  <ButtonLink href={contactData.social.telegram} size='sm'>
                    <Icon name='send' size={18} strokeWidth={2} />
                    Telegram
                  </ButtonLink>
                  <ButtonLink
                    href={contactData.social.vk}
                    size='sm'
                    variant='tertiary'
                  >
                    ВКонтакте
                  </ButtonLink>
                  {SOCIAL_PROFILES.filter(u =>
                    /youtube|dzen|rutube/.test(u)
                  ).map(u => (
                    <ButtonLink key={u} href={u} size='sm' variant='tertiary'>
                      {u.includes('youtube')
                        ? 'YouTube'
                        : u.includes('dzen')
                          ? 'Дзен'
                          : 'Rutube'}
                    </ButtonLink>
                  ))}
                </div>
              </div>
            </div>
            <div className='ds-card px-7 py-6 text-[15px] text-muted leading-[1.6]'>
              {CONTACTS.legalName}
              <br />
              ИНН {CONTACTS.inn}
              <br />
              ОГРНИП {CONTACTS.ogrnip}
            </div>
          </div>
        </div>
      </section>

      {/* Модальное окно для записи */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
