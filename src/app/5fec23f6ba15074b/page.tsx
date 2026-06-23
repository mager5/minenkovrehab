import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ панель | Миненков Вадим',
  description: 'Управление пользователями',
};

async function getUsersData(offset: number = 0, limit: number = 20) {
  const apiUrl =
    process.env.NEXT_PUBLIC_ROBOKASSA_API_URL || 'https://api.minenkovrehab.ru';

  try {
    const countRes = await fetch(`${apiUrl}/api/admin/users/count`, {
      cache: 'no-store',
    });
    const countData = await countRes.json();
    const totalUsers = countData.success ? countData.data.totalUsers : 0;

    const listRes = await fetch(
      `${apiUrl}/api/admin/users/list?limit=${limit}&offset=${offset}`,
      { cache: 'no-store' }
    );
    const listData = await listRes.json();
    const users = listData.success ? listData.data.users : [];

    return { totalUsers, users, error: null };
  } catch (e) {
    return { totalUsers: 0, users: [], error: 'Ошибка при загрузке данных' };
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { offset?: string };
}) {
  const offset = Number(searchParams.offset) || 0;
  const limit = 20;
  const { totalUsers, users, error } = await getUsersData(offset, limit);

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
                        {users.map((user: any) => (
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
                      onClick={() => {
                        if (offset > 0) {
                          window.location.href = `/5fec23f6ba15074b?offset=${offset - limit}`;
                        }
                      }}
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
                      onClick={() => {
                        if (
                          totalUsers !== null &&
                          offset + limit < totalUsers
                        ) {
                          window.location.href = `/5fec23f6ba15074b?offset=${offset + limit}`;
                        }
                      }}
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
