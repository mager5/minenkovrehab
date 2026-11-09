'use client';
// Части кабинета: карточка «Вы вошли как», карточка программы, пустое состояние, загрузка.
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import { ButtonLink } from '@/components/ds/Button';
import { CONTACTS } from '@/lib/seo';
import { accountContent } from '@/data/content';
import type { Course } from '@/data/courses';
import { logout } from './useAccount';

export function AccountAside({ email }: { email: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <aside
      className='ds-card p-[22px] dsk:p-7 flex flex-col gap-4'
      aria-label='Аккаунт'
    >
      <div className='flex gap-3.5 items-center'>
        <span
          aria-hidden='true'
          className='flex-none w-[52px] h-[52px] rounded-full bg-sky flex items-center justify-center'
        >
          <Icon name='user' size={24} color='var(--c-blue)' />
        </span>
        <span className='leading-[1.35] min-w-0'>
          <span className='block text-[15px] text-muted'>Вы вошли как</span>
          <strong className='block text-[17px] text-navy [overflow-wrap:anywhere]'>
            {email}
          </strong>
        </span>
      </div>
      <Link
        href='/forgot-password'
        className='flex items-center gap-2.5 min-h-[44px] font-bold text-brand no-underline hover:text-navy ds-focus rounded-lg'
      >
        <Icon name='key' size={20} />
        Сменить пароль
      </Link>
      <button
        type='button'
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          if (!(await logout(router))) setBusy(false);
        }}
        className='flex items-center gap-2.5 min-h-[44px] font-bold text-danger-ink bg-transparent border-0 p-0 cursor-pointer text-left font-[inherit] text-[19px] ds-focus rounded-lg disabled:opacity-60'
      >
        <Icon name='logout' size={20} />
        {busy ? 'Выходим…' : 'Выйти'}
      </button>
      <div className='p-4 rounded-2xl bg-canvas text-[15px] text-muted leading-normal [&_a]:text-brand max-[768px]:[&_a]:inline-flex max-[768px]:[&_a]:min-h-[44px] max-[768px]:[&_a]:items-center'>
        Вопросы по доступу:{' '}
        <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>,{' '}
        <a href={CONTACTS.telegram} target='_blank' rel='noopener noreferrer'>
          Telegram
        </a>
      </div>
    </aside>
  );
}

export function ProgramCard({
  course,
  continueStage,
}: {
  course: Course;
  continueStage?: number | null | undefined;
}) {
  return (
    <Link
      href={`/dashboard/courses/${course.slug}`}
      className='ds-card group grid dsk:grid-cols-[220px_minmax(0,1fr)] overflow-hidden no-underline text-inherit hover:shadow-pop transition-shadow ds-focus'
    >
      <div className='relative h-[180px] dsk:h-auto dsk:min-h-[200px]'>
        <Image
          src={course.image}
          alt=''
          fill
          sizes='(min-width: 901px) 220px, 100vw'
          className='object-cover'
        />
      </div>
      <div className='p-[22px] dsk:px-7 dsk:py-[26px] flex flex-col gap-2.5'>
        <div>
          <span className='ds-badge bg-mint text-mint-ink'>Доступ открыт</span>
        </div>
        <h3 className='m-0 mt-1 text-[21px] dsk:text-[22px] leading-[1.3] font-extrabold text-navy'>
          {course.cabinetTitle || course.title}
        </h3>
        {course.meta ? (
          <p className='m-0 text-[16px] text-muted'>{course.meta}</p>
        ) : null}
        <span className='inline-flex items-center gap-1.5 mt-1.5 font-extrabold text-brand group-hover:text-navy'>
          {continueStage
            ? `Продолжить: этап ${continueStage}`
            : 'Открыть программу'}
          <Icon name='chev-right' size={20} strokeWidth={2.6} />
        </span>
      </div>
    </Link>
  );
}

export function EmptyPrograms() {
  return (
    <div className='ds-card px-[22px] py-10 dsk:px-10 dsk:py-14 text-center'>
      <span
        aria-hidden='true'
        className='inline-flex w-20 h-20 rounded-[26px] bg-sky items-center justify-center'
      >
        <Icon name='book' size={36} color='var(--c-blue)' strokeWidth={2} />
      </span>
      <h2 className='ds-h2 !text-[28px] dsk:!text-[32px] mt-5'>
        {accountContent.emptyTitle}
      </h2>
      <p className='mx-auto mt-3 mb-7 max-w-[520px] text-muted'>
        {accountContent.emptyText}
      </p>
      <div className='flex flex-col dsk:flex-row gap-3 justify-center'>
        <ButtonLink href='/products/rehab-programs' size='lg'>
          Выбрать программу
        </ButtonLink>
        <ButtonLink href='/products' variant='light' size='lg'>
          Все услуги
        </ButtonLink>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className='ds-card p-8 text-muted' role='status' aria-live='polite'>
      Загрузка…
    </div>
  );
}
