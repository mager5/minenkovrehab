'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  AboutSection,
  ServicesSection,
  HelpSection,
  CTASection,
} from '@/components';
import { getHomeContent } from '@/lib/content';
import { HomeContent } from '@/types/content';

// Анимации
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const [content, setContent] = React.useState<HomeContent | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getHomeContent<HomeContent>();
        setContent(data);
      } catch (error) {
        console.error('Ошибка загрузки контента:', error);
      }
    }
    loadContent();

    // Скрытие глобального хедера и инфо-панели
    const header = document.querySelector('header') as HTMLElement | null;
    const infoPanel = document.querySelector(
      '[role="complementary"]'
    ) as HTMLElement | null;

    if (header) header.style.display = 'none';
    if (infoPanel) infoPanel.style.display = 'none';

    return () => {
      // Восстановление
      if (header) header.style.display = '';
      if (infoPanel) infoPanel.style.display = '';
    };
  }, []);

  return (
    <div className='ios-home-page font-sans text-gray-800'>
      {/* Абстрактные фоновые элементы */}
      <div className='ios-bg-blob ios-blob-1' />
      <div className='ios-bg-blob ios-blob-2' />
      <div className='ios-bg-blob ios-blob-3' />

      {/* iOS 26 Navigation */}
      <nav className='ios-nav'>
        <Link
          href='/'
          className='font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'
        >
          Minenkov<span className='font-light text-gray-600'>Rehab</span>
        </Link>

        <div className='hidden md:flex items-center gap-2'>
          {['Обо мне', 'Услуги', 'Помощь'].map((item, i) => (
            <Link
              key={i}
              href={`#${['about', 'services', 'help'][i]}`}
              className='ios-nav-link'
            >
              {item}
            </Link>
          ))}
        </div>

        <Link
          href='/contacts'
          className='bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors'
        >
          Записаться
        </Link>
      </nav>

      {/* iOS 26 Hero Section */}
      <section className='relative pt-40 pb-20 px-4 min-h-screen flex items-center justify-center'>
        <div className='container mx-auto max-w-6xl'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Text Content */}
            <motion.div
              initial='hidden'
              animate='visible'
              variants={staggerContainer}
              className='text-center lg:text-left z-10'
            >
              <motion.div
                variants={fadeIn}
                className='inline-block px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-sm font-semibold text-blue-800 mb-6 shadow-sm'
              >
                ✨ Физическая реабилитация нового поколения
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className='text-5xl md:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900'
              >
                Здоровье <br />
                <span className='italic font-light text-blue-600'>
                  в движении
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className='text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0'
              >
                Индивидуальные программы восстановления после травм и операций.
                Современный подход, основанный на доказательной медицине.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'
              >
                <Link href='/about' className='ios-button ios-button-primary'>
                  Узнать больше
                </Link>
                <Link
                  href='/contacts'
                  className='ios-button ios-button-secondary'
                >
                  Связаться со мной
                </Link>
              </motion.div>
            </motion.div>

            {/* Visual Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className='relative z-10 hidden lg:block'
            >
              <div className='ios-glass-card p-4 relative transform rotate-2 hover:rotate-0 transition-transform duration-500'>
                <div className='relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl'>
                  <Image
                    src='/images/hero/hero-banner.jpg'
                    alt='Rehabilitation'
                    fill
                    className='object-cover'
                    priority
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent'></div>

                  <div className='absolute bottom-6 left-6 right-6 text-white p-4 ios-glass rounded-xl bg-white/10 border-white/20 backdrop-blur-md'>
                    <p className='font-semibold text-lg'>Вадим Миненков</p>
                    <p className='text-sm opacity-90'>Врач ЛФК, реабилитолог</p>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: 'easeInOut',
                  }}
                  className='absolute -top-6 -right-6 ios-glass p-4 rounded-2xl shadow-xl bg-white/80'
                >
                  <span className='text-3xl'>🩺</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                  className='absolute top-1/2 -left-8 ios-glass p-4 rounded-2xl shadow-xl bg-white/80'
                >
                  <span className='text-3xl'>💪</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wrapped Content Sections */}
      <div className='ios-content-wrapper space-y-8 pb-20 px-4'>
        {/* About Section Wrapper */}
        <div id='about' className='container mx-auto max-w-6xl'>
          <AboutSection />
        </div>

        {/* Services Section Wrapper */}
        <div id='services' className='container mx-auto max-w-6xl'>
          <ServicesSection />
        </div>

        {/* Help Section Wrapper */}
        <div id='help' className='container mx-auto max-w-6xl'>
          <HelpSection />
        </div>

        {/* CTA Section Wrapper */}
        <div className='container mx-auto max-w-6xl'>
          <CTASection />
        </div>
      </div>
    </div>
  );
}
