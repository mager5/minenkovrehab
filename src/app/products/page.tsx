'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getProductsContent } from '@/lib/content';

// Интерфейс для типизации контента продуктов
interface ProductContentType {
  title: string;
  description: string;
  services: {
    id: string;
    title: string;
    description: string;
    price: string;
    image: string;
  }[];
}

export default function ProductsPage() {
  // Состояние для данных страницы
  const [productsContent, setProductsContent] = useState<ProductContentType>({
    title: "Услуги",
    description: "Выберите подходящую услугу для ваших потребностей в реабилитации",
    services: []
  });

  // Загрузка контента при монтировании компонента
  useEffect(() => {
    async function loadProductsData() {
      try {
        const data = await getProductsContent<ProductContentType>();
        setProductsContent(data);
      } catch (error) {
        console.error('Ошибка загрузки данных продуктов:', error);
      }
    }
    
    loadProductsData();
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

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero секция */}
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
              alt="Услуги реабилитации"
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
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {productsContent.title}
          </motion.h1>
          <motion.p 
            className="max-w-2xl text-xl text-white mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {productsContent.description}
          </motion.p>
        </motion.div>
      </motion.section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {productsContent.services.map((service, index) => (
            <motion.div
              key={service.title}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative h-64">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-primary mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-accent font-bold text-2xl">
                    {service.price}
                  </span>
                  <Link 
                    href={`/products/${service.id}`}
                    className="inline-flex items-center text-primary hover:text-accent transition-colors"
                  >
                    <span className="mr-2">Подробнее</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 