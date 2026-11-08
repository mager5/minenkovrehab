import type { Metadata } from 'next';
import Link from 'next/link';
import { privateMetadata } from '@/lib/seo';
import { ButtonLink, CutoutCard, Icon } from '@/components/ds';

// 404: noindex, без canonical.
export const metadata: Metadata = privateMetadata(
  'Страница не найдена | Вадим Миненков'
);

const links = [
  { label: 'Обо мне', href: '/about' },
  { label: 'Услуги', href: '/products' },
  { label: 'Отзывы', href: '/reviews' },
  { label: 'Контакты', href: '/contacts' },
];

export default function NotFound() {
  return (
    <div className='ds'>
      <section className='ds-wrap pt-4 dsk:pt-6'>
        <div className='ds-panel ds-panel-bg grid gap-12 dsk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-center'>
          <div>
            <p
              aria-hidden='true'
              className='m-0 text-[96px] dsk:text-[140px] leading-none font-extrabold tracking-[-0.04em] text-[#BFD9EE]'
            >
              404
            </p>
            <h1 className='ds-h1 mt-3'>Страница не найдена</h1>
            <p className='ds-lead mt-4 mb-0'>
              Извините, запрашиваемая страница не существует.
            </p>
            <div className='flex flex-col dsk:flex-row gap-3.5 mt-8'>
              <ButtonLink href='/'>Вернуться на главную</ButtonLink>
              <ButtonLink href='/products' variant='secondary'>
                Услуги и цены
              </ButtonLink>
            </div>
            <p className='mt-8 mb-2.5 text-[16px] text-muted'>
              Возможно, вы искали:
            </p>
            <div className='flex flex-wrap gap-x-5 gap-y-1'>
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className='inline-flex items-center gap-1.5 min-h-[44px] font-bold text-brand hover:text-navy'
                >
                  {l.label}
                  <Icon name='chev-right' size={16} strokeWidth={2.4} />
                </Link>
              ))}
            </div>
          </div>
          <div className='hidden dsk:block'>
            <CutoutCard h={480} cardH={360} />
          </div>
        </div>
      </section>
    </div>
  );
}
