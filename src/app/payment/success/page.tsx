'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

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

  useEffect(() => {
    // Получаем параметры от Robokassa
    const outSum = searchParams.get('OutSum');
    const invId = searchParams.get('InvId');
    const signatureValue = searchParams.get('SignatureValue');

    setPaymentData({ 
      outSum: outSum || undefined, 
      invId: invId || undefined, 
      signatureValue: signatureValue || undefined 
    });

    // Проверяем подпись (опционально)
    if (outSum && invId && signatureValue) {
      verifyPayment(outSum, invId, signatureValue);
    } else {
      setIsVerifying(false);
      setIsValid(true); // Считаем валидным, если пользователь попал на эту страницу
    }
  }, [searchParams]);

  const verifyPayment = async (outSum: string, invId: string, signature: string) => {
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Проверяем платеж...
          </h1>
          <p className="text-gray-600">
            Пожалуйста, подождите
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {isValid ? (
          <>
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Платеж успешен!
            </h1>
            <p className="text-gray-600 mb-6">
              Спасибо за оплату! Ваш платеж был успешно обработан.
            </p>
            
            {paymentData.outSum && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Детали платежа:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Сумма: <span className="font-medium">{paymentData.outSum} ₽</span></div>
                  {paymentData.invId && (
                    <div>Номер заказа: <span className="font-medium">{paymentData.invId}</span></div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                В ближайшее время с вами свяжется наш специалист для уточнения деталей.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/club"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Перейти в клуб
                </Link>
                <Link 
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  На главную
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ошибка проверки
            </h1>
            <p className="text-gray-600 mb-6">
              Не удалось проверить подлинность платежа. Пожалуйста, свяжитесь с поддержкой.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/contacts"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Связаться с нами
              </Link>
              <Link 
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                На главную
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}