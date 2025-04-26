'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          className="absolute inset-0 opacity-15"
          style={{ y: heroImageY }}
        >
          <Image 
            src="https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1920&h=800&auto=format&fit=crop" 
            alt="Контакты" 
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
            <span className="text-accent-light">Свяжитесь</span> со мной
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
                          <a href="mailto:minenkov.rehab@gmail.com" className="text-dark hover:text-primary transition-colors">
                            minenkov.rehab@gmail.com
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
                          <a href="tel:+79615854288" className="text-dark hover:text-primary transition-colors">
                            +7 (961) 585-42-88
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
                            <motion.a 
                              href="https://t.me/MV_Rehab" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-dark hover:text-primary transition-all duration-300"
                              whileHover={{ scale: 1.2, rotate: 5 }}
                            >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.652 6.654-1.02 8.83-.125.718-.373 1.034-.613 1.068-.523.068-1.039-.242-1.602-.554-1.048-.581-1.738-.909-2.768-1.48-1.234-.68-.388-1.049.285-1.654.177-.158 3.182-2.904 3.235-3.15.006-.024.004-.053-.006-.08a.183.183 0 0 0-.105-.04c-.074-.009-.168.022-.294.09-.365.18-2.234 1.407-3.026 1.903-.566.355-1.107.439-1.61.251-.524-.197-1.098-.414-1.547-.57-.626-.217-1.227-.435-1.227-.98 0-.265.24-.521.72-.764.85-.432 1.559-.788 2.145-1.055.04-.018 3.957-1.626 4.494-1.838.536-.212 1.19-.465 1.813-.466z" />
                            </svg>
                            </motion.a>
                            <motion.a 
                              href="https://youtube.com/@mv_rehab" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-dark hover:text-primary transition-all duration-300"
                              whileHover={{ scale: 1.2, rotate: 5 }}
                            >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            </motion.a>
                            <motion.a 
                              href="#" 
                              className="text-dark hover:text-primary transition-all duration-300"
                              whileHover={{ scale: 1.2, rotate: 5 }}
                            >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 0 0 2.126-1.384c.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 0 0-1.384-2.126A5.847 5.847 0 0 0 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382 3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
                            </svg>
                            </motion.a>
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