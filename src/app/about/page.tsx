"use client";

// import Image from 'next/image'; // Удаляем или комментируем
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Counter } from '@/components/ui/Counter';
import { aboutContent } from '@/data/about-content';
import { getAboutContent } from '@/lib/content';

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

// Определение типа контента о нас
interface AboutContentType {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  mission: {
    title: string;
    description: string;
    values: {
      title: string;
      description: string;
    }[];
  };
  experience: {
    title: string;
    description: string;
    stats: {
      value: number;
      label: string;
    }[];
  };
  approach: {
    title: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  team: {
    title: string;
    description: string;
  };
}

export default function About() {
  // Состояние для данных страницы
  const [content, setContent] = useState<AboutContentType>(aboutContent);
  
  // Загрузка контента при монтировании компонента
  useEffect(() => {
    async function loadAboutData() {
      try {
        const data = await getAboutContent<AboutContentType>();
        setContent(data);
      } catch (error) {
        console.error('Ошибка загрузки данных о нас:', error);
      }
    }
    
    loadAboutData();
  }, []);

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
    <div className="min-h-screen overflow-x-hidden">
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
              alt="Обо мне"
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
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {content.hero.title}
          </motion.h1>
          <motion.h2 
            className="text-2xl md:text-3xl font-semibold mb-6 text-accent-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {content.hero.subtitle}
          </motion.h2>
          <motion.p 
            className="text-lg opacity-90 text-white max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {content.hero.description}
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Миссия */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-6">{content.mission.title}</h2>
            <p className="text-lg text-gray-600">{content.mission.description}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.mission.values.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-6 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-primary mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Опыт и статистика */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-6">{content.experience.title}</h2>
            <p className="text-lg text-gray-600">{content.experience.description}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.experience.stats.map((stat, index) => (
              <Counter 
                key={index}
                value={stat.value}
                label={stat.label}
                plus={true}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Наш подход */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-6">{content.approach.title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.approach.steps.map((step, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-6 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-primary ml-4">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-6">{content.team.title}</h2>
            <p className="text-lg text-gray-600">{content.team.description}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 