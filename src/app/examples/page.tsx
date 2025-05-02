'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const examplesList = [
  {
    id: 1,
    title: 'Анимации',
    description: 'Примеры использования библиотеки Framer Motion для создания анимаций интерфейса',
    path: '/examples/animations',
    color: 'bg-primary text-white',
    borderColor: 'border-primary',
  },
  {
    id: 2,
    title: 'Lottie-анимации',
    description: 'Векторные анимации с использованием библиотеки Lottie для создания сложных и легких анимаций',
    path: '/examples/lottie',
    color: 'bg-accent text-white',
    borderColor: 'border-accent',
    isNew: true,
  },
  {
    id: 3,
    title: 'Поддержка Retina',
    description: 'Примеры оптимизации изображений для дисплеев с высоким разрешением',
    path: '/examples/retina',
    color: 'bg-gray-700 text-white',
    borderColor: 'border-gray-700',
  },
];

export default function Examples() {
  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Примеры компонентов
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-700 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Коллекция демонстрационных примеров технологий и компонентов, используемых в проекте
          </motion.p>
          <motion.div 
            className="h-1 w-20 bg-accent mx-auto mt-6"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '5rem', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          ></motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examplesList.map((example, index) => (
            <motion.div 
              key={example.id}
              className={`rounded-lg border-2 ${example.borderColor} overflow-hidden transition-all hover:shadow-lg relative`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1 * index,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -10, 
                transition: { 
                  duration: 0.2, 
                  type: "tween" 
                } 
              }}
            >
              {example.isNew && (
                <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold py-1 px-2 rounded-full">
                  Новое
                </div>
              )}
              <div className={`p-6 ${example.color}`}>
                <h3 className="text-xl font-bold mb-1">{example.title}</h3>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-700 mb-6">
                  {example.description}
                </p>
                <Link 
                  href={example.path}
                  className={`inline-block border border-current px-4 py-2 rounded-md font-medium transition-colors text-${example.color.split(' ')[0].replace('bg-', '')}`}
                >
                  Посмотреть пример
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link 
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 