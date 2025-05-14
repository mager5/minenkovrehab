'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // Удаляем этот импорт
import BookingModal from '@/components/BookingModal';
import ContactForm from '@/components/ContactForm';
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

// Примечание: метаданные для этой страницы находятся в отдельном файле,
// так как страница использует директиву 'use client'

export default function ContactsPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
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
              alt="Контакты"
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
            <span className="text-white">Свяжитесь</span> со мной
          </motion.h1>
          <motion.p 
            className="text-lg text-white opacity-95 mb-8 max-w-2xl mx-auto font-medium"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Ответы на ваши вопросы и запись на онлайн-консультации
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Основной контент */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Форма обратной связи */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <ContactForm />
              </motion.div>
              
              {/* Контактная информация */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <motion.div 
                  className="bg-white rounded-xl shadow-lg p-8 mb-8 transform transition-all duration-500 hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.h2 
                    className="text-3xl font-bold text-primary mb-6 relative inline-block after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >Контактная информация</motion.h2>
                  
                  <div className="space-y-6 mt-8">
                    {[
                      {
                        icon: (
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        ),
                        title: "Email",
                        content: (
                          <a href="mailto:minenkov.rehab@yandex.ru" className="text-dark hover:text-primary transition-colors">
                            minenkov.rehab@yandex.ru
                          </a>
                        )
                      },
                      {
                        icon: (
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        ),
                        title: "Телефон",
                        content: (
                          <a 
                            href="tel:+79283287052"
                            className="!text-primary"
                            aria-label="Позвонить по телефону +7 928 328-70-52"
                          >
                            <span className="!text-primary">+7 928 328-70-52</span>
                          </a>
                        )
                      },
                      {
                        icon: (
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        ),
                        title: "Мессенджеры",
                        content: (
                        <div className="flex space-x-4 mt-2">
                            <a 
                              href="https://t.me/MV_Rehab" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-dark hover:text-primary transition-all duration-300"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.652 6.654-1.02 8.83-.125.718-.373 1.034-.613 1.068-.523.068-1.039-.242-1.602-.554-1.048-.581-1.738-.909-2.768-1.48-1.234-.68-.388-1.049.285-1.654.177-.158 3.182-2.904 3.235-3.15.006-.024.004-.053-.006-.08a.183.183 0 0 0-.105-.04c-.074-.009-.168.022-.294.09-.365.18-2.234 1.407-3.026 1.903-.566.355-1.107.439-1.61.251-.524-.197-1.098-.414-1.547-.57-.626-.217-1.227-.435-1.227-.98 0-.265.24-.521.72-.764.85-.432 1.559-.788 2.145-1.055.04-.018 3.957-1.626 4.494-1.838.536-.212 1.19-.465 1.813-.466z"/>
                              </svg>
                            </a>
                            <a 
                              href="https://vk.com/minenkov_rehab" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-dark hover:text-primary transition-all duration-300"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.091h-1.367c-.518 0-.677-.217-1.6-1.14-.825-.776-1.177-.88-1.38-.88-.283 0-.365.073-.365.427v1.039c0 .3-.095.48-.9.48-1.333 0-2.805-.807-3.846-2.307C7.614 11.886 7.077 10.145 7.077 9.843c0-.17.073-.316.427-.316h1.367c.32 0 .44.145.563.486.613 1.785 1.636 3.348 2.056 3.348.156 0 .23-.073.23-.47v-1.81c-.05-.897-.523-1.058-.523-1.403 0-.17.145-.34.374-.34h2.15c.29 0 .4.145.4.486v2.442c0 .265.117.352.19.352.155 0 .288-.097.577-.386.893-1.004 1.53-2.55 1.53-2.55.085-.182.24-.352.575-.352h1.368c.41 0 .502.207.41.487-.17.524-1.806 3.132-1.806 3.132-.145.242-.2.35 0 .621.145.206.652.627.985 1.004.62.694 1.1 1.277 1.225 1.676.145.41-.073.622-.486.622z"/>
                              </svg>
                            </a>
                        </div>
                        )
                      },
                      {
                        icon: (
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ),
                        title: "Время работы",
                        content: (
                        <p className="text-dark">
                            Понедельник - Пятница: 10:00 - 19:00<br/>
                            Суббота: 10:00 - 15:00<br/>
                          Воскресенье: выходной
                        </p>
                        )
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-start hover:translate-x-1 transition-all duration-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      >
                        <div className="bg-primary-light p-3 rounded-full mr-4">
                          {item.icon}
                      </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-1">{item.title}</h3>
                          {item.content}
                    </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Карточка записи */}
                <motion.div 
                  className="bg-white rounded-xl shadow-lg p-8 mb-8 transform transition-all duration-500 hover:shadow-xl animate-fadeIn"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.h2 
                    className="text-3xl font-bold text-primary mb-6 relative inline-block after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >Запись на приём</motion.h2>
                  
                  <div className="mt-8">
                    <motion.p 
                      className="text-dark mb-6"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      Запишитесь на онлайн-консультацию или реабилитационную программу. Выберите удобное время и формат, и я помогу вам начать процесс восстановления.
                    </motion.p>
                    
                    <motion.button 
                      onClick={() => setIsBookingModalOpen(true)}
                      className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Записаться на консультацию
                    </motion.button>
                    </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.h2 
                    className="text-3xl font-bold text-primary mb-6 relative inline-block after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >Часто задаваемые вопросы</motion.h2>
                  
                  <div className="space-y-6 mt-8">
                    {[
                      {
                        question: "Как проходит онлайн-консультация?",
                        answer: "Консультация проводится через видеосвязь (Zoom, Skype или другой удобный для вас сервис). В ходе консультации мы обсудим вашу проблему, я проведу функциональное тестирование и составим план реабилитации."
                      },
                      {
                        question: "Сколько времени занимает реабилитация?",
                        answer: "Сроки реабилитации индивидуальны и зависят от тяжести травмы, длительности проблемы и вашей активности в процессе реабилитации. Обычно первые результаты становятся заметны через 2-4 недели регулярных занятий."
                      },
                      {
                        question: "Нужно ли мне специальное оборудование?",
                        answer: "Для большинства программ реабилитации достаточно минимального набора оборудования, которое можно найти дома или приобрести по доступной цене. Конкретный список я предоставлю после консультации, исходя из ваших индивидуальных потребностей."
                      }
                    ].map((faq, index) => (
                      <motion.div 
                        key={index}
                        className="hover:translate-x-1 transition-all duration-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      >
                        <h3 className="text-lg font-semibold text-primary mb-2">{faq.question}</h3>
                      <p className="text-dark">
                          {faq.answer}
                      </p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <motion.div
                      whileHover={{ x: 10 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Link 
                        href="/products" 
                        className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition-all duration-300"
                    >
                      Посмотреть все услуги
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Модальное окно для записи */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
} 