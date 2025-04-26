'use client';

import Link from 'next/link';

// Компонент для отображения страницы "Продукт не найден"
export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-primary mb-4">Продукт не найден</h1>
      <p className="mb-6">Запрашиваемый продукт не существует или был удален.</p>
      <Link 
        href="/products"
        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Вернуться к списку продуктов
      </Link>
    </div>
  );
} 