'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from './data';
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

interface ProductPageWrapperProps {
  product: Product | undefined;
}

export default function ProductPageWrapper({ product }: ProductPageWrapperProps) {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });

  // Если продукт не найден, возвращаем сообщение об ошибке
  if (!product) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-2xl font-semibold text-primary mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Продукт не найден
        </motion.h1>
        <motion.p 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Запрашиваемый продукт не существует или был удален.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/products"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Вернуться к списку продуктов
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // Форматирование номера телефона в формате +7 (XXX) XXX-XX-XX
  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    
    // Удаляем все нецифровые символы
    const phoneNumber = value.replace(/\D/g, '');
    
    // Если первая цифра 8 или 7, удаляем ее и добавляем +7
    let normalisedPhone = phoneNumber;
    if (phoneNumber.startsWith('8') || phoneNumber.startsWith('7')) {
      normalisedPhone = phoneNumber.substring(1);
    }
    
    const phoneNumberLength = normalisedPhone.length;
    
    // Начинаем всегда с +7
    let formattedNumber = '+7';
    
    // Добавляем скобку и первые цифры кода
    if (phoneNumberLength > 0) {
      formattedNumber += ` (${normalisedPhone.substring(0, Math.min(3, phoneNumberLength))}`;
    }
    
    // Закрываем скобку и добавляем следующие цифры
    if (phoneNumberLength > 3) {
      formattedNumber += `) ${normalisedPhone.substring(3, Math.min(6, phoneNumberLength))}`;
    }
    
    // Добавляем первое тире
    if (phoneNumberLength > 6) {
      formattedNumber += `-${normalisedPhone.substring(6, Math.min(8, phoneNumberLength))}`;
    }
    
    // Добавляем второе тире
    if (phoneNumberLength > 8) {
      formattedNumber += `-${normalisedPhone.substring(8, Math.min(10, phoneNumberLength))}`;
    }
    
    return formattedNumber;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      // Ограничиваем максимальную длину номера (+7 (XXX) XXX-XX-XX)
      if (formattedValue.length > 18) return;
      setContactInfo(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setContactInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  // Имитация процесса оплаты
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentProcessing(true);

    // Имитация API запроса на оплату
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

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
          {paymentSuccess ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-accent text-6xl mb-6 flex justify-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 150 
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <motion.h2 
                className="text-2xl font-bold text-primary mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Спасибо за покупку!
              </motion.h2>
              <motion.p 
                className="text-lg mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Напишите мне в Telegram для получения материалов и инструкций:
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a 
                  href="https://t.me/MV_Rehab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  @MV_Rehab
                </a>
              </motion.div>
            </motion.div>
          ) : (
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

              {/* Форма оплаты */}
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
                    Оформить заказ
                  </motion.h2>
                  <motion.div 
                    className="text-2xl font-bold text-accent mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {product.price.toLocaleString('ru-RU')} ₽
                  </motion.div>

                  <motion.form 
                    onSubmit={handlePayment}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      <label htmlFor="name" className="block text-dark mb-2">Ваше имя</label>
                      <motion.input
                        type="text"
                        id="name"
                        name="name"
                        value={contactInfo.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        whileFocus={{ boxShadow: "0 0 0 2px rgba(58, 124, 165, 0.3)" }}
                      />
                    </motion.div>
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <label htmlFor="email" className="block text-dark mb-2">Email</label>
                      <motion.input
                        type="email"
                        id="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        whileFocus={{ boxShadow: "0 0 0 2px rgba(58, 124, 165, 0.3)" }}
                      />
                    </motion.div>
                    <motion.div 
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.9 }}
                    >
                      <label htmlFor="phone" className="block text-dark mb-2">Телефон</label>
                      <motion.input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={contactInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="+7 (___) ___-__-__"
                        whileFocus={{ boxShadow: "0 0 0 2px rgba(58, 124, 165, 0.3)" }}
                      />
                    </motion.div>
                    <motion.button
                      type="submit"
                      className={`w-full py-3 rounded-md transition-colors ${
                        isPaymentProcessing 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-accent text-white hover:bg-accent/90'
                      }`}
                      disabled={isPaymentProcessing}
                      whileHover={!isPaymentProcessing ? { scale: 1.03 } : {}}
                      whileTap={!isPaymentProcessing ? { scale: 0.97 } : {}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    >
                      {isPaymentProcessing ? 'Обработка платежа...' : 'Оплатить'}
                    </motion.button>
                    <motion.p 
                      className="text-sm text-gray-500 mt-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      Нажимая кнопку, вы соглашаетесь с условиями <Link href="/terms" className="text-primary hover:underline">оферты</Link>
                    </motion.p>
                  </motion.form>
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
} 