// Страница-уведомление в стиле дизайн-системы: «Доступ к курсу закрыт», заглушки разделов и т. п.
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ds/Button';
import { BigIcon } from '@/components/account/Alert';

type Action = { href: string; label: string };

export default function NoticePage({
  title,
  children,
  primary,
  secondary,
  icon = 'lock',
  tone = 'warn',
}: {
  title: string;
  children: ReactNode;
  primary?: Action;
  secondary?: Action;
  icon?: string;
  tone?: 'warn' | 'sky' | 'mint';
}) {
  return (
    <div className='ds-wrap pt-4 dsk:pt-6 pb-[var(--sec)]'>
      <div className='ds-panel ds-panel-bg'>
        <div className='ds-card mx-auto max-w-[640px] px-[22px] py-10 dsk:px-10 dsk:py-12 text-center'>
          <BigIcon name={icon} tone={tone} />
          <h1 className='mt-[18px] mb-2 text-[26px] dsk:text-[30px] font-extrabold text-navy leading-tight'>
            {title}
          </h1>
          <div className='mx-auto mb-6 max-w-[460px] text-muted'>{children}</div>
          {primary || secondary ? (
            <div className='flex flex-col dsk:flex-row gap-3 justify-center'>
              {primary ? (
                <ButtonLink href={primary.href} size='md'>
                  {primary.label}
                </ButtonLink>
              ) : null}
              {secondary ? (
                <ButtonLink href={secondary.href} variant='secondary' size='md'>
                  {secondary.label}
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
