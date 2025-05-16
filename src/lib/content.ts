/**
 * Утилиты для работы с JSON-контентом
 * 
 * Этот модуль предоставляет функции для загрузки JSON-контента
 * с поддержкой как новой структуры (директория content/),
 * так и старой (файлы в корне проекта).
 */

/**
 * Загружает JSON-контент из файлов
 * @param contentType Тип контента (home, about, products, contacts)
 * @returns Содержимое JSON-файла
 */
export async function getContent<T>(contentType: string): Promise<T> {
  try {
    // Пытаемся сначала загрузить из новой структуры
    const response = await fetch(`/content/${contentType}.json`);
    
    if (response.ok) {
      return await response.json() as T;
    }
    
    // Если не получилось, пытаемся загрузить из старой структуры
    const fallbackResponse = await fetch(`/content-${contentType}.json`);
    
    if (fallbackResponse.ok) {
      return await fallbackResponse.json() as T;
    }
    
    // Особый случай для контактов, которые могут быть в public
    if (contentType === 'contacts') {
      const publicResponse = await fetch(`/content-contacts.json`);
      if (publicResponse.ok) {
        return await publicResponse.json() as T;
      }
    }
    
    throw new Error(`Не удалось загрузить контент: ${contentType}`);
  } catch (error) {
    console.error(`Ошибка при загрузке контента ${contentType}:`, error);
    throw error;
  }
}

/**
 * Загружает контент главной страницы
 */
export function getHomeContent<T>(): Promise<T> {
  return getContent<T>('home');
}

/**
 * Загружает контент страницы "О нас"
 */
export function getAboutContent<T>(): Promise<T> {
  return getContent<T>('about');
}

/**
 * Загружает контент продуктов
 */
export function getProductsContent<T>(): Promise<T> {
  return getContent<T>('products');
}

/**
 * Загружает контактную информацию
 */
export function getContactsContent<T>(): Promise<T> {
  return getContent<T>('contacts');
} 