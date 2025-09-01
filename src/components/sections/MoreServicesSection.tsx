'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { homeContent } from '@/data/content';
import { useState, useRef, useEffect } from 'react';

interface MoreServicesSectionProps {
  currentProductId?: string;
}

export function MoreServicesSection({
  currentProductId,
}: MoreServicesSectionProps) {
  // Показываем все услуги, включая экспресс-консультацию, но исключаем текущую
  const filteredServices = homeContent.services.items.filter(service => {
    // Исключаем текущую услугу на основе ID
    if (currentProductId) {
      const serviceId = getServiceId(service.title);
      return serviceId !== currentProductId;
    }

    return true;
  });

  // Состояние для слайдера
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Состояние для свайпа
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Количество карточек на экране в зависимости от размера
  const getCardsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 3; // xl
      if (window.innerWidth >= 768) return 2; // md
      return 1; // mobile
    }
    return 3;
  };

  // Обновляем количество карточек при изменении размера окна
  useEffect(() => {
    const updateCardsPerView = () => {
      const newCardsPerView = getCardsPerView();
      setCardsPerView(newCardsPerView);
      // Сбрасываем слайд если он выходит за границы
      const newMaxSlide = Math.max(
        0,
        filteredServices.length - newCardsPerView
      );
      setCurrentSlide(prev => Math.min(prev, newMaxSlide));
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);

    return () => window.removeEventListener('resize', updateCardsPerView);
  }, [filteredServices.length]);

  const maxSlide = Math.max(0, filteredServices.length - cardsPerView);

  // Функции навигации слайдера
  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50;

  // Обработчики свайпа для touch устройств
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX || 0);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX || 0);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < maxSlide) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }

    setIsDragging(false);
  };

  // Обработчики свайпа для mouse (десктоп)
  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < maxSlide) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }

    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  // Функция для получения ID услуги на основе названия
  function getServiceId(serviceTitle: string): string {
    if (serviceTitle.includes('Формула Движения')) {
      return 'formula-movement';
    }
    if (serviceTitle.includes('Программа')) {
      return 'personal-program';
    }
    if (serviceTitle.includes('консультаци')) {
      return 'consultation';
    }
    if (serviceTitle.includes('тренировк')) {
      return 'online-training';
    }
    if (serviceTitle.includes('протокол')) {
      return 'rehabilitation-protocols';
    }
    return '';
  }

  // Если нет услуг для отображения, не рендерим секцию
  if (filteredServices.length === 0) {
    return null;
  }

  return (
    <section className='py-20 bg-gray-50 overflow-x-hidden'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2
            className='text-3xl md:text-4xl font-bold text-primary mt-2 mb-3'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Еще услуги
          </motion.h2>
          <motion.div
            className='h-1 w-20 bg-accent mx-auto'
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '5rem', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </motion.div>

        {/* Слайдер с карточками услуг */}
        <div className='relative'>
          {/* Навигационные стрелки */}
          {/* Левая стрелка - показываем только если можно прокрутить назад */}
          {filteredServices.length > cardsPerView && currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:bg-accent hover:text-white'
              style={{ transform: 'translateY(-50%) translateX(-50%)' }}
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
          )}

          {/* Правая стрелка - показываем только если можно прокрутить вперед */}
          {filteredServices.length > cardsPerView &&
            currentSlide < maxSlide && (
              <button
                onClick={nextSlide}
                className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:bg-accent hover:text-white'
                style={{ transform: 'translateY(-50%) translateX(50%)' }}
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </button>
            )}

          {/* Контейнер слайдера */}
          <div className='overflow-hidden px-6'>
            <div
              ref={sliderRef}
              className={`flex gap-8 select-none ${isDragging ? 'transition-none cursor-grabbing' : 'transition-transform duration-500 ease-in-out cursor-grab'}`}
              style={{
                transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`,
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
            >
              {filteredServices.map((service, index) => (
                <div
                  key={service.title}
                  className='flex-shrink-0 flex'
                  style={{
                    width: `calc(${100 / cardsPerView}% - ${(cardsPerView - 1) * 2}rem / ${cardsPerView})`,
                  }}
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    image={
                      service.icon === 'consultation'
                        ? '/images/products/consultation.jpg'
                        : service.icon === 'rehabilitation'
                          ? '/images/hero/formula-m.jpg'
                          : service.icon === 'online'
                            ? '/images/hero/protocols.jpg'
                            : service.icon === 'training'
                              ? '/images/products/online_training.jpg'
                              : `/images/services/${service.icon}.svg`
                    }
                    delay={0.1 * (index + 1)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Индикаторы слайдов */}
          {filteredServices.length > cardsPerView && (
            <div className='flex justify-center mt-8 space-x-2'>
              {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'bg-accent scale-110'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  delay: number;
}

function ServiceCard({ title, description, image, delay }: ServiceCardProps) {
  // Определяем ссылку на основе названия услуги
  const getServiceLink = (serviceTitle: string) => {
    if (serviceTitle.includes('Формула Движения')) {
      return '/products/formula-movement';
    }
    if (serviceTitle.includes('Программа')) {
      return '/products/personal-program';
    }
    if (serviceTitle.includes('Экспресс онлайн-консультация')) {
      return '/products/consultation';
    }
    if (serviceTitle.includes('консультаци')) {
      return '/products/consultation';
    }
    if (serviceTitle.includes('тренировк')) {
      return '/products/online-training';
    }
    if (serviceTitle.includes('протокол')) {
      return '/products/rehabilitation-protocols';
    }
    return '/products';
  };

  return (
    <Link href={getServiceLink(title)} className='block cursor-pointer'>
      <div className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full flex flex-col'>
        <div className='relative h-52'>
          <Image src={image} alt={title} fill className='object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent'></div>
          <div className='absolute bottom-0 left-0 p-4 text-white'>
            <span className='font-semibold text-accent-light'>{title}</span>
          </div>
        </div>
        <div className='p-6 flex-1 flex flex-col'>
          <h3 className='text-xl font-semibold text-primary mb-3'>{title}</h3>
          <p className='text-dark mb-4 line-clamp-3 flex-1' title={description}>
            {description}
          </p>
          <div>
            <span className='inline-block text-accent font-medium'>
              Подробнее
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
