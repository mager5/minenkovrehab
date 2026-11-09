// Каркас страниц входа: панель с градиентом, слева заголовок и пояснения, справа белая карточка с формой.
import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';

export type AuthBullet = { icon: string; text: ReactNode };

export function AuthShell({
  title,
  lead,
  bullets,
  children,
  below,
}: {
  title: ReactNode;
  lead?: ReactNode;
  bullets?: AuthBullet[];
  children: ReactNode;
  /** Дополнительный блок под панелью (например, второе состояние). */
  below?: ReactNode;
}) {
  // Телефон (≤768px): короткий заголовок → сразу карточка формы → пояснения под формой;
  // панель без фона и двойных отступов. Десктоп — как раньше: слева заголовок и пояснения, справа форма.
  return (
    <div className='pb-[var(--sec)]'>
      <section className='ds-wrap pt-4 dsk:pt-6 max-[768px]:pt-3'>
        <div className='ds-panel ds-panel-bg grid gap-8 dsk:gap-x-14 dsk:gap-y-0 dsk:grid-cols-2 dsk:grid-rows-[auto_1fr] items-start max-[768px]:!p-0 max-[768px]:[background:none] max-[768px]:gap-4'>
          <div className='min-w-0 dsk:pt-2 dsk:col-start-1 dsk:row-start-1'>
            <h1 className='ds-h1 dsk:!text-[48px] max-[768px]:!text-[29px] max-[768px]:!leading-[1.15]'>
              {title}
            </h1>
            {lead ? (
              <p className='ds-lead mt-4 mb-0 max-w-[520px] max-[768px]:hidden'>
                {lead}
              </p>
            ) : null}
          </div>
          {bullets?.length ? (
            <ul className='list-none -mt-2 dsk:mt-8 mb-0 p-0 flex flex-col gap-3.5 dsk:col-start-1 dsk:row-start-2 max-[768px]:order-3 max-[768px]:mt-2 max-[768px]:px-1'>
              {bullets.map((b, i) => (
                <li key={i} className='flex gap-3 items-start'>
                  <span
                    aria-hidden='true'
                    className='flex-none w-9 h-9 rounded-xl bg-white flex items-center justify-center'
                  >
                    <Icon name={b.icon} size={18} color='var(--c-mint-ink)' />
                  </span>
                  <span className='text-[17px] pt-[5px] [&_a]:text-brand'>
                    {b.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className='ds-card p-[22px] dsk:p-10 min-w-0 dsk:col-start-2 dsk:row-start-1 dsk:row-span-2 max-[768px]:order-2 max-[768px]:!p-5'>
            {children}
          </div>
        </div>
      </section>
      {below}
    </div>
  );
}

/** Заголовок карточки формы. */
export function CardHead({
  title,
  sub,
}: {
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <>
      <h2 className='m-0 mb-1.5 text-[24px] dsk:text-[26px] font-extrabold text-navy leading-tight max-[768px]:text-[21px] max-[768px]:mb-4'>
        {title}
      </h2>
      {sub ? (
        <p className='m-0 mb-6 text-[16px] text-muted max-[768px]:hidden'>
          {sub}
        </p>
      ) : (
        <div className='mb-6 max-[768px]:hidden' />
      )}
    </>
  );
}

/** Ссылка «назад» со стрелкой (≥44px). */
export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className='inline-flex items-center gap-1.5 min-h-[44px] font-bold text-brand no-underline hover:text-navy ds-focus rounded-lg'
    >
      <Icon name='arrow-left' size={18} strokeWidth={2.4} />
      {children}
    </a>
  );
}
