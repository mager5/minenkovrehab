'use client';

// Форма заявки (страница «Контакты» и блок записи на главной).
// Отправка: POST /api/leads → база (rehab.leads) + уведомления на почту и в Telegram (через очередь бэкенда).
// Кнопка активна всегда; при ошибке подсвечиваются поля и фокус уходит к первому неверному.
import { useState } from 'react';
import { TextField, TextArea, Select, Checkbox, Icon } from '@/components/ds';
import { Honeypot } from '@/components/shared/Honeypot';
import { leadServiceOptions } from '@/data/content';
import { useLeadForm } from '@/lib/leads';

export function ContactForm({
  variant = 'contacts',
  className = '',
}: {
  variant?: 'contacts' | 'home';
  className?: string;
}) {
  const isHome = variant === 'home';
  const [service, setService] = useState(leadServiceOptions[0]?.value ?? '');
  const form = useLeadForm({ source: isHome ? 'home' : 'contacts', requireMessage: !isHome });
  const { values, errors } = form;

  const headingId = isHome ? 'lead-form-heading' : 'contact-form-heading';
  const fid = (k: string) => (isHome ? `lead-${k}` : k);
  const ids = {
    name: fid('name'),
    phone: fid('phone'),
    message: fid('message'),
    consent: fid('consent'),
    offer: fid('consent'),
  };
  const sending = form.status === 'sending';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = leadServiceOptions.find(o => o.value === service)?.label ?? '';
    void form.submit(label, ids);
  };

  return (
    <div className={`ds-card p-6 dsk:p-10 text-ink ${className}`}>
      <h2
        className={isHome ? 'sr-only' : 'ds-h2 ds-h2-sm mb-6'}
        id={headingId}
        style={isHome ? undefined : { fontSize: 'min(var(--fs-h2), 30px)' }}
      >
        {isHome ? 'Запись на консультацию' : 'Напишите мне'}
      </h2>

      {form.status === 'sent' ? (
        <div className='flex gap-4 items-start p-6 rounded-[20px] bg-mint' role='status' aria-live='polite'>
          <span className='ds-ibox w-11 h-11 rounded-[14px] bg-white'>
            <Icon name='check' size={22} strokeWidth={3} color='var(--c-mint-ink)' />
          </span>
          <div>
            <p className='m-0 font-extrabold text-[20px] text-navy'>Заявка отправлена!</p>
            <p className='m-0 mt-1 text-[17px] text-ink'>
              Благодарю за обращение. Я свяжусь с вами в ближайшее время.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='relative flex flex-col gap-5' aria-labelledby={headingId} noValidate>
          <Honeypot id={fid('website')} ref={form.honeypot} />
          <div className='grid gap-4 dsk:grid-cols-2'>
            <TextField
              label='Ваше имя'
              id={ids.name}
              name='name'
              type='text'
              autoComplete='name'
              value={values.name}
              onChange={e => form.set('name', e.target.value)}
              required
              aria-required='true'
              error={errors.name}
            />
            <TextField
              label='Телефон'
              id={ids.phone}
              name='phone'
              type='tel'
              inputMode='tel'
              autoComplete='tel'
              placeholder='+7 (___) ___-__-__'
              value={values.phone}
              onChange={e => form.set('phone', e.target.value)}
              required
              aria-required='true'
              error={errors.phone}
            />
          </div>

          <Select
            label='Что вас интересует'
            id={fid('service')}
            options={leadServiceOptions}
            value={service}
            onChange={setService}
          />

          {!isHome ? (
            <TextArea
              label='Ваше сообщение'
              id={ids.message}
              name='message'
              placeholder='Коротко опишите ситуацию'
              value={values.message}
              onChange={e => form.set('message', e.target.value)}
              required
              aria-required='true'
              error={errors.message}
            />
          ) : null}

          <Checkbox
            id={ids.consent}
            checked={form.consent}
            onChange={e => form.setConsent(e.target.checked)}
            required
            error={errors.consent}
          >
            Я даю{' '}
            <a href='/consent' target='_blank' rel='noopener noreferrer'>
              согласие на обработку персональных данных
            </a>{' '}
            в соответствии с{' '}
            <a href='/policy' target='_blank' rel='noopener noreferrer'>
              политикой конфиденциальности
            </a>{' '}
            и согласен с условиями{' '}
            <a href='/offer' target='_blank' rel='noopener noreferrer'>
              договора оферты
            </a>
          </Checkbox>

          {form.serverError ? (
            <div className='ds-error p-4 rounded-2xl bg-[#FBEDEC]' role='alert' aria-live='assertive'>
              <Icon name='alert' size={18} color='var(--c-danger-ink)' />
              {form.serverError}
            </div>
          ) : null}

          <button
            type='submit'
            className={`ds-btn ds-btn-lg ds-btn-primary ${isHome ? 'ds-btn-block' : 'self-stretch dsk:self-start'}`}
            aria-busy={sending}
          >
            {sending ? (
              <>
                <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Отправка...
              </>
            ) : isHome ? (
              'Записаться на консультацию'
            ) : (
              'Отправить сообщение'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
