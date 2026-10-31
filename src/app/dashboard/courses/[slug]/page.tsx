import { cookies } from 'next/headers';
import NoticePage from '@/components/shared/NoticePage';
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
  if(response.status===403)return <NoticePage title='Доступ к курсу закрыт' primary={{href:'/products',label:'Выбрать программу'}} secondary={{href:'/dashboard',label:'В личный кабинет'}}>Для просмотра нужна активная покупка этого курса.</NoticePage>;
  if(!response.ok)throw new Error('Course access unavailable');
  return <CourseDetailClientPage slug={(await params).slug} />;
}
