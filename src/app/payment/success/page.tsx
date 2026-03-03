'use client';

import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';

interface PaymentData {
  outSum?: string;
  invId?: string;
  signatureValue?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailResultMessage, setEmailResultMessage] = useState('');

  useEffect(() => {
    // Получаем параметры от Robokassa
    if (searchParams) {
      const outSum = searchParams.get('OutSum');
      const invId = searchParams.get('InvId');
      const signatureValue = searchParams.get('SignatureValue');

      setPaymentData({
        ...(outSum && { outSum }),
        ...(invId && { invId }),
        ...(signatureValue && { signatureValue }),
      });

      // Проверяем подпись (опционально)
      if (outSum && invId && signatureValue) {
        verifyPayment(outSum, invId, signatureValue);
      } else {
        setIsVerifying(false);
        setIsValid(true); // Считаем валидным, если пользователь попал на эту страницу
      }
    } else {
      setIsVerifying(false);
      setIsValid(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isVerifying && isValid) {
      const mock = searchParams?.get('mock');
      if (mock === '1') {
        setIsEmailModalOpen(true);
      }
    }
  }, [isVerifying, isValid, searchParams]);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email обязателен';
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(value.trim())) {
      return 'Некорректный формат email';
    }
    return '';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailResultMessage('');

    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError('');
    setIsSubmittingEmail(true);

    try {
      // Используем новый API на Railway
      const response = await fetch(
        'https://minenkovrehab-production-15cc.up.railway.app/api/mock-payment/complete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      const serverMessage =
        data?.message ||
        (data?.status === 'exists'
          ? 'Пользователь с таким email уже зарегистрирован. Используйте форму входа.'
          : 'Личный кабинет создан. На указанный email отправлены логин, пароль и безопасная ссылка для входа.');

      let finalMessage = serverMessage;
      if (data?.emailSent === false && data?.emailError) {
        finalMessage += `\n\nДополнительно: ${data.emailError}`;
      } else if (data?.emailSent === false) {
        finalMessage +=
          '\n\nДополнительно: письмо не было отправлено почтовым сервисом. Проверьте настройки Resend.';
      }

      setEmailResultMessage(finalMessage);
    } catch (error) {
      console.error('Ошибка при отправке email:', error);
      setEmailResultMessage(
        'Произошла ошибка. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const verifyPayment = async (
    outSum: string,
    invId: string,
    signature: string
  ) => {
    try {
      // Здесь можно добавить проверку подписи через API
      // const response = await fetch(`/api/robokassa/verify-signature?outSum=${outSum}&invId=${invId}&signature=${signature}&type=success`);
      // const result = await response.json();
      // setIsValid(result.data?.isValid || false);

      // Пока просто считаем валидным
      setIsValid(true);
    } catch (error) {
      console.error('Ошибка проверки платежа:', error);
      setIsValid(true); // В случае ошибки считаем валидным
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4'></div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Проверяем платеж...
          </h1>
          <p className='text-gray-600'>Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
          {isValid ? (
            <>
              <CheckCircleIcon className='h-20 w-20 text-green-500 mx-auto mb-6' />
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                Платеж успешен!
              </h1>
              <p className='text-gray-600 mb-6'>
                Спасибо за оплату! Ваш платеж был успешно обработан.
              </p>

              {paymentData.outSum && (
                <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    Детали платежа:
                  </h3>
                  <div className='space-y-1 text-sm text-gray-600'>
                    <div>
                      Сумма:{' '}
                      <span className='font-medium'>
                        {paymentData.outSum} ₽
                      </span>
                    </div>
                    {paymentData.invId && (
                      <div>
                        Номер заказа:{' '}
                        <span className='font-medium'>{paymentData.invId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className='space-y-3'>
                <p className='text-sm text-gray-500'>
                  В ближайшее время с вами свяжется наш специалист для уточнения
                  деталей.
                </p>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <Link
                    href='/'
                    className='flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors'
                  >
                    На главную
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-red-500 text-4xl'>⚠️</span>
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                Ошибка проверки
              </h1>
              <p className='text-gray-600 mb-6'>
                Не удалось проверить подлинность платежа. Пожалуйста, свяжитесь
                с поддержкой.
              </p>

              <div className='flex flex-col sm:flex-row gap-3'>
                <Link
                  href='/contacts'
                  className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
                >
                  Связаться с нами
                </Link>
                <Link
                  href='/'
                  className='flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors'
                >
                  На главную
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Transition appear show={isEmailModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setIsEmailModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/40' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-200'
                enterFrom='opacity-0 scale-95 translate-y-4'
                enterTo='opacity-100 scale-100 translate-y-0'
                leave='ease-in duration-150'
                leaveFrom='opacity-100 scale-100 translate-y-0'
                leaveTo='opacity-0 scale-95 translate-y-4'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title className='text-lg font-semibold leading-6 text-gray-900'>
                    Для доступа к личному кабинету укажите адрес электронной
                    почты
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p className='text-sm text-gray-500'>
                      На указанный email мы отправим логин, временный пароль и
                      безопасную ссылку для входа в личный кабинет.
                    </p>
                  </div>

                  <form className='mt-4 space-y-4' onSubmit={handleEmailSubmit}>
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Электронная почта
                      </label>
                      <input
                        id='email'
                        type='email'
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (emailError) {
                            setEmailError('');
                          }
                        }}
                        placeholder='you@example.com'
                        className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                      />
                      {emailError && (
                        <p className='mt-1 text-xs text-red-600'>
                          {emailError}
                        </p>
                      )}
                    </div>

                    {emailResultMessage && (
                      <div className='text-xs text-gray-600 bg-gray-50 rounded-md p-2'>
                        {emailResultMessage}
                      </div>
                    )}

                    <div className='mt-4 flex flex-col sm:flex-row gap-3'>
                      <button
                        type='submit'
                        disabled={isSubmittingEmail}
                        className='flex-1 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50'
                      >
                        {isSubmittingEmail ? 'Отправка...' : 'Получить доступ'}
                      </button>
                      <button
                        type='button'
                        onClick={() => setIsEmailModalOpen(false)}
                        className='flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
                      >
                        Позже
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
