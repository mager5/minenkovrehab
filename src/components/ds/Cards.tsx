// Карточки: услуга, вырезанное фото в рамке с плашкой, заглушка «Скоро».
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ButtonLink } from './Button';
import { Badge } from './Layout';
import { IconBox } from './Icon';

export function ServiceCard({
  title,
  text,
  price,
  unit,
  href,
  featured,
  tag,
  headingLevel = 3,
}: {
  title: string;
  text: string;
  price: string;
  unit?: string;
  href: string;
  featured?: boolean;
  tag?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const H = `h${headingLevel}` as 'h3';
  return (
    <article
      className='ds-card p-6 dsk:p-8 flex flex-col gap-3.5 h-full'
      style={featured ? { background: 'var(--g-featured)' } : undefined}
    >
      {tag ? (
        <div>
          <Badge tone='mint'>{tag}</Badge>
        </div>
      ) : null}
      <H className='ds-h3'>{title}</H>
      <p className='m-0 text-[17px] text-muted flex-1'>{text}</p>
      <p className='m-0 flex items-baseline gap-2 flex-wrap'>
        <span className='text-[28px] font-extrabold text-ink leading-tight'>
          {price}
        </span>
        {unit ? <span className='text-[16px] text-muted'>{unit}</span> : null}
      </p>
      <ButtonLink
        href={href}
        variant={featured ? 'primary' : 'tertiary'}
        size='md'
        block
        aria-label={`Подробнее: ${title}`}
      >
        Подробнее
      </ButtonLink>
    </article>
  );
}

export const CUTOUT = {
  src: '/images/hero/vadim-cutout.webp',
  width: 1189,
  height: 1969,
};

/**
 * Вырезанное фото Вадима, «выходящее» из скруглённой карточки с градиентом, и плашка.
 * Высоты задаются отдельно для десктопа и телефона.
 */
export function CutoutCard({
  h = 620,
  cardH = 470,
  hM = 400,
  cardHM = 300,
  plaque,
  priority,
  maxWidth,
  hS,
  cardHS,
}: {
  h?: number;
  cardH?: number;
  hM?: number;
  cardHM?: number;
  plaque?: ReactNode;
  priority?: boolean;
  maxWidth?: number;
  /** Телефон ≤768px: своя высота фото и карточки (по умолчанию как hM / cardHM). */
  hS?: number;
  cardHS?: number;
}) {
  const vars = {
    '--h': `${h}px`,
    '--ch': `${cardH}px`,
    '--hm': `${hM}px`,
    '--chm': `${cardHM}px`,
    '--hs': `${hS ?? hM}px`,
    '--chs': `${cardHS ?? cardHM}px`,
    maxWidth,
  } as React.CSSProperties;
  const wDesk = Math.round((h * CUTOUT.width) / CUTOUT.height);
  const wMob = Math.round((hM * CUTOUT.width) / CUTOUT.height);
  return (
    <div
      className='relative mx-auto w-full h-[var(--hm)] dsk:h-[var(--h)] max-[768px]:h-[var(--hs)]'
      style={vars}
    >
      <div
        aria-hidden='true'
        className='absolute inset-x-0 bottom-0 h-[var(--chm)] dsk:h-[var(--ch)] max-[768px]:h-[var(--chs)] rounded-[24px] dsk:rounded-[28px]'
        style={{
          background: 'var(--g-photo-card)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.6)',
        }}
      />
      <Image
        src={CUTOUT.src}
        alt='Вадим Миненков, инструктор-методист ЛФК'
        width={CUTOUT.width}
        height={CUTOUT.height}
        priority={!!priority}
        sizes={`(max-width: 900px) ${wMob}px, ${wDesk}px`}
        className='absolute left-1/2 bottom-0 -translate-x-1/2 h-full w-auto max-w-none rounded-b-[24px] dsk:rounded-b-[28px]'
      />
      {plaque}
    </div>
  );
}

export function Plaque({
  title,
  sub,
  icon = 'video',
  className = '',
}: {
  title: string;
  sub: string;
  icon?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 dsk:gap-3 py-2 pr-3.5 pl-2 dsk:py-3 dsk:pr-5 dsk:pl-3 rounded-2xl dsk:rounded-[20px] bg-white ${className}`}
      style={{ boxShadow: '0 16px 36px rgba(13,60,99,.16)' }}
    >
      <span className='dsk:hidden'>
        <IconBox name={icon} tone='sky' size={34} radius={11} iconSize={18} />
      </span>
      <span className='hidden dsk:inline-flex'>
        <IconBox name={icon} tone='sky' size={44} radius={14} iconSize={22} />
      </span>
      <span className='text-[14px] dsk:text-[16px] max-[768px]:text-[15px] leading-[1.3] font-extrabold text-navy'>
        {title}
        <br />
        <span className='font-semibold text-muted'>{sub}</span>
      </span>
    </div>
  );
}
