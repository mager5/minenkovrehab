'use client';

import Link from 'next/link';
import { products, formatPrice, Product } from '../data';
import { motion } from 'framer-motion';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useState, useEffect } from 'react';

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
  // Состояние для чекбокса согласия
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  // Состояние для показа всех уровней программы "Формула движения"
  const [showAllLevels, setShowAllLevels] = useState(false);
  // Состояние для чекбоксов согласия для каждого уровня
  const [isConsentCheckedLevel2, setIsConsentCheckedLevel2] = useState(false);
  const [showConsentErrorLevel2, setShowConsentErrorLevel2] = useState(false);
  const [isConsentCheckedLevel3, setIsConsentCheckedLevel3] = useState(false);
  const [showConsentErrorLevel3, setShowConsentErrorLevel3] = useState(false);
  const [isConsentCheckedLevel4, setIsConsentCheckedLevel4] = useState(false);
  const [showConsentErrorLevel4, setShowConsentErrorLevel4] = useState(false);

  // Состояния для анимации оплаты для каждого уровня
  const [isPaymentProcessingLevel1, setIsPaymentProcessingLevel1] =
    useState(false);
  const [isPaymentProcessingLevel2, setIsPaymentProcessingLevel2] =
    useState(false);
  const [isPaymentProcessingLevel3, setIsPaymentProcessingLevel3] =
    useState(false);
  const [isPaymentProcessingLevel4, setIsPaymentProcessingLevel4] =
    useState(false);

  // Сброс состояний обработки при возврате пользователя на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Сбрасываем все состояния обработки при возврате на страницу
        setIsPaymentProcessingLevel1(false);
        setIsPaymentProcessingLevel2(false);
        setIsPaymentProcessingLevel3(false);
        setIsPaymentProcessingLevel4(false);
        console.log('🔄 Состояния обработки сброшены при возврате на страницу');
      }
    };

    const handleFocus = () => {
      // Дополнительный сброс при фокусе на окне
      setIsPaymentProcessingLevel1(false);
      setIsPaymentProcessingLevel2(false);
      setIsPaymentProcessingLevel3(false);
      setIsPaymentProcessingLevel4(false);
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

  // Проверка согласия перед действием
  const checkConsent = () => {
    if (!isConsentChecked) {
      setShowConsentError(true);
      setTimeout(() => setShowConsentError(false), 3000);
      return false;
    }
    setShowConsentError(false);
    return true;
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
    if (!isConsentCheckedLevel2) {
      setShowConsentErrorLevel2(true);
      setTimeout(() => setShowConsentErrorLevel2(false), 3000);
      e.preventDefault();
      return;
    }
  };

  const handleTelegramClickLevel3 = (e: React.MouseEvent) => {
    if (!isConsentCheckedLevel3) {
      setShowConsentErrorLevel3(true);
      setTimeout(() => setShowConsentErrorLevel3(false), 3000);
      e.preventDefault();
      return;
    }
  };

  const handleTelegramClickLevel4 = (e: React.MouseEvent) => {
    if (!isConsentCheckedLevel4) {
      setShowConsentErrorLevel4(true);
      setTimeout(() => setShowConsentErrorLevel4(false), 3000);
      e.preventDefault();
      return;
    }
  };

  // Обработчики для кнопок оплаты для каждого уровня
  const handlePaymentLevel1 = async () => {
    if (!isConsentChecked) {
      setShowConsentError(true);
      setTimeout(() => setShowConsentError(false), 3000);
      return;
    }
    await handlePayment(1);
  };

  const handlePaymentLevel2 = async () => {
    if (!isConsentCheckedLevel2) {
      setShowConsentErrorLevel2(true);
      setTimeout(() => setShowConsentErrorLevel2(false), 3000);
      return;
    }
    await handlePayment(2);
  };

  const handlePaymentLevel3 = async () => {
    if (!isConsentCheckedLevel3) {
      setShowConsentErrorLevel3(true);
      setTimeout(() => setShowConsentErrorLevel3(false), 3000);
      return;
    }
    await handlePayment(3);
  };

  const handlePaymentLevel4 = async () => {
    if (!isConsentCheckedLevel4) {
      setShowConsentErrorLevel4(true);
      setTimeout(() => setShowConsentErrorLevel4(false), 3000);
      return;
    }
    await handlePayment(4);
  };

  // Динамическая генерация ссылки на оплату через Railway API
  const handlePayment = async (level: number) => {
    try {
      console.log('🔄 Создание платежа для продукта:', product.title);
      console.log('🔄 Уровень:', level);

      // Устанавливаем состояние загрузки для соответствующего уровня
      switch (level) {
        case 1:
          setIsPaymentProcessingLevel1(true);
          console.log('✅ Спиннер активирован для уровня 1');
          break;
        case 2:
          setIsPaymentProcessingLevel2(true);
          console.log('✅ Спиннер активирован для уровня 2');
          break;
        case 3:
          setIsPaymentProcessingLevel3(true);
          console.log('✅ Спиннер активирован для уровня 3');
          break;
        case 4:
          setIsPaymentProcessingLevel4(true);
          console.log('✅ Спиннер активирован для уровня 4');
          break;
      }

      // Добавляем минимальную задержку, чтобы пользователь увидел спиннер
      await new Promise(resolve => setTimeout(resolve, 500));

      // Прямое обращение к Railway API
      console.log('🌐 Отправка запроса к Railway API...');
      const response = await fetch(
        'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: product.price,
            // description: product.title, // Убрано по требованию пользователя
            productId: product.id, // Добавляем ID продукта для правильной фискализации
            level: level, // Передаем уровень отдельным параметром
            email: 'customer@example.com', // Можно добавить форму для email
            phone: '+79001234567', // Корректный формат телефона
          }),
        }
      );

      console.log('📡 Ответ от API:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка API:', errorText);
        throw new Error(
          `Ошибка создания платежа: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log('📦 Результат от API:', result);

      if (result.success && result.data?.paymentUrl) {
        console.log('✅ Платежная ссылка получена:', result.data.paymentUrl);

        // Сразу переходим на платежную систему без показа галочки
        // Спиннер будет крутиться до момента перехода
        const cleanUrl = result.data.paymentUrl.replace(/%27/g, '');
        console.log('🔍 Переход на платежную систему:', cleanUrl);
        window.location.href = cleanUrl;
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (error) {
      console.error('❌ Ошибка при создании платежа:', error);

      // Добавляем задержку перед сбросом состояния, чтобы пользователь увидел спиннер
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Сбрасываем состояния обработки при ошибке
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

      // Более информативное сообщение об ошибке
      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(
        `Произошла ошибка при создании платежа: ${errorMessage}\n\nПопробуйте еще раз или обратитесь в поддержку.`
      );
    }
  };

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

                {/* Чекбокс согласия */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showConsentError
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-start space-x-3 cursor-pointer group'>
                    <div className='relative mt-1'>
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
                      Я даю согласие на обработку персональных данных в
                      соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>{' '}
                      и согласен с условиями{' '}
                      <Link
                        href='/oferta.pdf'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
                      </Link>
                      .
                    </span>
                  </label>
                  {showConsentError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-2 text-xs text-red-600 font-medium'
                    >
                      ⚠️ Пожалуйста, отметьте согласие на обработку персональных
                      данных для продолжения
                    </motion.div>
                  )}
                </motion.div>

                {/* Кнопка покупки */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ scale: isConsentChecked ? 1.05 : 1 }}
                  whileTap={{ scale: isConsentChecked ? 0.95 : 1 }}
                  className='mb-4'
                >
                  <button
                    onClick={handlePaymentLevel1}
                    disabled={!isConsentChecked || isPaymentProcessingLevel1}
                    className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg flex items-center justify-center space-x-2 ${
                      isConsentChecked && !isPaymentProcessingLevel1
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
                  whileHover={{ scale: isConsentChecked ? 1.05 : 1 }}
                  whileTap={{ scale: isConsentChecked ? 0.95 : 1 }}
                  className='mb-4'
                >
                  {isConsentChecked ? (
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
              </motion.div>
            </motion.div>
          </div>

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
                <h3 className='text-xl font-semibold text-primary mb-4'>
                  Стоимость услуги
                </h3>
                <div className='text-2xl font-bold text-accent mb-6'>
                  6 000 ₽
                </div>
                <div
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showConsentErrorLevel2
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-start space-x-3 cursor-pointer group'>
                    <div className='relative mt-1'>
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
                      Я даю согласие на обработку персональных данных в
                      соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>{' '}
                      и согласен с условиями{' '}
                      <Link
                        href='/oferta.pdf'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
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
                      ⚠️ Пожалуйста, отметьте согласие на обработку персональных
                      данных для продолжения
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={handlePaymentLevel2}
                  disabled={
                    !isConsentCheckedLevel2 || isPaymentProcessingLevel2
                  }
                  className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg mb-4 flex items-center justify-center space-x-2 ${
                    isConsentCheckedLevel2 && !isPaymentProcessingLevel2
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
                {isConsentCheckedLevel2 ? (
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
                <h3 className='text-xl font-semibold text-primary mb-4'>
                  Стоимость услуги
                </h3>
                <div className='text-2xl font-bold text-accent mb-6'>
                  6 000 ₽
                </div>
                <div
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showConsentErrorLevel3
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-start space-x-3 cursor-pointer group'>
                    <div className='relative mt-1'>
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
                      Я даю согласие на обработку персональных данных в
                      соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>{' '}
                      и согласен с условиями{' '}
                      <Link
                        href='/oferta.pdf'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
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
                <button
                  onClick={handlePaymentLevel3}
                  disabled={
                    !isConsentCheckedLevel3 || isPaymentProcessingLevel3
                  }
                  className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg mb-4 flex items-center justify-center space-x-2 ${
                    isConsentCheckedLevel3 && !isPaymentProcessingLevel3
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
                {isConsentCheckedLevel3 ? (
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
                <h3 className='text-xl font-semibold text-primary mb-4'>
                  Стоимость услуги
                </h3>
                <div className='text-2xl font-bold text-accent mb-6'>
                  6 000 ₽
                </div>
                <div
                  className={`mb-4 p-3 rounded-md transition-all ${
                    showConsentErrorLevel4
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <label className='flex items-start space-x-3 cursor-pointer group'>
                    <div className='relative mt-1'>
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
                      Я даю согласие на обработку персональных данных в
                      соответствии с{' '}
                      <Link
                        href='/policy'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        политикой конфиденциальности
                      </Link>{' '}
                      и согласен с условиями{' '}
                      <Link
                        href='/oferta.pdf'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        договора оферты
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
                <button
                  onClick={handlePaymentLevel4}
                  disabled={
                    !isConsentCheckedLevel4 || isPaymentProcessingLevel4
                  }
                  className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg mb-4 flex items-center justify-center space-x-2 ${
                    isConsentCheckedLevel4 && !isPaymentProcessingLevel4
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
                {isConsentCheckedLevel4 ? (
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
    </motion.div>
  );
}
