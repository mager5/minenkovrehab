'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = '' }) => {
  return (
    <motion.div
      className={`w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          allowTouchMove={true}
          touchRatio={1}
          touchAngle={45}
          grabCursor={true}
          className="rehabilitation-carousel"
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 1,
            },
            1024: {
              slidesPerView: 1,
            },
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="relative bg-white rounded-lg shadow-lg overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Кастомные кнопки навигации по центру контейнера - скрыты на мобильных */}
        <button
          className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 text-black/70 rounded-full flex items-center justify-center hover:bg-white/90 hover:text-black/90 transition-all duration-200 shadow-lg z-10 backdrop-blur-sm hidden sm:flex"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        <button
          className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 text-black/70 rounded-full flex items-center justify-center hover:bg-white/90 hover:text-black/90 transition-all duration-200 shadow-lg z-10 backdrop-blur-sm hidden sm:flex"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default ImageCarousel;