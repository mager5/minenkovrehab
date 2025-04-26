// Серверная часть для статической генерации
import { products } from '../data';
import { Metadata } from 'next';
import ProductPageProxy from './page-proxy';

// Маркер для статической генерации
export const dynamic = 'force-static';

// Метаданные для страницы продукта
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return {
      title: 'Продукт не найден | Миненков Вадим',
      description: 'Запрашиваемый продукт не существует или был удален.',
    };
  }
  
  return {
    title: `${product.title} | Миненков Вадим`,
    description: product.shortDescription,
  };
}

// Функция для статической генерации страниц
export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

// Серверная функция рендеринга страницы
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Получаем id из промиса params
  const { id } = await params;
  
  // Эта часть будет рендериться на сервере
  const product = products.find(p => p.id === id);
  const productExists = !!product;
  
  return <ProductPageProxy product={product} productExists={productExists} />;
} 