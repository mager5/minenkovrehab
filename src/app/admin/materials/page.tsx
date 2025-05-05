'use client';

import { useState, useEffect } from 'react';

// Временный тип для материалов (позже заменим на реальный)
type Material = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        setMaterials(data);
        setLoading(false);
      });
  }, []);

  const handleAddMaterial = () => {
    setCurrentMaterial({
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (currentMaterial) {
      // Сохраняем на сервер
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMaterial),
      });
      setMaterials([...materials, currentMaterial]);
      setIsModalOpen(false);
      setCurrentMaterial(null);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    // TODO: реализовать удаление на сервере
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Материалы</h1>
          <button
            onClick={handleAddMaterial}
            className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            Добавить материал
          </button>
        </div>

        {/* Список материалов */}
        {loading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-sm p-6">
                {material.imageUrl && (
                  <img 
                    src={material.imageUrl} 
                    alt={material.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{material.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{material.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setCurrentMaterial(material);
                        setIsModalOpen(true);
                      }}
                      className="text-accent hover:text-accent-dark"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно для добавления/редактирования */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">
                {currentMaterial?.id ? 'Редактировать материал' : 'Новый материал'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={currentMaterial?.title || ''}
                    onChange={(e) => setCurrentMaterial({
                      ...currentMaterial!,
                      title: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Содержание
                  </label>
                  <textarea
                    value={currentMaterial?.content || ''}
                    onChange={(e) => setCurrentMaterial({
                      ...currentMaterial!,
                      content: e.target.value
                    })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Изображение (URL)
                  </label>
                  <input
                    type="text"
                    value={currentMaterial?.imageUrl || ''}
                    onChange={(e) => setCurrentMaterial({
                      ...currentMaterial!,
                      imageUrl: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveMaterial}
                  className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 