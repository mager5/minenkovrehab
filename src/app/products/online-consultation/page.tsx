'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Типы данных для консультаций
interface Consultation {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

// Данные о консультациях
const consultations: Consultation[] = [
  {
    id: 'initial-consultation',
    title: 'Первичная консультация',
    subtitle: 'Для новых пациентов',
    description:
      'Детальная оценка состояния, анализ жалоб и симптомов, предварительный диагноз и план лечения.',
    price: 3500,
    duration: '60 МИН.',
    features: [
      'Сбор анамнеза',
      'Оценка функционального состояния',
      'Диагностика проблемы',
      'Рекомендации по дальнейшим действиям',
      'Ответы на ваши вопросы',
    ],
    recommended: true,
  },
  {
    id: 'follow-up-consultation',
    title: 'Повторная консультация',
    description:
      'Для тех, кто уже был на первичной консультации. Оценка динамики, корректировка плана лечения.',
    price: 2500,
    duration: '45 МИН.',
    features: [
      'Оценка динамики состояния',
      'Корректировка плана лечения',
      'Новые упражнения и рекомендации',
      'Ответы на возникшие вопросы',
    ],
    popular: true,
  },
  {
    id: 'online-consultation',
    title: 'Онлайн консультация',
    description:
      'Удаленная консультация через видеосвязь. Удобно для тех, кто не может приехать лично.',
    price: 2000,
    duration: '50 МИН.',
    features: [
      'Видеоконсультация через Zoom или Skype',
      'Анализ присланных данных и обследований',
      'Разработка рекомендаций',
      'Видеоинструкции по упражнениям',
      'Письменное заключение по email',
    ],
  },
  {
    id: 'comprehensive-assessment',
    title: 'Комплексная оценка',
    subtitle: 'Расширенная диагностика',
    description:
      'Глубокий анализ состояния опорно-двигательного аппарата с использованием специализированных тестов.',
    price: 5000,
    duration: '90 МИН.',
    features: [
      'Функциональные тесты и пробы',
      'Анализ походки и осанки',
      'Оценка биомеханики движений',
      'Детальный письменный отчет',
      'Персонализированный план реабилитации',
      'Рекомендации по активности и образу жизни',
    ],
  },
];

// Функция для форматирования цены консультаций
const formatConsultationPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ₽`;
};

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

export default function OnlineConsultationPage() {
  const [selectedConsultationId, setSelectedConsultationId] = useState<
    string | null
  >(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Получаем выбранную консультацию
  const selectedConsultation = selectedConsultationId
    ? consultations.find(c => c.id === selectedConsultationId)
    : null;

  // Форматирование номера телефона в формате +7 (XXX) XXX-XX-XX
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

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      // Ограничиваем максимальную длину номера (+7 (XXX) XXX-XX-XX)
      if (formattedValue.length > 18) return;
      setContactInfo(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setContactInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  // Имитация процесса оплаты
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentProcessing(true);

    // Имитация API запроса на оплату
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  // Если пользователь не выбрал консультацию, отображаем список всех консультаций
  if (!selectedConsultation && !paymentSuccess) {
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
              <motion.span
                whileHover={{ x: -3 }}
                transition={{ duration: 0.2 }}
              >
                ←
              </motion.span>{' '}
              Вернуться к услугам
            </Link>
          </motion.div>

          {/* Заголовок */}
          <motion.h1
            className='text-3xl font-bold text-primary mb-8 text-center'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Выберите тип консультации
          </motion.h1>

          {/* Список консультаций */}
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
            {consultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all duration-300 ${
                  consultation.recommended
                    ? 'border-accent'
                    : 'border-transparent'
                }`}
                initial='hidden'
                animate='visible'
                variants={fadeIn}
                custom={index}
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  borderColor: consultation.recommended
                    ? 'var(--color-accent)'
                    : 'var(--color-primary-light)',
                }}
              >
                {consultation.recommended && (
                  <div className='bg-accent text-white text-xs py-1 text-center font-medium'>
                    Рекомендуемый вариант
                  </div>
                )}
                {consultation.popular && (
                  <div className='bg-primary text-white text-xs py-1 text-center font-medium'>
                    Популярный выбор
                  </div>
                )}
                <div className='p-6'>
                  <h2 className='text-xl font-bold text-primary mb-2'>
                    {consultation.title}
                  </h2>
                  {consultation.subtitle && (
                    <p className='text-sm text-gray-600 mb-3'>
                      {consultation.subtitle}
                    </p>
                  )}
                  <div className='text-2xl font-bold text-accent mb-4'>
                    {formatConsultationPrice(consultation.price)}
                  </div>
                  <p className='text-gray-600 mb-4'>
                    {consultation.description}
                  </p>
                  <div className='text-sm text-gray-500 mb-4'>
                    Длительность: {consultation.duration}
                  </div>
                  <div className='mb-5'>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>
                      Включает:
                    </h3>
                    <ul className='text-sm text-gray-600 space-y-1'>
                      {consultation.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className='flex items-start'>
                          <span className='text-accent mr-2'>•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <motion.button
                    onClick={() => setSelectedConsultationId(consultation.id)}
                    className='w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Записаться
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Если консультация выбрана, показываем форму оплаты
  if (selectedConsultation && !paymentSuccess) {
    return (
      <motion.div
        className='py-12'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl'>
          {/* Навигация */}
          <motion.div
            className='mb-8'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => setSelectedConsultationId(null)}
              className='text-primary hover:underline inline-flex items-center'
            >
              <motion.span
                whileHover={{ x: -3 }}
                transition={{ duration: 0.2 }}
              >
                ←
              </motion.span>{' '}
              Вернуться к выбору консультации
            </button>
          </motion.div>

          {/* Информация о выбранной консультации */}
          <motion.div
            className='bg-white rounded-lg shadow-md p-6 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-2xl font-bold text-primary mb-2'>
              {selectedConsultation.title}
            </h2>
            {selectedConsultation.subtitle && (
              <p className='text-gray-600 mb-3'>
                {selectedConsultation.subtitle}
              </p>
            )}
            <div className='text-3xl font-bold text-accent mb-4'>
              {formatConsultationPrice(selectedConsultation.price)}
            </div>
            <p className='text-gray-600 mb-4'>
              {selectedConsultation.description}
            </p>
            <div className='text-sm text-gray-500 mb-4'>
              Длительность: {selectedConsultation.duration}
            </div>
          </motion.div>

          {/* Форма оплаты */}
          <motion.div
            className='bg-white rounded-lg shadow-md p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className='text-xl font-bold text-primary mb-6'>
              Контактная информация
            </h3>
            <form onSubmit={handlePayment} className='space-y-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Имя *
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={contactInfo.name}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='Введите ваше имя'
                />
              </div>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Email *
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='Введите ваш email'
                />
              </div>
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Телефон *
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={contactInfo.phone}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='+7 (XXX) XXX-XX-XX'
                />
              </div>
              <motion.button
                type='submit'
                disabled={isPaymentProcessing}
                className='w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50'
                whileHover={{ scale: isPaymentProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isPaymentProcessing ? 1 : 0.98 }}
              >
                {isPaymentProcessing
                  ? 'Обработка...'
                  : 'Записаться на консультацию'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Страница успешной записи
  return (
    <motion.div
      className='py-12'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center'>
        <motion.div
          className='bg-white rounded-lg shadow-md p-8'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className='text-6xl mb-4'>✅</div>
          <h2 className='text-2xl font-bold text-primary mb-4'>
            Заявка успешно отправлена!
          </h2>
          <p className='text-gray-600 mb-6'>
            Спасибо за вашу заявку! Я свяжусь с вами в ближайшее время для
            подтверждения записи и уточнения деталей консультации.
          </p>
          <div className='space-y-3'>
            <motion.button
              onClick={() => {
                setPaymentSuccess(false);
                setSelectedConsultationId(null);
                setContactInfo({ name: '', email: '', phone: '' });
              }}
              className='w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Записаться на другую консультацию
            </motion.button>
            <Link
              href='/products'
              className='block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors'
            >
              Вернуться к услугам
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
