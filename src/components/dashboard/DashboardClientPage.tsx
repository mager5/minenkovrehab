'use client';

// Главная личного кабинета: «Мои программы» (только программы с материалами в кабинете),
// «Мои покупки» со статусом по источнику записи (оплата / доступ выдан) и подсказкой по типу,
// «Вам может подойти» — продукты каталога, которых у человека ещё нет; карточка аккаунта.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHead } from '@/components/ds/Layout';
import { Icon } from '@/components/ds/Icon';
import { ServiceCard } from '@/components/ds/Cards';
import { COURSES, type Course } from '@/data/courses';
import {
  COURSE_BY_PRODUCT,
  RECOMMEND_ORDER,
  accountContent,
  moreCards,
  purchaseKind,
} from '@/data/content';
import { CONTACTS } from '@/lib/seo';
import { getCatalogItemById } from '@/app/products/catalog';
import { readLastStage } from '@/lib/course-progress';
import { useAccount, type Purchase } from '@/components/account/useAccount';
import {
  AccountAside,
  EmptyPrograms,
  LoadingCard,
  ProgramCard,
} from '@/components/account/AccountParts';

/** Программы с материалами в кабинете, к которым у человека есть доступ. */
export function cabinetCourses(purchases: Purchase[]): Course[] {
  const slugs = new Set(
    purchases.map(p => COURSE_BY_PRODUCT[p.slug]).filter(Boolean)
  );
  return COURSES.filter(c => c.hasCabinetPage && slugs.has(c.slug));
}

export function useLastStages(courses: Course[]) {
  const [stages, setStages] = useState<Record<string, number>>({});
  useEffect(() => {
    const next: Record<string, number> = {};
    for (const c of courses) {
      const n = readLastStage(c.slug, 5);
      if (n) next[c.slug] = n;
    }
    setStages(next);
  }, [courses]);
  return stages;
}

/** Название покупки по slug из каталога сайта, в одном формате; «Формула Движения» — с уровнем. */
export function purchaseTitle(purchase: Purchase): string {
  const level = purchase.slug.match(/^formula-movement-level-(\d+)$/);
  if (level) return `Формула Движения. Уровень ${level[1]}`;
  return (
    getCatalogItemById(purchase.slug)?.title ||
    purchase.products?.title ||
    'Покупка'
  );
}

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const kind = purchaseKind(purchase.slug);
  const status = accountContent.purchaseStatus[kind];
  const badge = purchase.paid_via
    ? accountContent.sourceBadge[purchase.paid_via]
    : status.badge;
  const course = COURSE_BY_PRODUCT[purchase.slug];
  const title = purchaseTitle(purchase);
  return (
    <li className='flex flex-col dsk:flex-row dsk:items-center gap-2 dsk:gap-4 py-4 border-t border-line first:border-t-0'>
      <div className='flex-1 min-w-0'>
        <span className='block text-[17px] font-bold text-ink'>{title}</span>
        {status.note ? (
          <span className='block text-[15px] text-muted mt-0.5'>
            {status.note}
          </span>
        ) : null}
      </div>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
        <span
          className={`ds-badge !text-[15px] !py-1.5 !px-3.5 ${
            kind === 'program' ? 'bg-mint text-mint-ink' : 'bg-sky text-navy'
          }`}
        >
          {badge}
        </span>
        {kind === 'program' && course ? (
          <Link
            href={`/dashboard/courses/${course}`}
            className='inline-flex items-center min-h-[44px] font-bold text-brand no-underline hover:text-navy ds-focus rounded-lg'
          >
            {status.action}
          </Link>
        ) : (
          <a
            href={CONTACTS.telegram}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 min-h-[44px] font-bold text-brand no-underline hover:text-navy ds-focus rounded-lg'
          >
            <Icon name='send' size={18} />
            {status.action}
          </a>
        )}
      </div>
    </li>
  );
}

/** До трёх продуктов каталога, которых у человека ещё нет: сначала программы, потом услуги. */
export function recommendations(purchases: Purchase[]) {
  const owned = new Set(purchases.map(p => p.slug));
  return RECOMMEND_ORDER.filter(id => !owned.has(id) && moreCards[id])
    .slice(0, 3)
    .map(id => moreCards[id]!);
}

function Recommendations({ purchases }: { purchases: Purchase[] }) {
  const cards = useMemo(() => recommendations(purchases), [purchases]);
  if (!cards.length) return null;
  return (
    <section aria-labelledby='recommend-title'>
      <h2 id='recommend-title' className='ds-h2 ds-h2-sm mb-5'>
        {accountContent.recommendTitle}
      </h2>
      {/* Телефон: горизонтальная карусель со snap; десктоп: сетка */}
      <div
        className={`flex dsk:grid gap-4 dsk:gap-5 overflow-x-auto dsk:overflow-visible snap-x snap-mandatory -mx-4 px-4 dsk:mx-0 dsk:px-0 pb-3 dsk:pb-0 ds-hscroll ${
          cards.length > 2 ? 'dsk:grid-cols-3' : 'dsk:grid-cols-2'
        }`}
      >
        {cards.map(c => (
          <div
            key={c.href}
            className='flex-[0_0_84%] dsk:flex-auto snap-start min-w-0'
          >
            <ServiceCard
              title={c.title}
              text={c.text}
              price={c.price}
              unit={c.unit}
              href={c.href}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardClientPage() {
  const { user, purchases, loading } = useAccount();
  const courses = useMemo(() => cabinetCourses(purchases), [purchases]);
  const lastStages = useLastStages(courses);

  return (
    <div className='pb-[var(--sec)]'>
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Личный кабинет' }]}
        title='Личный кабинет'
        lead={accountContent.dashboardLead}
      />
      <section className='ds-wrap ds-sec'>
        <div className='grid gap-6 dsk:gap-8 dsk:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] items-start'>
          <div className='min-w-0 flex flex-col gap-6'>
            {loading ? (
              <LoadingCard />
            ) : purchases.length === 0 ? (
              <EmptyPrograms />
            ) : (
              <>
                {courses.length ? (
                  <div>
                    <h2 className='ds-h2 ds-h2-sm mb-5'>Мои программы</h2>
                    <div className='flex flex-col gap-4'>
                      {courses.map(c => (
                        <ProgramCard
                          key={c.slug}
                          course={c}
                          continueStage={lastStages[c.slug]}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className='ds-card px-[22px] py-6 dsk:px-9 dsk:py-8'>
                  <h2 className='m-0 mb-2 text-[24px] dsk:text-[26px] font-extrabold text-navy'>
                    Мои покупки
                  </h2>
                  <ul className='list-none m-0 p-0'>
                    {purchases.map(p => (
                      <PurchaseRow key={p.id} purchase={p} />
                    ))}
                  </ul>
                </div>
              </>
            )}
            {loading ? null : <Recommendations purchases={purchases} />}
          </div>
          <AccountAside email={user?.email ?? null} />
        </div>
      </section>
    </div>
  );
}
