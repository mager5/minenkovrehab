"use client";

import { useState, useEffect } from 'react';
import { aboutContent } from '@/data/about-content';
import { getAboutContent } from '@/lib/content';
import {
  HeroSection,
  MissionSection,
  ExperienceSection,
  ApproachSection,
  TeamSection
} from '@/components/sections/about';

// Определение типа контента о нас
interface AboutContentType {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  mission: {
    title: string;
    description: string;
    values: {
      title: string;
      description: string;
    }[];
  };
  experience: {
    title: string;
    description: string;
    stats: {
      value: number;
      label: string;
    }[];
  };
  approach: {
    title: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  team: {
    title: string;
    description: string;
  };
}

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
        console.error('Ошибка загрузки данных о нас:', error);
      }
    }
    
    loadAboutData();
  }, []);
  
  return (
    <div className="min-h-screen overflow-x-hidden">
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