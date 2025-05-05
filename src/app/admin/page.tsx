'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Панель управления</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/home-content" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Главная страница</h2>
              <p className="text-gray-600">Редактирование контента главной страницы</p>
            </div>
          </Link>

          <Link href="/admin/about-content" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Обо мне</h2>
              <p className="text-gray-600">Редактирование информации о специалисте</p>
            </div>
          </Link>

          <Link href="/admin/products-content" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Услуги</h2>
              <p className="text-gray-600">Управление списком услуг и ценами</p>
            </div>
          </Link>

          <Link href="/admin/reviews-content" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Отзывы</h2>
              <p className="text-gray-600">Управление отзывами клиентов</p>
            </div>
          </Link>

          <Link href="/admin/contacts-content" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Контакты</h2>
              <p className="text-gray-600">Редактирование контактной информации</p>
            </div>
          </Link>

          <Link href="/admin/images" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Изображения</h2>
              <p className="text-gray-600">Управление медиафайлами</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 