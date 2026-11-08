'use client';

// «Мои программы»: программы с материалами в кабинете, к которым открыт доступ. Без фильтров и сортировки.
import { useMemo } from 'react';
import { PageHead } from '@/components/ds/Layout';
import { accountContent } from '@/data/content';
import { useAccount } from '@/components/account/useAccount';
import {
  EmptyPrograms,
  LoadingCard,
  ProgramCard,
} from '@/components/account/AccountParts';
import {
  cabinetCourses,
  useLastStages,
} from '@/components/dashboard/DashboardClientPage';

export default function CoursesClientPage() {
  const { purchases, loading } = useAccount();
  const courses = useMemo(() => cabinetCourses(purchases), [purchases]);
  const lastStages = useLastStages(courses);

  return (
    <div className='pb-[var(--sec)]'>
      <PageHead
        crumbs={[
          { label: 'Личный кабинет', href: '/dashboard' },
          { label: 'Мои программы' },
        ]}
        title='Мои программы'
        lead={accountContent.coursesLead}
      />
      <section className='ds-wrap ds-sec'>
        {loading ? (
          <LoadingCard />
        ) : courses.length === 0 ? (
          <EmptyPrograms />
        ) : (
          <>
            <p className='m-0 mb-5 text-[16px] text-muted'>
              Доступно программ: {courses.length}
            </p>
            <div className='flex flex-col gap-4 max-w-[900px]'>
              {courses.map(c => (
                <ProgramCard key={c.slug} course={c} continueStage={lastStages[c.slug]} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
