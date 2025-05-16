'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui';
import { ProductsContent, Service } from '@/types/content';

export default function ProductsContentAdmin() {
  const [content, setContent] = useState<ProductsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-products')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (field: keyof ProductsContent, value: string) => {
    setContent((prev: ProductsContent | null) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleServiceChange = (idx: number, field: keyof Service, value: string) => {
    setContent((prev: ProductsContent | null) => {
      if (!prev) return null;
      const newArr = [...prev.services];
      newArr[idx] = { ...newArr[idx], [field]: value };
      return { ...prev, services: newArr };
    });
  };

  const handleAddService = () => {
    setContent((prev: ProductsContent | null) => {
      if (!prev) return null;
      return {
        ...prev,
        services: [
          ...prev.services,
          {
            title: '',
            description: '',
            image: '',
            price: ''
          }
        ]
      };
    });
  };

  const handleRemoveService = (idx: number) => {
    setContent((prev: ProductsContent | null) => {
      if (!prev) return null;
      return {
        ...prev,
        services: prev.services.filter((_, i) => i !== idx)
      };
    });
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/content-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Редактирование страницы &quot;Услуги&quot;</h1>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок</label>
              <input type="text" value={content.title} onChange={e => handleChange('title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea value={content.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Фоновое изображение (hero)</label>
              <div className="flex items-center gap-4">
                {content.heroBg && (
                  <div className="relative w-48 h-24">
                    <img src={content.heroBg} alt="Фон hero" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('heroBg', '')}
                      title="Удалить фон"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('heroBg', path)}
                    folder="products-hero"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Список услуг</h2>
          <div className="space-y-6">
            {content.services.map((service: Service, idx: number) => (
              <div key={idx} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Услуга {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Название</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={e => handleServiceChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Описание</label>
                    <textarea
                      value={service.description}
                      onChange={e => handleServiceChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Цена</label>
                    <input
                      type="text"
                      value={service.price}
                      onChange={e => handleServiceChange(idx, 'price', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Изображение</label>
                    <div className="flex items-center gap-4">
                      {service.image && (
                        <div className="relative w-32 h-32">
                          <img src={service.image} alt={`Изображение услуги ${idx + 1}`} className="w-full h-full object-cover rounded-lg border" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                            onClick={() => handleServiceChange(idx, 'image', '')}
                            title="Удалить фото"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      <div className="max-w-xs">
                        <ImageUpload
                          onUpload={path => handleServiceChange(idx, 'image', path)}
                          folder="services"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddService}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            >
              Добавить услугу
            </button>
          </div>
        </section>

        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {success && <p className="mt-4 text-green-500">Изменения сохранены</p>}
        </div>
      </div>
    </div>
  );
} 