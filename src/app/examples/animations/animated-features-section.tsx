"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedFeature from '@/components/AnimatedFeature';
import { FiActivity, FiAward, FiClock, FiHeart, FiShield, FiSmile } from 'react-icons/fi';

const AnimatedFeaturesSection = () => {
  const features = [
    {
      icon: <FiHeart size={24} />,
      title: 'Индивидуальный подход',
      description: 'Каждая программа реабилитации создается с учетом ваших индивидуальных потребностей и целей',
    },
    {
      icon: <FiActivity size={24} />,
      title: 'Современные методики',
      description: 'Мы используем только научно обоснованные и эффективные методы физической реабилитации',
    },
    {
      icon: <FiAward size={24} />,
      title: 'Сертифицированные специалисты',
      description: 'Наши врачи имеют высокую квалификацию и регулярно повышают уровень своих знаний',
    },
    {
      icon: <FiClock size={24} />,
      title: 'Удобное расписание',
      description: 'Мы подбираем оптимальное расписание занятий, учитывая ваши временные возможности',
    },
    {
      icon: <FiShield size={24} />,
      title: 'Безопасность',
      description: 'Все процедуры проводятся с соблюдением высоких стандартов безопасности и гигиены',
    },
    {
      icon: <FiSmile size={24} />,
      title: 'Комфортная атмосфера',
      description: 'Мы создаем дружелюбную обстановку, в которой вы будете чувствовать себя комфортно',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Наши преимущества</h2>
          <div className="w-24 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
            Мы стремимся сделать ваш путь к восстановлению максимально 
            эффективным, безопасным и комфортным.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedFeaturesSection; 