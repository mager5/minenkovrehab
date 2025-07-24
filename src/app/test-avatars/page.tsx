'use client';

import { useEffect, useState } from 'react';

export default function TestAvatars() {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch('/api/heygen/avatars');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setAvatars(data.avatars || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching avatars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  if (loading) {
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold mb-4'>Тестирование API аватаров</h1>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        <p>Загрузка списка аватаров...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold mb-4'>Тестирование API аватаров</h1>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          <strong>Ошибка:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Доступные аватары HeyGen</h1>

      {avatars.length === 0 ? (
        <p className='text-gray-600'>Аватары не найдены</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {avatars.map((avatar, index) => (
            <div
              key={avatar.avatar_id || index}
              className='border rounded-lg p-4 shadow'
            >
              <h3 className='font-semibold text-lg mb-2'>
                {avatar.pose_name || 'Без названия'}
              </h3>
              <p className='text-sm text-gray-600 mb-2'>
                <strong>ID:</strong> {avatar.avatar_id}
              </p>
              {avatar.normal_preview && (
                <img
                  src={avatar.normal_preview}
                  alt={avatar.pose_name}
                  className='w-full h-32 object-cover rounded mb-2'
                />
              )}
              <div className='text-xs text-gray-500'>
                <p>
                  <strong>Публичный:</strong> {avatar.is_public ? 'Да' : 'Нет'}
                </p>
                <p>
                  <strong>Статус:</strong> {avatar.status}
                </p>
                {avatar.default_voice && (
                  <p>
                    <strong>Голос по умолчанию:</strong> {avatar.default_voice}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='mt-8 p-4 bg-gray-100 rounded'>
        <h2 className='font-semibold mb-2'>Информация для разработчика:</h2>
        <p>
          <strong>Всего аватаров:</strong> {avatars.length}
        </p>
        <details className='mt-2'>
          <summary className='cursor-pointer text-blue-600'>
            Показать JSON
          </summary>
          <pre className='mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-64'>
            {JSON.stringify(avatars, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
