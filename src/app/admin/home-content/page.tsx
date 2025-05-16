'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui';

export default function HomeContentAdmin() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-home')
      .then(res => res.json())
      .then(data => {
        if (!data.hero) data.hero = {};
        if (!('bg' in data.hero)) data.hero.bg = data.hero.image || '';
        if (!data.about) data.about = {};
        if (!('bg' in data.about)) data.about.bg = data.about.image || '';
        setContent(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (section: string, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/content-home', {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Редактирование главной страницы</h1>

        {/* Hero */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Hero</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Заголовок</label>
              <input type="text" value={content.hero.title} onChange={e => handleChange('hero', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Описание</label>
              <textarea value={content.hero.description} onChange={e => handleChange('hero', 'description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Картинка Hero (отображается на главной)</label>
              <div className="flex items-center gap-4 mb-2">
                {content.hero.image && (
                  <div className="relative w-32 h-32">
                    <img src={content.hero.image} alt="Hero" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('hero', 'image', '')}
                      title="Удалить картинку"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('hero', 'image', path)}
                    currentImage={content.hero.image}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Фоновое изображение Hero (опционально)</label>
              <div className="flex items-center gap-4 mb-2">
                {content.hero.bg && (
                  <div className="relative w-32 h-32">
                    <img src={content.hero.bg} alt="Фон hero" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('hero', 'bg', '')}
                      title="Удалить фон"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('hero', 'bg', path)}
                    currentImage={content.hero.bg}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Фото специалиста (отображается справа в Hero)</label>
              <div className="flex items-center gap-4 mb-2">
                {content.hero.photo && (
                  <div className="relative w-32 h-32">
                    <img src={content.hero.photo} alt="Фото специалиста" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('hero', 'photo', '')}
                      title="Удалить фото"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('hero', 'photo', path)}
                    currentImage={content.hero.photo}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Преимущества</h2>
          <div className="space-y-4">
            {content.advantages.map((adv: any, idx: number) => (
              <div key={idx} className="border-b pb-4 mb-4">
                <label className="text-sm font-medium mb-1">Заголовок</label>
                <input type="text" value={adv.title} onChange={e => {
                  const newArr = [...content.advantages];
                  newArr[idx].title = e.target.value;
                  setContent((prev: any) => ({ ...prev, advantages: newArr }));
                }} className="w-full px-3 py-2 border rounded-md mb-2" />
                <label className="text-sm font-medium mb-1">Описание</label>
                <textarea value={adv.description} onChange={e => {
                  const newArr = [...content.advantages];
                  newArr[idx].description = e.target.value;
                  setContent((prev: any) => ({ ...prev, advantages: newArr }));
                }} className="w-full px-3 py-2 border rounded-md" rows={2} />
              </div>
            ))}
          </div>
        </section>

        {/* О нас + Статистика */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">О нас</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Заголовок</label>
              <input type="text" value={content.about.title} onChange={e => handleChange('about', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Описание</label>
              <textarea value={content.about.description} onChange={e => handleChange('about', 'description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Опыт</label>
              <input type="text" value={content.about.experience} onChange={e => handleChange('about', 'experience', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Картинка "О нас" (отображается на главной)</label>
              <div className="flex items-center gap-4 mb-2">
                {content.about.image && (
                  <div className="relative w-32 h-32">
                    <img src={content.about.image} alt="О нас" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('about', 'image', '')}
                      title="Удалить картинку"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('about', 'image', path)}
                    currentImage={content.about.image}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Фоновое изображение "О нас" (опционально)</label>
              <div className="flex items-center gap-4 mb-2">
                {content.about.bg && (
                  <div className="relative w-32 h-32">
                    <img src={content.about.bg} alt="Фон о нас" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleChange('about', 'bg', '')}
                      title="Удалить фон"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <div className="max-w-xs">
                  <ImageUpload
                    onUpload={path => handleChange('about', 'bg', path)}
                    currentImage={content.about.bg}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Статистика</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1">Довольных клиентов</label>
                <input type="number" value={content.stats.satisfiedClients} onChange={e => handleChange('stats', 'satisfiedClients', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Проведенных консультаций</label>
                <input type="number" value={content.stats.consultations} onChange={e => handleChange('stats', 'consultations', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Онлайн-программ</label>
                <input type="number" value={content.stats.onlinePrograms} onChange={e => handleChange('stats', 'onlinePrograms', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Лет опыта</label>
                <input type="number" value={content.stats.experience} onChange={e => handleChange('stats', 'experience', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
        </section>

        {/* Услуги */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Услуги</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Заголовок секции</label>
              <input type="text" value={content.services.title} onChange={e => handleChange('services', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Онлайн-консультации</label>
              <input type="text" value={content.services.consultations.title} onChange={e => setContent((prev: any) => ({ ...prev, services: { ...prev.services, consultations: { ...prev.services.consultations, title: e.target.value } } }))} className="w-full px-3 py-2 border rounded-md mb-2" />
              <textarea value={content.services.consultations.description} onChange={e => setContent((prev: any) => ({ ...prev, services: { ...prev.services, consultations: { ...prev.services.consultations, description: e.target.value } } }))} className="w-full px-3 py-2 border rounded-md" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Индивидуальные программы</label>
              <input type="text" value={content.services.programs.title} onChange={e => setContent((prev: any) => ({ ...prev, services: { ...prev.services, programs: { ...prev.services.programs, title: e.target.value } } }))} className="w-full px-3 py-2 border rounded-md mb-2" />
              <textarea value={content.services.programs.description} onChange={e => setContent((prev: any) => ({ ...prev, services: { ...prev.services, programs: { ...prev.services.programs, description: e.target.value } } }))} className="w-full px-3 py-2 border rounded-md" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Анализ движения</label>
              <input type="text" value={content.services.analysis.title} onChange={e => setContent((prev: any) => ({ ...prev, services: { ...prev.services, analysis: { ...prev.services.analysis, title: e.target.value } } }))} className="w-full px-3 py-2 border rounded-md mb-2" />
              <textarea value={content.services.analysis.description} onChange={e => setContent((prev: any) => ({ ...prev, services: { ...prev.services, analysis: { ...prev.services.analysis, description: e.target.value } } }))} className="w-full px-3 py-2 border rounded-md" rows={2} />
            </div>
          </div>
        </section>

        {/* Изображения услуг */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Изображения услуг (отображаются на главной)</h2>
          <div className="space-y-4">
            {content.services && Object.entries(content.services).map(([key, service]: [string, any], idx: number) => (
              key !== 'title' && (
                <div key={key} className="border-b pb-4 mb-4">
                  <div className="font-semibold mb-2">{service.title || key}</div>
                  <div className="flex items-center gap-4 mb-2">
                    {service.image && (
                      <div className="relative w-32 h-32">
                        <img src={service.image} alt={service.title || key} className="w-full h-full object-cover rounded-lg border" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                          onClick={() => {
                            const newServices = { ...content.services };
                            newServices[key].image = '';
                            setContent((prev: any) => ({ ...prev, services: newServices }));
                          }}
                          title="Удалить изображение"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    <div className="max-w-xs">
                      <ImageUpload
                        onUpload={path => {
                          const newServices = { ...content.services };
                          newServices[key].image = path;
                          setContent((prev: any) => ({ ...prev, services: newServices }));
                        }}
                        currentImage={service.image}
                      />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Когда нужна помощь */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Когда нужна помощь</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Заголовок</label>
              <input type="text" value={content.help.title} onChange={e => handleChange('help', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Подзаголовок</label>
              <input type="text" value={content.help.subtitle} onChange={e => handleChange('help', 'subtitle', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            {content.help.items.map((item: any, idx: number) => (
              <div key={idx} className="border-b pb-4 mb-4">
                <label className="text-sm font-medium mb-1">Проблема</label>
                <input type="text" value={item.title} onChange={e => {
                  const newArr = [...content.help.items];
                  newArr[idx].title = e.target.value;
                  setContent((prev: any) => ({ ...prev, help: { ...prev.help, items: newArr } }));
                }} className="w-full px-3 py-2 border rounded-md mb-2" />
                <label className="text-sm font-medium mb-1">Описание</label>
                <textarea value={item.description} onChange={e => {
                  const newArr = [...content.help.items];
                  newArr[idx].description = e.target.value;
                  setContent((prev: any) => ({ ...prev, help: { ...prev.help, items: newArr } }));
                }} className="w-full px-3 py-2 border rounded-md" rows={2} />
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">CTA</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Заголовок</label>
              <input type="text" value={content.cta.title} onChange={e => handleChange('cta', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Описание</label>
              <textarea value={content.cta.description} onChange={e => handleChange('cta', 'description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">Текст кнопки</label>
              <input type="text" value={content.cta.buttonText} onChange={e => handleChange('cta', 'buttonText', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </section>

        {/* Кнопка сохранения */}
        <div className="pt-6">
          <button onClick={handleSave} disabled={saving} className="w-full bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md transition-colors duration-300">
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          {success && <div className="text-green-600 mt-2">Изменения сохранены!</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
} 