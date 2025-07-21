import { getProductsContent } from '@/lib/content';
import { ProductContentType } from '@/types/content';
import { Product } from './data';

// Функция для получения всех продуктов
export async function getAllProducts(): Promise<Product[]> {
  try {
    // Всегда используем данные из data.ts для полной функциональности
    const { products } = await import('./data');
    return products;

    // Закомментированный код для JSON (если понадобится в будущем)
    // const data = await getProductsContent<ProductContentType>();
    // return data.services.map(service => ({
    //   id: service.id,
    //   title: service.title,
    //   shortDescription: service.description,
    //   fullDescription: [], // Это поле будет пустым, так как в JSON его нет
    //   price: parseFloat(service.price.replace(/[^\d.-]/g, '')), // Преобразуем цену из строки в число
    //   image: service.image,
    // }));
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки данных продуктов:', error);
    }
    // В случае ошибки, возвращаем пустой массив
    return [];
  }
}

// Функция для получения продукта по id
export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find(p => p.id === id);
}

// Функция для получения всех id продуктов
export async function getAllProductIds(): Promise<string[]> {
  const products = await getAllProducts();
  return products.map(product => product.id);
}
