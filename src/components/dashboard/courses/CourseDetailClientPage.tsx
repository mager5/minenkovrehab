'use client';

// import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { COURSES } from '@/data/courses';
import { MeniscusStagesDetails } from '@/components/dashboard/courses/MeniscusStagesDetails';
import { PlantarFasciopathyDetails } from '@/components/dashboard/courses/PlantarFasciopathyDetails';

type Props = {
  slug: string;
};

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

export default function CourseDetailClientPage({ slug }: Props) {
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

  const course = COURSES.find(item => item.slug === slug);

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

  if (!course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-gray-500'>Курс не найден</div>
      </div>
    );
  }

  const isMeniscusCourse = course.slug === 'meniscus-resection-rehab';
  const isPlantarCourse = course.slug === 'plantar-fasciopathy';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.fullDescription,
    provider: {
      '@type': 'Organization',
      name: 'Миненков Вадим',
      url: 'https://minenkovrehab.ru',
    },
  };

  const rehabPrinciples = [
    {
      title: 'Прогрессия нагрузки',
      description:
        'Постепенное увеличение объёма и сложности упражнений: повторения, подходы, интенсивность, дни тренировок. Основная цель — дать тканям время адаптироваться.',
    },
    {
      title: 'Специфичность',
      description:
        'Упражнения подбираются под конкретные задачи: ходьба по лестнице, бег, работа. Тренируем именно те движения и структуры, которые нужны в жизни и спорте.',
    },
    {
      title: 'Восстановление',
      description:
        'Полноценный сон, питание и управление стрессом. Без восстановления даже правильные упражнения приводят к перегрузке и замедляют реабилитацию.',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              {course.title}
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Детальное описание курса и связанных услуг.
            </p>
          </div>
          <Link
            href='/dashboard/courses'
            className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            Ко всем курсам
          </Link>
        </div>
      </header>

      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10'>
        {isMeniscusCourse ? (
          <div className='space-y-10'>
            <section className='space-y-4'>
              <div className='bg-white rounded-lg shadow overflow-hidden'>
                <div className='relative h-64 w-full sm:h-80'>
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes='(min-width: 1280px) 66vw, 100vw'
                    className='object-cover'
                    priority
                  />
                </div>
                <div className='px-5 py-6 sm:px-6 sm:py-7 space-y-5'>
                  <div className='flex flex-wrap gap-2'>
                    <span className='inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 text-xs font-medium'>
                      1,5–3 месяца
                    </span>
                    <span className='inline-flex items-center rounded-full bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 text-xs font-medium'>
                      5 этапов
                    </span>
                    <span className='inline-flex items-center rounded-full bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 text-xs font-medium'>
                      Домашний формат
                    </span>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='rounded-lg border border-gray-100 bg-white px-4 py-4'>
                      <p className='text-sm font-semibold text-gray-900'>
                        Что включено
                      </p>
                      <ul className='mt-2 space-y-1.5 text-sm text-gray-700'>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500' />
                          Цели и задачи по этапам
                        </li>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500' />
                          Рекомендации и активность
                        </li>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500' />
                          Списки упражнений
                        </li>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500' />
                          Критерии перехода
                        </li>
                      </ul>
                    </div>
                    <div className='rounded-lg border border-gray-100 bg-white px-4 py-4'>
                      <p className='text-sm font-semibold text-gray-900'>
                        Как пользоваться курсом
                      </p>
                      <ul className='mt-2 space-y-1.5 text-sm text-gray-700'>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500' />
                          Выберите этап и следуйте плану
                        </li>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500' />
                          Оценивайте критерии перехода
                        </li>
                        <li className='flex gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500' />
                          Корректируйте объём под самочувствие
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    <a
                      href='#stages'
                      className='inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    >
                      Перейти к этапам
                    </a>
                    <a
                      href='#principles'
                      className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    >
                      Принципы реабилитации
                    </a>
                  </div>
                </div>
              </div>
              <p className='text-xs text-rose-700 flex items-start gap-2 max-w-2xl'>
                <span className='mt-1 h-1.5 w-1.5 rounded-full bg-rose-500' />
                <span>
                  Программа не заменяет очную консультацию. Уточняйте план у
                  врача или реабилитолога.
                </span>
              </p>
            </section>

            <section id='principles' className='space-y-4'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                Принципы физической реабилитации
              </h2>
              <p className='text-sm text-gray-600 max-w-3xl'>
                Чтобы ткани коленного сустава адаптировались к нагрузке,
                соблюдаются три ключевых принципа. Они лежат в основе всех
                упражнений и критериев перехода между этапами.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                {rehabPrinciples.map(principle => (
                  <div
                    key={principle.title}
                    className='bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-2'
                  >
                    <div className='text-sm font-semibold text-gray-900'>
                      {principle.title}
                    </div>
                    <p className='text-sm text-gray-600'>
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div id='stages'>
              <MeniscusStagesDetails />
            </div>
          </div>
        ) : isPlantarCourse ? (
          <PlantarFasciopathyDetails />
        ) : (
          <div className='space-y-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2'>
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                  <div className='relative h-64 w-full sm:h-80'>
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes='(min-width: 1280px) 66vw, 100vw'
                      className='object-cover'
                      priority
                    />
                  </div>
                  <div className='px-5 py-6 sm:px-6 sm:py-7 space-y-4'>
                    <p className='text-base text-gray-700 leading-relaxed'>
                      {course.fullDescription}
                    </p>
                  </div>
                </div>
              </div>
              <aside className='lg:col-span-1 space-y-6'>
                <div className='bg-white rounded-lg shadow p-5 sm:p-6'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-3'>
                    Связанные услуги
                  </h2>
                  <p className='text-sm text-gray-500 mb-4'>
                    Курс опирается на услуги, которые уже представлены на сайте.
                  </p>
                  <ul className='space-y-3'>
                    {course.services.map(service => (
                      <li
                        key={service.id}
                        className='flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5'
                      >
                        <div className='mt-1 h-2 w-2 rounded-full bg-indigo-500' />
                        <div className='text-sm text-gray-800'>
                          <div className='font-medium'>{service.title}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='bg-indigo-50 border border-indigo-100 rounded-lg p-5 sm:p-6'>
                  <h2 className='text-lg font-semibold text-indigo-900 mb-2'>
                    Как начать обучение
                  </h2>
                  <p className='text-sm text-indigo-800 mb-3'>
                    Получите доступ к материалам курса после оплаты
                    соответствующей услуги на сайте.
                  </p>
                  <Link
                    href='/products'
                    className='inline-flex items-center justify-center w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  >
                    Перейти к услугам
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
