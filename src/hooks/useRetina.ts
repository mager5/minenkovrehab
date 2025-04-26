"use client";

import { useState, useEffect } from 'react';

/**
 * Хук для определения Retina дисплея
 * @returns {boolean} - true если устройство имеет Retina дисплей
 */
export const useRetina = (): boolean => {
  const [isRetina, setIsRetina] = useState(false);

  useEffect(() => {
    // Определяем, является ли дисплей Retina
    const checkIfRetina = () => {
      if (typeof window === 'undefined') {
        return false;
      }
      
      const mediaQuery = window.matchMedia(
        '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
      );
      
      setIsRetina(mediaQuery.matches);
    };

    checkIfRetina();

    // Слушаем изменения - полезно при смене дисплея или при изменении масштаба
    const mediaQuery = window.matchMedia(
      '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
    );
    
    // Для современных браузеров используем addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkIfRetina);
    } 
    // Для старых браузеров используем addListener (устаревший метод)
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(checkIfRetina);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', checkIfRetina);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(checkIfRetina);
      }
    };
  }, []);

  return isRetina;
};

/**
 * Хук для получения соответствующего изображения в зависимости от типа дисплея
 * @param {string} normalImagePath - Путь к обычному изображению
 * @param {string} retinaImagePath - Путь к Retina изображению
 * @returns {string} - Путь к изображению в зависимости от типа дисплея
 */
export const useRetinaImage = (
  normalImagePath: string,
  retinaImagePath: string
): string => {
  const isRetina = useRetina();
  return isRetina ? retinaImagePath : normalImagePath;
};

export default useRetina; 