'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoMdClose } from 'react-icons/io';
import { bookingServices } from '@/data/content';
import { TextField, TextArea, Select, Checkbox, Icon } from '@/components/ds';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [offerChecked, setOfferChecked] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [offerError, setOfferError] = useState(false);

  // Сброс формы при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        service: '',
        message: '',
      });
      setSubmitSuccess(false);
      setSubmitError(false);
      setConsentChecked(false);
      setOfferChecked(false);
      setOfferChecked(false);
      setConsentError(false);
      setOfferError(false);
    }
  }, [isOpen]);

  // Обновление URL только на клиенте
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Добавляем случайный параметр к URL при открытии модального окна
      const timestamp = new Date().getTime();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?modal=${timestamp}`
      );
    }
  }, [isOpen]);

  // Ref для фокуса на первом элементе при открытии
  const initialFocusRef = useRef<HTMLInputElement & HTMLButtonElement>(null);

  const services = bookingServices;

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(e.target.checked);
    if (e.target.checked) {
      setConsentError(false);
    }
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferChecked(e.target.checked);
    if (e.target.checked) {
      setOfferError(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Сброс ошибок
    setConsentError(false);
    setOfferError(false);

    // Проверка обоих чекбоксов
    let hasErrors = false;
    if (!consentChecked) {
      setConsentError(true);
      hasErrors = true;
    }
    if (!offerChecked) {
      setOfferError(true);
      hasErrors = true;
    }

    if (hasErrors) {
      return; // Предотвращаем отправку если не отмечены оба чекбокса
    }

    setIsSubmitting(true);
    setSubmitError(false);

    // Имитация отправки данных формы
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Сброс формы после успешной отправки
      setFormData({
        name: '',
        phone: '',
        service: '',
        message: '',
      });
      setConsentChecked(false);
    }, 1500);
  };

  // Обработчик нажатия клавиши Escape для закрытия модального окна
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-50'
        onClose={onClose}
        initialFocus={initialFocusRef}
        onKeyDown={handleKeyDown}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div
            className='fixed inset-0 bg-[rgba(13,60,99,0.45)] backdrop-blur-sm'
            aria-hidden='true'
          />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='ds w-full max-w-[520px] transform rounded-[28px] bg-white p-6 dsk:p-9 text-left shadow-pop transition-all relative'>
                <button
                  type='button'
                  className='absolute top-4 right-4 w-12 h-12 rounded-full bg-sky hover:bg-[#d5e6f3] flex items-center justify-center border-0 cursor-pointer ds-focus z-10'
                  onClick={onClose}
                  aria-label='Закрыть'
                >
                  <IoMdClose className='h-5 w-5 text-navy' />
                </button>

                <Dialog.Title
                  as='h2'
                  className='ds-h2 mb-6 pr-14'
                  style={{ fontSize: 'min(var(--fs-h2), 30px)' }}
                  id='booking-modal-title'
                >
                  Записаться
                </Dialog.Title>

                {submitSuccess ? (
                  <div
                    className='flex flex-col gap-4 p-6 rounded-[20px] bg-mint'
                    role='status'
                    aria-live='polite'
                  >
                    <p className='m-0 flex items-center gap-3 font-extrabold text-[20px] text-navy'>
                      <Icon
                        name='check'
                        size={24}
                        strokeWidth={3}
                        color='var(--c-mint-ink)'
                      />
                      Запись оформлена!
                    </p>
                    <p className='m-0 text-[17px] text-ink'>
                      Благодарю за обращение. Я свяжусь с вами в ближайшее время
                      для подтверждения записи.
                    </p>
                    <div>
                      <button
                        type='button'
                        className='ds-btn ds-btn-md ds-btn-secondary'
                        onClick={onClose}
                        ref={initialFocusRef}
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-4'
                    aria-labelledby='booking-modal-title'
                  >
                    <TextField
                      label='Ваше имя'
                      id='name'
                      name='name'
                      type='text'
                      autoComplete='name'
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      required
                      aria-required='true'
                      ref={initialFocusRef}
                    />
                    <TextField
                      label='Телефон'
                      id='phone'
                      name='phone'
                      type='tel'
                      inputMode='tel'
                      autoComplete='tel'
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={handleBlur}
                      required
                      placeholder='+7 (___) ___-__-__'
                      pattern='\+7 \([0-9]{3}\) [0-9]{3}-[0-9]{2}-[0-9]{2}'
                      aria-required='true'
                      hint='Формат: +7 (999) 999-99-99'
                    />
                    <Select
                      label='Услуга'
                      id='service'
                      name='service'
                      placeholder='Выберите услугу'
                      options={services.map(sv => ({
                        value: sv.id,
                        label: sv.name,
                      }))}
                      value={formData.service}
                      onChange={v =>
                        handleChange({
                          target: { name: 'service', value: v },
                        } as unknown as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                    <TextArea
                      label='Ваше сообщение'
                      id='message'
                      name='message'
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => handleFocus('message')}
                      onBlur={handleBlur}
                      placeholder='Коротко опишите ситуацию (необязательно)'
                    />
                    <Checkbox
                      id='modal-consent'
                      checked={consentChecked}
                      onChange={handleConsentChange}
                      required
                      error={
                        consentError
                          ? 'Необходимо дать согласие на обработку персональных данных'
                          : undefined
                      }
                    >
                      Я даю{' '}
                      <a
                        href='/consent'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        согласие на обработку персональных данных
                      </a>{' '}
                      в соответствии с{' '}
                      <a
                        href='/policy'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </a>
                    </Checkbox>
                    <Checkbox
                      id='modal-offer'
                      checked={offerChecked}
                      onChange={handleOfferChange}
                      required
                      error={
                        offerError
                          ? 'Необходимо согласиться с условиями договора оферты'
                          : undefined
                      }
                    >
                      Я согласен с условиями{' '}
                      <a
                        href='/offer'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
                      </a>
                    </Checkbox>

                    {submitError && (
                      <div
                        className='ds-error p-4 rounded-2xl bg-[#FBEDEC]'
                        role='alert'
                        aria-live='assertive'
                      >
                        <Icon
                          name='alert'
                          size={18}
                          color='var(--c-danger-ink)'
                        />
                        Не удалось отправить заявку. Пожалуйста, попробуйте
                        снова позже.
                      </div>
                    )}

                    <button
                      type='submit'
                      className='ds-btn ds-btn-lg ds-btn-primary ds-btn-block mt-2'
                      disabled={
                        isSubmitting || !consentChecked || !offerChecked
                      }
                      aria-disabled={
                        isSubmitting || !consentChecked || !offerChecked
                      }
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? 'Отправка...' : 'Записаться'}
                    </button>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookingModal;
