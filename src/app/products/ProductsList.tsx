'use client';

// Список услуг (/products) и хаб восстановительных программ (/products/rehab-programs).
// Карточки рисуются на сервере (данные приходят пропсами из каталога), поэтому все ссылки на услуги
// есть в исходном HTML; фильтр-чипы только скрывают группы на клиенте.
import { useState } from 'react';
import {
  Chips,
  PageHead,
  SectionHead,
  ServiceCard,
  ButtonLink,
  IconBox,
  Icon,
  type Crumb,
} from '@/components/ds';

export type ProductCard = {
  href: string;
  title: string;
  description: string;
  price: string;
  image: string;
  group?: 'online' | 'programs';
  tag?: string;
  featured?: boolean;
};

type Filter = 'all' | 'online' | 'programs';

function splitPrice(label: string) {
  const i = label.indexOf(' / ');
  return i === -1
    ? { price: label, unit: '' }
    : { price: label.slice(0, i), unit: label.slice(i + 1) };
}

function Grid({ items }: { items: ProductCard[] }) {
  return (
    <div className='grid gap-4 dsk:gap-6 sm:grid-cols-2 dsk:grid-cols-3'>
      {items.map(s => {
        const { price, unit } = splitPrice(s.price);
        return (
          <ServiceCard
            key={s.href}
            title={s.title}
            text={s.description}
            price={price}
            unit={unit}
            href={s.href}
            {...(s.tag ? { tag: s.tag } : {})}
            {...(s.featured ? { featured: true } : {})}
            headingLevel={3}
          />
        );
      })}
    </div>
  );
}

const notMedical = (
  <span className='inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-sky text-navy text-[15px] font-bold self-start whitespace-nowrap'>
    <Icon name='info' size={18} color='var(--c-blue)' />
    Не является медицинской услугой
  </span>
);

export default function ProductsList({
  title,
  description,
  services,
  crumbs,
  grouped = false,
}: {
  title: string;
  description: string;
  services: ProductCard[];
  crumbs: Crumb[];
  grouped?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const online = services.filter(s => s.group === 'online');
  const programs = services.filter(s => s.group === 'programs');

  return (
    <div className='ds'>
      <PageHead
        crumbs={crumbs}
        title={title}
        lead={description}
        extra={
          grouped ? (
            <div className='mt-7'>
              <Chips<Filter>
                label='Тип услуги'
                value={filter}
                onChange={setFilter}
                items={[
                  { value: 'all', label: 'Все услуги' },
                  { value: 'online', label: 'Онлайн-занятия' },
                  { value: 'programs', label: 'Программы' },
                ]}
              />
            </div>
          ) : (
            <div className='mt-6'>{notMedical}</div>
          )
        }
      />

      {grouped ? (
        <>
          {filter !== 'programs' ? (
            <section className='ds-wrap ds-sec' aria-labelledby='svc-online'>
              <SectionHead
                id='svc-online'
                title='Онлайн-занятия'
                sub='Консультации и тренировки по видеосвязи'
              />
              <Grid items={online} />
            </section>
          ) : null}
          {filter !== 'online' ? (
            <section className='ds-wrap ds-sec' aria-labelledby='svc-programs'>
              <SectionHead
                id='svc-programs'
                title='Программы для самостоятельных занятий'
                sub='Пошаговые алгоритмы с объяснением и демонстрацией упражнений'
                right={notMedical}
              />
              <Grid items={programs} />
            </section>
          ) : null}
        </>
      ) : (
        <section className='ds-wrap ds-sec'>
          <h2 className='sr-only'>Программы</h2>
          <Grid items={services} />
        </section>
      )}

      <section className='ds-wrap ds-sec'>
        <div className='ds-card grid gap-6 dsk:gap-8 dsk:grid-cols-[auto_minmax(0,1fr)_auto] items-center p-6 dsk:p-10'>
          <IconBox name='phone' size={64} radius={20} iconSize={28} />
          <div>
            <h2 className='m-0 text-[24px] dsk:text-[28px] font-extrabold text-navy leading-tight'>
              Не знаете, что выбрать?
            </h2>
            <p className='mt-2 mb-0 text-[17px] dsk:text-[18px] text-muted'>
              Экспресс онлайн-консультация — короткий разбор одного конкретного
              вопроса по видеосвязи: 20 минут, 4 000 ₽.
            </p>
          </div>
          <ButtonLink
            href='/products/express-consultation'
            size='md'
            className='ds-full-m'
          >
            Записаться на экспресс-консультацию
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
