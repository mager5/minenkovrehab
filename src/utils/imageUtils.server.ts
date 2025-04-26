/**
 * Серверные утилиты для работы с изображениями
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