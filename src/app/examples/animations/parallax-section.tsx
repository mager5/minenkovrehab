"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Создаем параллакс эффекты - разная скорость движения для разных элементов
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1]);
  
  return (
    <section 
      ref={ref}
      className="relative h-[120vh] overflow-hidden bg-gradient-to-b from-primary-dark to-primary flex items-center justify-center text-white"
    >
      {/* Задний фон с самым медленным движением */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: y1 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_65%)] opacity-30" />
      </motion.div>
      
      {/* Средний слой */}
      <motion.div 
        className="absolute top-20 left-0 right-0 z-10 flex justify-center"
        style={{ y: y2 }}
      >
        <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-accent/20 backdrop-blur-md" />
      </motion.div>
      
      {/* Передний слой с контентом */}
      <motion.div 
        className="relative z-20 container mx-auto px-6 text-center"
        style={{ y: y3, opacity, scale }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Современный подход к реабилитации
        </h2>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 opacity-90">
          Мы используем передовые методики и технологии для максимально 
          эффективного восстановления наших пациентов
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-white text-primary font-semibold rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            Узнать подробнее
          </button>
          <button className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition">
            Записаться на приём
          </button>
        </div>
      </motion.div>
      
      {/* Декоративные элементы */}
      <motion.div 
        className="absolute bottom-20 right-10 z-10 w-20 h-20 md:w-32 md:h-32 rounded-full bg-accent/30 backdrop-blur-sm"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
      />
      
      <motion.div 
        className="absolute top-40 left-20 z-10 w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary-light/20 backdrop-blur-sm"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -120]) }}
      />
    </section>
  );
};

export default ParallaxSection; 