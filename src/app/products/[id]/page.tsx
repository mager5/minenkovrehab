// Серверная часть для статической генерации
import { products } from '../data';
import { Metadata } from 'next';
import ProductPageProxy from './page-proxy';
import { getAllProductIds, getProductById } from '../productAdapter';

// Маркер для статической генерации
export const dynamic = 'force-static';

// Метаданные для страницы продукта
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // Получаем продукт из централизованного хранилища
  const product = await getProductById(id);
  
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
export async function generateStaticParams() {
  // Получаем все id продуктов из централизованного хранилища
  const productIds = await getAllProductIds();
  
  return productIds.map((id) => ({
    id,
  }));
}

// Серверная функция рендеринга страницы
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Получаем id из промиса params
  const { id } = await params;
  
  // Получаем продукт из централизованного хранилища
  const product = await getProductById(id);
  const productExists = !!product;
  
  return <ProductPageProxy product={product} productExists={productExists} />;
} 