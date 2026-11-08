'use client';

// Форма заявки (страница «Контакты» и блок записи на главной).
// Логика отправки — прежняя (без изменений); редизайн затронул только разметку и стили.
import { useState } from 'react';
import { TextField, TextArea, Select, Checkbox, Icon } from '@/components/ds';
import { leadServiceOptions } from '@/data/content';

export function ContactForm({
  variant = 'contacts',
  className = '',
}: {
  variant?: 'contacts' | 'home';
  className?: string;
}) {
  const isHome = variant === 'home';
  // Выбор услуги — только для отображения в форме (в отправку не входит, как и раньше).
  const [service, setService] = useState(leadServiceOptions[0]?.value ?? '');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;

    // Удаляем все нецифровые символы
    const phoneNumber = value.replace(/\D/g, '');

    // Если первая цифра 8 или 7, удаляем ее и добавляем +7
    let normalisedPhone = phoneNumber;
    if (phoneNumber.startsWith('8') || phoneNumber.startsWith('7')) {
      normalisedPhone = phoneNumber.substring(1);
    }

    const phoneNumberLength = normalisedPhone.length;

    // Начинаем всегда с +7
    let formattedNumber = '+7';

    // Добавляем скобку и первые цифры кода
    if (phoneNumberLength > 0) {
      formattedNumber += ` (${normalisedPhone.substring(0, Math.min(3, phoneNumberLength))}`;
    }

    // Закрываем скобку и добавляем следующие цифры
    if (phoneNumberLength > 3) {
      formattedNumber += `) ${normalisedPhone.substring(3, Math.min(6, phoneNumberLength))}`;
    }

    // Добавляем первое тире
    if (phoneNumberLength > 6) {
      formattedNumber += `-${normalisedPhone.substring(6, Math.min(8, phoneNumberLength))}`;
    }

    // Добавляем второе тире
    if (phoneNumberLength > 8) {
      formattedNumber += `-${normalisedPhone.substring(8, Math.min(10, phoneNumberLength))}`;
    }

    return formattedNumber;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      // Ограничиваем максимальную длину отформатированного номера, чтобы соответствовать +7 (XXX) XXX-XX-XX
      if (formattedValue.length > 18) return;
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(e.target.checked);
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentChecked) {
      return; // Prevent submission if consent is not checked
    }

    setIsSubmitting(true);
    setSubmitError(false);

    // Имитация отправки данных формы
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', phone: '', message: '' });
      setConsentChecked(false);
    }, 1500);
  };

  const headingId = isHome ? 'lead-form-heading' : 'contact-form-heading';
  const fid = (k: string) => (isHome ? `lead-${k}` : k);

  return (
    <div className={`ds-card p-6 dsk:p-10 text-ink ${className}`}>
      <h2
        className={isHome ? 'sr-only' : 'ds-h2 ds-h2-sm mb-6'}
        id={headingId}
        style={isHome ? undefined : { fontSize: 'min(var(--fs-h2), 30px)' }}
      >
        {isHome ? 'Запись на консультацию' : 'Напишите мне'}
      </h2>

      {submitSuccess ? (
        <div
          className='flex gap-4 items-start p-6 rounded-[20px] bg-mint'
          role='status'
          aria-live='polite'
        >
          <span className='ds-ibox w-11 h-11 rounded-[14px] bg-white'>
            <Icon
              name='check'
              size={22}
              strokeWidth={3}
              color='var(--c-mint-ink)'
            />
          </span>
          <div>
            <p className='m-0 font-extrabold text-[20px] text-navy'>
              Сообщение отправлено!
            </p>
            <p className='m-0 mt-1 text-[17px] text-ink'>
              Благодарю за обращение. Я свяжусь с вами в ближайшее время.
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-5'
          aria-labelledby={headingId}
        >
          <div className='grid gap-4 dsk:grid-cols-2'>
            <TextField
              label='Ваше имя'
              id={fid('name')}
              name='name'
              type='text'
              autoComplete='name'
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              required
              aria-required='true'
            />
            <TextField
              label={isHome ? 'Телефон' : 'Телефон (необязательно)'}
              id={fid('phone')}
              name='phone'
              type='tel'
              inputMode='tel'
              autoComplete='tel'
              placeholder='+7 (___) ___-__-__'
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => handleFocus('phone')}
              onBlur={handleBlur}
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
              id={fid('message')}
              name='message'
              placeholder='Коротко опишите ситуацию'
              value={formData.message}
              onChange={handleChange}
              onFocus={() => handleFocus('message')}
              onBlur={handleBlur}
              required
              aria-required='true'
            />
          ) : null}

          <Checkbox
            id={fid('consent')}
            checked={consentChecked}
            onChange={handleConsentChange}
            required
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

          <button
            type='submit'
            className={`ds-btn ds-btn-lg ds-btn-primary ${isHome ? 'ds-btn-block' : 'self-stretch dsk:self-start'}`}
            disabled={isSubmitting || !consentChecked}
            aria-disabled={isSubmitting || !consentChecked}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className='animate-spin h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                  />
                </svg>
                Отправка...
              </>
            ) : isHome ? (
              'Записаться на консультацию'
            ) : (
              'Отправить сообщение'
            )}
          </button>
          {!consentChecked && !isSubmitting ? (
            <p className='ds-hint m-0 -mt-2'>
              Чтобы отправить, отметьте согласие выше.
            </p>
          ) : null}

          {submitError && (
            <div
              className='ds-error p-4 rounded-2xl bg-[#FBEDEC]'
              role='alert'
              aria-live='assertive'
            >
              <Icon name='alert' size={18} color='var(--c-danger-ink)' />
              Что-то пошло не так. Пожалуйста, попробуйте позже или свяжитесь со
              мной другим способом.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
