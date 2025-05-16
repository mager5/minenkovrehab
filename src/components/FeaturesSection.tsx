"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiUsers, FiAward } from 'react-icons/fi';

export function FeaturesSection() {
  const features = [
    {
      icon: <FiCheckCircle size={24} />,
      title: "Экспертная Реабилитация",
      description: "Профессиональный подход к восстановлению здоровья"
    },
    {
      icon: <FiUsers size={24} />,
      title: "Индивидуальный Подход",
      description: "Персональные программы для каждого клиента"
    },
    {
      icon: <FiAward size={24} />,
      title: "Проверенные Методики",
      description: "Современные методы реабилитации с доказанной эффективностью"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-primary mb-4">Почему выбирают меня</h2>
          <div className="w-24 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
            Я стремлюсь сделать ваш путь к восстановлению максимально 
            эффективным, безопасным и комфортным
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="rounded-lg bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.2
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-accent/10 rounded-full p-3 text-accent mb-4">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-primary">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              <motion.div
                className="w-10 h-1 bg-accent mt-4"
                initial={{ width: 0 }}
                animate={{ width: '40px' }}
                transition={{ 
                  delay: (index * 0.2) + 0.5, 
                  duration: 0.6,
                  ease: 'easeOut'
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 