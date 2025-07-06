'use client';

import Link from 'next/link';
import {
  AboutSection,
  ServicesSection,
  HelpSection,
  CTASection,
} from '@/components';
import { HomeContent } from '@/types/content';

interface ClientHomePageProps {
  content: HomeContent;
}

export default function ClientHomePage({ content }: ClientHomePageProps) {
  if (!content || !content.hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Контент не найден</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen overflow-x-hidden'>
      {/* Hero секция с фоном и текстом */}
      <section className='hero-section pt-32 sm:pt-16 pb-20 lg:pt-40 lg:pb-32 overflow-hidden'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-12'>
            <div className='md:w-1/2 text-white'>
              <h1
                className='hero-title font-bold mb-6 leading-tight'
                style={{ color: '#d1f3ea' }}
              >
                {content.hero.title}
              </h1>
              <p
                className='text-base sm:text-lg md:text-xl opacity-95 mb-8 font-medium leading-relaxed'
                style={{ color: '#FFFFFF' }}
              >
                {content.hero.description}
              </p>
              <div className='flex flex-col sm:flex-row gap-4 w-full'>
                <Link
                  href={content.hero.cta1?.link || '/about'}
                  className='btn bg-accent hover:bg-accent-dark text-white !text-white px-6 py-3 rounded-md font-medium transition-all hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto text-center'
                >
                  {content.hero.cta1?.text || 'Узнать больше'}
                </Link>
                <Link
                  href={content.hero.cta2?.link || '/contacts'}
                  className='btn bg-white/90 text-primary hover:bg-white/95 px-6 py-3 rounded-md font-medium transition-all hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto text-center'
                >
                  {content.hero.cta2?.text || 'Записаться'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Секции */}
      <AboutSection content={content} />
      <ServicesSection content={content} />
      <HelpSection content={content} />
      <CTASection content={content} />
    </div>
  );
} 