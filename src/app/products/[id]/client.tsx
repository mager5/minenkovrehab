'use client';

import Link from 'next/link';
import { products, formatPrice, Product } from '../data';
import { motion } from 'framer-motion';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useState } from 'react';

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

  // Динамическая генерация ссылки на оплату через Railway API
  const handlePayment = async () => {
    if (!checkConsent()) {
      return;
    }
    try {
      console.log('🔄 Создание платежа для продукта:', product.title);

      // Прямое обращение к Railway API
      const response = await fetch(
        'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: product.price,
            description: product.title,
            email: 'customer@example.com', // Можно добавить форму для email
            phone: '+79001234567', // Корректный формат телефона
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка создания платежа');
      }

      const result = await response.json();

      if (result.success && result.data?.paymentUrl) {
        console.log('✅ Платежная ссылка получена:', result.data.paymentUrl);
        // Проверяем, что в URL нет лишних кавычек (оставляем для совместимости)
        const cleanUrl = result.data.paymentUrl.replace(/%27/g, '');
        console.log('🔍 Очищенная ссылка:', cleanUrl);
        window.location.href = cleanUrl;
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (error) {
      console.error('❌ Ошибка при создании платежа:', error);
      alert('Произошла ошибка при создании платежа. Попробуйте еще раз.');
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

              {/* Карусель изображений для протокола реабилитации */}
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
                  {formatPrice(product.id, product.price)}
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
                    onClick={handlePayment}
                    className={`block w-full text-white text-center px-6 py-3 rounded-md font-medium transition-all shadow-lg ${
                      isConsentChecked
                        ? 'bg-accent hover:bg-accent/90 hover:shadow-xl cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Купить онлайн
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
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
