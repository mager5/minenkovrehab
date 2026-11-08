'use client';

// Главная личного кабинета: «Мои программы» (только программы с материалами в кабинете),
// «Мои покупки» с понятным статусом по типу покупки, карточка аккаунта.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHead } from '@/components/ds/Layout';
import { Icon } from '@/components/ds/Icon';
import { COURSES, type Course } from '@/data/courses';
import {
  COURSE_BY_PRODUCT,
  accountContent,
  purchaseKind,
} from '@/data/content';
import { CONTACTS } from '@/lib/seo';
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

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const kind = purchaseKind(purchase.slug);
  const status = accountContent.purchaseStatus[kind];
  const course = COURSE_BY_PRODUCT[purchase.slug];
  const title = purchase.products?.title || 'Покупка';
  return (
    <li className='flex flex-col dsk:flex-row dsk:items-center gap-2 dsk:gap-4 py-4 border-t border-line first:border-t-0'>
      <div className='flex-1 min-w-0'>
        <span className='block text-[17px] font-bold text-ink'>{title}</span>
        {status.note ? (
          <span className='block text-[15px] text-muted mt-0.5'>{status.note}</span>
        ) : null}
      </div>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
        <span
          className={`ds-badge !text-[15px] !py-1.5 !px-3.5 ${
            kind === 'program' ? 'bg-mint text-mint-ink' : 'bg-sky text-navy'
          }`}
        >
          {status.badge}
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
          </div>
          <AccountAside email={user?.email ?? null} />
        </div>
      </section>
    </div>
  );
}
