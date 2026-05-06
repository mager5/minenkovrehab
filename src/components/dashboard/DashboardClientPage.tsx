'use client';

// import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Video } from 'lucide-react';
import { COURSES } from '@/data/courses';
import { useEffect, useState } from 'react';

function getRailwayApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
  }

  return (
    process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
    'https://minenkovrehab-production-15cc.up.railway.app'
  );
}

export default function DashboardClientPage() {
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // const {
        //   data: { user },
        // } = await supabase.auth.getUser();
        //
        // if (!user) {
        //   router.push('/login');
        //   return;
        // }
        //
        // setUser(user);
        //
        // // Получаем покупки пользователя
        // const { data: purchasesData } = await supabase
        //   .from('purchases')
        //   .select(
        //     `
        //     *,
        //     products (
        //       title,
        //       description
        //     )
        //   `
        //   )
        //   .eq('user_id', user.id)
        //   .eq('status', 'active');
        //
        // setPurchases(purchasesData || []);

        const meResponse = await fetch(
          `${getRailwayApiBaseUrl()}/api/auth/me`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const mePayload = await meResponse.json().catch(() => null);

        if (
          !meResponse.ok ||
          !mePayload?.success ||
          !mePayload?.data?.user?.id
        ) {
          router.push('/login');
          return;
        }

        setUser(mePayload.data.user);

        const purchasesResponse = await fetch(
          `${getRailwayApiBaseUrl()}/api/auth/purchases`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const purchasesPayload = await purchasesResponse
          .json()
          .catch(() => null);
        if (purchasesResponse.ok && purchasesPayload?.success) {
          setPurchases(purchasesPayload?.data?.purchases || []);
        } else {
          setPurchases([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-gray-500'>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const visibleCourses = COURSES.filter(
    course => course.slug !== 'plantar-fasciopathy'
  );

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
              {/*
                Видеогалерея пользователям не нужна (оставлено закомментированным по просьбе).
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
              */}
            </div>

            <div className='flex items-center justify-between mb-4 gap-3 flex-wrap'>
              <h2 className='text-xl font-semibold'>Мои курсы</h2>
              <div className='flex items-center gap-4 text-sm text-gray-500'>
                <span>
                  Активных курсов:{' '}
                  <span className='font-medium'>
                    {purchases ? purchases.length : 0}
                  </span>
                </span>
                <Link
                  href='/dashboard/courses'
                  className='inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700'
                >
                  Перейти к списку курсов
                </Link>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {/*
                Старый вариант (оставлен для истории):
                {COURSES.map(course => (
                  <Link
                    key={course.slug}
                    href={`/dashboard/courses/${course.slug}`}
                    className='bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 group'
                  >
                    <div className='relative h-32 w-full sm:h-40'>
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                        className='object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity' />
                    </div>
                    <div className='px-4 py-4 sm:px-5 sm:py-5'>
                      <h3 className='text-lg font-medium text-gray-900 mb-1'>
                        {course.title}
                      </h3>
                      <p className='text-sm text-gray-500 line-clamp-3'>
                        {course.shortDescription}
                      </p>
                    </div>
                  </Link>
                ))}
              */}
              {visibleCourses.map(course => (
                <Link
                  key={course.slug}
                  href={`/dashboard/courses/${course.slug}`}
                  className='bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 group'
                >
                  <div className='relative h-32 w-full sm:h-40'>
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                      className='object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity' />
                  </div>
                  <div className='px-4 py-4 sm:px-5 sm:py-5'>
                    <h3 className='text-lg font-medium text-gray-900 mb-1'>
                      {course.title}
                    </h3>
                    <p className='text-sm text-gray-500 line-clamp-3'>
                      {course.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
