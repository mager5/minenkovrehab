'use client';

import { COURSES } from '@/data/courses';
import { CoursesList } from '@/components/dashboard/courses/CoursesList';
// import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getRailwayApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
    'https://minenkovrehab-production-15cc.up.railway.app'
  );
}

export default function CoursesClientPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  // const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser();
      //
      // if (!user) {
      //   router.push('/login');
      //   return;
      // }
      // setUser(user);
      // setLoading(false);

      try {
        const response = await fetch(`${getRailwayApiBaseUrl()}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.success || !payload?.data?.user?.id) {
          router.push('/login');
          return;
        }

        setUser(payload.data.user);
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
    return null;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: COURSES.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://minenkovrehab.ru/dashboard/courses/${course.slug}`,
      name: course.title,
    })),
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              Курсы
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Выберите курс, чтобы открыть подробное описание и материалы.
            </p>
          </div>
        </div>
      </header>
      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <CoursesList courses={COURSES} />
      </main>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
