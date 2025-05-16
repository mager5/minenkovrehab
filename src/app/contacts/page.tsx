'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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

interface ContactData {
  phone: string;
  email: string;
  social: {
    vk: string;
    telegram: string;
  };
}

export default function ContactsPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({
    phone: '+79283287052',
    email: 'minenkov.rehab@yandex.ru',
    social: {
      vk: 'https://vk.com/minenkovrehab',
      telegram: 'https://t.me/minenkov_rehab'
    }
  });
  
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

  // Попытка загрузить статический контент при рендере на клиенте
  useEffect(() => {
    async function loadContactData() {
      try {
        const response = await fetch('/content-contacts.json');
        if (response.ok) {
          const data = await response.json();
          setContactData(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки контактных данных:', error);
      }
    }
    
    loadContactData();
  }, []);

  // Форматирование телефона с префиксом +7
  const formatPhone = (phone: string) => {
    return phone.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 $1 $2-$3-$4');
  };

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
              alt="Контакты"
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
      <div className="flex-grow py-12 lg:py-20 bg-gray-50">
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
                className="bg-white rounded-xl shadow p-8"
              >
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Контактная информация</h2>
                <div className="space-y-8">
                  {/* Email */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-5">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">Email</h3>
                      <a 
                        href={`mailto:${contactData.email}`} 
                        className="text-lg font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        {contactData.email}
                      </a>
                    </div>
                  </div>

                  {/* Телефон */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-5">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">Телефон</h3>
                      <a 
                        href={`tel:${contactData.phone}`}
                        className="text-lg font-medium text-primary hover:text-primary-dark transition-colors"
                        aria-label={`Позвонить по телефону ${contactData.phone}`}
                      >
                        {formatPhone(contactData.phone)}
                      </a>
                    </div>
                  </div>

                  {/* Социальные сети */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-5">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.5 11h.01M12 11h.01M15.5 11h.01M10 16h4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Связаться со мной</h3>
                      <div className="flex items-center space-x-6">
                        {/* ВКонтакте */}
                        <a 
                          href={contactData.social.vk} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark transition-colors" 
                          aria-label="ВКонтакте"
                        >
                          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 3.208-4.431 3.538-5.932l.002-.001c.164-.547 0-.949-.793-.949h-2.624c-.668 0-.976.345-1.141.731 0 0-1.336 3.198-3.226 5.271-.61.599-.892.791-1.225.791-.164 0-.419-.192-.419-.739V5.949c0-.656-.187-.949-.74-.949H9.161c-.419 0-.668.306-.668.591 0 .622.945.765 1.043 2.515v3.797c0 .832-.151.985-.486.985-.892 0-3.057-3.211-4.34-6.886-.259-.713-.512-1.001-1.185-1.001H.9c-.749 0-.9.345-.9.731 0 .682.892 4.073 4.148 8.553C6.318 17.343 9.374 19 12.154 19c1.671 0 1.875-.368 1.875-1.001 0-2.922-.151-3.198.686-3.198.388 0 1.056.192 2.616 1.667C19.114 18.217 19.407 19 20.405 19h2.624c.748 0 1.127-.368.909-1.094-.499-1.527-3.871-4.668-4.023-4.878z"/>
                          </svg>
                        </a>
                        
                        {/* Telegram */}
                        <a 
                          href={contactData.social.telegram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark transition-colors" 
                          aria-label="Telegram"
                        >
                          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.48-1.9-.932-1.056-.721-1.653-1.172-2.678-1.877-1.185-.81-.417-1.265.26-2 .177-.19 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.211-.07-.06-.196-.04-.282-.024-.118.027-2.003 1.272-5.65 3.733-.532.359-1.016.54-1.453.542-.478.008-1.398-.177-2.075-.38-.840-.243-1.504-.374-1.449-.788.028-.215.336-.437.933-.663 3.66-1.6 6.104-2.646 7.335-3.141 3.494-1.406 4.218-1.652 4.681-1.66v-.002z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для записи */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
} 