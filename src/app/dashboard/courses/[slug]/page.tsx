import { cookies } from 'next/headers';
import Link from 'next/link';
import { migrationBackendOrigin } from '@/lib/migration-config';
import CourseDetailClientPage from '@/components/dashboard/courses/CourseDetailClientPage';
import { COURSES } from '@/data/courses';
import { Metadata } from 'next';

type Params = {
  slug: string;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course =
    COURSES.find(item => item.slug === slug) ?? COURSES[0] ?? null;

  if (!course) {
    return {
      title: 'Курс не найден',
    };
  }

  const url = `https://minenkovrehab.ru/dashboard/courses/${course.slug}`;

  return {
    title: `${course.title} | Личный кабинет`,
    description: course.shortDescription,
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      url,
      images: [
        {
          url: course.image,
        },
      ],
      type: 'article',
    },
  };
}

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const origin=migrationBackendOrigin();
  if(!origin)throw new Error('Migration API unavailable');
  const response=await fetch(origin+'/api/courses/'+encodeURIComponent((await params).slug)+'/access',{headers:{cookie:(await cookies()).toString()},cache:'no-store'});
  if(response.status===403)return <main className='p-12'><h1>Доступ к курсу закрыт</h1><p>Для просмотра нужна активная покупка этого курса.</p><Link href='/products'>Программы</Link></main>;
  if(!response.ok)throw new Error('Course access unavailable');
  return <CourseDetailClientPage slug={(await params).slug} />;
}
