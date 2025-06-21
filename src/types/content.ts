export interface Certificate {
  title: string;
  image: string;
}

// Расширенный тип для сервисов с ID
export interface ServiceWithId extends Service {
  id: string;
}

export interface Service {
  title: string;
  description: string;
  image: string;
  price: string;
}

// Типы для страницы About
export interface AboutHeroContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface AboutMissionValue {
  title: string;
  description: string;
}

export interface AboutMissionContent {
  title: string;
  description: string;
  values: AboutMissionValue[];
}

export interface AboutExperienceStat {
  value: number;
  label: string;
}

export interface AboutExperienceContent {
  title: string;
  description: string;
  stats: AboutExperienceStat[];
  yearsText: string;
}

export interface AboutApproachStep {
  title: string;
  description: string;
}

export interface AboutApproachContent {
  title: string;
  steps: AboutApproachStep[];
}

export interface AboutTeamContent {
  title: string;
  description: string;
}

export interface AboutPhoto {
  title: string;
  image: string;
}

export interface AboutContentType {
  hero: AboutHeroContent;
  mission: AboutMissionContent;
  experience: AboutExperienceContent;
  approach: AboutApproachContent;
  team: AboutTeamContent;
  photo: string;
  heroBg: string;
  advantages: string[];
  certificates: Certificate[];
  photos: AboutPhoto[];
}

// Типы для страницы Products
export interface ProductContentType {
  title: string;
  description: string;
  services: ServiceWithId[];
}

// Типы для главной страницы
export interface HomeAdvantage {
  description: string;
}

export interface HomeAboutContent {
  title: string;
  experience: string;
  description: string;
  priceTitle: string;
  priceDescription: string;
  methodsTitle: string;
  methodsDescription: string;
}

export interface HomeServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface HomeServicesContent {
  title: string;
  items: HomeServiceItem[];
}

export interface HomeHelpItem {
  title: string;
  description: string;
}

export interface HomeHelpContent {
  title: string;
  subtitle: string;
  items: HomeHelpItem[];
}

export interface HomeStatsContent {
  satisfiedClients: number;
  satisfiedClientsLabel: string;
  consultations: number;
  consultationsLabel: string;
  onlinePrograms: number;
  onlineProgramsLabel: string;
  experience: number;
  experienceLabel: string;
}

export interface HomeCtaContent {
  title: string;
  description: string;
  buttonText: string;
}

export interface HomeContent {
  advantages: HomeAdvantage[];
  about: HomeAboutContent;
  services: HomeServicesContent;
  help: HomeHelpContent;
  stats: HomeStatsContent;
  cta: HomeCtaContent;
}

// Типы для продуктов
export interface ProductItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string[];
  price: number;
  image: string;
}

export interface ConsultationProduct {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

// Устаревшие типы (для обратной совместимости)
export interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  photo: string;
  heroBg: string;
  experience: string;
  advantages: string[];
  certificates: Certificate[];
}

export interface ProductsContent {
  title: string;
  description: string;
  services: Service[];
  heroBg?: string;
}
