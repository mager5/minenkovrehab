"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AboutSection } from '@/components/AboutSection';
import { ServicesSection } from '@/components/ServicesSection';
import { HelpSection } from '@/components/HelpSection';
import { CTASection } from '@/components/CTASection';
import { FeaturesSection } from '@/components/FeaturesSection';

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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero секция с фоном и текстом */}
      <motion.section 
        className="hero-section pt-32 sm:pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="md:w-1/2 text-white"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={0}
            >
              <motion.h1 
                className="hero-title font-bold mb-6 leading-tight" 
                style={{color: '#d1f3ea'}}
              >
                Физическая реабилитация и тренировки для здоровья
              </motion.h1>
              <motion.p 
                className="text-base sm:text-lg md:text-xl opacity-95 mb-8 font-medium leading-relaxed space-y-2"
                style={{color: '#FFFFFF', opacity: 1, transform: 'none'}}
              >
                <span className="block">• Индивидуальный подход в подборе тренировок с учетом состояния вашего здоровья</span>
                <span className="block">• Регулярные тренировки в онлайн-группе</span>
                <span className="block">• Готовые протоколы реабилитации после травм и операций</span>
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 w-full"
                variants={fadeIn}
                custom={2}
              >
                <Link 
                  href="/about"
                  className="btn bg-accent hover:bg-accent-dark text-white !text-white px-6 py-3 rounded-md font-medium transition-all hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto text-center"
                >
                  Узнать больше
                </Link>
                <Link 
                  href="/contacts"
                  className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-all hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto text-center"
                >
                  Записаться
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <FeaturesSection />
      <AboutSection />
      <ServicesSection />
      <HelpSection />
      <CTASection />
    </div>
  );
}
