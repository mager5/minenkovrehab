'use client';

import { useState, useEffect } from 'react';

function getRailwayApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'https://api.minenkovrehab.ru'
  );
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  total_purchases: number;
  active_purchases: number;
}

interface AdminUsersClientPageProps {
  adminSecret: string;
}

export default function AdminUsersClientPage({
  adminSecret,
}: AdminUsersClientPageProps) {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadData(0);
  }, [adminSecret]);

  const loadData = async (newOffset: number = 0) => {
    if (!adminSecret) return;

    setLoading(true);
    setError('');

    try {
      // Load count
      const countResponse = await fetch(
        `${getRailwayApiBaseUrl()}/api/admin/users/count?secret=${encodeURIComponent(adminSecret)}`
      );
      const countPayload = await countResponse.json();
      if (!countResponse.ok || !countPayload?.success) {
        throw new Error(
          countPayload?.error || 'Ошибка загрузки количества пользователей'
        );
      }
      setTotalUsers(countPayload.data.totalUsers);

      // Load list
      const listResponse = await fetch(
        `${getRailwayApiBaseUrl()}/api/admin/users/list?secret=${encodeURIComponent(adminSecret)}&limit=${limit}&offset=${newOffset}`
      );
      const listPayload = await listResponse.json();
      if (!listResponse.ok || !listPayload?.success) {
        throw new Error(
          listPayload?.error || 'Ошибка загрузки списка пользователей'
        );
      }
      setUsers(listPayload.data.users || []);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(0);
  };

  const handlePrev = () => {
    if (offset > 0) {
      loadData(Math.max(0, offset - limit));
    }
  };

  const handleNext = () => {
    loadData(offset + limit);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ru-RU');
    } catch {
      return dateStr;
    }
  };

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

            {/* Stats */}
            {totalUsers !== null && (
              <div className='mb-6 bg-white p-6 rounded-lg shadow'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  Статистика
                </h2>
                <p className='text-gray-700'>
                  Всего пользователей:{' '}
                  <span className='font-bold text-indigo-600'>
                    {totalUsers}
                  </span>
                </p>
              </div>
            )}

            {/* Users table */}
            {users.length > 0 && (
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

                {/* Pagination */}
                <div className='px-6 py-4 border-t border-gray-200 flex justify-between items-center'>
                  <button
                    onClick={handlePrev}
                    disabled={offset === 0 || loading}
                    className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Назад
                  </button>
                  <span className='text-sm text-gray-500'>
                    Показано {offset + 1}-
                    {Math.min(offset + limit, totalUsers || 0)} из {totalUsers}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={
                      (totalUsers !== null && offset + limit >= totalUsers) ||
                      loading
                    }
                    className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Вперед
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className='text-center py-12'>
                <div className='text-gray-500'>Загрузка...</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
