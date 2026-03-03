'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Course } from '@/data/courses';

type Props = {
  courses: Course[];
};

type SortOrder = 'services-desc' | 'services-asc';

export function CoursesList({ courses }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('services-desc');
  const [minServices, setMinServices] = useState<number>(0);

  const processedCourses = useMemo(() => {
    const withCount = courses.map(course => ({
      ...course,
      servicesCount: course.services.length,
    }));

    const filtered = withCount.filter(
      course => course.servicesCount >= minServices
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'services-desc') {
        return b.servicesCount - a.servicesCount;
      }
      return a.servicesCount - b.servicesCount;
    });

    return sorted;
  }, [courses, minServices, sortOrder]);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <p className='text-sm text-gray-500'>
            Доступно курсов: {processedCourses.length} из {courses.length}
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <span>Фильтр по количеству услуг:</span>
            <select
              value={minServices}
              onChange={e => setMinServices(Number(e.target.value))}
              className='border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white'
            >
              <option value={0}>Все</option>
              <option value={1}>От 1 услуги</option>
              <option value={2}>От 2 услуг</option>
              <option value={3}>От 3 услуг</option>
            </select>
          </label>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <span>Сортировка:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as SortOrder)}
              className='border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white'
            >
              <option value='services-desc'>Сначала больше услуг</option>
              <option value='services-asc'>Сначала меньше услуг</option>
            </select>
          </label>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
      >
        {processedCourses.map((course, index) => (
          <motion.div
            key={course.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 * index }}
          >
            <Link
              href={`/dashboard/courses/${course.slug}`}
              className='flex flex-col h-full bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <div className='relative h-40 w-full'>
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes='(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'
                  className='object-cover'
                  priority={index < 2}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                <div className='absolute bottom-3 left-3 right-3'>
                  <p className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow'>
                    Связанных услуг: {course.services.length}
                  </p>
                </div>
              </div>
              <div className='flex-1 px-4 py-4 sm:px-5 sm:py-5 flex flex-col'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  {course.title}
                </h3>
                <p className='text-sm text-gray-600 mb-3 line-clamp-3'>
                  {course.shortDescription}
                </p>
                <div className='mt-auto flex items-center justify-between pt-2 border-t border-gray-100'>
                  <div className='flex -space-x-2'>
                    {course.services.slice(0, 3).map(service => (
                      <span
                        key={service.id}
                        className='inline-flex items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-700'
                      >
                        {service.title}
                      </span>
                    ))}
                    {course.services.length > 3 && (
                      <span className='inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600'>
                        +{course.services.length - 3}
                      </span>
                    )}
                  </div>
                  <span className='text-sm font-medium text-indigo-600 group-hover:text-indigo-700'>
                    Открыть курс
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
