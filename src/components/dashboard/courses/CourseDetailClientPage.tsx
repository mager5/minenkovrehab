'use client';

// Страница программы в кабинете (концепт 2 «Мягкая забота»).
// Доступ проверяется на сервере (app/dashboard/courses/[slug]/page.tsx), здесь — только вёрстка.
// Последний открытый этап запоминается в localStorage (без него всё работает, открывается 1 этап).
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { COURSES } from '@/data/courses';
import { MeniscusStagesDetails } from '@/components/dashboard/courses/MeniscusStagesDetails';
import { PlantarFasciopathyDetails } from '@/components/dashboard/courses/PlantarFasciopathyDetails';
import { getRailwayApiBaseUrl } from '@/lib/api-base';
import { readLastStage, saveLastStage } from '@/lib/course-progress';
import { PageHead } from '@/components/ds/Layout';
import { Icon } from '@/components/ds/Icon';
import { ButtonLink } from '@/components/ds/Button';
import NoticePage from '@/components/shared/NoticePage';

type Props = {
  slug: string;
};

type StageId = 1 | 2 | 3 | 4 | 5;

export default function CourseDetailClientPage({ slug }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [openPrinciples, setOpenPrinciples] = useState({
    progression: false,
    specificity: false,
    recovery: false,
    individuality: false,
    trialLoad: false,
  });
  const [meniscusStageId, setMeniscusStageIdState] = useState<StageId>(1);
  const router = useRouter();

  const setMeniscusStageId = (id: StageId) => {
    setMeniscusStageIdState(id);
    saveLastStage(slug, id);
  };

  useEffect(() => {
    const saved = readLastStage(slug, 5);
    if (saved) setMeniscusStageIdState(saved as StageId);
  }, [slug]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(`${getRailwayApiBaseUrl()}/api/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success || !payload?.data?.user?.id) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
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
      <div className='ds-wrap pt-6 pb-[var(--sec)]'>
        <div className='ds-card p-8 text-muted' role='status'>
          Загрузка…
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!course) {
    return (
      <NoticePage
        title='Курс не найден'
        icon='book'
        tone='sky'
        primary={{ href: '/dashboard', label: 'В личный кабинет' }}
      >
        Такой программы нет в личном кабинете. Список ваших программ — на
        главной странице кабинета.
      </NoticePage>
    );
  }

  const isMeniscusCourse = course.slug === 'meniscus-resection-rehab';
  const isPlantarCourse = course.slug === 'plantar-fasciopathy';
  const meniscusStages = [
    { id: 1 as const, title: '1 ЭТАП – Острый', period: '0–2 недели' },
    { id: 2 as const, title: '2 ЭТАП – Ранний восстановительный', period: '2–4 недели' },
    { id: 3 as const, title: '3 ЭТАП – Поздний восстановительный', period: '4–8 недель' },
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

  const crumbs = [
    { label: 'Личный кабинет', href: '/dashboard' },
    { label: 'Мои программы', href: '/dashboard/courses' },
    { label: course.shortTitle || course.title },
  ];

  return (
    <div className='pb-[var(--sec)]'>
      <PageHead
        crumbs={crumbs}
        title={course.cabinetTitle || course.title}
        lead={
          isMeniscusCourse
            ? `${course.shortDescription} Занимает 1,5–3 месяца.`
            : course.shortDescription
        }
        extra={
          <div className='flex flex-wrap gap-2.5 mt-6'>
            <span className='ds-badge bg-mint text-mint-ink'>Доступ открыт</span>
            {isMeniscusCourse ? (
              <>
                <span className='ds-badge bg-white text-navy'>5 этапов</span>
                <span className='ds-badge bg-white text-navy'>Видео упражнений 1–3 этапов</span>
              </>
            ) : null}
          </div>
        }
      />

      {isMeniscusCourse ? (
        <>
          <section className='ds-wrap ds-sec'>
            <div className='ds-card p-[22px] dsk:px-9 dsk:py-8'>
              <h2 className='m-0 mb-3 text-[24px] dsk:text-[26px] font-extrabold text-navy'>
                Прежде чем начать
              </h2>
              <p className='m-0'>
                Данный раздел сайта — собрание аудиовизуальных и текстовых
                материалов моего личного авторства. Восстановительная программа
                — это своего рода «дорожная карта»: какие задачи стоят на каждом
                этапе, как двигаться вперёд и какие ориентиры учитывать.
              </p>
              <div className='flex gap-3.5 mt-[18px] px-5 py-[18px] rounded-[20px] bg-[#FFF6E5] shadow-[inset_0_0_0_1px_#F3DDB0]'>
                <span
                  aria-hidden='true'
                  className='flex-none w-10 h-10 rounded-xl bg-[#FFE8BD] flex items-center justify-center'
                >
                  <Icon name='alert' size={20} color='var(--c-warn-ink)' />
                </span>
                <p className='m-0 text-[17px] text-[#4A3A1A]'>
                  <strong>
                    Доступ к материалам не является назначением лечения
                  </strong>{' '}
                  и не заменяет очную консультацию. Перед выполнением любых
                  упражнений обязательно проконсультируйтесь с лечащим врачом
                  или специалистом по реабилитации.
                </p>
              </div>
              <div className='flex flex-col gap-2.5 mt-[18px]'>
                <Accordion title='О программе подробнее'>
                <p className='m-0 mt-3'>
                  Данный раздел сайта представляет собой собрание
                  аудиовизуальных и текстовых материалов моего личного
                  авторства. Меня зовут Миненков Вадим Леонидович, я —
                  инструктор методист ЛФК (специалист по физической реабилитации
                  и спортивной тренировке)
                </p>

                <p className='m-0 mt-3 font-bold text-ink'>
                  Что такое &quot;восстановительная программа&quot; в нашем
                  случае?
                </p>
                <p className='m-0 mt-3'>
                  Восстановительная программа — это структурированная
                  последовательность этапов восстановления после резекции
                  мениска. Это своего рода &quot;дорожная карта&quot;, которая
                  помогает понимать, какие задачи стоят на каждом этапе, как
                  двигаться вперёд и какие ориентиры учитывать. Это не строгое
                  правило, а скорее логичный и обоснованный путь восстановления,
                  проверенный практикой.
                </p>

                <p className='m-0 mt-3'>
                  Материалы, представленные в программе, не противоречат
                  официальным клиническим рекомендациям. Напротив — они
                  дополняют их, раскрывая нюансы и детали, которые часто
                  остаются &quot;за кадром&quot;.
                </p>

                <p className='m-0 mt-3 font-bold text-ink'>
                  При этом они не могут использоваться без предварительной
                  консультации с лечащим врачом.
                </p>

                <p className='m-0 mt-3'>
                  Весь контент является компиляцией — собранной информацией из
                  различных источников: методических пособий, бумажных изданий,
                  планов лечения, а также рекомендаций врачей и моего
                  собственного опыта практической работы.
                </p>

                <p className='m-0 mt-3 font-bold text-ink'>
                  Важно понимать:
                </p>
                <p className='m-0 mt-3'>
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

                <p className='m-0 mt-3 font-bold text-ink'>
                  Перед выполнением любых упражнений обязательно
                  проконсультируйтесь с лечащим врачом или специалистом по
                  реабилитации.
                </p>

                <p className='m-0 mt-3'>
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
                </Accordion>
                <Accordion title='Что такое резекция мениска и сколько длится восстановление'>
                <p className='m-0 mt-3'>
                  Резекция мениска – это хирургическая операция, направленная на
                  удаление поврежденной части мениска в коленном суставе
                </p>
                <p className='m-0 mt-3'>
                  Резекция мениска может быть частичной/парциальной (удаляется
                  только часть мениска) и полной (удаляется весь мениск)
                </p>

                <p className='m-0 mt-4 font-bold text-ink'>
                  Реабилитация состоит из 5 этапов
                </p>
                <ul className='mt-3 mb-0 pl-6 list-disc flex flex-col gap-1.5'>
                  {meniscusStages.map(stage => (
                    <li key={stage.id}>
                      <a
                        href='#stages'
                        className='text-brand font-bold underline hover:text-navy'
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
                      <span className='text-muted'>. {stage.period}</span>
                    </li>
                  ))}
                </ul>
                <p className='m-0 mt-3 text-[15px] text-muted'>
                  *Данные сроки являются ориентировочными и не могут корректно
                  соответствовать каждому случаю. В зависимости от исходной
                  точки, поставленных целей и задач, сроки реабилитации могут в
                  значительной степени отличаться
                </p>

                <ul className='mt-3 mb-0 pl-6 list-disc flex flex-col gap-2.5'>
                  <li>
                    <strong>Позднего восстановительного этапа</strong> будет
                    достаточно большинству людей, чья повседневная активность не
                    связана с высокими физическими нагрузками (
                    <em>
                      работа в офисе, легкие домашние обязанности или умеренная
                      физическая активность, не требующая интенсивных нагрузок
                      на коленный сустав
                    </em>
                    )
                  </li>
                  <li>
                    <strong>Функциональный этап</strong> потребуется тем, кто
                    планирует вернуться к активной физической нагрузке, включая
                    спортивные занятия с умеренной интенсивностью или
                    профессиональную деятельность, связанную с физическими
                    усилиями, но без экстремальных нагрузок (
                    <em>езда на велосипеде, бег по ровной поверхности</em>)
                  </li>
                  <li>
                    <strong>Тренировочный этап</strong> необходим тем, кто
                    планирует вернуться к интенсивному спорту (
                    <em>
                      лыжи, футбол, баскетбол, бег по пересеченной местности
                    </em>
                    ) или профессии, предполагающие высокие физические нагрузки
                    (
                    <em>
                      где важна высокая выносливость, сила и скорость реакции
                    </em>
                    ). «Реабилитация спортсменов, как правило происходит
                    значительно быстрее, поэтому переход на следующий этап
                    осуществляется по достижению критериев для перехода, без
                    строгой привязки к обозначенным временным отрезкам»
                  </li>
                </ul>

                <p className='m-0 mt-3'>
                  <strong>
                    Так же на сроки восстановления могут повлиять следующие
                    факторы:
                  </strong>{' '}
                  возраст, физическая подготовка, объем оперативного
                  вмешательства, состояние окружающих тканей, локализация
                  поврежденного мениска (<em>латеральный, медиальный</em>), зона
                  повреждения мениска (<em>передний рог, тело, задний рог</em>),
                  сопутствующие патологии, осложнения, уровень комплаентности,
                  психологическое состояние и прочее.
                </p>
                </Accordion>
                <Accordion title='Принципы физической реабилитации'>
                <p className='m-0 mt-2 mb-2 px-1 whitespace-pre-line'>
                  При выполнении физических упражнений организм подвергается
                  воздействию (
                  <em>механических, биохимических и нейрофизиологических</em>){' '}
                  <u>стимулов</u>, которые инициируют процессы <u>адаптации</u>{' '}
                  в тканях. В результате этих адаптаций происходит повышение{' '}
                  <u>толерантности</u> тканей к нагрузкам, что приводит к
                  увеличению их функциональной прочности и устойчивости к
                  повреждениям.
                </p>
                <p className='m-0 mt-3 mb-1'>
                  Для реализации данной формулы необходимо соблюдать основные
                  принципы физической реабилитации:
                </p>

                <button
                  type='button'
                  className='mt-2 w-full flex items-center justify-between gap-3 min-h-[52px] px-4 py-2.5 rounded-2xl border-0 bg-white font-[inherit] text-[17px] font-extrabold text-navy text-left cursor-pointer ds-focus'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      progression: !prev.progression,
                    }))
                  }
                  aria-expanded={openPrinciples.progression}
                >
                  <span>
                    1. Принцип прогрессии нагрузки
                  </span>
                  <ChevronDown
                    className={`flex-none h-6 w-6 text-brand transition-transform ${openPrinciples.progression ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.progression && (
                  <p className='m-0 mt-2 mb-2 px-1 whitespace-pre-line'>
                    — это постепенное увеличение нагрузки (
                    <em>от простого к сложному</em>). <u>Посредством</u>:
                    увеличения числа упражнений в комплексе, количества
                    повторений, подходов, тренировочных дней, режима работы (
                    <em>изометрический, изотонический</em>), интенсивности,
                    сложности упражнений, регуляции времени отдыха между
                    подходами. <u>Основная задача</u>: подбор упражнений,
                    соответствующих исходной точке с выстраиванием прогресса в
                    них (
                    <em>
                      чтобы структуры сустава могли адаптироваться к новым
                      условиям
                    </em>
                    )
                  </p>
                )}

                <button
                  type='button'
                  className='mt-2 w-full flex items-center justify-between gap-3 min-h-[52px] px-4 py-2.5 rounded-2xl border-0 bg-white font-[inherit] text-[17px] font-extrabold text-navy text-left cursor-pointer ds-focus'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      specificity: !prev.specificity,
                    }))
                  }
                  aria-expanded={openPrinciples.specificity}
                >
                  <span>
                    2. Принцип специфичности
                  </span>
                  <ChevronDown
                    className={`flex-none h-6 w-6 text-brand transition-transform ${openPrinciples.specificity ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.specificity && (
                  <p className='m-0 mt-2 mb-2 px-1 whitespace-pre-line'>
                    — для развития конкретных навыков и улучшения
                    функциональности в определённом виде активности, необходимо
                    выполнять упражнения и действия, которые максимально
                    имитируют эту активность. Это означает, что тренировка
                    должна быть направлена на развитие именно тех движений, мышц
                    и энергосистем, которые задействуются в конкретной задаче
                    или виде спорта. <u>Пример:</u> если наша задача выполнять
                    подъем и спуск по лестнице без боли и дискомфорта, мы должны
                    выполнять аналогичные подводящие упражнения (
                    <em>
                      шаги на степ платформу, полуприседы на одной ноге и тд.
                    </em>
                    ), руководствуясь правилом прогрессии (
                    <em>
                      подбирать сложность упражнения согласно функциональному
                      уровню готовности структур
                    </em>
                    )
                  </p>
                )}

                <button
                  type='button'
                  className='mt-2 w-full flex items-center justify-between gap-3 min-h-[52px] px-4 py-2.5 rounded-2xl border-0 bg-white font-[inherit] text-[17px] font-extrabold text-navy text-left cursor-pointer ds-focus'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      recovery: !prev.recovery,
                    }))
                  }
                  aria-expanded={openPrinciples.recovery}
                >
                  <span>
                    3. Принцип восстановления
                  </span>
                  <ChevronDown
                    className={`flex-none h-6 w-6 text-brand transition-transform ${openPrinciples.recovery ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.recovery && (
                  <p className='m-0 mt-2 mb-2 px-1 whitespace-pre-line'>
                    — для того, чтобы на полученные стимулы от упражнений,
                    произошли нужные нам адаптации, организм должен получить
                    достаточное время и условия для восстановления.{' '}
                    <u>Основные компоненты:</u> полноценный сон (
                    <em>не менее 8 часов</em>), минимизация психологического
                    стресса, полноценный рацион питания (
                    <em>с достаточным содержанием БЖУ и микроэлементов</em>).
                    Слишком частые нагрузки без должного восстановления повышают
                    риск перегрузки (
                    <em>рецидив, травмы, ухудшение результатов</em>)
                  </p>
                )}

                <button
                  type='button'
                  className='mt-2 w-full flex items-center justify-between gap-3 min-h-[52px] px-4 py-2.5 rounded-2xl border-0 bg-white font-[inherit] text-[17px] font-extrabold text-navy text-left cursor-pointer ds-focus'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      individuality: !prev.individuality,
                    }))
                  }
                  aria-expanded={openPrinciples.individuality}
                >
                  <span>
                    4. Принцип индивидуальности
                  </span>
                  <ChevronDown
                    className={`flex-none h-6 w-6 text-brand transition-transform ${openPrinciples.individuality ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.individuality && (
                  <p className='m-0 mt-2 mb-2 px-1 whitespace-pre-line'>{`Каждый человек обладает уникальными структурно-функциональными особенностями и специфической реакцией на физическую нагрузку, что определяет необходимость персонализированного подхода при построении тренировочной или восстановительной программы. Однотипные упражнения, объёмы и интенсивность нагрузки не могут одинаково эффективно воздействовать на всех, поэтому каждый элемент программы подбирается с учётом текущего функционального состояния, способности к адаптации, уровня подготовки, скорости восстановления и переносимости нагрузок. Применение этого принципа предполагает гибкость: параметры выполнения упражнений, их объём, темп, амплитуда движения и сложность корректируются в соответствии с индивидуальными особенностями и реакцией организма. Если выполнение упражнения сопровождается дискомфортом, болевыми ощущениями или другими функциональными ограничениями, нагрузка изменяется до тех пор, пока выполнение не станет безопасным и функционально допустимым; при невозможности устранить негативные проявления рассматривается замена упражнения или отказ от него. Такой подход обеспечивает адаптацию тренировочного процесса к конкретному человеку, позволяет постепенно увеличивать нагрузку и способствует развитию силы, выносливости, координации и других функциональных характеристик без излишнего риска перегрузки.`}</p>
                )}

                <button
                  type='button'
                  className='mt-2 w-full flex items-center justify-between gap-3 min-h-[52px] px-4 py-2.5 rounded-2xl border-0 bg-white font-[inherit] text-[17px] font-extrabold text-navy text-left cursor-pointer ds-focus'
                  onClick={() =>
                    setOpenPrinciples(prev => ({
                      ...prev,
                      trialLoad: !prev.trialLoad,
                    }))
                  }
                  aria-expanded={openPrinciples.trialLoad}
                >
                  <span>
                    5. Принцип пробного освоения нагрузки
                  </span>
                  <ChevronDown
                    className={`flex-none h-6 w-6 text-brand transition-transform ${openPrinciples.trialLoad ? 'rotate-180' : ''}`}
                  />
                </button>
                {openPrinciples.trialLoad && (
                  <p className='m-0 mt-2 mb-2 px-1 whitespace-pre-line'>{`Принцип пробного освоения нагрузки применяется как к новым упражнениям, так и к упражнениям, которые человек выполняет после длительного перерыва, травмы, операции или значительных изменений физической подготовки. Суть этого принципа в том, что любую такую нагрузку сначала выполняют в облегчённом варианте, уменьшая объём и интенсивность на 30–50% относительно общей рекомендуемой нагрузки. Это позволяет безопасно проверить, как организм и ткани реагируют на новую или изменённую активность, выявить возможные ограничения и избежать перегрузки.
Реакцию наблюдают во время выполнения упражнения, сразу после тренировки и в течение последующих суток, включая ночной период. На основе этих наблюдений решают, как продолжать нагрузку: при нормальной реакции её постепенно увеличивают до целевых параметров, при появлении дискомфорта, боли или ограничений — корректируют объём, интенсивность или технику выполнения, либо заменяют упражнение.
Принцип пробной дозировки включает возможность постепенного освоения нагрузки в разных формах. В его рамках можно начинать с меньшего числа тренировочных сессий в течение дня или недели, следить за реакцией организма на получаемый объём и постепенно увеличивать количество подходов или сессий до рабочих значений. Такой подход помогает организму постепенно привыкать к нагрузке, снижает риск перегрузки и создаёт безопасную основу для последовательного и контролируемого прогрессирования тренировочного процесса.`}</p>
                )}

                <p className='m-0 mt-3'>
                  На начальном этапе реабилитации (
                  <em>острый и ранний восстановительный этапы</em>) упражнения
                  на травмированный сегмент выполняются ежедневно (
                  <em>
                    возможна индивидуальная коррекция, с включением
                    дополнительных дней отдыха
                  </em>
                  ). Это связано с тем, что на этих этапах нагрузки недостаточно
                  интенсивны, чтобы требовать отдельного дня восстановления для
                  адаптации после выполнения комплекса. Основное внимание
                  уделяется легким упражнениям, направленным на улучшение
                  трофических процессов, восстановление амплитуды движения
                  коленного сустава и укрепления мышц за счёт преимущественно
                  изометрических упражнений
                </p>
                <p className='m-0 mt-3'>
                  По мере прогресса и перехода к более поздним этапам
                  реабилитации, нагрузка увеличивается. Упражнения становятся
                  более интенсивными и направленными на развитие силы,
                  выносливости и мощности поврежденного сегмента. В связи с этим
                  меняется и режим выполнения: комплекс упражнений выполняется
                  3–4 раза в неделю, что позволяет организму полноценно
                  адаптироваться и восстанавливаться после каждой тренировки. Но
                  если задача вернуть спортсмена к его профессиональной
                  нагрузке, то в дни отдыха от работы с основным сегментом,
                  выполняется аэробная нагрузка (
                  <em>вело, эллипс, дорожка, бассейн</em>) и тренировка
                  периферических сегментов (<em>верх тела</em>). Это позволяет
                  спортсмену <u>быстрей</u> набрать функциональные кондиции и
                  предотвратить детренированность
                </p>
                <p className='m-0 mt-3'>
                  В профессиональном спорте можно встретить ситуации, где на
                  сроке 3-4 недели после операции спортсмен завершает свою
                  реабилитацию и возвращается к спортивной деятельности. Важно
                  отметить, что это не является нормой и для людей «не
                  спортсменов» ни в коем случае не стоит брать пример с
                  профессионалов (
                  <em>
                    в копирование графиков восстановления и объемов нагрузки
                  </em>
                  ). Для профессионала это часть работы, где форсирование
                  реабилитационного процесса обусловлено спецификой их
                  деятельности и данный шаг сопряжен с осознанным риском
                </p>

                <blockquote className='m-0 mt-5 p-5 rounded-2xl bg-sky italic text-navy'>
                  «Реабилитация после резекции мениска — это не вопрос времени,
                  а вопрос достижений. Просто ожидание окончания этапов не
                  гарантирует восстановления. Только через последовательное
                  выполнение упражнений и корректное увеличение нагрузки можно
                  достичь полноценного восстановления функции сустава. Время без
                  усилий не восстановит функциональность колена!»
                </blockquote>
                </Accordion>
              </div>
            </div>
          </section>
          <section id='stages' className='ds-wrap pt-12 dsk:pt-16 scroll-mt-28'>
            <MeniscusStagesDetails
              activeStageId={meniscusStageId}
              onActiveStageIdChange={setMeniscusStageId}
            />
          </section>
        </>
      ) : isPlantarCourse ? (
        <section className='ds-wrap ds-sec'>
          <PlantarFasciopathyDetails />
        </section>
      ) : (
        <section className='ds-wrap ds-sec'>
          <div className='ds-card p-[22px] dsk:p-9'>
            <p className='m-0 whitespace-pre-line'>{course.fullDescription}</p>
            <div className='mt-6'>
              <ButtonLink href='/products' size='md'>
                Перейти к услугам
              </ButtonLink>
            </div>
          </div>
        </section>
      )}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}

/** Раскрывающийся блок «Прежде чем начать». Содержимое в DOM всегда, свёрнутое — hidden. */
function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className='rounded-[18px] bg-canvas'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(v => !v)}
        className='w-full flex justify-between items-center gap-3 min-h-[56px] px-[18px] py-3 border-0 bg-transparent font-[inherit] text-[17px] font-extrabold text-navy text-left cursor-pointer rounded-[18px] ds-focus'
      >
        {title}
        <span
          aria-hidden='true'
          className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${
            open ? 'bg-brand' : 'bg-white'
          }`}
        >
          <Icon
            name={open ? 'minus' : 'plus'}
            size={16}
            strokeWidth={2.6}
            color={open ? '#fff' : 'var(--c-blue)'}
          />
        </span>
      </button>
      <div id={id} hidden={!open} className='px-[18px] pb-5 text-[16px] dsk:text-[17px]'>
        {children}
      </div>
    </div>
  );
}

// ChevronDown используется в принципах физической реабилитации.
void ChevronDown;
