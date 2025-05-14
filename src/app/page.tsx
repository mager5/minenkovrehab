"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
// import { HomeContent } from '@/types/content'; // Временно комментируем, пока нет типа

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
  const [content, setContent] = useState<any | null>(null); // Временно используем any
  // Рефы для секций с параллакс-эффектом
  // const heroRef = useRef(null);
  const aboutRef = useRef(null);
  
  // Эффект параллакса для героя - УДАЛЯЕМ, если не используются
  // const { scrollYProgress: heroScroll } = useScroll({
  //   target: heroRef,
  //   offset: ["start start", "end start"]
  // });
  
  // const heroImageY = useTransform(heroScroll, [0, 1], [0, 150]); // Удалено
  // const heroContentY = useTransform(heroScroll, [0, 1], [0, -50]); // Удалено
  // const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0.3]); // Удалено
  
  // Эффект параллакса для блока "О нас"
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  });
  
  const aboutImageScale = useTransform(aboutScroll, [0, 0.5], [0.9, 1]);
  const aboutContentY = useTransform(aboutScroll, [0, 0.5], [50, 0]);
  
  useEffect(() => {
    fetch('/api/content-home')
      .then(res => {
        if (!res.ok) {
          console.error('Failed to fetch home content, status:', res.status);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Home content data received:', data); // Логируем данные
        setContent(data);
      })
      .catch(error => {
        console.error('Error fetching or parsing home content:', error); // Логируем ошибки
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero секция с фоном и текстом */}
      <motion.section 
        // ref={heroRef}
        className="hero-section pt-32 sm:pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="md:w-1/2 text-white"
              // style={{ opacity: heroOpacity }}
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

      {/* Блок с преимуществами */}
      <section className="py-12 bg-white overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:space-x-6 lg:space-x-8">
            {/* Преимущество 1 */}
            <motion.div 
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-all flex border border-gray-100 lg:w-1/3"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                backgroundColor: "rgba(230, 242, 249, 0.5)"
              }}
            >
              <div className="mr-4">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </motion.div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Экспертная Реабилитация</h3>
                <p className="text-dark">
                  {content?.advantages[0].description}
                </p>
              </div>
            </motion.div>
            
            {/* Преимущество 2 */}
            <motion.div 
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-all flex border border-gray-100 lg:w-1/3"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                backgroundColor: "rgba(230, 242, 249, 0.5)"
              }}
            >
              <div className="mr-4">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Индивидуальный Подход</h3>
                <p className="text-dark">
                  {content?.advantages[1].description}
                </p>
              </div>
            </motion.div>
            
            {/* Преимущество 3 */}
            <motion.div 
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-all flex border border-gray-100 lg:w-1/3"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                backgroundColor: "rgba(230, 242, 249, 0.5)"
              }}
            >
              <div className="mr-4">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Удобный Формат</h3>
                <p className="text-dark">
                  {content?.advantages[2].description}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* О нас и счетчики */}
      <motion.section 
        ref={aboutRef}
        className="py-20 bg-gray-50 overflow-x-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="text-accent font-semibold text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              О НАС
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {content?.about.title}
            </motion.h2>
            <motion.div 
              className="h-1 w-20 bg-accent mx-auto"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "5rem", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            ></motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              style={{ scale: aboutImageScale }}
            >
              <motion.div 
                className="relative rounded-lg overflow-hidden shadow-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative group w-full max-w-md lg:max-w-none">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <img 
                    src="/images/hero/her-banner-mob-retina.png" 
                    alt="Физическая реабилитация"
                    className="rounded-lg shadow-xl relative z-10 w-full h-auto object-cover"
                    width={600}
                    height={700}
                  />
                </div>
                <motion.div 
                  className="absolute top-0 right-0 bg-accent text-white font-bold py-2 px-4 rounded-bl-lg"
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {content?.about.experience}
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div
              style={{ y: aboutContentY }}
            >
              <motion.p 
                className="text-dark text-lg mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {content?.about.description}
              </motion.p>
              
              <motion.div 
                className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px rgba(0,0,0,0.07)"
                }}
              >
                <h3 className="flex items-center text-xl font-semibold text-primary mb-3">
                  <motion.div 
                    className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent mr-3"
                    whileHover={{ scale: 1.1, backgroundColor: "rgb(209, 243, 234)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  {content?.about.priceTitle}
                </h3>
                <p className="text-dark">
                  {content?.about.priceDescription}
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px rgba(0,0,0,0.07)"
                }}
              >
                <h3 className="flex items-center text-xl font-semibold text-primary mb-3">
                  <motion.div 
                    className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent mr-3"
                    whileHover={{ scale: 1.1, backgroundColor: "rgb(209, 243, 234)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </motion.div>
                  {content?.about.methodsTitle}
                </h3>
                <p className="text-dark">
                  {content?.about.methodsDescription}
                </p>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Статистика */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Counter value={content?.stats.satisfiedClients} label={content?.stats.satisfiedClientsLabel} plus={true} delay={0} />
            <Counter value={content?.stats.consultations} label={content?.stats.consultationsLabel} plus={true} delay={0.1} />
            <Counter value={content?.stats.onlinePrograms} label={content?.stats.onlineProgramsLabel} plus={true} delay={0.2} />
            <Counter value={content?.stats.experience} label={content?.stats.experienceLabel} plus={true} delay={0.3} />
          </div>
        </div>
      </motion.section>

      {/* Наши услуги */}
      <section className="py-20 bg-white overflow-x-hidden">
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
            >УСЛУГИ</motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {content?.services.title}
            </motion.h2>
            <motion.div 
              className="h-1 w-20 bg-accent mx-auto"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "5rem", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Услуга 1 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1,
                type: "spring", 
                stiffness: 50 
              }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="relative h-52">
                <Image 
                  src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=600&h=400&auto=format&fit=crop" 
                  alt="Онлайн-консультации" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <motion.span 
                    className="font-semibold text-accent-light"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >{content?.services.consultations.title}</motion.span>
                </div>
              </div>
              <div className="p-6">
                <motion.h3 
                  className="text-xl font-semibold text-primary mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >{content?.services.consultations.title}</motion.h3>
                <motion.p 
                  className="text-dark mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  {content?.services.consultations.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{ x: 5 }}
                >
                  <Link 
                    href="/products" 
                    className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
                  >
                    Подробнее
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Услуга 2 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2,
                type: "spring", 
                stiffness: 50 
              }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="relative h-52">
                <Image 
                  src="/images/services/individual-programs.svg" 
                  alt="Индивидуальные программы" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <motion.span 
                    className="font-semibold text-accent-light"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >{content?.services.programs.title}</motion.span>
                </div>
              </div>
              <div className="p-6">
                <motion.h3 
                  className="text-xl font-semibold text-primary mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >{content?.services.programs.title}</motion.h3>
                <motion.p 
                  className="text-dark mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  {content?.services.programs.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  whileHover={{ x: 5 }}
                >
                  <Link 
                    href="/products" 
                    className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
                  >
                    Подробнее
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Услуга 3 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3,
                type: "spring", 
                stiffness: 50 
              }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="relative h-52">
                <Image 
                  src="/images/services/movement-analysis.svg"
                  alt="Анализ движения" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <motion.span 
                    className="font-semibold text-accent-light"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >{content?.services.analysis.title}</motion.span>
                </div>
              </div>
              <div className="p-6">
                <motion.h3 
                  className="text-xl font-semibold text-primary mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >{content?.services.analysis.title}</motion.h3>
                <motion.p 
                  className="text-dark mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  {content?.services.analysis.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  whileHover={{ x: 5 }}
                >
                  <Link 
                    href="/products" 
                    className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
                  >
                    Подробнее
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Когда вам нужна помощь */}
      <section className="py-20 bg-primary/95 text-white overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-8 leading-tight" 
                style={{color: '#d1f3ea'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {content?.help.title}
                <motion.span 
                  className="text-accent-light"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >{content?.help.subtitle}</motion.span>
              </motion.h2>
              
              <div className="space-y-6">
                {content?.help.items.map((item: { title: string; description: string }, index: number) => (
                  <motion.div 
                    key={index}
                    className="flex items-start bg-primary-dark/50 p-4 rounded-lg" 
                    style={{backgroundColor: 'rgba(209, 243, 234, 0.2)'}}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    whileHover={{ 
                      y: -5, 
                      boxShadow: "0 10px 25px rgba(209, 243, 234, 0.2)",
                      backgroundColor: "#DCF5ED"
                    }}
                  >
                    <motion.div 
                      className="bg-accent/20 p-2 rounded-lg mr-4" 
                      style={{backgroundColor: 'rgba(209, 243, 234, 0.3)'}}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="#d1f3ea">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-medium mb-2" style={{color: '#d1f3ea'}}>{item.title}</h3>
                      <p className="text-gray-200" style={{color: '#d1f3ea'}}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div 
                className="absolute -inset-1 rounded-lg bg-accent/20 blur"
                animate={{ 
                  boxShadow: ["0 0 20px 5px rgba(209, 243, 234, 0.2)", "0 0 30px 5px rgba(209, 243, 234, 0.4)", "0 0 20px 5px rgba(209, 243, 234, 0.2)"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative group w-full max-w-md lg:max-w-none">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <img 
                    src="/images/hero/her-banner-mob-retina.png" 
                    alt="Физическая реабилитация"
                    className="rounded-lg shadow-xl relative z-10 w-full h-auto object-cover"
                    width={600}
                    height={700}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="py-20 bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-primary mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            {content?.cta.title}
          </motion.h2>
          <motion.p 
            className="text-lg text-dark mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {content?.cta.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/contacts"
              className="btn bg-accent hover:bg-accent-dark text-white !text-white px-8 py-3 rounded-md font-medium transition-all"
            >
              {content?.cta.buttonText}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Компонент для анимированного счетчика
function Counter({ 
  value, 
  label, 
  plus = false, 
  delay = 0 
}: { 
  value: number; 
  label: string; 
  plus?: boolean; 
  delay?: number;
}) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
      }}
    >
      <motion.div 
        className="text-4xl font-bold text-primary mb-2"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ 
          duration: 0.8, 
          delay: delay + 0.2,
          type: "spring",
          stiffness: 150
        }}
      >
        {value}{plus && '+'}
      </motion.div>
      <motion.p 
        className="text-accent font-semibold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: delay + 0.4 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
