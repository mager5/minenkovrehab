import type { Metadata } from 'next';
import Image from 'next/image';
import { aboutContent as content, educationContent } from '@/data/content';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbs, person } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  ButtonLink,
  PageHead,
  SectionHead,
  IconBox,
  Icon,
  SoonBadge,
} from '@/components/ds';

export const metadata: Metadata = pageMetadata({
  title: 'Обо мне — инструктор-методист ЛФК | Вадим Миненков',
  description:
    'Вадим Миненков — специалист по физической реабилитации и спортивной тренировке, инструктор-методист ЛФК. Опыт 8+ лет, онлайн-консультации и программы.',
  path: '/about',
  socialTitle: 'Обо мне — Вадим Миненков',
  type: 'profile',
});

const valueIcons = ['award', 'target', 'monitor'];

// Контент страницы — один источник (src/data/content.ts), рендерится на сервере.
export default function About() {
  return (
    <div className='ds'>
      <JsonLd
        nodes={[
          {
            '@type': 'ProfilePage',
            url: 'https://minenkovrehab.ru/about',
            name: 'Обо мне',
            mainEntity: person,
          },
          breadcrumbs([{ name: 'Обо мне', path: '/about' }]),
        ]}
      />

      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Обо мне' }]}
        title={content.hero.subtitle}
        lead={content.hero.description
          .replace(/\s+/g, ' ')
          .replace('Я - ', 'Я — ')}
        extra={
          <div className='flex flex-col dsk:flex-row gap-3.5 mt-8'>
            <ButtonLink href='/contacts'>Связаться со мной</ButtonLink>
            <ButtonLink href='/products' variant='secondary'>
              Услуги и цены
            </ButtonLink>
          </div>
        }
        right={
          <Image
            src='/images/hero/blue-stripe.JPG'
            alt='Вадим Миненков с эспандером'
            width={1200}
            height={1600}
            priority
            sizes='(max-width: 900px) 100vw, 460px'
            className='ds-photo aspect-[4/5] h-auto shadow-[0_24px_48px_rgba(13,60,99,.14)]'
            style={{ objectPosition: 'center 58%' }}
          />
        }
      />

      {/* Миссия и ценности */}
      <section className='ds-wrap ds-sec' aria-labelledby='about-mission'>
        <div className='ds-card grid gap-8 dsk:gap-14 dsk:grid-cols-2 p-6 dsk:p-14'>
          <div>
            <h2 className='ds-h2' id='about-mission'>
              {content.mission.title}
            </h2>
            <p className='mt-5 mb-0 text-[19px] dsk:text-[22px] leading-[1.6] text-ink'>
              {content.mission.description}
            </p>
          </div>
          <ul className='list-none m-0 p-0 flex flex-col gap-6 dsk:gap-7'>
            {content.mission.values.map((v, i) => (
              <li key={v.title} className='flex gap-4 items-start'>
                <IconBox name={valueIcons[i] ?? 'heart'} />
                <div>
                  <h3 className='ds-h3 mb-1' style={{ fontSize: 21 }}>
                    {v.title}
                  </h3>
                  <p className='m-0 text-[17px] text-muted'>{v.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Подход */}
      <section className='ds-wrap ds-sec' aria-labelledby='about-approach'>
        <SectionHead
          id='about-approach'
          title={content.approach.title}
          sub='Четыре шага, которые проходит каждый, кто занимается со мной'
        />
        <div className='grid gap-6 dsk:gap-8 dsk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-stretch'>
          <ol className='list-none m-0 p-0 grid gap-4 dsk:gap-5 sm:grid-cols-2'>
            {content.approach.steps.map((s, n) => (
              <li
                key={s.title}
                className='ds-card rounded-[24px] p-6 dsk:p-7 flex flex-col gap-3'
              >
                <span
                  aria-hidden='true'
                  className='w-12 h-12 rounded-full bg-brand text-white font-extrabold text-[20px] flex items-center justify-center'
                >
                  {n + 1}
                </span>
                <h3 className='ds-h3 mt-1'>{s.title}</h3>
                <p className='m-0 text-[17px] text-muted'>{s.description}</p>
              </li>
            ))}
          </ol>
          <Image
            src='/images/hero/stretch-leg.jpg'
            alt='Вадим выполняет растяжку'
            width={1200}
            height={1600}
            sizes='(max-width: 900px) 100vw, 480px'
            className='ds-photo h-[360px] dsk:h-full dsk:min-h-[420px]'
            style={{ objectPosition: 'center 35%' }}
          />
        </div>
      </section>

      {/* Образование и сертификаты — заглушка до получения документов (TODO в src/data/content.ts) */}
      <section className='ds-wrap ds-sec' aria-labelledby='about-edu'>
        <div className='ds-card p-6 dsk:p-12'>
          <div className='flex flex-col dsk:flex-row dsk:justify-between dsk:items-center gap-3 dsk:gap-4 mb-3'>
            <h2 className='ds-h2' id='about-edu'>
              {educationContent.title}
            </h2>
            {educationContent.status === 'soon' ? (
              <span>
                <SoonBadge />
              </span>
            ) : null}
          </div>
          <p className='m-0 mb-7 text-[17px] dsk:text-[19px] text-muted'>
            {educationContent.note}
          </p>
          <div className='grid gap-4 dsk:gap-5 grid-cols-1 sm:grid-cols-3'>
            {educationContent.placeholders.map((t, i) => (
              <div
                key={i}
                className='aspect-[4/3] rounded-[20px] border-2 border-dashed border-[#BFD3E4] bg-[#F7FAFC] flex flex-col items-center justify-center gap-2.5 text-muted text-[16px] font-semibold'
              >
                <Icon
                  name='award'
                  size={32}
                  strokeWidth={1.8}
                  color='#7A8896'
                />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Цитата */}
      <section className='ds-wrap ds-sec'>
        <div className='ds-panel ds-cta-bg grid gap-7 dsk:gap-10 dsk:grid-cols-[minmax(0,1fr)_auto] items-center'>
          <p className='m-0 text-[22px] dsk:text-[30px] leading-[1.4] font-bold'>
            «Я профессионал в области физической реабилитации и спортивной
            тренировки. Моя цель — вернуть вам радость и свободу в движении»
          </p>
          <ButtonLink href='/contacts' variant='light'>
            Связаться со мной
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
