// Главная страница (концепт 2 «Мягкая забота», hero — вариант 4 «фото выходит из рамки»).
// Серверный компонент: весь текст есть в исходном HTML; интерактивна только форма записи.
import Image from 'next/image';
import Link from 'next/link';
import {
  ButtonLink,
  CutoutCard,
  Plaque,
  ServiceCard,
  SectionHead,
  Icon,
  IconBox,
  formatPhone,
} from '@/components/ds';
import { ContactForm } from '@/components/sections/contact/ContactForm';
import { homeContent, reviewsContent, homeReviewNames } from '@/data/content';
import { CONTACTS } from '@/lib/seo';

const heroPoints = [
  'Индивидуальный подход в подборе тренировок с учетом состояния вашего здоровья',
  'Программа тренировок «Формула Движения»',
  'Готовые восстановительные программы после травм и операций',
];

const onlineCards = [
  {
    title: 'Онлайн-консультация',
    text: 'Индивидуальный разбор вашей ситуации с подбором эффективных решений.',
    price: '7 000 ₽',
    unit: '/ 60 минут',
    href: '/products/consultation',
  },
  {
    title: 'Экспресс онлайн-консультация',
    text: 'Короткая консультация по видеосвязи для разбора одного конкретного вопроса и получения рекомендаций.',
    price: '4 000 ₽',
    unit: '/ 20 минут',
    href: '/products/express-consultation',
  },
  {
    title: 'Онлайн-тренировка',
    text: 'Индивидуальная онлайн-тренировка в формате видеозвонка по предварительному согласованию времени и даты.',
    price: '5 000 ₽',
    unit: '/ 60 минут',
    href: '/products/online-training',
  },
];

const programCards = [
  {
    title: 'Программа тренировок «Формула Движения»',
    text: 'Авторская программа для всего тела: подвижность суставов, сила и контроль движений. Всего 30 минут в удобное для вас время.',
    price: '6 000 ₽',
    unit: '/ уровень (2 мес.)',
    href: '/products/formula-movement',
    featured: true,
  },
  {
    title: 'Восстановление после резекции мениска',
    text: 'Пошаговый алгоритм действий после операции коленного сустава.',
    price: '8 000 ₽',
    unit: '/ 6 мес.',
    href: '/products/meniscus-resection',
  },
  {
    title: 'Плантарный фасциит «Пяточная шпора»',
    text: 'Пошаговый алгоритм для восстановления при плантарной фасциопатии.',
    price: '10 000 ₽',
    unit: '/ 6 мес.',
    href: '/products/plantar-fasciopathy',
  },
  {
    title: 'Восстановительная программа «Поясница»',
    text: 'Неспецифическая боль в нижней части спины: от мягкого снятия напряжения до формирования «мышечного корсета».',
    price: '10 000 ₽',
    unit: '/ 6 мес.',
    href: '/products/low-back-pain',
  },
  {
    title: 'Восстановительная программа «Шея + грудной отдел»',
    text: 'Неспецифическая боль в верхней части спины: от снятия напряжения до укрепления и улучшения контроля движений.',
    price: '10 000 ₽',
    unit: '/ 6 мес.',
    href: '/products/neck-thoracic-pain',
  },
];

const helpIcons = ['pulse', 'refresh', 'heart', 'target'];

export default function HomeClient() {
  const { about, help, cta } = homeContent;
  const homeReviews = homeReviewNames
    .map(n => reviewsContent.find(r => r.name === n))
    .filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <div className='ds'>
      {/* ---------- Hero ---------- */}
      <section className='ds-wrap pt-4 dsk:pt-6'>
        <div
          className='grid grid-cols-1 dsk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-x-14 rounded-[32px] dsk:rounded-[40px] px-[22px] py-8 dsk:px-16 dsk:pt-14 dsk:pb-16'
          style={{ background: 'var(--g-panel)' }}
        >
          <div className='dsk:col-start-1 dsk:row-start-1'>
            <p className='m-0 mb-4 dsk:mb-5 inline-block px-4 py-2 rounded-full bg-white text-mint-ink font-bold text-[15px] dsk:text-[16px] leading-snug'>
              Инструктор-методист ЛФК, занятия онлайн
            </p>
            <h1
              className='ds-h1'
              style={{ fontSize: 'clamp(34px, 4.2vw, 60px)' }}
            >
              Физическая реабилитация и тренировки для здоровья
            </h1>
          </div>

          <div className='mt-5 dsk:mt-0 dsk:col-start-2 dsk:row-start-1 dsk:row-span-2 self-end'>
            <CutoutCard
              h={620}
              cardH={470}
              hM={400}
              cardHM={300}
              priority
              plaque={
                <Plaque
                  title='Онлайн-консультация'
                  sub='от 4 000 ₽'
                  className='left-[-10px] bottom-[18px] dsk:left-[-36px] dsk:bottom-10'
                />
              }
            />
          </div>

          <div className='dsk:col-start-1 dsk:row-start-2 dsk:pb-2'>
            <ul className='list-none m-0 mt-6 dsk:mt-8 p-0 flex flex-col gap-3.5 text-[18px] dsk:text-[20px]'>
              {heroPoints.map(t => (
                <li key={t} className='flex gap-3.5 items-start'>
                  <span
                    aria-hidden='true'
                    className='flex-none w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center mt-0.5'
                  >
                    <Icon
                      name='check'
                      size={16}
                      strokeWidth={3}
                      color='var(--c-mint-ink)'
                    />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className='flex flex-col dsk:flex-row gap-3.5 mt-8 dsk:mt-10'>
              <ButtonLink href='/contacts' size='lg'>
                Записаться
              </ButtonLink>
              <ButtonLink href='/about' size='lg' variant='secondary'>
                Узнать больше
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Обо мне ---------- */}
      <section className='ds-wrap ds-sec' aria-labelledby='home-about'>
        <div className='ds-card grid gap-8 dsk:gap-14 dsk:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] items-center p-5 dsk:p-12'>
          <Image
            src='/images/hero/blue-stripe.JPG'
            alt='Вадим Миненков с эспандером'
            width={1200}
            height={1600}
            sizes='(max-width: 900px) 100vw, 400px'
            className='ds-photo aspect-[4/5] h-auto'
            style={{ objectPosition: 'center 58%' }}
          />
          <div>
            <h2 className='ds-h2 mb-5' id='home-about'>
              {about.title}
            </h2>
            <p className='m-0 text-[18px] dsk:text-[21px]'>
              {about.description}
            </p>
            <div className='grid gap-4 dsk:gap-5 dsk:grid-cols-2 mt-7 dsk:mt-8'>
              <div className='bg-canvas rounded-[20px] p-6'>
                <h3 className='ds-h3 mb-2' style={{ fontSize: 20 }}>
                  {about.priceTitle}
                </h3>
                <p className='m-0 text-[17px] text-muted'>
                  Индивидуальные занятия и консультации, тренировки по программе
                  «Формула Движения» и восстановительные программы при различных
                  состояниях.
                </p>
              </div>
              <div className='bg-canvas rounded-[20px] p-6'>
                <h3 className='ds-h3 mb-2' style={{ fontSize: 20 }}>
                  {about.methodsTitle}
                </h3>
                <p className='m-0 text-[17px] text-muted'>
                  Каждое занятие продумано, чтобы вы чувствовали прогресс,
                  комфорт и уверенность в каждом движении.
                </p>
              </div>
            </div>
            <Link
              href='/about'
              className='inline-flex items-center gap-1.5 mt-6 dsk:mt-7 min-h-[44px] font-bold text-brand hover:text-navy'
            >
              Подробнее обо мне
              <Icon name='chev-right' size={18} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Услуги и цены ---------- */}
      <section className='ds-wrap ds-sec' aria-labelledby='home-services'>
        <div className='text-left dsk:text-center max-w-[720px] dsk:mx-auto mb-8 dsk:mb-12'>
          <h2 className='ds-h2 mb-3.5' id='home-services'>
            Услуги и цены
          </h2>
          <p className='m-0 text-[18px] dsk:text-[20px] text-muted'>
            Выберите подходящую услугу для вашего восстановления и реабилитации
          </p>
        </div>
        <h3 className='m-0 mb-5 text-[22px] dsk:text-[24px] font-extrabold text-ink'>
          Онлайн-занятия
        </h3>
        <div className='grid gap-4 dsk:gap-6 dsk:grid-cols-3'>
          {onlineCards.map(c => (
            <ServiceCard key={c.href} {...c} headingLevel={4} />
          ))}
        </div>
        <h3 className='m-0 mt-12 dsk:mt-14 mb-5 text-[22px] dsk:text-[24px] font-extrabold text-ink'>
          Программы для самостоятельных занятий
        </h3>
        <div className='grid gap-4 dsk:gap-6 dsk:grid-cols-3'>
          {programCards.map(c => (
            <ServiceCard key={c.href} {...c} headingLevel={4} />
          ))}
        </div>
      </section>

      {/* ---------- Когда обращаться ---------- */}
      <section className='ds-wrap ds-sec' aria-labelledby='home-help'>
        <div className='grid gap-8 dsk:gap-12 dsk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-center'>
          <div>
            <h2 className='ds-h2 mb-6 dsk:mb-8' id='home-help'>
              {help.title.trim()} {help.subtitle.replace(/:$/, '')}
            </h2>
            <div className='grid gap-4 dsk:gap-5 sm:grid-cols-2'>
              {help.items.map((it, i) => (
                <div
                  key={it.title}
                  className='ds-card p-6 dsk:p-7 rounded-[24px]'
                >
                  <IconBox name={helpIcons[i] ?? 'heart'} className='mb-4' />
                  <h3
                    className='ds-h3 mb-2 text-ink'
                    style={{ fontSize: 21, color: 'var(--c-ink)' }}
                  >
                    {it.title}
                  </h3>
                  <p className='m-0 text-[17px] text-muted'>{it.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Image
            src='/images/hero/stretch-leg.jpg'
            alt='Вадим выполняет растяжку'
            width={1200}
            height={1600}
            sizes='(max-width: 900px) 100vw, 480px'
            className='ds-photo aspect-[3/4] h-auto'
            style={{ objectPosition: 'center 40%' }}
          />
        </div>
      </section>

      {/* ---------- Отзывы ---------- */}
      <section className='ds-wrap ds-sec' aria-labelledby='home-reviews'>
        <SectionHead
          id='home-reviews'
          title='Отзывы моих клиентов'
          right={
            <ButtonLink href='/reviews' variant='secondary' size='md'>
              Все отзывы
            </ButtonLink>
          }
        />
        <div className='flex dsk:grid dsk:grid-cols-3 gap-4 dsk:gap-6 overflow-x-auto dsk:overflow-visible snap-x snap-mandatory -mx-4 px-4 dsk:mx-0 dsk:px-0 pb-3 dsk:pb-0 ds-hscroll'>
          {homeReviews.map((r, i) => (
            <figure
              key={r.name}
              className='ds-card m-0 p-6 dsk:p-8 flex flex-col gap-5 flex-[0_0_86%] dsk:flex-auto snap-start'
            >
              <blockquote className='m-0 text-[17px] dsk:text-[18px] flex-1'>
                «{r.text}»
              </blockquote>
              <figcaption className='flex gap-3.5 items-center'>
                <span
                  aria-hidden='true'
                  className={`flex-none w-12 h-12 rounded-full font-extrabold flex items-center justify-center ${
                    i % 2 ? 'bg-sky text-navy' : 'bg-mint text-mint-ink'
                  }`}
                >
                  {r.name[0]}
                </span>
                <span className='text-[16px] leading-[1.4]'>
                  <strong className='font-extrabold'>{r.name}</strong>
                  <br />
                  <span className='text-muted'>{r.problem}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Запись ---------- */}
      <section className='ds-wrap ds-sec' aria-labelledby='home-cta'>
        <div className='ds-panel ds-cta-bg grid gap-8 dsk:gap-12 dsk:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center'>
          <div>
            <h2 className='ds-h2' id='home-cta' style={{ color: '#fff' }}>
              {cta.title}
            </h2>
            <p className='ds-lead mt-5 mb-0' style={{ color: '#DCE9F4' }}>
              {cta.description}
            </p>
            <div className='mt-7 dsk:mt-9 flex flex-col gap-1.5 text-[18px] dsk:text-[19px]'>
              <a
                href={`tel:${CONTACTS.phoneE164}`}
                className='font-extrabold text-[24px] dsk:text-[28px] text-white no-underline hover:text-white min-h-[44px] inline-flex items-center'
              >
                {formatPhone(CONTACTS.phoneE164)}
              </a>
              <a
                href={`mailto:${CONTACTS.email}`}
                className='text-white underline underline-offset-4 hover:text-white min-h-[44px] inline-flex items-center'
              >
                {CONTACTS.email}
              </a>
              <span style={{ color: '#DCE9F4' }}>
                {CONTACTS.workingHours.replace(/-/g, '–')}
              </span>
            </div>
          </div>
          <ContactForm variant='home' />
        </div>
      </section>
    </div>
  );
}
