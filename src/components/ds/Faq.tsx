'use client';
// Аккордеон «Частые вопросы». Ответы в DOM всегда (не скрыты до гидрации) — свёрнутые прячутся через hidden.
import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Faq({
  items,
  idPrefix = 'faq',
}: {
  items: { q: string; a: ReactNode }[];
  idPrefix?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className='flex flex-col gap-3'>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className='rounded-[20px] bg-white'
            style={isOpen ? { boxShadow: 'var(--shadow-card)' } : undefined}
          >
            <h3 className='m-0'>
              <button
                type='button'
                id={`${idPrefix}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className='w-full flex justify-between items-center gap-4 py-[18px] px-5 dsk:py-[22px] dsk:px-6 border-0 bg-transparent font-[inherit] text-[17px] dsk:text-[19px] font-extrabold text-navy text-left cursor-pointer rounded-[20px]'
              >
                {it.q}
                <span
                  aria-hidden='true'
                  className='flex-none w-9 h-9 rounded-full flex items-center justify-center'
                  style={{
                    background: isOpen ? 'var(--c-blue)' : 'var(--c-sky)',
                  }}
                >
                  <Icon
                    name={isOpen ? 'minus' : 'plus'}
                    size={18}
                    strokeWidth={2.6}
                    color={isOpen ? '#fff' : 'var(--c-blue)'}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`${idPrefix}-a${i}`}
              role='region'
              aria-labelledby={`${idPrefix}-q${i}`}
              hidden={!isOpen}
              className='px-5 pb-5 dsk:px-6 dsk:pb-6 text-[17px] text-muted [&_a]:text-brand [&_a]:underline'
            >
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
