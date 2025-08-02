'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Обновляем индекс при изменении initialIndex
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Блокируем скролл страницы
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors duration-200'
            aria-label='Закрыть галерею'
          >
            <X size={32} />
          </button>

          {/* Счетчик изображений */}
          <div className='absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 text-white rounded-full text-sm'>
            {currentIndex + 1} / {images.length}
          </div>

          {/* Основное изображение */}
          <motion.div
            className='relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='relative w-full h-full flex items-center justify-center'>
              <Image
                src={currentImage?.src || ''}
                alt={currentImage?.alt || ''}
                fill
                className='object-contain'
                sizes='90vw'
                priority
              />
            </div>
          </motion.div>

          {/* Кнопки навигации */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className='absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors duration-200 bg-black/30 rounded-full hover:bg-black/50'
                aria-label='Предыдущее изображение'
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={goToNext}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors duration-200 bg-black/30 rounded-full hover:bg-black/50'
                aria-label='Следующее изображение'
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Информация об изображении */}
          {(currentImage?.title || currentImage?.description) && (
            <motion.div
              className='absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentImage?.title && (
                <h3 className='text-lg font-semibold mb-1'>
                  {currentImage.title}
                </h3>
              )}
              {currentImage?.description && (
                <p className='text-sm text-gray-200'>
                  {currentImage.description}
                </p>
              )}
            </motion.div>
          )}

          {/* Миниатюры (только на десктопе) */}
          {images.length > 1 && (
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden md:flex space-x-2 bg-black/30 p-2 rounded-lg backdrop-blur-sm'>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-16 h-12 rounded overflow-hidden transition-all duration-200 ${
                    index === currentIndex
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className='object-cover'
                    sizes='64px'
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
