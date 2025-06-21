'use client';

import { useState, useEffect } from 'react';
import { aboutContent } from '@/data/content';
import { getAboutContent } from '@/lib/content';
import { AboutContentType } from '@/types/content';
import {
  HeroSection,
  MissionSection,
  ExperienceSection,
  ApproachSection,
  TeamSection,
} from '@/components';

export default function About() {
  // Состояние для данных страницы
  const [content, setContent] = useState<AboutContentType>(aboutContent);

  // Загрузка контента при монтировании компонента
  useEffect(() => {
    async function loadAboutData() {
      try {
        const data = await getAboutContent<AboutContentType>();
        setContent(data);
      } catch (error) {
        // Log error for debugging in development
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Ошибка загрузки данных о нас:', error);
        }
      }
    }

    loadAboutData();
  }, []);

  return (
    <div className='min-h-screen overflow-x-hidden'>
      {/* Hero секция */}
      <HeroSection
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        description={content.hero.description}
      />

      {/* Миссия */}
      <MissionSection
        title={content.mission.title}
        description={content.mission.description}
        values={content.mission.values}
      />

      {/* Опыт и статистика */}
      <ExperienceSection
        title={content.experience.title}
        description={content.experience.description}
        stats={content.experience.stats}
      />

      {/* Наш подход */}
      <ApproachSection
        title={content.approach.title}
        steps={content.approach.steps}
      />

      {/* Команда */}
      <TeamSection
        title={content.team.title}
        description={content.team.description}
      />
    </div>
  );
}
