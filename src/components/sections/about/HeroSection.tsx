import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

export function HeroSection({ title, subtitle, description }: HeroSectionProps) {
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
          {title}
        </motion.h1>
        <motion.h2 
          className="text-2xl md:text-3xl font-semibold mb-6 text-accent-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {subtitle}
        </motion.h2>
        <motion.p 
          className="text-lg opacity-90 text-white max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.section>
  );
} 