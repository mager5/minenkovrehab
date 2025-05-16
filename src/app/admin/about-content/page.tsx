'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui';
import { AboutContent, Certificate } from '@/types/content';

export default function AboutContentAdmin() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-about')
      .then(res => res.json())
      .then(data => {
        if (!data.photos) data.photos = [];
        setContent(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (field: keyof AboutContent, value: string) => {
    setContent((prev: AboutContent | null) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleAdvantageChange = (idx: number, value: string) => {
    setContent((prev: AboutContent | null) => {
      if (!prev) return null;
      const newArr = [...prev.advantages];
      newArr[idx] = value;
      return { ...prev, advantages: newArr };
    });
  };

  const handleCertificateChange = (idx: number, field: keyof Certificate, value: string) => {
    setContent((prev: AboutContent | null) => {
      if (!prev) return null;
      const newArr = [...prev.certificates];
      newArr[idx] = { ...newArr[idx], [field]: value };
      return { ...prev, certificates: newArr };
    });
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/content-about', {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Редактирование страницы &quot;Обо мне&quot;</h1>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Заголовок</label>
              <input type="text" value={content.title} onChange={e => handleChange('title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Подзаголовок</label>
              <input type="text" value={content.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Описание</label>
              <textarea value={content.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Основное фото (портрет)</label>
              <div className="flex items-center gap-4">
                {content.photo ? (
                  <div className="relative w-32 h-32">
                    <img src={content.photo} alt="Фото" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('photo', '')}
                      title="Удалить фото"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">Нет фотографии</div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('photo', path)}
                    folder="about"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Фоновое изображение (hero-секция)</label>
              <div className="flex items-center gap-4">
                {content.heroBg && (
                  <div className="relative w-32 h-32">
                    <img src={content.heroBg} alt="Фоновое изображение" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('heroBg', '')}
                      title="Удалить фото"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('heroBg', path)}
                    folder="about"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Опыт</label>
              <input type="text" value={content.experience} onChange={e => handleChange('experience', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </section>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Фоновое изображение Hero-секции</h2>
          <p className="text-gray-500 text-sm mb-2">Это изображение будет использоваться как фон в верхней части страницы "Обо мне".</p>
          <div className="flex items-center gap-4 mb-2">
            {content.heroBg && (
              <div className="relative w-32 h-32">
                <img src={content.heroBg} alt="Фон hero" className="w-full h-full object-cover rounded-lg border" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                  onClick={() => setContent((prev: any) => ({ ...prev, heroBg: '' }))}
                  title="Удалить фон"
                >
                  &times;
                </button>
              </div>
            )}
            <div className="max-w-xs">
              <ImageUpload
                onUpload={path => setContent((prev: any) => ({ ...prev, heroBg: path }))}
                currentImage={content.heroBg}
              />
            </div>
          </div>
        </section>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Преимущества</h2>
          <div className="space-y-4">
            {content.advantages.map((advantage: string, idx: number) => (
              <div key={idx}>
                <label className="text-sm font-medium mb-1">Преимущество {idx + 1}</label>
                <input
                  type="text"
                  value={advantage}
                  onChange={e => handleAdvantageChange(idx, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Сертификаты</h2>
          <div className="space-y-6">
            {content.certificates.map((cert: Certificate, idx: number) => (
              <div key={idx} className="border p-4 rounded-lg">
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1">Название сертификата</label>
                  <input
                    type="text"
                    value={cert.title}
                    onChange={e => handleCertificateChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Изображение сертификата</label>
                  <div className="flex items-center gap-4">
                    {cert.image && (
                      <div className="relative w-32 h-32">
                        <img src={cert.image} alt={`Сертификат ${idx + 1}`} className="w-full h-full object-cover rounded-lg border" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                          onClick={() => handleCertificateChange(idx, 'image', '')}
                          title="Удалить фото"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    <div className="max-w-xs">
                      <ImageUpload
                        onUpload={path => handleCertificateChange(idx, 'image', path)}
                        folder="about/certificates"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newCertificates = [...content.certificates, { title: '', image: '' }];
                setContent((prev: AboutContent | null) => {
                  if (!prev) return null;
                  return { ...prev, certificates: newCertificates };
                });
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            >
              Добавить сертификат
            </button>
          </div>
        </section>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Фотогалерея</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {content.photos && content.photos.length > 0 ? (
              content.photos.map((photo: string, idx: number) => (
                <div key={idx} className="relative group w-32 h-32">
                  <img src={photo} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                    onClick={() => {
                      const newPhotos = content.photos.filter((_: string, i: number) => i !== idx);
                      setContent((prev: any) => ({ ...prev, photos: newPhotos }));
                    }}
                    title="Удалить фото"
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-400">Нет фотографий</div>
            )}
          </div>
          <div className="max-w-xs">
            <ImageUpload
              onUpload={path => {
                setContent((prev: any) => ({ ...prev, photos: [...(prev.photos || []), path] }));
              }}
            />
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