"use client";

import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface AnimatedFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

const AnimatedFeature: React.FC<AnimatedFeatureProps> = ({
  icon,
  title,
  description,
  delay = 0,
  className = '',
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay * 0.2,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={`rounded-lg bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-primary rounded-full p-3 text-white mb-4">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-dark">{title}</h3>
      
      <p className="text-gray-600">{description}</p>
      
      <motion.div
        className="w-10 h-1 bg-accent mt-4"
        initial={{ width: 0 }}
        animate={{ width: '40px' }}
        transition={{ 
          delay: (delay * 0.2) + 0.5, 
          duration: 0.6,
          ease: 'easeOut'
        }}
      />
    </motion.div>
  );
};

export default AnimatedFeature; 