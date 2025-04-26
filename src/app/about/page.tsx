'use client';

import Image from 'next/image';
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

export default function AboutPage() {
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
    <div className="flex flex-col">
      {/* Hero секция */}
      <motion.section 
        ref={heroRef}
        className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-br from-primary to-primary-dark"
      >
        <motion.div 
          className="absolute inset-0 opacity-15"
          style={{ y: heroImageY }}
        >
          <Image 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1920&h=800&auto=format&fit=crop" 
            alt="О реабилитологе" 
            fill
            className="object-cover"
            priority
          />
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
            О <span className="text-accent-light">Специалисте</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-white opacity-95 mb-8 max-w-2xl mx-auto font-medium"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Профессиональный подход к физической реабилитации с научно обоснованными методиками и индивидуальным подходом.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Основной контент */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-primary mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >Опыт и компетенции</motion.h2>
              
              <motion.p 
                className="text-dark text-lg mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="font-semibold text-primary">Опыт работы более 8 лет</span> с различными травмами и заболеваниями опорно-двигательного аппарата.
              </motion.p>
              
              <motion.p 
                className="text-dark text-lg mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Программы реабилитации разрабатываются с учетом ваших особенностей, целей и образа жизни.
              </motion.p>
              
              <motion.div 
                className="border-l-4 border-accent pl-6 my-8"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-dark text-lg italic">
                  Существует множество вариаций травм и заболеваний, которые требуют профессионального подхода к реабилитации. Моя задача — помочь вам вернуться к полноценной жизни без боли и ограничений с помощью научно обоснованных методик и индивидуального подхода.
                </p>
              </motion.div>
              
              <motion.p 
                className="text-dark text-lg mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Качественная и профессиональная реабилитация по разумным ценам, с возможностью выбора формата работы под ваш бюджет.
              </motion.p>
              
              <motion.p 
                className="text-dark text-lg mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Детальный анализ вашей проблемы, рекомендации и план действий в удобном онлайн-формате.
              </motion.p>
              
              <motion.div 
                className="bg-gray-50 p-6 rounded-lg my-8"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <p className="text-lg text-dark font-medium">
                  Выберите подходящий формат работы и начните путь к восстановлению и здоровью уже сегодня. Я помогу вам достичь ваших целей.
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-primary mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >Доступные услуги</motion.h2>
              
              <ul className="space-y-4">
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <motion.li 
                    key={item}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  >
                    <div className="bg-accent-light rounded-full p-1 mt-1 mr-3">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      {item === 1 && (
                        <>
                          <h3 className="text-xl font-semibold text-primary mb-2">Онлайн-консультации</h3>
                          <p className="text-dark">Детальный анализ вашей проблемы, функциональное тестирование и разработка стратегии восстановления.</p>
                        </>
                      )}
                      {item === 2 && (
                        <>
                          <h3 className="text-xl font-semibold text-primary mb-2">Программы реабилитации</h3>
                          <p className="text-dark">Индивидуальные программы с учетом ваших особенностей, направленные на достижение конкретных результатов.</p>
                        </>
                      )}
                      {item === 3 && (
                        <>
                          <h3 className="text-xl font-semibold text-primary mb-2">Личные тренировки</h3>
                          <p className="text-dark">Персональные тренировки под руководством специалиста с контролем техники выполнения.</p>
                        </>
                      )}
                      {item === 4 && (
                        <>
                          <h3 className="text-xl font-semibold text-primary mb-2">Анализ движения</h3>
                          <p className="text-dark">Детальный анализ биомеханики движений для выявления причин боли и дискомфорта.</p>
                        </>
                      )}
                      {item === 5 && (
                        <>
                          <h3 className="text-xl font-semibold text-primary mb-2">Курсы и вебинары</h3>
                          <p className="text-dark">Образовательные материалы для самостоятельной работы над своим здоровьем.</p>
                        </>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div 
                className="mt-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link 
                  href="/products" 
                  className="inline-block bg-primary hover:bg-primary-dark text-white py-3 px-8 rounded-md transition-colors"
                >
                  Посмотреть все услуги
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
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
          >
            <Link 
              href="/contacts"
              className="btn bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-md font-medium transition-all"
            >
              Записаться на консультацию
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
} 