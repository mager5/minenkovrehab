'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '../data';
import { motion } from 'framer-motion';

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

// Клиентский компонент для страницы продукта
export default function ProductClient({ product }: { product: Product }) {
  return (
    <motion.div 
      className="py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Навигация */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/products" className="text-primary hover:underline inline-flex items-center">
            <motion.span whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
              ← 
            </motion.span> Вернуться к продуктам
          </Link>
        </motion.div>

        {/* Содержимое страницы */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.07)" }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Информация о продукте */}
            <motion.div 
              className="lg:w-2/3 lg:pr-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={0}
            >
              <motion.h1 
                className="text-3xl font-bold text-primary mb-4"
                variants={fadeIn}
                custom={1}
              >
                {product.title}
              </motion.h1>
              <motion.div 
                className="h-48 bg-secondary mb-6 relative flex items-center justify-center rounded-lg overflow-hidden"
                variants={fadeIn}
                custom={2}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Заглушка для изображения продукта */}
                <motion.div 
                  className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold rounded-lg"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 0.9 }}
                >
                  {product.title}
                </motion.div>
              </motion.div>
              <motion.div 
                className="mb-6"
                variants={fadeIn}
                custom={3}
              >
                <motion.h2 
                  className="text-xl font-semibold text-dark mb-4"
                  variants={fadeIn}
                  custom={4}
                >
                  Описание
                </motion.h2>
                <motion.p 
                  className="text-dark mb-4"
                  variants={fadeIn}
                  custom={5}
                >
                  {product.shortDescription}
                </motion.p>
                <ul className="list-disc pl-5 space-y-2">
                  {product.fullDescription.map((item, index) => (
                    <motion.li 
                      key={index} 
                      className="text-dark"
                      variants={fadeIn}
                      custom={6 + index * 0.5}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Блок цены и контактов */}
            <motion.div 
              className="lg:w-1/3 mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div 
                className="bg-secondary p-6 rounded-lg"
                whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              >
                <motion.h2 
                  className="text-xl font-semibold text-primary mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Стоимость услуги
                </motion.h2>
                <motion.div 
                  className="text-2xl font-bold text-accent mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {product.price.toLocaleString('ru-RU')} ₽
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4"
                >
                  <Link
                    href="https://t.me/MV_Rehab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-primary text-white text-center px-6 py-3 rounded-md font-medium transition-all hover:bg-primary-dark"
                  >
                    Связаться в Telegram
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 