"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface RetinaImageProps {
  src: string;
  retinaImg: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const RetinaImage = ({
  src,
  retinaImg,
  alt,
  width,
  height,
  className = '',
}: RetinaImageProps) => {
  const [isRetina, setIsRetina] = useState(false);

  useEffect(() => {
    // Проверка Retina дисплея
    const checkRetina = () => {
      const mediaQuery = window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');
      setIsRetina(mediaQuery.matches);
    };

    checkRetina();
    
    // Добавляем слушатель на изменение размера окна для повторной проверки
    window.addEventListener('resize', checkRetina);
    
    return () => {
      window.removeEventListener('resize', checkRetina);
    };
  }, []);

  return (
    <Image
      src={isRetina ? retinaImg : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
};

export default RetinaImage; 