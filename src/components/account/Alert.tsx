// Сообщения форм: ошибка (role=alert), успех и информация (role=status).
import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';

export function ErrorAlert({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      role='alert'
      className='flex gap-3 px-[18px] py-4 rounded-[18px] bg-[#FBEDEC] shadow-[inset_0_0_0_1px_#F2C9C4]'
    >
      <Icon
        name='alert'
        size={22}
        color='var(--c-danger-ink)'
        className='flex-none mt-0.5'
      />
      <div className='leading-[1.45]'>
        <strong className='block text-[16px] text-danger-ink'>{title}</strong>
        {children ? (
          <span className='text-[15px] text-[#7A2A22]'>{children}</span>
        ) : null}
      </div>
    </div>
  );
}

export function StatusBox({
  tone = 'mint',
  icon = 'check',
  title,
  children,
}: {
  tone?: 'mint' | 'sky';
  icon?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      role='status'
      className={`flex gap-3.5 px-5 py-[18px] rounded-[20px] ${
        tone === 'mint' ? 'bg-mint' : 'bg-sky'
      }`}
    >
      <span
        aria-hidden='true'
        className='flex-none w-11 h-11 rounded-[14px] bg-white flex items-center justify-center'
      >
        <Icon
          name={icon}
          size={22}
          color={tone === 'mint' ? 'var(--c-mint-ink)' : 'var(--c-blue)'}
          strokeWidth={2.4}
        />
      </span>
      <div className='leading-normal'>
        <strong className='block text-[18px] text-navy'>{title}</strong>
        {children ? (
          <span className='text-[16px] text-ink'>{children}</span>
        ) : null}
      </div>
    </div>
  );
}

/** Крупная иконка-«плитка» над заголовком в центрированных карточках. */
export function BigIcon({
  name,
  tone = 'mint',
}: {
  name: string;
  tone?: 'mint' | 'sky' | 'warn';
}) {
  const bg = { mint: 'bg-mint', sky: 'bg-sky', warn: 'bg-warn-soft' }[tone];
  const color = {
    mint: 'var(--c-mint-ink)',
    sky: 'var(--c-blue)',
    warn: 'var(--c-warn-ink)',
  }[tone];
  return (
    <span
      aria-hidden='true'
      className={`inline-flex w-[72px] h-[72px] rounded-[24px] ${bg} items-center justify-center`}
    >
      <Icon name={name} size={34} color={color} strokeWidth={2} />
    </span>
  );
}
