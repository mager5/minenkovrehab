// Каркасные блоки: хлебные крошки, шапка страницы, заголовок секции, бейджи, CTA-панель.
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import { ButtonLink } from './Button';
import { CONTACTS } from '@/lib/seo';

export type Crumb = { label: string; href?: string };

/** Видимые хлебные крошки (разметка BreadcrumbList — в JSON-LD страницы, здесь не дублируется). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const parent = [...items].reverse().find(c => c.href);
  return (
    <nav aria-label='Хлебные крошки' className='mb-4 dsk:mb-5'>
      {/* Телефон: только ссылка на родительский раздел */}
      {parent?.href ? (
        <Link
          href={parent.href}
          className='dsk:hidden inline-flex items-center gap-1 min-h-[44px] text-[16px] text-muted no-underline hover:text-navy'
        >
          <Icon name='chev-left' size={18} strokeWidth={2.2} />
          {parent.label}
        </Link>
      ) : null}
      <ol className='hidden dsk:flex flex-wrap items-center gap-x-1.5 text-[16px] list-none m-0 p-0'>
        {items.map((c, i) => (
          <li key={i} className='flex items-center gap-1.5'>
            {i > 0 ? (
              <Icon
                name='chev-right'
                size={16}
                strokeWidth={2}
                color='#7A8896'
              />
            ) : null}
            {c.href ? (
              <Link
                href={c.href}
                className='text-muted no-underline hover:text-navy inline-flex min-h-[44px] items-center'
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current='page' className='text-navy font-bold'>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Badge({
  children,
  tone = 'white',
  className = '',
}: {
  children: ReactNode;
  tone?: 'white' | 'mint' | 'sky' | 'navy';
  className?: string;
}) {
  const t = {
    white: 'bg-white text-mint-ink',
    mint: 'bg-mint text-mint-ink',
    sky: 'bg-sky text-navy',
    navy: 'bg-white text-navy',
  }[tone];
  return <span className={`ds-badge ${t} ${className}`}>{children}</span>;
}

export function SoonBadge({ children = 'Скоро' }: { children?: ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warn-soft text-warn-ink font-extrabold text-[14px]'>
      <Icon
        name='clock'
        size={16}
        strokeWidth={2.4}
        color='var(--c-warn-ink)'
      />
      {children}
    </span>
  );
}

/** Шапка внутренней страницы: панель с градиентом, крошки, H1, лид, правая колонка (фото/видео). */
export function PageHead({
  crumbs,
  title,
  lead,
  right,
  extra,
  align = 'center',
}: {
  crumbs: Crumb[];
  title: ReactNode;
  lead?: ReactNode;
  right?: ReactNode;
  extra?: ReactNode;
  align?: 'center' | 'end';
}) {
  return (
    <section className='ds-wrap pt-4 dsk:pt-6'>
      <div
        className={`ds-panel ds-panel-bg grid gap-8 dsk:gap-12 ${
          right ? 'dsk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''
        } ${align === 'end' ? 'items-end' : 'items-center'}`}
      >
        <div className='min-w-0'>
          <Breadcrumbs items={crumbs} />
          <h1 className='ds-h1'>{title}</h1>
          {lead ? (
            <p className='ds-lead mt-5 mb-0 max-w-[760px]'>{lead}</p>
          ) : null}
          {extra}
        </div>
        {right ? <div className='min-w-0'>{right}</div> : null}
      </div>
    </section>
  );
}

export function SectionHead({
  title,
  sub,
  right,
  as: Tag = 'h2',
  className = '',
  id,
}: {
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={`flex flex-col dsk:flex-row dsk:justify-between dsk:items-end gap-4 dsk:gap-5 mb-6 dsk:mb-8 ${className}`}
    >
      <div>
        <Tag className='ds-h2' id={id}>
          {title}
        </Tag>
        {sub ? (
          <p className='mt-2.5 mb-0 text-[17px] dsk:text-[19px] text-muted'>
            {sub}
          </p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

/** Синяя CTA-панель «Начните свой путь к здоровью сегодня». */
export function CtaPanel({
  title = 'Начните свой путь к здоровью сегодня',
  text = 'Запишитесь на консультацию и получите профессиональную помощь в достижении ваших целей',
  button = 'Записаться на консультацию',
  href = '/contacts',
}: {
  title?: string;
  text?: string;
  button?: string;
  href?: string;
}) {
  return (
    <section className='ds-wrap ds-sec'>
      <div className='ds-panel ds-cta-bg grid gap-8 dsk:gap-10 dsk:grid-cols-[minmax(0,1fr)_auto] items-center'>
        <div>
          <h2 className='ds-h2' style={{ color: '#fff' }}>
            {title}
          </h2>
          <p className='ds-lead mt-4 mb-0' style={{ color: '#DCE9F4' }}>
            {text}
          </p>
        </div>
        <div className='flex flex-col gap-3'>
          <ButtonLink
            href={href}
            variant='light'
            size='lg'
            className='ds-full-m'
          >
            {button}
          </ButtonLink>
          <a
            href={`tel:${CONTACTS.phoneE164}`}
            className='text-center font-extrabold text-[22px] text-white no-underline hover:text-white min-h-[44px] inline-flex items-center justify-center'
          >
            {formatPhone(CONTACTS.phoneE164)}
          </a>
        </div>
      </div>
    </section>
  );
}

/** +79283287052 → +7 928 328-70-52 */
export function formatPhone(e164: string) {
  const d = e164.replace(/\D/g, '');
  const m = d.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+7 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : e164;
}

export function CheckList({
  items,
  className = '',
  style,
}: {
  items: ReactNode[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <ul
      className={`list-none m-0 p-0 flex flex-col gap-3 ${className}`}
      style={style}
    >
      {items.map((t, i) => (
        <li key={i} className='flex gap-3 items-start'>
          <span
            aria-hidden='true'
            className='flex-none w-[26px] h-[26px] rounded-full bg-mint flex items-center justify-center mt-[2px]'
          >
            <Icon
              name='check'
              size={14}
              strokeWidth={3.2}
              color='var(--c-mint-ink)'
            />
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
