'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface PaymentData {
  outSum?: string;
  invId?: string;
  culture?: string;
}

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData>({});

  useEffect(() => {
    // Получаем параметры от Robokassa
    if (searchParams) {
      const outSum = searchParams.get('OutSum');
      const invId = searchParams.get('InvId');
      const culture = searchParams.get('Culture');

      setPaymentData({
        ...(outSum && { outSum }),
        ...(invId && { invId }),
        ...(culture && { culture }),
      });
    }
  }, [searchParams]);

  const handleRetryPayment = () => {
    // Перенаправляем обратно на страницу с формой оплаты
    window.history.back();
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <XCircleIcon className='h-20 w-20 text-red-500 mx-auto mb-6' />

        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Платеж не выполнен
        </h1>

        <p className='text-gray-600 mb-6'>
          К сожалению, ваш платеж не был завершен. Это могло произойти по
          следующим причинам:
        </p>

        <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
          <h3 className='font-semibold text-gray-900 mb-3'>
            Возможные причины:
          </h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start'>
              <span className='text-red-500 mr-2'>•</span>
              Отмена платежа пользователем
            </li>
            <li className='flex items-start'>
              <span className='text-red-500 mr-2'>•</span>
              Недостаточно средств на карте
            </li>
            <li className='flex items-start'>
              <span className='text-red-500 mr-2'>•</span>
              Технические проблемы банка
            </li>
            <li className='flex items-start'>
              <span className='text-red-500 mr-2'>•</span>
              Превышено время ожидания
            </li>
          </ul>
        </div>

        {paymentData.outSum && (
          <div className='bg-blue-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>
              Детали платежа:
            </h3>
            <div className='space-y-1 text-sm text-gray-600'>
              <div>
                Сумма:{' '}
                <span className='font-medium'>{paymentData.outSum} ₽</span>
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
          <p className='text-sm text-gray-500 mb-4'>
            Вы можете попробовать оплатить снова или обратиться в службу
            поддержки.
          </p>

          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={handleRetryPayment}
              className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
            >
              <ArrowPathIcon className='h-5 w-5' />
              Попробовать снова
            </button>
            <Link
              href='/contacts'
              className='flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center'
            >
              Связаться с нами
            </Link>
          </div>

          <Link
            href='/'
            className='block w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors'
          >
            Вернуться на главную
          </Link>
        </div>

        <div className='mt-6 pt-6 border-t border-gray-200'>
          <p className='text-xs text-gray-500'>
            Если проблема повторяется, пожалуйста, свяжитесь с нашей службой
            поддержки. Мы поможем вам завершить оплату.
          </p>
        </div>
      </div>
    </div>
  );
}
