// Серверная часть для статической генерации
import { products } from '../data';
import { Metadata } from 'next';
import ProductPageProxy from './page-proxy';

// Маркер для статической генерации
export const dynamic = 'force-static';

// Метаданные для страницы продукта
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const product = products.find(p => p.id === params.id);
  
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
export default function Page({ params }: { params: { id: string } }) {
  // Эта часть будет рендериться на сервере
  const product = products.find(p => p.id === params.id);
  const productExists = !!product;
  
  return <ProductPageProxy product={product} productExists={productExists} />;
} 