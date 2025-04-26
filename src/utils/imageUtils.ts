"use client";

/**
 * Утилиты для работы с изображениями
 */

/**
 * Преобразует путь к изображению для получения Retina версии (@2x)
 * @param {string} imagePath - Путь к обычному изображению
 * @returns {string} - Путь к Retina версии изображения
 */
export const getRetinaImagePath = (imagePath: string): string => {
  const extension = imagePath.split('.').pop() || '';
  const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
  return `${basePath}@2x.${extension}`;
};

/**
 * Проверяет, является ли текущий дисплей Retina
 * @returns {boolean} - true если устройство имеет Retina дисплей
 */
export const isRetinaDisplay = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Для SSR
  }
  return (
    window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches
  );
};

/**
 * Преобразует стили для background-image с поддержкой Retina
 * @param {string} normalImageUrl - URL обычного изображения
 * @param {string} retinaImageUrl - URL Retina изображения
 * @returns {Object} - Объект со стилями
 */
export const getRetinaBackgroundStyles = (normalImageUrl: string, retinaImageUrl: string) => {
  return {
    backgroundImage: `url(${normalImageUrl})`,
    '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)': {
      backgroundImage: `url(${retinaImageUrl})`,
    },
  };
}; 