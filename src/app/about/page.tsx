'use client';

// import Image from 'next/image'; // Удаляем или комментируем
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { AboutContent } from '@/types/content';

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
  const [content, setContent] = useState<AboutContent | null>(null);
  
  useEffect(() => {
    fetch('/api/content-about')
      .then(res => res.json())
      .then(data => setContent(data));
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
  
  if (!content) return null;
  
  return (
    <div className="flex flex-col">
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
              alt="О реабилитологе"
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
            О <span className="text-white">Специалисте</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-white opacity-95 mb-8 max-w-2xl mx-auto font-medium"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            {content.subtitle}
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
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {content.description}
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="relative w-full h-96 rounded-xl overflow-hidden">
                    <img
                      src={content.photo}
                      alt="Вадим Миненков"
                      className="object-cover"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold text-primary mb-4">Преимущества</h3>
                  <ul className="space-y-3">
                    {content.advantages.map((advantage: string, idx: number) => (
                      <motion.li
                        key={idx}
                        className="flex items-start"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                      >
                        <span className="text-primary mr-2">✓</span>
                        {advantage}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>

            {/* Сертификаты */}
            <motion.div
              className="bg-white rounded-xl shadow-sm p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.h2
                className="text-3xl font-bold text-primary mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Сертификаты и квалификация
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.certificates.map((cert, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                  >
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={cert.image}
                        alt={cert.title}
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{cert.title}</h3>
                  </motion.div>
                ))}
              </div>
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