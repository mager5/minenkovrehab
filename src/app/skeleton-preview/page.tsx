'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import HomeSkeleton from '@/components/HomeSkeleton';
import DefaultPageSkeleton from '@/components/skeletons/DefaultPageSkeleton';
import { 
  CircleSkeleton, 
  TextSkeleton, 
  ImageSkeleton, 
  ButtonSkeleton,
  AvatarWithTextSkeleton,
  CardSkeleton,
  ServiceCardSkeleton,
  TestimonialSkeleton,
  StatsSkeleton,
  FeatureCardSkeleton,
  HeroSkeleton,
  AboutSectionCardSkeleton,
  ContactInfoSkeleton,
  SocialButtonSkeleton
} from '@/components/ui/Skeleton';

export default function SkeletonPreviewPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Предпросмотр скелетонов</h1>
      <p className="mb-4">На этой странице вы можете просмотреть все скелетоны, используемые на сайте.</p>
      
      <div className="mb-8">
        <button 
          onClick={() => router.push('/?skeleton=true')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mr-4"
        >
          Просмотр главной страницы со скелетоном
        </button>
        
        <button 
          onClick={() => router.back()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Вернуться назад
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">HomeSkeleton</h2>
          <div className="border p-4 rounded bg-gray-50">
            <HomeSkeleton />
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">DefaultPageSkeleton</h2>
          <div className="border p-4 rounded bg-gray-50">
            <DefaultPageSkeleton />
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Базовые компоненты</h2>
          <div className="space-y-4 border p-4 rounded bg-gray-50">
            <div>
              <p className="text-sm text-gray-500 mb-1">CircleSkeleton</p>
              <CircleSkeleton width={50} height={50} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">TextSkeleton</p>
              <TextSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ImageSkeleton</p>
              <ImageSkeleton height="150px" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ButtonSkeleton</p>
              <ButtonSkeleton width="120px" height="40px" />
            </div>
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Сложные компоненты</h2>
          <div className="space-y-6 border p-4 rounded bg-gray-50">
            <div>
              <p className="text-sm text-gray-500 mb-1">AvatarWithTextSkeleton</p>
              <AvatarWithTextSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">CardSkeleton</p>
              <CardSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ServiceCardSkeleton</p>
              <ServiceCardSkeleton />
            </div>
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Содержимое страниц</h2>
          <div className="space-y-6 border p-4 rounded bg-gray-50">
            <div>
              <p className="text-sm text-gray-500 mb-1">TestimonialSkeleton</p>
              <TestimonialSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">StatsSkeleton</p>
              <StatsSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">FeatureCardSkeleton</p>
              <FeatureCardSkeleton />
            </div>
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Секции</h2>
          <div className="space-y-6 border p-4 rounded bg-gray-50">
            <div>
              <p className="text-sm text-gray-500 mb-1">HeroSkeleton</p>
              <HeroSkeleton className="h-[300px]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">AboutSectionCardSkeleton</p>
              <AboutSectionCardSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ContactInfoSkeleton</p>
              <ContactInfoSkeleton />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">SocialButtonSkeleton</p>
              <SocialButtonSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 