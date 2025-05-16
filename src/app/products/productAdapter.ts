import { getProductsContent } from '@/lib/content';
import { Product } from './data';

// Интерфейс для типизации контента продуктов из JSON
export interface ProductContentType {
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

// Функция для получения всех продуктов
export async function getAllProducts(): Promise<Product[]> {
  try {
    const data = await getProductsContent<ProductContentType>();
    
    // Преобразуем данные из JSON в формат Product[]
    return data.services.map(service => ({
      id: service.id,
      title: service.title,
      shortDescription: service.description,
      fullDescription: [], // Это поле будет пустым, так как в JSON его нет
      price: parseFloat(service.price.replace(/[^\d.-]/g, '')), // Преобразуем цену из строки в число
      image: service.image
    }));
  } catch (error) {
    console.error('Ошибка загрузки данных продуктов:', error);
    // В случае ошибки, возвращаем пустой массив или данные из локального хранилища
    const { products } = await import('./data');
    return products;
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