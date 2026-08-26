'use client';

import { useState, useEffect } from 'react';
import { getRailwayApiBaseUrl } from '@/lib/api-base';

export default function AdminPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Старый helper через ROBOKASSA_API_URL:
  // const getRailwayApiBaseUrl = () => {
  //   return (
  //     process.env.NEXT_PUBLIC_ROBOKASSA_API_URL ||
  //     'https://api.minenkovrehab.ru'
  //   );
  // };

  const loadData = async (newOffset: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getRailwayApiBaseUrl();
      console.log('Loading data from:', apiUrl);

      const countRes = await fetch(`${apiUrl}/api/admin/users/count`, {
        cache: 'no-store',
      });
      console.log('Count response:', countRes);
      const countData = await countRes.json();
      console.log('Count data:', countData);
      const total = countData.success ? countData.data.totalUsers : 0;
      setTotalUsers(total);

      const listRes = await fetch(
        `${apiUrl}/api/admin/users/list?limit=${limit}&offset=${newOffset}`,
        { cache: 'no-store' }
      );
      console.log('List response:', listRes);
      const listData = await listRes.json();
      console.log('List data:', listData);
      const usersList = listData.success ? listData.data.users : [];
      setUsers(usersList);
      setOffset(newOffset);
    } catch (e) {
      console.error('Error loading data:', e);
      setError(
        `Ошибка при загрузке данных: ${e instanceof Error ? e.message : String(e)}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ru-RU');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-gray-500'>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
            Админ панель
          </h1>
        </div>
      </header>
      <main>
        <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            {error && (
              <div className='mb-6 p-4 bg-red-50 text-red-700 rounded-lg'>
                {error}
              </div>
            )}

            <div className='mb-6 bg-white p-6 rounded-lg shadow'>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Статистика
              </h2>
              <p className='text-gray-700'>
                Всего пользователей:{' '}
                <span className='font-bold text-indigo-600'>{totalUsers}</span>
              </p>
            </div>

            {users.length > 0 && (
              <>
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Email
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Имя
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Дата регистрации
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Всего покупок
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Активных покупок
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {users.map(user => (
                          <tr key={user.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {user.email}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {user.full_name || '-'}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {formatDate(user.created_at)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {user.total_purchases}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {user.active_purchases}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className='px-6 py-4 border-t border-gray-200 flex justify-between items-center'>
                    <button
                      onClick={() => loadData(Math.max(0, offset - limit))}
                      disabled={offset === 0}
                      className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Назад
                    </button>
                    <span className='text-sm text-gray-500'>
                      Показано {offset + 1}-
                      {Math.min(offset + limit, totalUsers || 0)} из{' '}
                      {totalUsers}
                    </span>
                    <button
                      onClick={() => loadData(offset + limit)}
                      disabled={
                        totalUsers !== null && offset + limit >= totalUsers
                      }
                      className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Вперед
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
