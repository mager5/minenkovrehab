import type { Metadata } from 'next';
import { aboutContent as content } from '@/data/content';
import {
  HeroSection,
  MissionSection,
  ExperienceSection,
  ApproachSection,
  TeamSection,
} from '@/components';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbs, person } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Обо мне — инструктор-методист ЛФК | Вадим Миненков',
  description:
    'Вадим Миненков — специалист по физической реабилитации и спортивной тренировке, инструктор-методист ЛФК. Опыт 8+ лет, онлайн-консультации и программы.',
  path: '/about',
  socialTitle: 'Обо мне — Вадим Миненков',
  type: 'profile',
});

// Контент страницы — один источник (src/data/content.ts), рендерится на сервере.
export default function About() {
  return (
    <div className='min-h-screen overflow-x-hidden'>
      <JsonLd
        nodes={[
          {
            '@type': 'ProfilePage',
            url: 'https://minenkovrehab.ru/about',
            name: 'Обо мне',
            mainEntity: person,
          },
          breadcrumbs([{ name: 'Обо мне', path: '/about' }]),
        ]}
      />
      <HeroSection
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        description={content.hero.description}
      />
      <MissionSection
        title={content.mission.title}
        description={content.mission.description}
        values={content.mission.values}
      />
      <ExperienceSection
        title={content.experience.title}
        description={content.experience.description}
        stats={content.experience.stats}
      />
      <ApproachSection
        title={content.approach.title}
        steps={content.approach.steps}
      />
      {/* Без заголовка: H1 «Обо мне» уже есть в первом экране */}
      <TeamSection description={content.team.description} />
    </div>
  );
}
