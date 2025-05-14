'use client';

// import Image from 'next/image'; // Удаляем или комментируем
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

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

export default function ProductsPage() {
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
    <div className="flex flex-col min-h-screen">
      {/* Hero секция */}
      <motion.section 
        ref={heroRef}
        className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-br from-primary to-primary-dark"
      >
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ y: heroImageY }}
        >
          <div className="relative w-full h-full">
            <img 
              src="/images/hero/section-banner.jpg" 
              alt="Услуги физической реабилитации"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#3A7CA5]/80 via-[#3A7CA5]/50 to-transparent"></div>
        </motion.div>
        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={0}
          >
            Услуги <span className="text-white">Физической</span> Реабилитации
          </motion.h1>
          <motion.p 
            className="text-lg text-white opacity-95 mb-8 max-w-2xl mx-auto font-medium"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Полный спектр услуг для восстановления вашего здоровья и возвращения к полноценной жизни без боли и ограничений.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Основные услуги */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.span 
              className="text-accent font-semibold text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >НАШИ УСЛУГИ</motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Выберите Подходящий <span className="text-accent">Формат</span> Работы
            </motion.h2>
            <motion.div 
              className="h-1 w-20 bg-accent mx-auto"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "5rem", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
          </motion.div>

          <div className="flex flex-col space-y-8 md:space-y-8 lg:space-y-8">
            {/* Услуга 1 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=600&h=800&auto=format&fit=crop" 
                    alt="Онлайн-консультация" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <motion.div 
                  className="md:w-2/3 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div 
                    className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    4 000 ₽
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-primary mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >Онлайн-консультация</motion.h3>
                  <motion.p 
                    className="text-dark mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Индивидуальная онлайн-консультация по видеосвязи включает ознакомление с вашими исследованиями, 
                    сбор анамнеза и проведение функциональных тестов для оценки вашего состояния.
                  </motion.p>
                  <div className="mb-5 space-y-2">
                    {[
                      "Длительность: 45-60 минут",
                      "Определение стратегии и тактики тренировок",
                      "Модуляция имеющейся активности"
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      href="/products/consultation" 
                      className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Записаться
                  </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Услуга 2 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <img 
                    src="/images/services/individual-programs.svg" 
                    alt="Индивидуальные программы" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <motion.div 
                  className="md:w-2/3 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div 
                    className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    20 000 ₽
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-primary mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >Онлайн-ведение (1 месяц)</motion.h3>
                  <motion.p 
                    className="text-dark mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Месячное сопровождение с индивидуальным комплексом упражнений в видео формате с подробными инструкциями 
                    и постоянной поддержкой на каждом этапе реабилитации.
                  </motion.p>
                  <div className="mb-5 space-y-2">
                    {[
                      "Индивидуальный комплекс упражнений",
                      "Еженедельный созвон для корректировок",
                      "Постоянная обратная связь"
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      href="/products/personal-program" 
                      className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Заказать
                  </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Услуга 3 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <img 
                    src="/images/services/movement-analysis.svg" 
                    alt="Клуб ФОРМУЛА ДВИЖЕНИЯ" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <motion.div 
                  className="md:w-2/3 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div 
                    className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    2 950 ₽
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-primary mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >Клуб &quot;ФОРМУЛА ДВИЖЕНИЯ&quot;</motion.h3>
                  <motion.p 
                    className="text-dark mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Закрытая группа в Телеграм для людей, кто хочет начинать правильно двигаться с учетом 
                    увеличения здоровья, делать это плавно и максимально бюджетно.
                  </motion.p>
                  <div className="mb-5 space-y-2">
                    {[
                      "3 разминки в неделю по 30 минут",
                      "Доступ на 1 месяц",
                      "Для профилактики и поддержания здоровья"
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      href="/products/movement-analysis" 
                      className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Присоединиться
                  </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Услуга 4 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&h=800&auto=format&fit=crop" 
                    alt="Протокол реабилитации коленного сустава" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <motion.div 
                  className="md:w-2/3 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div 
                    className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    7 000 ₽
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-primary mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >Протокол реабилитации коленного сустава</motion.h3>
                  <motion.p 
                    className="text-dark mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Подробная инструкция для самостоятельной реабилитации после резекции мениска, от первого дня 
                    после операции до возвращения к беговой активности.
                  </motion.p>
                  <div className="mb-5 space-y-2">
                    {[
                      "15 страниц подробных инструкций",
                      "Видео тестовых упражнений",
                      "Бессрочный доступ"
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      href="/products/online-support" 
                      className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Приобрести
                  </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Как проходит работа */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.span 
              className="text-accent font-semibold text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >ПРОЦЕСС</motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Как Проходит <span className="text-accent">Работа</span> со Мной
            </motion.h2>
            <motion.div 
              className="h-1 w-20 bg-accent mx-auto"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "5rem", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {/* Шаг 1 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  delay: 0.3
                }}
              >
                1
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-4 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >Первичная консультация</motion.h3>
              <motion.p 
                className="text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                Подробное обсуждение вашей проблемы, анализ истории заболеваний, травм и образа жизни.
                Определение целей и ожиданий от работы.
              </motion.p>
            </motion.div>

            {/* Шаг 2 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  delay: 0.4
                }}
              >
                2
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-4 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >Диагностика и анализ</motion.h3>
              <motion.p 
                className="text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                Оценка вашего состояния, выявление проблемных зон и причин дискомфорта.
                Анализ движения и биомеханики для точного диагноза.
              </motion.p>
            </motion.div>

            {/* Шаг 3 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  delay: 0.5
                }}
              >
                3
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-4 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >Составление плана</motion.h3>
              <motion.p 
                className="text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                Разработка индивидуального плана реабилитации с учетом ваших особенностей,
                целей и возможностей для регулярных занятий.
              </motion.p>
            </motion.div>

            {/* Шаг 4 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.4,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  delay: 0.6
                }}
              >
                4
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-4 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >Реализация программы</motion.h3>
              <motion.p 
                className="text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                Выполнение упражнений программы с подробными видео-инструкциями.
                Регулярная самостоятельная работа и отслеживание прогресса.
              </motion.p>
            </motion.div>

            {/* Шаг 5 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.5,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  delay: 0.7
                }}
              >
                5
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-4 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >Корректировка и поддержка</motion.h3>
              <motion.p 
                className="text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                Регулярная обратная связь, корректировка программы при необходимости.
                Поддержка во время всего процесса реабилитации.
              </motion.p>
            </motion.div>

            {/* Шаг 6 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.6,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  delay: 0.8
                }}
              >
                6
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-4 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >Закрепление результата</motion.h3>
              <motion.p 
                className="text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 1 }}
              >
                Оценка достигнутых результатов, рекомендации для поддержания
                эффекта и профилактики повторных проблем.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ секция */}
      <motion.section 
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.span 
              className="text-accent font-semibold text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >ВОПРОСЫ</motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Часто Задаваемые <span className="text-accent">Вопросы</span>
            </motion.h2>
            <motion.div 
              className="h-1 w-20 bg-accent mx-auto"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "5rem", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Как проходит онлайн-консультация?",
                answer: "Онлайн-консультация проводится через Zoom или Skype. Заранее вы получаете анкету для заполнения, чтобы я мог подготовиться к встрече. Во время консультации мы обсуждаем вашу ситуацию, я провожу функциональное тестирование через видео и даю рекомендации. После консультации вы получаете запись сессии и первые рекомендации по упражнениям."
              },
              {
                question: "Можно ли решить мою проблему онлайн?",
                answer: "Большинство проблем с опорно-двигательным аппаратом можно успешно решать в онлайн-формате. Современные технологии позволяют проводить детальный анализ движения и разрабатывать эффективные программы реабилитации дистанционно. При необходимости, я подскажу, когда стоит обратиться за очной помощью к специалистам в вашем городе."
              },
              {
                question: "Сколько времени займет реабилитация?",
                answer: "Сроки реабилитации индивидуальны и зависят от характера проблемы, ее давности, вашей регулярности в выполнении рекомендаций и индивидуальных особенностей организма. Обычно первые улучшения становятся заметны через 2-4 недели регулярных занятий. Полное восстановление может занять от нескольких недель до нескольких месяцев."
              },
              {
                question: "С какими проблемами вы работаете?",
                answer: "Я работаю с широким спектром проблем: боли в спине, шее, суставах; восстановление после травм и операций; нарушения осанки; спортивные травмы; синдромы мышечных перегрузок; подготовка к соревнованиям и восстановление после них. Если у вас есть сомнения, подходит ли ваша ситуация для работы со мной, просто напишите мне, и я отвечу на ваши вопросы."
              },
              {
                question: "Нужно ли мне специальное оборудование?",
                answer: "Для большинства программ реабилитации специальное оборудование не требуется. Все упражнения разрабатываются с учетом доступных вам ресурсов. В базовой комплектации достаточно иметь коврик для упражнений и, возможно, эластичные ленты. Если какое-то оборудование необходимо, мы обсудим это в процессе консультации."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.1 + index * 0.1,
                  type: "spring", 
                  stiffness: 70 
                }}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  transition: { duration: 0.2 }
                }}
              >
                <motion.h3 
                  className="text-xl font-bold text-primary mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >{faq.question}</motion.h3>
                <motion.p 
                  className="text-dark"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >{faq.answer}</motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA секция */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-primary to-primary-dark text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Готовы начать свой путь к восстановлению?
          </motion.h2>
          <motion.p 
            className="text-lg opacity-90 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Выберите подходящий формат работы и запишитесь на консультацию прямо сейчас.
            Я помогу вам вернуться к жизни без боли и ограничений.
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
            href="/contacts"
              className="btn bg-white hover:bg-gray-100 text-accent border border-accent px-8 py-3 rounded-md font-medium transition-all"
          >
            Записаться на консультацию
          </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
} 