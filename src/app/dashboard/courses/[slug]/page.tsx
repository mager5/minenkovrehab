import CourseDetailClientPage from '@/components/dashboard/courses/CourseDetailClientPage';
import { COURSES } from '@/data/courses';
import { Metadata } from 'next';

type Params = {
  slug: string;
};

export function generateStaticParams() {
  return COURSES.map(course => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const course =
    COURSES.find(item => item.slug === params.slug) ?? COURSES[0] ?? null;

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

export default function CoursePage({ params }: { params: Params }) {
  return <CourseDetailClientPage slug={params.slug} />;
}
