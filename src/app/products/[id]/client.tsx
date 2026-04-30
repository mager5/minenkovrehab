'use client';

import Link from 'next/link';
import { products, formatPrice, Product } from '../data';
import { motion } from 'framer-motion';
import ImageCarousel from '@/components/ui/ImageCarousel';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { MoreServicesSection } from '@/components/sections/MoreServicesSection';

// Анимации для появления элементов
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  }),
};

// Клиентский компонент для страницы продукта
export default function ProductClient({ product }: { product: Product }) {
  // Состояние для чекбоксов согласия
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isOfferChecked, setIsOfferChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [showOfferError, setShowOfferError] = useState(false);
  // Состояние для показа всех уровней программы "Формула движения"
  const [showAllLevels, setShowAllLevels] = useState(false);
  // Состояние для показа дополнительной информации для консультации
  const [showMoreConsultation, setShowMoreConsultation] = useState(false);
  // Состояние для чекбоксов согласия для каждого уровня
  const [isConsentCheckedLevel2, setIsConsentCheckedLevel2] = useState(false);
  const [isOfferCheckedLevel2, setIsOfferCheckedLevel2] = useState(false);
  const [showConsentErrorLevel2, setShowConsentErrorLevel2] = useState(false);
  const [showOfferErrorLevel2, setShowOfferErrorLevel2] = useState(false);
  const [isConsentCheckedLevel3, setIsConsentCheckedLevel3] = useState(false);
  const [isOfferCheckedLevel3, setIsOfferCheckedLevel3] = useState(false);
  const [showConsentErrorLevel3, setShowConsentErrorLevel3] = useState(false);
  const [showOfferErrorLevel3, setShowOfferErrorLevel3] = useState(false);
  const [isConsentCheckedLevel4, setIsConsentCheckedLevel4] = useState(false);
  const [isOfferCheckedLevel4, setIsOfferCheckedLevel4] = useState(false);
  const [showConsentErrorLevel4, setShowConsentErrorLevel4] = useState(false);
  const [showOfferErrorLevel4, setShowOfferErrorLevel4] = useState(false);

  // Состояния для анимации оплаты для каждого уровня
  const [isPaymentProcessingLevel1, setIsPaymentProcessingLevel1] =
    useState(false);
  const [isPaymentProcessingLevel2, setIsPaymentProcessingLevel2] =
    useState(false);
  const [isPaymentProcessingLevel3, setIsPaymentProcessingLevel3] =
    useState(false);
  const [isPaymentProcessingLevel4, setIsPaymentProcessingLevel4] =
    useState(false);

  // Состояния для экспресс-консультации
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Сброс состояний обработки при возврате пользователя на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Сбрасываем все состояния обработки при возврате на страницу
        setIsPaymentProcessingLevel1(false);
        setIsPaymentProcessingLevel2(false);
        setIsPaymentProcessingLevel3(false);
        setIsPaymentProcessingLevel4(false);
        setIsLoading(false);
        console.log('🔄 Состояния обработки сброшены при возврате на страницу');
      }
    };

    const handleFocus = () => {
      // Дополнительный сброс при фокусе на окне
      setIsPaymentProcessingLevel1(false);
      setIsPaymentProcessingLevel2(false);
      setIsPaymentProcessingLevel3(false);
      setIsPaymentProcessingLevel4(false);
      setIsLoading(false);
      console.log('🔄 Состояния обработки сброшены при фокусе на окне');
    };

    // Добавляем обработчики событий
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Очистка обработчиков при размонтировании компонента
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('mr_checkout_email') || '';
      const savedPhone = localStorage.getItem('mr_checkout_phone') || '';
      if (savedEmail) setCustomerEmail(savedEmail);
      if (savedPhone) setCustomerPhone(savedPhone);
    } catch {}
  }, []);

  // Проверка согласия перед действием
  const checkConsent = () => {
    let hasError = false;

    if (!isConsentChecked) {
      setShowConsentError(true);
      setTimeout(() => setShowConsentError(false), 3000);
      hasError = true;
    } else {
      setShowConsentError(false);
    }

    if (!isOfferChecked) {
      setShowOfferError(true);
      setTimeout(() => setShowOfferError(false), 3000);
      hasError = true;
    } else {
      setShowOfferError(false);
    }

    return !hasError;
  };

  // Обработчик для Telegram
  const handleTelegramClick = (e: React.MouseEvent) => {
    if (!checkConsent()) {
      e.preventDefault();
      return;
    }
  };

  // Обработчики для кнопок Telegram для каждого уровня
  const handleTelegramClickLevel2 = (e: React.MouseEvent) => {
    if (!isConsentCheckedLevel2 || !isOfferCheckedLevel2) {
      if (!isConsentCheckedLevel2) {
        setShowConsentErrorLevel2(true);
        setTimeout(() => setShowConsentErrorLevel2(false), 3000);
      }
      if (!isOfferCheckedLevel2) {
        setShowOfferErrorLevel2(true);
        setTimeout(() => setShowOfferErrorLevel2(false), 3000);
      }
      e.preventDefault();
      return;
    }
  };

  const handleTelegramClickLevel3 = (e: React.MouseEvent) => {
    if (!isConsentCheckedLevel3 || !isOfferCheckedLevel3) {
      if (!isConsentCheckedLevel3) {
        setShowConsentErrorLevel3(true);
        setTimeout(() => setShowConsentErrorLevel3(false), 3000);
      }
      if (!isOfferCheckedLevel3) {
        setShowOfferErrorLevel3(true);
        setTimeout(() => setShowOfferErrorLevel3(false), 3000);
      }
      e.preventDefault();
      return;
    }
  };

  const handleTelegramClickLevel4 = (e: React.MouseEvent) => {
    if (!isConsentCheckedLevel4 || !isOfferCheckedLevel4) {
      if (!isConsentCheckedLevel4) {
        setShowConsentErrorLevel4(true);
        setTimeout(() => setShowConsentErrorLevel4(false), 3000);
      }
      if (!isOfferCheckedLevel4) {
        setShowOfferErrorLevel4(true);
        setTimeout(() => setShowOfferErrorLevel4(false), 3000);
      }
      e.preventDefault();
      return;
    }
  };

  // Обработчики для кнопок оплаты для каждого уровня
  const handlePaymentLevel1 = async () => {
    if (!checkConsent()) {
      return;
    }
    await handlePayment(1);
  };

  const handlePaymentLevel2 = async () => {
    if (!isConsentCheckedLevel2 || !isOfferCheckedLevel2) {
      if (!isConsentCheckedLevel2) {
        setShowConsentErrorLevel2(true);
        setTimeout(() => setShowConsentErrorLevel2(false), 3000);
      }
      if (!isOfferCheckedLevel2) {
        setShowOfferErrorLevel2(true);
        setTimeout(() => setShowOfferErrorLevel2(false), 3000);
      }
      return;
    }
    await handlePayment(2);
  };

  const handlePaymentLevel3 = async () => {
    if (!isConsentCheckedLevel3 || !isOfferCheckedLevel3) {
      if (!isConsentCheckedLevel3) {
        setShowConsentErrorLevel3(true);
        setTimeout(() => setShowConsentErrorLevel3(false), 3000);
      }
      if (!isOfferCheckedLevel3) {
        setShowOfferErrorLevel3(true);
        setTimeout(() => setShowOfferErrorLevel3(false), 3000);
      }
      return;
    }
    await handlePayment(3);
  };

  const handlePaymentLevel4 = async () => {
    if (!isConsentCheckedLevel4 || !isOfferCheckedLevel4) {
      if (!isConsentCheckedLevel4) {
        setShowConsentErrorLevel4(true);
        setTimeout(() => setShowConsentErrorLevel4(false), 3000);
      }
      if (!isOfferCheckedLevel4) {
        setShowOfferErrorLevel4(true);
        setTimeout(() => setShowOfferErrorLevel4(false), 3000);
      }
      return;
    }
    await handlePayment(4);
  };

  // Функция для определения типа платежа (для фискализации)
  const getPaymentMethod = (productId: string) => {
    // 100% предоплата для консультаций и онлайн-тренировок
    if (
      ['consultation', 'express-consultation', 'online-training'].includes(
        productId
      )
    ) {
      return 'full_prepayment';
    }
    // Полный расчет для программ восстановления и Формулы Движения
    // (formula-movement, personal-program - Резекция мениска, rehabilitation-protocols)
    return 'full_payment';
  };

  // Функция создания платежа через Railway API
  const handlePayment = async (level: number) => {
    try {
      console.log('🔄 Создание платежа для продукта:', product.title);
      console.log('🔄 Уровень:', level);

      const isEmailRequiredForAccess = ![
        'consultation',
        'express-consultation',
        'online-training',
      ].includes(product.id);

      let email = customerEmail.trim();

      // Старый вариант (оставлен для истории): всегда требовали email и блокировали оплату услуг
      // if (!email && typeof window !== 'undefined') {
      //   const promptedEmail =
      //     window.prompt(
      //       'Укажите email, на который отправить доступ к курсу:',
      //       ''
      //     ) || '';
      //   email = promptedEmail.trim();
      //   if (email) {
      //     setCustomerEmail(email);
      //     try {
      //       localStorage.setItem('mr_checkout_email', email);
      //     } catch {}
      //   }
      // }
      //
      // email = email.toLowerCase();
      // const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      // if (!email || !emailRegex.test(email)) {
      //   throw new Error('Укажите корректный email для получения доступа');
      // }

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (isEmailRequiredForAccess) {
        if (!email && typeof window !== 'undefined') {
          const promptedEmail =
            window.prompt(
              'Укажите email, на который отправить доступ к курсу:',
              ''
            ) || '';
          email = promptedEmail.trim();
          if (email) {
            setCustomerEmail(email);
            try {
              localStorage.setItem('mr_checkout_email', email);
            } catch {}
          }
        }

        email = email.toLowerCase();
        if (!email || !emailRegex.test(email)) {
          throw new Error('Укажите корректный email для получения доступа');
        }
      } else {
        // Для услуг (консультации/тренировки) email необязателен:
        // если введен и корректен — передаем; если пустой/некорректный — не блокируем оплату.
        if (email) {
          const normalized = email.toLowerCase();
          if (emailRegex.test(normalized)) {
            email = normalized;
          } else {
            email = '';
          }
        }
      }

      const phone = customerPhone.trim();
      // Старый вариант (оставлен для истории): спрашивали телефон через window.prompt
      // if (!phone && typeof window !== 'undefined') {
      //   const promptedPhone =
      //     window.prompt('Телефон (необязательно):', '') || '';
      //   phone = promptedPhone.trim();
      //   if (phone) {
      //     setCustomerPhone(phone);
      //     try {
      //       localStorage.setItem('mr_checkout_phone', phone);
      //     } catch {}
      //   }
      // }

      switch (level) {
        case 1:
          setIsPaymentProcessingLevel1(true);
          break;
        case 2:
          setIsPaymentProcessingLevel2(true);
          break;
        case 3:
          setIsPaymentProcessingLevel3(true);
          break;
        case 4:
          setIsPaymentProcessingLevel4(true);
          break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Используем новый API на Railway
      const response = await fetch(
        'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: product.price,
            productId: product.id,
            level,
            email: email || undefined,
            phone: phone || undefined,
            // Явно передаем параметры чека для корректного отображения в Robokassa
            receipt: {
              sno: 'usn_income', // УСН Доходы
              items: [
                {
                  // Добавляем уровень только для "Формулы движения", где это действительно нужно
                  name:
                    product.id === 'formula-movement' && level
                      ? `${product.title} (Уровень ${level})`
                      : product.title,
                  quantity: 1,
                  sum: product.price,
                  payment_method: getPaymentMethod(product.id),
                  payment_object: 'service',
                  tax: 'none', // Без НДС
                },
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Ошибка создания платежа: ${response.status} ${response.statusText} ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success && result.data?.paymentUrl) {
        // Убираем лишние символы из URL, если они есть
        const cleanUrl = result.data.paymentUrl.replace(/%27/g, '');
        window.location.href = cleanUrl;
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (error) {
      console.error('Ошибка оплаты:', error);

      // Сбрасываем состояние загрузки
      switch (level) {
        case 1:
          setIsPaymentProcessingLevel1(false);
          break;
        case 2:
          setIsPaymentProcessingLevel2(false);
          break;
        case 3:
          setIsPaymentProcessingLevel3(false);
          break;
        case 4:
          setIsPaymentProcessingLevel4(false);
          break;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(
        `Произошла ошибка при создании платежа: ${errorMessage}\n\nПопробуйте еще раз или обратитесь в поддержку.`
      );
    }
  };

  /*
  // Старый мок-метод для тестов (оставлен для истории)
  const handlePaymentMock = async (level: number) => {
    console.log('🧪 Демонстрационный режим оплаты, уровень:', level);

    // Устанавливаем состояние загрузки для соответствующего уровня
    switch (level) {
      case 1:
        setIsPaymentProcessingLevel1(true);
        break;
      case 2:
        setIsPaymentProcessingLevel2(true);
        break;
      case 3:
        setIsPaymentProcessingLevel3(true);
        break;
      case 4:
        setIsPaymentProcessingLevel4(true);
        break;
    }

    // Небольшая задержка, чтобы пользователь увидел спиннер
    await new Promise(resolve => setTimeout(resolve, 800));

    // Переход на страницу успешной оплаты (имитация)
    if (typeof window !== 'undefined') {
      window.location.href = '/payment/success?mock=1';
    }
  };
  */

  return (
    <motion.div
      className='py-12'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Навигация */}
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href='/products'
            className='text-primary hover:underline inline-flex items-center'
          >
            <motion.span whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
              ←
            </motion.span>{' '}
            Вернуться к продуктам
          </Link>
        </motion.div>

        {/* Содержимое страницы */}
        <motion.div
          className='bg-white p-6 rounded-lg shadow-md'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.07)' }}
        >
          <div className='flex flex-col lg:flex-row lg:items-start'>
            {/* Информация о продукте */}
            <motion.div
              className='lg:w-2/3 lg:pr-8'
              initial='hidden'
              animate='visible'
              variants={fadeIn}
              custom={0}
            >
              <motion.h1
                className='text-3xl font-bold text-primary mb-4'
                variants={fadeIn}
                custom={1}
              >
                {product.title}
              </motion.h1>

              {/* Основное изображение продукта - скрыто только для personal-program */}
              {product.image && product.id !== 'personal-program' && (
                <motion.div
                  className='mb-6 relative h-64 md:h-80 rounded-lg overflow-hidden'
                  variants={fadeIn}
                  custom={2}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className='object-cover'
                    priority
                  />
                </motion.div>
              )}

              {/* Карусель изображений для восстановительной программы */}
              {(product.id === 'rehabilitation-protocols' ||
                product.id === 'personal-program') && (
                <motion.div
                  className='mb-6 lg:self-start'
                  variants={fadeIn}
                  custom={2}
                >
                  <motion.h2
                    className='text-xl font-semibold text-dark mb-4'
                    variants={fadeIn}
                    custom={3}
                  >
                    Этапы реабилитации
                  </motion.h2>
                  <ImageCarousel
                    images={[
                      {
                        src: '/images/products/IMAGE 2025-07-22 23:23:43.jpg',
                        alt: 'Этап 1: Острый период (0-2 недели)',
                        title: 'Острый период',
                      },
                      {
                        src: '/images/products/IMAGE 2025-07-22 23:23:54.jpg',
                        alt: 'Этап 2: Подострый период (2-6 недель)',
                        title: 'Подострый период',
                      },
                      {
                        src: '/images/products/IMAGE 2025-07-22 23:24:03.jpg',
                        alt: 'Этап 3: Функциональное восстановление (6-12 недель)',
                        title: 'Функциональное восстановление',
                      },
                      {
                        src: '/images/products/IMAGE 2025-07-22 23:24:15.jpg',
                        alt: 'Этап 4: Возвращение к спорту (12+ недель)',
                        title: 'Возвращение к спорту',
                      },
                    ]}
                  />
                </motion.div>
              )}

              <motion.div className='mb-6' variants={fadeIn} custom={5}>
                <motion.h2
                  className='text-xl font-semibold text-dark mb-4'
                  variants={fadeIn}
                  custom={6}
                >
                  Описание
                </motion.h2>
                <motion.p
                  className='text-dark mb-4'
                  variants={fadeIn}
                  custom={7}
                >
                  {product.shortDescription}
                </motion.p>
                <ul className='list-disc pl-5 space-y-2'>
                  {product.fullDescription.map(
                    (item: string, index: number) => (
                      <motion.li
                        key={index}
                        className='text-dark'
                        variants={fadeIn}
                        custom={8 + index * 0.5}
                      >
                        {item}
                      </motion.li>
                    )
                  )}
                </ul>
              </motion.div>
            </motion.div>

            {/* Блок цены и контактов */}
            <motion.div
              className={`lg:w-1/3 mt-8 lg:mt-0 lg:self-start ${
                product.id === 'personal-program' ? 'lg:pt-16' : ''
              }`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div
                className='bg-secondary p-6 rounded-lg'
                whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                <motion.h2
                  className='text-xl font-semibold text-primary mb-4'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Стоимость услуги
                </motion.h2>
                <motion.div
                  className='text-2xl font-bold text-accent mb-6'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {product.id === 'formula-movement'
                    ? '6 000 ₽'
                    : formatPrice(product.id, product.price)}
                </motion.div>

                {/* Плашка "Не является медицинской услугой" */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'
                >
                  <div className='flex items-center space-x-2'>
                    <svg
                      className='w-4 h-4 text-blue-600 flex-shrink-0'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-sm text-blue-800 font-medium'>
                      Не является медицинской услугой
                    </span>
                  </div>
                </motion.div>

                {/* Чекбоксы согласия */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className='mb-4 space-y-3'
                >
                  {/* Чекбокс согласия на обработку персональных данных */}
                  <div
                    className={`p-3 rounded-md transition-all ${
                      showConsentError
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <label className='flex items-center space-x-3 cursor-pointer group'>
                      <div className='relative'>
                        <input
                          type='checkbox'
                          checked={isConsentChecked}
                          onChange={e => {
                            setIsConsentChecked(e.target.checked);
                            if (e.target.checked) setShowConsentError(false);
                          }}
                          className='sr-only'
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                            isConsentChecked
                              ? 'bg-primary border-primary shadow-md'
                              : 'bg-white border-gray-300 group-hover:border-primary/50'
                          }`}
                        >
                          {isConsentChecked && (
                            <svg
                              className='w-3 h-3 text-white'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className='text-xs text-gray-600 leading-relaxed'>
                        Я даю{' '}
                        <Link
                          href='/consent'
                          className='text-primary hover:underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          согласие на обработку персональных данных
                        </Link>{' '}
                        в соответствии с{' '}
                        <Link
                          href='/policy'
                          className='text-primary hover:underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          политикой конфиденциальности
                        </Link>
                      </span>
                    </label>
                    {showConsentError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-2 text-xs text-red-600 font-medium'
                      >
                        ⚠️ Пожалуйста, отметьте согласие на обработку
                        персональных данных для продолжения
                      </motion.div>
                    )}
                  </div>

                  {/* Чекбокс согласия с договором оферты */}
                  <div
                    className={`p-3 rounded-md transition-all ${
                      showOfferError
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <label className='flex items-center space-x-3 cursor-pointer group'>
                      <div className='relative'>
                        <input
                          type='checkbox'
                          checked={isOfferChecked}
                          onChange={e => {
                            setIsOfferChecked(e.target.checked);
                            if (e.target.checked) setShowOfferError(false);
                          }}
                          className='sr-only'
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                            isOfferChecked
                              ? 'bg-primary border-primary shadow-md'
                              : 'bg-white border-gray-300 group-hover:border-primary/50'
                          }`}
                        >
                          {isOfferChecked && (
                            <svg
                              className='w-3 h-3 text-white'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className='text-xs text-gray-600 leading-relaxed'>
                        Я согласен с условиями{' '}
                        <a
                          href='/offer'
                          className='text-primary hover:underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          договора оферты
                        </a>
                      </span>
                    </label>
                    {showOfferError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-2 text-xs text-red-600 font-medium'
                      >
                        ⚠️ Пожалуйста, согласитесь с условиями договора оферты
                        для продолжения
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Кнопка покупки */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{
                    scale: isConsentChecked && isOfferChecked ? 1.05 : 1,
                  }}
                  whileTap={{
                    scale: isConsentChecked && isOfferChecked ? 0.95 : 1,
                  }}
                  className='mb-4'
                >
                  <button
                    onClick={handlePaymentLevel1}
                    disabled={
                      !isConsentChecked ||
                      !isOfferChecked ||
                      isPaymentProcessingLevel1
                    }
                    aria-label={`Купить онлайн: ${product.title}`}
                    className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg flex items-center justify-center space-x-2 ${
                      isConsentChecked &&
                      isOfferChecked &&
                      !isPaymentProcessingLevel1
                        ? 'bg-accent hover:bg-accent/90 hover:shadow-xl cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isPaymentProcessingLevel1 ? (
                      <>
                        <svg
                          className='animate-spin h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        <span>Обработка...</span>
                      </>
                    ) : (
                      'Купить онлайн'
                    )}
                  </button>
                </motion.div>

                {/* Кнопка связи в Telegram */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  whileHover={{
                    scale: isConsentChecked && isOfferChecked ? 1.05 : 1,
                  }}
                  whileTap={{
                    scale: isConsentChecked && isOfferChecked ? 0.95 : 1,
                  }}
                  className='mb-4'
                >
                  {isConsentChecked && isOfferChecked ? (
                    <Link
                      href='https://t.me/MV_Rehab'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-primary hover:bg-primary-dark hover:border-primary/20 cursor-pointer'
                    >
                      Связаться в Telegram
                    </Link>
                  ) : (
                    <button
                      onClick={handleTelegramClick}
                      className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-gray-400 cursor-not-allowed'
                    >
                      Связаться в Telegram
                    </button>
                  )}
                </motion.div>

                {/* Кнопка показать все уровни для Формулы движения */}
                {product.id === 'formula-movement' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className='mb-4'
                  >
                    <button
                      onClick={() => setShowAllLevels(!showAllLevels)}
                      className='block w-full text-primary text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-primary hover:bg-primary hover:text-white'
                    >
                      {showAllLevels ? 'Свернуть' : 'Показать все уровни'}
                    </button>
                  </motion.div>
                )}

                {/* Кнопка показать еще для консультации */}
                {product.id === 'consultation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className='mb-4'
                  >
                    <button
                      onClick={() =>
                        setShowMoreConsultation(!showMoreConsultation)
                      }
                      className='block w-full text-primary text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-primary hover:bg-primary hover:text-white'
                    >
                      {showMoreConsultation ? 'Свернуть' : 'Показать еще'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Карточка оплаты экспресс-онлайн-консультации */}
          {product.id === 'consultation' && showMoreConsultation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className='mt-8'
            >
              <div className='bg-secondary p-6 rounded-lg border border-gray-200'>
                <h3 className='text-2xl font-bold text-primary mb-3'>
                  Экспресс онлайн-консультация
                </h3>
                <p className='text-gray-700 mb-4'>
                  Быстрая консультация для разбора конкретного вопроса и
                  получения рекомендаций.
                </p>

                <div className='space-y-4 mb-6'>
                  <div>
                    <h4 className='font-semibold text-primary mb-2'>
                      Что включает:
                    </h4>
                    <ul className='list-disc list-inside space-y-1 text-sm text-gray-700'>
                      <li>Разбор истории вашего состояния</li>
                      <li>Ответы на все ваши вопросы</li>
                      <li>Определение целей и задач</li>
                      <li>Выбор вектора действий по решению вашего вопроса</li>
                    </ul>
                  </div>
                </div>

                {/* Плашка "Не является медицинской услугой" */}
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                  <p className='text-sm text-yellow-800 font-medium'>
                    ⚠️ Не является медицинской услугой
                  </p>
                </div>

                {/* Цена */}
                <div className='mb-6'>
                  <div className='text-2xl font-bold text-primary'>
                    {formatPrice('express-consultation', 3000)}
                  </div>
                </div>

                {/* Чекбокс согласия */}
                <div className='mb-6'>
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isAgreed}
                        onChange={e => setIsAgreed(e.target.checked)}
                        className='absolute opacity-0 w-5 h-5 cursor-pointer'
                        required
                        aria-required='true'
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 flex-shrink-0 
                        ${isAgreed ? 'bg-accent border-accent' : 'bg-white border-gray-300 group-hover:border-accent'}`}
                        aria-hidden='true'
                      >
                        {isAgreed && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='3'
                              d='M5 13l4 4L19 7'
                            ></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-sm text-gray-700'>
                      Я даю{' '}
                      <Link
                        href='/consent'
                        className='text-primary hover:underline'
                      >
                        согласие на обработку персональных данных
                      </Link>{' '}
                      в соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                      >
                        политикой конфиденциальности
                      </Link>{' '}
                      и согласен с условиями{' '}
                      <Link
                        href='/terms'
                        className='text-primary hover:underline'
                      >
                        договора оферты
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {/* Кнопки */}
                <div className='flex flex-col sm:flex-row gap-4'>
                  <button
                    onClick={async () => {
                      if (!isAgreed) {
                        alert(
                          'Пожалуйста, дайте согласие на обработку персональных данных'
                        );
                        return;
                      }
                      setIsLoading(true);
                      try {
                        console.log(
                          '🧪 Демонстрационный режим: оплата для экспресс-консультации'
                        );
                        await new Promise(resolve => setTimeout(resolve, 800));
                        if (typeof window !== 'undefined') {
                          window.location.href =
                            '/payment/success?mock=1&product=express-consultation';
                        }
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={!isAgreed || isLoading}
                    aria-label='Купить онлайн экспресс-консультацию'
                    className='flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoading ? 'Обработка...' : 'Купить онлайн'}
                  </button>
                  <Link
                    href={isAgreed ? 'https://t.me/MV_Rehab' : '#'}
                    target={isAgreed ? '_blank' : '_self'}
                    rel={isAgreed ? 'noopener noreferrer' : ''}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors text-center ${
                      isAgreed
                        ? 'bg-white text-primary border-2 border-primary hover:bg-primary/5 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
                    }`}
                    {...(!isAgreed && { onClick: e => e.preventDefault() })}
                  >
                    Связаться в Telegram
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Дополнительные уровни для Формулы движения */}
          {product.id === 'formula-movement' && showAllLevels && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            >
              {/* Второй уровень */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='bg-secondary p-6 rounded-lg'
                whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                <h1 className='text-xl font-semibold text-primary mb-4'>
                  2-й уровень
                </h1>
                <div className='text-2xl font-bold text-accent mb-6'>
                  6 000 ₽
                </div>
                {/* Чекбокс согласия с политикой конфиденциальности */}
                <div
                  className={`mb-3 p-3 rounded-md transition-all ${
                    showConsentErrorLevel2
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isConsentCheckedLevel2}
                        onChange={e => {
                          setIsConsentCheckedLevel2(e.target.checked);
                          if (e.target.checked)
                            setShowConsentErrorLevel2(false);
                        }}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isConsentCheckedLevel2
                            ? 'bg-primary border-primary shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-primary/50'
                        }`}
                      >
                        {isConsentCheckedLevel2 && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-gray-600 leading-relaxed'>
                      Я даю{' '}
                      <Link
                        href='/consent'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        согласие на обработку персональных данных
                      </Link>{' '}
                      в соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>
                      .
                    </span>
                  </label>
                  {showConsentErrorLevel2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, дайте согласие на обработку персональных
                      данных для продолжения
                    </motion.div>
                  )}
                </div>

                {/* Чекбокс согласия с договором оферты */}
                <div
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showOfferErrorLevel2
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isOfferCheckedLevel2}
                        onChange={e => {
                          setIsOfferCheckedLevel2(e.target.checked);
                          if (e.target.checked) setShowOfferErrorLevel2(false);
                        }}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isOfferCheckedLevel2
                            ? 'bg-primary border-primary shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-primary/50'
                        }`}
                      >
                        {isOfferCheckedLevel2 && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-gray-600 leading-relaxed'>
                      Я согласен с условиями{' '}
                      <a
                        href='/offer'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
                      </a>
                      .
                    </span>
                  </label>
                  {showOfferErrorLevel2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, согласитесь с условиями договора оферты для
                      продолжения
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={handlePaymentLevel2}
                  disabled={
                    !isConsentCheckedLevel2 ||
                    !isOfferCheckedLevel2 ||
                    isPaymentProcessingLevel2
                  }
                  aria-label='Купить онлайн уровень 2 программы Формула движения'
                  className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg mb-4 flex items-center justify-center space-x-2 ${
                    isConsentCheckedLevel2 &&
                    isOfferCheckedLevel2 &&
                    !isPaymentProcessingLevel2
                      ? 'bg-accent hover:bg-accent/90 hover:shadow-xl cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isPaymentProcessingLevel2 ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      <span>Обработка...</span>
                    </>
                  ) : (
                    'Купить онлайн'
                  )}
                </button>
                {isConsentCheckedLevel2 && isOfferCheckedLevel2 ? (
                  <Link
                    href='https://t.me/MV_Rehab'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-primary hover:bg-primary-dark hover:border-primary/20 cursor-pointer'
                  >
                    Связаться в Telegram
                  </Link>
                ) : (
                  <button
                    onClick={handleTelegramClickLevel2}
                    className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-gray-400 cursor-not-allowed'
                  >
                    Связаться в Telegram
                  </button>
                )}
              </motion.div>

              {/* Третий уровень */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='bg-secondary p-6 rounded-lg'
                whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                <h1 className='text-xl font-semibold text-primary mb-4'>
                  3-й уровень
                </h1>
                <div className='text-2xl font-bold text-accent mb-6'>
                  6 000 ₽
                </div>
                {/* Первый чекбокс - согласие на обработку персональных данных */}
                <div
                  className={`mb-3 p-3 rounded-md transition-all ${
                    showConsentErrorLevel3
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isConsentCheckedLevel3}
                        onChange={e => {
                          setIsConsentCheckedLevel3(e.target.checked);
                          if (e.target.checked)
                            setShowConsentErrorLevel3(false);
                        }}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isConsentCheckedLevel3
                            ? 'bg-primary border-primary shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-primary/50'
                        }`}
                      >
                        {isConsentCheckedLevel3 && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-gray-600 leading-relaxed'>
                      Я даю{' '}
                      <Link
                        href='/consent'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        согласие на обработку персональных данных
                      </Link>{' '}
                      в соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>
                      .
                    </span>
                  </label>
                  {showConsentErrorLevel3 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, отметьте согласие на обработку персональных
                      данных для продолжения
                    </motion.div>
                  )}
                </div>

                {/* Второй чекбокс - согласие с договором оферты */}
                <div
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showOfferErrorLevel3
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isOfferCheckedLevel3}
                        onChange={e => {
                          setIsOfferCheckedLevel3(e.target.checked);
                          if (e.target.checked) setShowOfferErrorLevel3(false);
                        }}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isOfferCheckedLevel3
                            ? 'bg-primary border-primary shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-primary/50'
                        }`}
                      >
                        {isOfferCheckedLevel3 && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-gray-600 leading-relaxed'>
                      Я согласен с условиями{' '}
                      <a
                        href='/offer'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
                      </a>
                      .
                    </span>
                  </label>
                  {showOfferErrorLevel3 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, отметьте согласие с договором оферты для
                      продолжения
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={handlePaymentLevel3}
                  disabled={
                    !isConsentCheckedLevel3 ||
                    !isOfferCheckedLevel3 ||
                    isPaymentProcessingLevel3
                  }
                  aria-label='Купить онлайн уровень 3 программы Формула движения'
                  className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg mb-4 flex items-center justify-center space-x-2 ${
                    isConsentCheckedLevel3 &&
                    isOfferCheckedLevel3 &&
                    !isPaymentProcessingLevel3
                      ? 'bg-accent hover:bg-accent/90 hover:shadow-xl cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isPaymentProcessingLevel3 ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      <span>Обработка...</span>
                    </>
                  ) : (
                    'Купить онлайн'
                  )}
                </button>
                {isConsentCheckedLevel3 && isOfferCheckedLevel3 ? (
                  <Link
                    href='https://t.me/MV_Rehab'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-primary hover:bg-primary-dark hover:border-primary/20 cursor-pointer'
                  >
                    Связаться в Telegram
                  </Link>
                ) : (
                  <button
                    onClick={handleTelegramClickLevel3}
                    className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-gray-400 cursor-not-allowed'
                  >
                    Связаться в Telegram
                  </button>
                )}
              </motion.div>

              {/* Четвертый уровень */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className='bg-secondary p-6 rounded-lg'
                whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                <h1 className='text-xl font-semibold text-primary mb-4'>
                  4-й уровень
                </h1>
                <div className='text-2xl font-bold text-accent mb-6'>
                  6 000 ₽
                </div>
                {/* Первый чекбокс - согласие на обработку персональных данных */}
                <div
                  className={`mb-3 p-3 rounded-md transition-all ${
                    showConsentErrorLevel4
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isConsentCheckedLevel4}
                        onChange={e => {
                          setIsConsentCheckedLevel4(e.target.checked);
                          if (e.target.checked)
                            setShowConsentErrorLevel4(false);
                        }}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isConsentCheckedLevel4
                            ? 'bg-primary border-primary shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-primary/50'
                        }`}
                      >
                        {isConsentCheckedLevel4 && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-gray-600 leading-relaxed'>
                      Я даю{' '}
                      <Link
                        href='/consent'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        согласие на обработку персональных данных
                      </Link>{' '}
                      в соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>
                      .
                    </span>
                  </label>
                  {showConsentErrorLevel4 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, отметьте согласие на обработку персональных
                      данных для продолжения
                    </motion.div>
                  )}
                </div>

                {/* Второй чекбокс - согласие с договором оферты */}
                <div
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showOfferErrorLevel4
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-center space-x-3 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={isOfferCheckedLevel4}
                        onChange={e => {
                          setIsOfferCheckedLevel4(e.target.checked);
                          if (e.target.checked) setShowOfferErrorLevel4(false);
                        }}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isOfferCheckedLevel4
                            ? 'bg-primary border-primary shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-primary/50'
                        }`}
                      >
                        {isOfferCheckedLevel4 && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-gray-600 leading-relaxed'>
                      Я согласен с условиями{' '}
                      <a
                        href='/offer'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
                      </a>
                      .
                    </span>
                  </label>
                  {showOfferErrorLevel4 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, отметьте согласие с договором оферты для
                      продолжения
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={handlePaymentLevel4}
                  disabled={
                    !isConsentCheckedLevel4 ||
                    !isOfferCheckedLevel4 ||
                    isPaymentProcessingLevel4
                  }
                  aria-label='Купить онлайн уровень 4 программы Формула движения'
                  className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg mb-4 flex items-center justify-center space-x-2 ${
                    isConsentCheckedLevel4 &&
                    isOfferCheckedLevel4 &&
                    !isPaymentProcessingLevel4
                      ? 'bg-accent hover:bg-accent/90 hover:shadow-xl cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isPaymentProcessingLevel4 ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      <span>Обработка...</span>
                    </>
                  ) : (
                    'Купить онлайн'
                  )}
                </button>
                {isConsentCheckedLevel4 && isOfferCheckedLevel4 ? (
                  <Link
                    href='https://t.me/MV_Rehab'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-primary hover:bg-primary-dark hover:border-primary/20 cursor-pointer'
                  >
                    Связаться в Telegram
                  </Link>
                ) : (
                  <button
                    onClick={handleTelegramClickLevel4}
                    className='block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all border-2 border-transparent bg-gray-400 cursor-not-allowed'
                  >
                    Связаться в Telegram
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Секция "Еще услуги" */}
      <MoreServicesSection currentProductId={product.id} />
    </motion.div>
  );
}
