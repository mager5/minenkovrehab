import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Video } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Получаем покупки пользователя
  const { data: purchases } = await supabase
    .from('purchases')
    .select(
      `
      *,
      products (
        title,
        description
      )
    `
    )
    .eq('user_id', user.id)
    .eq('status', 'active');

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center'>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
            Личный кабинет
          </h1>
        </div>
      </header>
      <main>
        <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8'>
              <Link
                href='/dashboard/videos'
                className='bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow group cursor-pointer block'
              >
                <div className='flex items-center space-x-4'>
                  <div className='bg-indigo-100 p-3 rounded-full group-hover:bg-indigo-200 transition-colors'>
                    <Video className='h-6 w-6 text-indigo-600' />
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Видеогалерея
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Загрузить и смотреть видео
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            <h2 className='text-xl font-semibold mb-4'>Мои курсы</h2>

            {!purchases || purchases.length === 0 ? (
              <div className='bg-white overflow-hidden shadow rounded-lg p-6 text-center text-gray-500'>
                У вас пока нет активных курсов.
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {purchases.map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className='bg-white overflow-hidden shadow rounded-lg'
                  >
                    <div className='px-4 py-5 sm:p-6'>
                      <h3 className='text-lg font-medium leading-6 text-gray-900'>
                        {purchase.products.title}
                      </h3>
                      <p className='mt-1 text-sm text-gray-500'>
                        {purchase.products.description}
                      </p>
                      <div className='mt-4'>
                        <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                          Смотреть курс
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
