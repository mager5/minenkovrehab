'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Типы данных для экспресс консультации
interface ExpressConsultation {
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

// Данные об экспресс консультации
const expressConsultation: ExpressConsultation = {
  id: 'express-consultation',
  title: 'Экспресс онлайн-консультация',
  subtitle: 'Быстрое решение вопросов',
  description:
    'Краткая консультация для разбора конкретного вопроса и получения рекомендаций.',
  price: 3000,
  duration: '20 МИН.',
  features: [
    'Разбор истории вашего состояния',
    'Ответы на все ваши вопросы',
    'Определение целей и задач',
    'Выбор вектора действий по решению вашего вопроса',
    'Краткие рекомендации по упражнениям',
    'Видеозапись консультации',
  ],
  recommended: true,
};

// Функция форматирования цены
const formatExpressPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ₽`;
};

// Анимации
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

export default function ExpressConsultationPage() {
  const [selectedService, setSelectedService] = useState<string>(
    expressConsultation.id
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white'>
      {/* Hero секция */}
      <section className='relative py-20 lg:py-32 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5' />
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <motion.div
            className='text-center max-w-4xl mx-auto'
            initial='hidden'
            animate='visible'
            variants={fadeIn}
            custom={0}
          >
            <motion.span
              className='inline-block px-4 py-2 bg-accent/10 text-accent font-semibold rounded-full text-sm uppercase tracking-wider mb-6'
              variants={fadeIn}
              custom={1}
            >
              Экспресс формат
            </motion.span>
            <motion.h1
              className='text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6'
              variants={fadeIn}
              custom={2}
            >
              Экспресс онлайн-консультация
            </motion.h1>
            <motion.p
              className='text-xl text-gray-600 mb-8 leading-relaxed'
              variants={fadeIn}
              custom={3}
            >
              Быстрое решение конкретных вопросов по реабилитации и
              восстановлению. Получите профессиональные рекомендации за 20
              минут.
            </motion.p>
            <motion.div
              className='flex flex-col sm:flex-row gap-4 justify-center'
              variants={fadeIn}
              custom={4}
            >
              <Link
                href='#booking'
                className='inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
              >
                Записаться на консультацию
              </Link>
              <Link
                href='#details'
                className='inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300'
              >
                Подробнее
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Детали услуги */}
      <section id='details' className='py-20 bg-white'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            className='max-w-4xl mx-auto'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-primary mb-4'>
                Что включает экспресс консультация
              </h2>
              <p className='text-xl text-gray-600'>
                Эффективное решение ваших вопросов в сжатые сроки
              </p>
            </div>

            <div className='bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100'>
              <div className='grid lg:grid-cols-2 gap-12 items-center'>
                <div>
                  <div className='flex items-center mb-6'>
                    <div className='bg-accent/10 p-3 rounded-full mr-4'>
                      <svg
                        className='w-6 h-6 text-accent'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className='text-2xl font-bold text-primary'>
                        {expressConsultation.title}
                      </h3>
                      <p className='text-accent font-semibold'>
                        {expressConsultation.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className='text-gray-600 mb-6 leading-relaxed'>
                    {expressConsultation.description}
                  </p>

                  <div className='flex items-center mb-6'>
                    <div className='bg-primary/10 px-4 py-2 rounded-lg mr-4'>
                      <span className='text-primary font-bold text-lg'>
                        {expressConsultation.duration}
                      </span>
                    </div>
                    <div className='bg-accent/10 px-4 py-2 rounded-lg'>
                      <span className='text-accent font-bold text-lg'>
                        {formatExpressPrice(expressConsultation.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='text-xl font-bold text-primary mb-6'>
                    Что вы получите:
                  </h4>
                  <ul className='space-y-4'>
                    {expressConsultation.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        className='flex items-start'
                        variants={fadeIn}
                        custom={index + 1}
                      >
                        <div className='bg-accent/20 p-1 rounded-full mr-3 mt-1 flex-shrink-0'>
                          <svg
                            className='w-4 h-4 text-accent'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                        <span className='text-gray-700'>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Процесс консультации */}
      <section className='py-20 bg-gray-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            className='text-center mb-16'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            <h2 className='text-3xl md:text-4xl font-bold text-primary mb-4'>
              Как проходит консультация
            </h2>
            <p className='text-xl text-gray-600'>
              Простой и эффективный процесс получения помощи
            </p>
          </motion.div>

          <div className='max-w-4xl mx-auto'>
            <div className='grid md:grid-cols-3 gap-8'>
              {[
                {
                  step: '01',
                  title: 'Запись',
                  description:
                    'Выберите удобное время и оплатите консультацию онлайн',
                },
                {
                  step: '02',
                  title: 'Подготовка',
                  description:
                    'Отправьте краткое описание вашего вопроса и медицинские документы',
                },
                {
                  step: '03',
                  title: 'Консультация',
                  description:
                    'Получите профессиональные рекомендации в формате видеозвонка',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className='text-center'
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={index + 1}
                >
                  <div className='bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6'>
                    {item.step}
                  </div>
                  <h3 className='text-xl font-bold text-primary mb-4'>
                    {item.title}
                  </h3>
                  <p className='text-gray-600'>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Форма записи */}
      <section id='booking' className='py-20 bg-white'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            className='max-w-2xl mx-auto text-center'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            <h2 className='text-3xl md:text-4xl font-bold text-primary mb-4'>
              Записаться на экспресс консультацию
            </h2>
            <p className='text-xl text-gray-600 mb-8'>
              Получите профессиональную помощь уже сегодня
            </p>

            <div className='bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-8 mb-8'>
              <div className='text-center mb-6'>
                <div className='text-3xl font-bold text-primary mb-2'>
                  {formatExpressPrice(expressConsultation.price)}
                </div>
                <div className='text-accent font-semibold'>
                  {expressConsultation.duration}
                </div>
              </div>

              <Link
                href='/payment?service=express-consultation&amount=3000&description=Экспресс онлайн-консультация'
                className='inline-flex items-center justify-center w-full px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4h8v4z'
                  />
                </svg>
                Записаться и оплатить
              </Link>
            </div>

            <p className='text-sm text-gray-500'>
              После оплаты с вами свяжутся для согласования времени консультации
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className='py-20 bg-gray-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            className='text-center mb-16'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            <h2 className='text-3xl md:text-4xl font-bold text-primary mb-4'>
              Часто задаваемые вопросы
            </h2>
          </motion.div>

          <div className='max-w-3xl mx-auto'>
            <div className='space-y-6'>
              {[
                {
                  question: 'Чем экспресс консультация отличается от обычной?',
                  answer:
                    'Экспресс консультация длится 20 минут и фокусируется на решении конкретного вопроса, в то время как обычная консультация длится 60 минут и включает более детальный анализ.',
                },
                {
                  question: 'Какие вопросы можно решить за 20 минут?',
                  answer:
                    'Краткий анализ симптомов, рекомендации по упражнениям, ответы на вопросы о реабилитации, выбор направления лечения.',
                },
                {
                  question: 'Нужно ли готовиться к консультации?',
                  answer:
                    'Желательно подготовить краткое описание вашего вопроса и имеющиеся медицинские документы для более эффективного использования времени.',
                },
                {
                  question: 'Можно ли получить запись консультации?',
                  answer:
                    'Да, все консультации записываются и высылаются вам для повторного просмотра.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className='bg-white rounded-lg shadow-md p-6'
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={index + 1}
                >
                  <h3 className='text-lg font-bold text-primary mb-3'>
                    {item.question}
                  </h3>
                  <p className='text-gray-600'>{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className='py-20 bg-gradient-to-r from-primary to-accent'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            className='text-center text-white'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Готовы получить профессиональную помощь?
            </h2>
            <p className='text-xl mb-8 opacity-90'>
              Запишитесь на экспресс консультацию прямо сейчас
            </p>
            <Link
              href='#booking'
              className='inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
            >
              Записаться на консультацию
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
