'use client';

// import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { COURSES } from '@/data/courses';
import { MeniscusStagesDetails } from '@/components/dashboard/courses/MeniscusStagesDetails';
import { PlantarFasciopathyDetails } from '@/components/dashboard/courses/PlantarFasciopathyDetails';
import { ChevronDown } from 'lucide-react';

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
  const [openPrinciples, setOpenPrinciples] = useState({
    progression: false,
    specificity: false,
    recovery: false,
  });
  const [meniscusStageId, setMeniscusStageId] = useState<1 | 2 | 3 | 4 | 5>(1);
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
  const meniscusStages = [
    { id: 1 as const, title: '1 ЭТАП – Острый', period: '0–2 недели' },
    {
      id: 2 as const,
      title: '2 ЭТАП – Ранний восстановительный',
      period: '2–4 недели',
    },
    {
      id: 3 as const,
      title: '3 ЭТАП – Поздний восстановительный',
      period: '4–8 недель',
    },
    { id: 4 as const, title: '4 ЭТАП – Функциональный', period: '8–12 недель' },
    { id: 5 as const, title: '5 ЭТАП – Тренировочный', period: '3–4 месяца' },
  ];

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

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              {course.slug === 'meniscus-resection-rehab'
                ? 'Резекция мениска. Восстановительная программа (Занимает 1,5-3 месяца)'
                : course.title}
            </h1>
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
            <section className='max-w-5xl space-y-8'>
              <div className='rounded-2xl border border-gray-100 bg-white shadow-sm px-5 py-6 sm:px-7 sm:py-7 space-y-4'>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  Данный раздел сайта представляет собой собрание
                  аудиовизуальных и текстовых материалов моего личного
                  авторства. Меня зовут Миненков Вадим Леонидович, я —
                  инструктор методист ЛФК (специалист по физической реабилитации
                  и спортивной тренировке)
                </p>

                <p className='text-sm sm:text-base font-semibold text-gray-900 leading-relaxed'>
                  Что такое &quot;восстановительная программа&quot; в нашем
                  случае?
                </p>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  Восстановительная программа — это структурированная
                  последовательность этапов восстановления после резекции
                  мениска. Это своего рода &quot;дорожная карта&quot;, которая
                  помогает понимать, какие задачи стоят на каждом этапе, как
                  двигаться вперёд и какие ориентиры учитывать. Это не строгое
                  правило, а скорее логичный и обоснованный путь восстановления,
                  проверенный практикой.
                </p>

                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  Материалы, представленные на канале, не противоречат
                  официальным клиническим рекомендациям. Напротив — они
                  дополняют их, раскрывая нюансы и детали, которые часто
                  остаются &quot;за кадром&quot;.
                </p>

                <p className='text-sm sm:text-base font-semibold text-gray-900 leading-relaxed'>
                  При этом они не могут использоваться без предварительной
                  консультации с лечащим врачом.
                </p>

                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  Весь контент является компиляцией — собранной информацией из
                  различных источников: методических пособий, бумажных изданий,
                  планов лечения, а также рекомендаций врачей и моего
                  собственного опыта практической работы.
                </p>

                <p className='text-sm sm:text-base font-semibold text-gray-900 leading-relaxed'>
                  Важно понимать:
                </p>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  <strong>
                    Доступ к материалам не является назначением лечения и не
                    заменяет очную консультацию со специалистом.
                  </strong>{' '}
                  Материалы программы{' '}
                  <strong>
                    не учитывают индивидуальные особенности организма и
                    состояния здоровья каждого конкретного человека.
                  </strong>
                </p>

                <p className='text-sm sm:text-base font-semibold text-gray-900 leading-relaxed'>
                  Перед выполнением любых упражнений обязательно
                  проконсультируйтесь с лечащим врачом или специалистом по
                  реабилитации.
                </p>

                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  Восстановительная программа ниже представлена в текстовом
                  формате. И так же представлены видео упражнений для первых 3-х
                  этапов. С первого дня после операции до возвращения к ранней
                  беговой активности (бег трусцой). Далее, при переходе к
                  последующим двум этапам, выбор нагрузок и конкретных
                  упражнений должен строиться с учётом индивидуальной специфики
                  вида спорта и профессиональной активности. В связи с этим, в
                  программе не закреплены конкретные упражнения для этих этапов,
                  так как их содержание будет значительно варьироваться в
                  зависимости от профессиональных целей, вида спорта и
                  индивидуальных потребностей.
                </p>
              </div>

              <div className='rounded-2xl border border-gray-100 bg-white shadow-sm px-5 py-6 sm:px-7 sm:py-7 space-y-5'>
                <h2 className='text-xl sm:text-2xl font-semibold tracking-tight text-gray-900'>
                  Что такое резекция мениска
                </h2>
                <p className='text-base text-gray-700 leading-relaxed mb-3'>
                  Резекция мениска – это хирургическая операция, направленная на
                  удаление поврежденной части мениска в коленном суставе
                </p>
                <p className='text-base text-gray-700 leading-relaxed'>
                  Резекция мениска может быть частичной/парциальной (удаляется
                  только часть мениска) и полной (удаляется весь мениск)
                </p>

                <p className='text-base font-semibold text-gray-900'>
                  Реабилитация состоит из 5 этапов
                </p>
                <ul className='space-y-2 text-sm sm:text-base text-gray-700 list-disc pl-5'>
                  {meniscusStages.map(stage => (
                    <li key={stage.id}>
                      <a
                        href='#stages'
                        className='text-indigo-700 hover:text-indigo-800 hover:underline font-medium'
                        onClick={event => {
                          event.preventDefault();
                          setMeniscusStageId(stage.id);
                          const nextUrl = `${window.location.pathname}${window.location.search}`;
                          window.history.replaceState({}, '', nextUrl);
                          document.getElementById('stages')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }}
                      >
                        {stage.title}
                      </a>
                      <span className='text-gray-600'>. {stage.period}</span>
                    </li>
                  ))}
                </ul>
                <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                  *Данные сроки являются ориентировочными и не могут корректно
                  соответствовать каждому случаю. В зависимости от исходной
                  точки, поставленных целей и задач, сроки реабилитации могут в
                  значительной степени отличаться
                </p>

                <ul className='space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed'>
                  <li>
                    Позднего восстановительного этапа будет достаточно
                    большинству людей, чья повседневная активность не связана с
                    высокими физическими нагрузками (работа в офисе, легкие
                    домашние обязанности или умеренная физическая активность, не
                    требующая интенсивных нагрузок на коленный сустав)
                  </li>
                  <li>
                    Функциональный этап потребуется тем, кто планирует вернуться
                    к активной физической нагрузке, включая спортивные занятия с
                    умеренной интенсивностью или профессиональную деятельность,
                    связанную с физическими усилиями, но без экстремальных
                    нагрузок (езда на велосипеде, бег по ровной поверхности)
                  </li>
                  <li>
                    Тренировочный этап необходим тем, кто планирует вернуться к
                    интенсивному спорту (лыжи, футбол, баскетбол, бег по
                    пересеченной местности) или профессии, предполагающие
                    высокие физические нагрузки (где важна высокая выносливость,
                    сила и скорость реакции). «Реабилитация спортсменов, как
                    правило происходит значительно быстрее, поэтому переход на
                    следующий этап осуществляется по достижению критериев для
                    перехода, без строгой привязки к обозначенным временным
                    отрезкам»
                  </li>
                </ul>

                <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                  Так же на сроки восстановления могут повлиять следующие
                  факторы: возраст, физическая подготовка, объем оперативного
                  вмешательства, состояние окружающих тканей, локализация
                  поврежденного мениска (латеральный, медиальный), зона
                  повреждения мениска (передний рог, тело, задний рог),
                  сопутствующие патологии, осложнения, уровень комплаентности,
                  психологическое состояние и прочее.
                </p>
              </div>

              <div className='rounded-2xl border border-gray-100 bg-white shadow-sm px-5 py-6 sm:px-7 sm:py-7'>
                <h2 className='text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 mb-2'>
                  Принципы физической реабилитации
                </h2>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line mb-5'>
                  При выполнении физических упражнений организм подвергается
                  воздействию (механических, биохимических и
                  нейрофизиологических) стимулов, которые инициируют процессы
                  адаптации в тканях. В результате этих адаптаций происходит
                  повышение толерантности тканей к нагрузкам, что приводит к
                  увеличению их функциональной прочности и устойчивости к
                  повреждениям.
                </p>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed mb-4'>
                  Для реализации данной формулы необходимо соблюдать основные
                  принципы физической реабилитации:
                </p>

                <button
                  type='button'
                  className='w-full bg-transparent py-2 flex items-center justify-between text-left group'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      progression: !prev.progression,
                    }))
                  }
                  aria-expanded={openPrinciples.progression}
                >
                  <span className='text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors'>
                    1. Принцип прогрессии нагрузки
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${openPrinciples.progression ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.progression && (
                  <p className='text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line mb-5'>
                    Принцип прогрессии нагрузки – это постепенное увеличение
                    нагрузки (от простого к сложному). Посредством: увеличения
                    числа упражнений в комплексе, количества повторений,
                    подходов, тренировочных дней, режима работы (изометрический,
                    изотонический), интенсивности, сложности упражнений,
                    регуляции времени отдыха между подходами. Основная задача:
                    подбор упражнений, соответствующих исходной точке с
                    выстраиванием прогресса в них (чтобы структуры сустава могли
                    адаптироваться к новым условиям)
                  </p>
                )}

                <button
                  type='button'
                  className='w-full bg-transparent py-2 flex items-center justify-between text-left group'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      specificity: !prev.specificity,
                    }))
                  }
                  aria-expanded={openPrinciples.specificity}
                >
                  <span className='text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors'>
                    2. Принцип специфичности
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${openPrinciples.specificity ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.specificity && (
                  <p className='text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line mb-5'>
                    Для развития конкретных навыков и улучшения функциональности
                    в определённом виде активности, необходимо выполнять
                    упражнения и действия, которые максимально имитируют эту
                    активность. Это означает, что тренировка должна быть
                    направлена на развитие именно тех движений, мышц и
                    энергосистем, которые задействуются в конкретной задаче или
                    виде спорта. Пример: если наша задача выполнять подъем и
                    спуск по лестнице без боли и дискомфорта, мы должны
                    выполнять аналогичные подводящие упражнения (шаги на степ
                    платформу, полуприседы на одной ноге и тд.), руководствуясь
                    правилом прогрессии (подбирать сложность упражнения согласно
                    функциональному уровню готовности структур)
                  </p>
                )}

                <button
                  type='button'
                  className='w-full bg-transparent py-2 flex items-center justify-between text-left group mb-2'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      recovery: !prev.recovery,
                    }))
                  }
                  aria-expanded={openPrinciples.recovery}
                >
                  <span className='text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors'>
                    3. Принцип восстановления
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${openPrinciples.recovery ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.recovery && (
                  <p className='text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line mb-5'>
                    Для того, чтобы на полученные стимулы от упражнений,
                    произошли нужные нам адаптации, организм должен получить
                    достаточное время и условия для восстановления. Основные
                    компоненты: полноценный сон (не менее 8 часов), минимизация
                    психологического стресса, полноценный рацион питания (с
                    достаточным содержанием БЖУ и микроэлементов). Слишком
                    частые нагрузки без должного восстановления повышают риск
                    перегрузки (рецидив, травмы, ухудшение результатов)
                  </p>
                )}

                <p className='text-sm sm:text-base text-gray-700 leading-relaxed mb-3'>
                  На начальном этапе реабилитации (острый и ранний
                  восстановительный этапы) упражнения на травмированный сегмент
                  выполняются ежедневно (за исключением 1–2 дней отдыха в
                  неделю). Это связано с тем, что на этих этапах нагрузки
                  недостаточно интенсивны, чтобы требовать отдельного дня
                  восстановления для адаптации после выполнения комплекса.
                  Основное внимание уделяется легким упражнениям, направленным
                  на улучшение трофических процессов, восстановление амплитуды
                  движения коленного сустава и укрепления мышц за счёт
                  преимущественно изометрических упражнений
                </p>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed mb-3'>
                  По мере прогресса и перехода к более поздним этапам
                  реабилитации, нагрузка увеличивается. Упражнения становятся
                  более интенсивными и направленными на развитие силы,
                  выносливости и мощности поврежденного сегмента. В связи с этим
                  меняется и режим выполнения: комплекс упражнений выполняется
                  3–4 раза в неделю, что позволяет организму полноценно
                  адаптироваться и восстанавливаться после каждой тренировки. Но
                  если задача вернуть спортсмена к его профессиональной
                  нагрузке, то в дни отдыха от работы с основным сегментом,
                  выполняется аэробная нагрузка (вело, эллипс, дорожка, бассейн)
                  и тренировка периферических сегментов (верх тела). Это
                  позволяет спортсмену быстрей набрать функциональные кондиции и
                  предотвратить детренированность
                </p>
                <p className='text-sm sm:text-base text-gray-700 leading-relaxed mb-5'>
                  В профессиональном спорте можно встретить ситуации, где на
                  сроке 3-4 недели после операции спортсмен завершает свою
                  реабилитацию и возвращается к спортивной деятельности. Важно
                  отметить, что это не является нормой и для людей «не
                  спортсменов» ни в коем случае не стоит брать пример с
                  профессионалов (в копирование графиков восстановления и
                  объемов нагрузки). Для профессионала это часть работы, где
                  форсирование реабилитационного процесса обусловлено спецификой
                  их деятельности и данный шаг сопряжен с осознанным риском
                </p>

                <blockquote className='text-sm sm:text-base font-medium text-gray-900 leading-relaxed'>
                  «Реабилитация после резекции мениска — это не вопрос времени,
                  а вопрос достижений. Просто ожидание окончания этапов не
                  гарантирует восстановления. Только через последовательное
                  выполнение упражнений и корректное увеличение нагрузки можно
                  достичь полноценного восстановления функции сустава. Время без
                  усилий не восстановит функциональность колена!»
                </blockquote>
              </div>
            </section>

            <div id='stages'>
              <MeniscusStagesDetails
                activeStageId={meniscusStageId}
                onActiveStageIdChange={setMeniscusStageId}
              />
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
