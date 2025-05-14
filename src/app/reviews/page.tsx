'use client';

import React from 'react';
// import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Анимации для появления элементов
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.1,
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  })
};

// Тип отзыва
interface Review {
  id: number;
  name: string;
  problem: string;
  text: string;
  date: string;
  rating?: number;
}

// Демо-данные отзывов
const reviews: Review[] = [
  {
    id: 1,
    name: 'Анна К.',
    problem: 'Восстановление после травмы колена',
    text: 'Вадим — настоящий профессионал своего дела. После разрыва ПКС я прошла курс реабилитации, и уже через 3 месяца смогла вернуться к обычной жизни. Индивидуальный подход и внимание к деталям — то, что меня впечатлило больше всего.',
    date: '15 марта 2023',
    rating: 5,
  },
  {
    id: 2,
    name: 'Дмитрий С.',
    problem: 'Хроническая боль в пояснице',
    text: 'Долгие годы страдал от болей в спине. После 8 занятий с Вадимом почувствовал значительное облегчение. Особенно ценно, что он не только работает с симптомами, но и находит первопричину проблемы.',
    date: '28 апреля 2023',
    rating: 5,
  },
  {
    id: 3,
    name: 'Елена В.',
    problem: 'Реабилитация после инсульта',
    text: 'Когда мой отец перенес инсульт, мы были в отчаянии. Вадим составил индивидуальную программу реабилитации, и прогресс превзошел все ожидания. Особенно ценны были рекомендации по домашним упражнениям.',
    date: '10 января 2023',
    rating: 5,
  },
  {
    id: 4,
    name: 'Сергей М.',
    problem: 'Коррекция осанки',
    text: 'Профессиональный спортсмен, и правильная осанка критически важна для моих результатов. Работа с Вадимом помогла не только исправить проблемы с осанкой, но и улучшить показатели в моем виде спорта.',
    date: '17 июня 2023',
    rating: 5,
  },
  {
    id: 5,
    name: 'Ольга П.',
    problem: 'Реабилитация после эндопротезирования',
    text: 'После операции по замене тазобедренного сустава была очень напугана. Вадим помог мне не только физически восстановиться, но и вернуть уверенность в своих движениях. Благодаря его методике я вернулась к полноценной жизни намного быстрее, чем ожидалось.',
    date: '23 мая 2023',
    rating: 5,
  },
  {
    id: 6,
    name: 'Александр К.',
    problem: 'Вертеброгенная цервикалгия',
    text: 'Шейные головные боли мучили меня годами. Перепробовал множество методов лечения без особого успеха. Вадим предложил комплексный подход, который дал результаты уже после третьего сеанса. Сейчас боли полностью ушли, а я научился правильно заботиться о своем теле.',
    date: '9 февраля 2023',
    rating: 5,
  },
];

// Функция для рендеринга звездочек рейтинга
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      // Заполненная звезда для полного рейтинга
      stars.push(
        <svg 
          key={i} 
          className="w-5 h-5 text-[#B5D334]" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    } else {
      // Пустая звезда для недостающего рейтинга
      stars.push(
        <svg 
          key={i} 
          className="w-5 h-5 text-gray-300" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
  }
  return <div className="flex">{stars}</div>;
};

export default function ReviewsPage() {
  // Рефы для секций с параллакс-эффектом
  const heroRef = useRef(null);
  
  // Эффект параллакса для героя
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroImageY = useTransform(heroScroll, [0, 1], [0, 150]);
  const heroContentY = useTransform(heroScroll, [0, 1], [0, -50]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0.3]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero секция */}
      <motion.section 
        ref={heroRef}
        className="relative w-full pt-16 pb-12 lg:pt-24 lg:pb-16 bg-[#3A7CA5] overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ y: heroImageY }}
        >
          <div className="relative w-full h-full">
            <img 
              src="/images/hero/section-banner.jpg" 
              alt="Отзывы клиентов"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#3A7CA5]/80 via-[#3A7CA5]/50 to-transparent"></div>
        </motion.div>
        
        <motion.div 
          className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10"
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={0}
          >Отзывы наших клиентов</motion.h1>
          <motion.p 
            className="max-w-2xl text-xl text-white mb-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Узнайте, как индивидуальные программы реабилитации помогли сотням людей вернуться к полноценной жизни.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Секция с отзывами */}
      <section className="py-16 bg-[#F5F5F5] overflow-x-hidden">
        <div className="container mx-auto px-4 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div 
                key={review.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.1 * (index % 3), 
                  type: "spring", 
                  stiffness: 50 
                }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="flex items-center mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + 0.1 * (index % 3) }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-[#3A7CA5] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {review.name.charAt(0)}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-xl text-[#333333]">{review.name}</h3>
                    <p className="text-sm text-[#333333]/70">{review.problem}</p>
                  </div>
                </motion.div>
                
                {review.rating && (
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + 0.1 * (index % 3) }}
                  >
                    {renderStars(review.rating)}
                  </motion.div>
                )}
                
                <motion.p 
                  className="text-[#333333] mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + 0.1 * (index % 3) }}
                >
                  &quot;{review.text}&quot;
                </motion.p>
                
                <motion.div 
                  className="text-sm text-[#333333]/50 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + 0.1 * (index % 3) }}
                >
                  {review.date}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Секция со статистикой */}
      <motion.section 
        className="py-16 bg-[#3A7CA5] text-white overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Довольных клиентов" },
              { value: "98%", label: "Положительных отзывов" },
              { value: "4.9", label: "Средний рейтинг" },
              { value: "72%", label: "Клиентов по рекомендации" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <motion.div 
                  className="text-4xl font-bold mb-2"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.2 + 0.1 * index,
                    type: "spring",
                    stiffness: 100
                  }}
                >{stat.value}</motion.div>
                <motion.p 
                  className="text-[#E0F2F8]"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + 0.1 * index }}
                >{stat.label}</motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Секция "Поделитесь своей историей" */}
      <motion.section 
        className="py-16 bg-white overflow-x-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-[#333333]"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >Поделитесь своей историей</motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-lg text-[#333333] mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Ваш отзыв поможет другим людям принять важное решение о своем здоровье 
            и вдохновит их начать путь к восстановлению.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="https://t.me/vadim_minenkov" 
                target="_blank" 
                className="inline-flex items-center justify-center px-6 py-3 bg-[#3A7CA5] text-white font-medium rounded-lg hover:bg-[#3A7CA5]/90 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.1 14.9l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z" />
                </svg>
                Написать в Telegram
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="mailto:vadim@minenkovrehab.ru"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#E0F2F8] text-[#333333] font-medium rounded-lg hover:bg-[#E0F2F8]/80 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Отправить по email
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA секция */}
      <motion.section 
        className="py-16 bg-gradient-to-r from-[#3A7CA5] to-[#3A7CA5]/80 text-white overflow-x-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >Начните свой путь к восстановлению сегодня</motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Присоединяйтесь к сотням довольных клиентов и сделайте первый шаг к здоровой, активной жизни.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-[#B5D334] text-white font-bold rounded-lg hover:bg-[#B5D334]/90 transition-colors"
            >
              Записаться на консультацию
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
} 