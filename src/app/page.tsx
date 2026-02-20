'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  AboutSection,
  ServicesSection,
  HelpSection,
  CTASection,
} from '@/components';
import { useEffect } from 'react';
import { getHomeContent } from '@/lib/content';
import { HomeContent } from '@/types/content';

// Анимации для появления элементов при прокрутке (ускоренные)
const fadeInOnScroll = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2, // Ускоренная анимация
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export default function Home() {
  useEffect(() => {
    async function loadContent() {
      try {
        await getHomeContent<HomeContent>();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Ошибка загрузки контента главной:', error);
      }
    }

    loadContent();
  }, []);

  return (
    <div className='flex flex-col min-h-screen overflow-x-hidden'>
      {/* Hero секция с фоном и текстом */}
      <motion.section className='hero-section pt-32 sm:pt-16 pb-20 lg:pt-40 lg:pb-32 overflow-hidden'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-12'>
            <div className='md:w-1/2 text-white'>
              <h1
                className='hero-title font-bold mb-6 leading-tight'
                style={{ color: '#d1f3ea' }}
              >
                Физическая реабилитация и тренировки для здоровья
              </h1>
              <p
                className='text-base sm:text-lg md:text-xl opacity-95 mb-8 font-medium leading-relaxed'
                style={{ color: '#FFFFFF', opacity: 1, transform: 'none' }}
              >
                <span className='block mb-3'>
                  • Индивидуальный подход в подборе тренировок с учетом
                  состояния вашего здоровья
                </span>
                <span className='block mb-3'>
                  • Программа тренировок &quot;Формула Движения&quot;
                </span>
                <span className='block'>
                  • Готовые восстановительные программы после травм и операций
                </span>
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link
                  href='/about'
                  className='inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary bg-white rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  aria-label='Узнать больше о специалисте и методах реабилитации'
                >
                  Узнать больше
                </Link>
                <Link
                  href='/contacts'
                  className='inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-accent rounded-lg hover:bg-accent-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  aria-label='Записаться на консультацию или связаться со специалистом'
                >
                  Записаться
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <AboutSection />
      <ServicesSection />
      <HelpSection />
      <CTASection />
    </div>
  );
}
