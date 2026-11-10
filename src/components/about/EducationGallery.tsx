'use client';
// «Образование и сертификаты» на /about: карточки документов (десктоп — сетка 2×2,
// телефон — горизонтальная карусель) и просмотр документа целиком в диалоге.
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import type { EducationDoc } from '@/data/content';

export function EducationGallery({ items }: { items: EducationDoc[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const show = useCallback((i: number) => {
    setOpen(i);
    if (!dlg.current?.open) dlg.current?.showModal();
  }, []);
  const close = useCallback(() => dlg.current?.close(), []);
  const step = useCallback(
    (d: number) =>
      setOpen(i => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    const el = dlg.current;
    if (!el) return;
    const onClose = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    el.addEventListener('close', onClose);
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('close', onClose);
      el.removeEventListener('keydown', onKey);
    };
  }, [step]);

  const doc = open === null ? null : items[open];

  return (
    <>
      <ul className='list-none m-0 p-0 flex dsk:grid dsk:grid-cols-2 gap-4 dsk:gap-6 overflow-x-auto dsk:overflow-visible snap-x snap-mandatory -mx-6 px-6 dsk:mx-0 dsk:px-0 pb-3 dsk:pb-0 ds-hscroll'>
        {items.map((d, i) => (
          <li
            key={d.image}
            className='flex-[0_0_86%] sm:flex-[0_0_60%] dsk:flex-auto snap-start min-w-0'
          >
            <button
              type='button'
              onClick={() => show(i)}
              aria-haspopup='dialog'
              aria-label={`Открыть документ: ${d.kind}, ${d.title}, ${d.year}`}
              className='group w-full h-full text-left flex flex-col gap-4 p-3 dsk:p-4 rounded-[24px] bg-canvas border-0 cursor-pointer font-[inherit] ds-focus hover:shadow-pop transition-shadow'
            >
              <span className='relative block w-full aspect-[3/2] rounded-[16px] overflow-hidden bg-white'>
                <Image
                  src={d.image}
                  alt={`${d.kind}: ${d.title}, ${d.org}, ${d.year}`}
                  fill
                  sizes='(min-width: 901px) 560px, 86vw'
                  className='object-contain transition-transform duration-300 group-hover:scale-[1.02]'
                />
                <span className='absolute right-3 bottom-3 w-11 h-11 rounded-full bg-white/95 shadow-[0_6px_16px_rgba(13,60,99,.16)] flex items-center justify-center'>
                  <Icon name='eye' size={20} color='var(--c-blue)' />
                </span>
              </span>
              <span className='flex flex-col gap-1.5 px-2 pb-2'>
                <span className='flex items-center gap-2 flex-wrap'>
                  <span className='ds-badge bg-mint text-mint-ink'>
                    {d.year}
                  </span>
                  <span className='text-[15px] text-muted font-semibold'>
                    {d.kind}
                  </span>
                </span>
                <strong className='text-[19px] dsk:text-[20px] leading-[1.3] text-navy'>
                  {d.title}
                </strong>
                <span className='text-[15px] dsk:text-[16px] text-muted leading-snug'>
                  {d.org}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dlg}
        aria-label={doc ? `${doc.kind}: ${doc.title}` : 'Документ'}
        onClick={e => {
          if (e.target === e.currentTarget) close();
        }}
        className='m-auto p-0 border-0 bg-transparent max-w-none max-h-none w-screen h-[100dvh] backdrop:bg-[rgba(10,24,40,.94)]'
      >
        {doc ? (
          <div
            className='w-full h-full flex flex-col items-center justify-center gap-3 dsk:gap-4 px-3 dsk:px-20 py-4'
            onClick={e => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className='w-full max-w-[1200px] flex items-start justify-between gap-4 text-white'>
              <p className='m-0 leading-snug'>
                <strong className='block text-[17px] dsk:text-[20px]'>
                  {doc.title}, {doc.year}
                </strong>
                <span className='text-[15px] text-white/80'>{doc.org}</span>
              </p>
              <button
                type='button'
                onClick={close}
                aria-label='Закрыть'
                className='flex-none w-11 h-11 rounded-full bg-white text-navy border-0 cursor-pointer flex items-center justify-center ds-focus'
              >
                <Icon name='close' size={22} />
              </button>
            </div>
            <div className='relative w-full max-w-[1200px] flex-1 min-h-0'>
              <Image
                key={doc.image}
                src={doc.image}
                alt={`${doc.kind}: ${doc.title}, ${doc.org}, ${doc.year}`}
                fill
                sizes='(min-width: 901px) 1200px, 100vw'
                className='object-contain'
              />
            </div>
            {items.length > 1 ? (
              <div className='flex items-center gap-4 text-white'>
                <button
                  type='button'
                  onClick={() => step(-1)}
                  aria-label='Предыдущий документ'
                  className='w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center ds-focus'
                >
                  <Icon name='chev-left' size={22} />
                </button>
                <span className='text-[15px] font-semibold tabular-nums'>
                  {(open ?? 0) + 1} из {items.length}
                </span>
                <button
                  type='button'
                  onClick={() => step(1)}
                  aria-label='Следующий документ'
                  className='w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center ds-focus'
                >
                  <Icon name='chev-right' size={22} />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
