'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoMdClose } from 'react-icons/io';
import { bookingServices } from '@/data/content';
import { TextField, TextArea, Select, Checkbox, Icon } from '@/components/ds';
import { Honeypot } from '@/components/shared/Honeypot';
import { useLeadForm } from '@/lib/leads';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const form = useLeadForm({ source: 'modal', requireOffer: true });
  const { values, errors } = form;
  const [service, setService] = useState('');
  const sending = form.status === 'sending';
  const ids = {
    name: 'modal-name',
    phone: 'modal-phone',
    message: 'modal-message',
    consent: 'modal-consent',
    offer: 'modal-offer',
  };

  // Сброс формы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setService('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Обновление URL только на клиенте
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const timestamp = new Date().getTime();
      window.history.replaceState({}, '', `${window.location.pathname}?modal=${timestamp}`);
    }
  }, [isOpen]);

  // Ref для фокуса на первом элементе при открытии
  const initialFocusRef = useRef<HTMLInputElement & HTMLButtonElement>(null);

  const services = bookingServices;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = services.find(sv => sv.id === service)?.name ?? '';
    void form.submit(label, ids);
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

                {form.status === 'sent' ? (
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
                      Заявка отправлена!
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
                    className='relative flex flex-col gap-4'
                    aria-labelledby='booking-modal-title'
                    noValidate
                  >
                    <Honeypot id='modal-website' ref={form.honeypot} />
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
                      ref={initialFocusRef}
                    />
                    <TextField
                      label='Телефон'
                      id={ids.phone}
                      name='phone'
                      type='tel'
                      inputMode='tel'
                      autoComplete='tel'
                      value={values.phone}
                      onChange={e => form.set('phone', e.target.value)}
                      required
                      placeholder='+7 (___) ___-__-__'
                      aria-required='true'
                      error={errors.phone}
                      hint='Формат: +7 (999) 999-99-99'
                    />
                    <Select
                      label='Услуга'
                      id='modal-service'
                      placeholder='Выберите услугу'
                      options={services.map(sv => ({ value: sv.id, label: sv.name }))}
                      value={service}
                      onChange={setService}
                    />
                    <TextArea
                      label='Ваше сообщение'
                      id={ids.message}
                      name='message'
                      rows={3}
                      value={values.message}
                      onChange={e => form.set('message', e.target.value)}
                      placeholder='Коротко опишите ситуацию (необязательно)'
                    />
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
                      </a>
                    </Checkbox>
                    <Checkbox
                      id={ids.offer}
                      checked={form.offer}
                      onChange={e => form.setOffer(e.target.checked)}
                      required
                      error={errors.offer}
                    >
                      Я согласен с условиями{' '}
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
                      className='ds-btn ds-btn-lg ds-btn-primary ds-btn-block mt-2'
                      aria-busy={sending}
                    >
                      {sending ? 'Отправка...' : 'Записаться'}
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
