import type { Metadata } from 'next';

// Единые данные о сайте для метаданных, sitemap и schema.org.
export const SITE_URL = 'https://minenkovrehab.ru';
export const BRAND = 'Вадим Миненков — реабилитолог';
/** Короткое имя бренда в конце <title>. */
export const TITLE_SUFFIX = 'Вадим Миненков';
export const DEFAULT_OG_IMAGE = '/images/og-image.jpg';
export const SERVICES_OG_IMAGE = '/images/og/services-og.jpg';
export const CONTACTS_OG_IMAGE = '/images/og/contacts-og.jpg';

export const CONTACTS = {
  phone: '+7 928 328 70 52',
  phoneE164: '+79283287052',
  email: 'minenkov.rehab@yandex.ru',
  telegram: 'https://t.me/MV_Rehab',
  workingHours: 'Пн-Сб: 10:00-19:00',
  legalName: 'ИП Миненков Вадим Леонидович',
  inn: '262703733425',
  ogrnip: '325265100067202',
};

export const SOCIAL_PROFILES = [
  'https://t.me/MV_Rehab',
  'https://vk.com/minenkov_rehab',
  'https://youtube.com/@mv_rehab',
  'https://rutube.ru/channel/38070887',
  'https://dzen.ru/id/646ca9d1fc7bc51b6ac77784',
];

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

type PageSeo = {
  /** Полный <title>, без шаблона. */
  title: string;
  description: string;
  /** Путь страницы, например '/products'. */
  path: string;
  image?: string;
  imageAlt?: string;
  /** Короткий заголовок для превью в соцсетях; по умолчанию title. */
  socialTitle?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'profile';
};

/**
 * Метаданные страницы: свои title, description, canonical, Open Graph и Twitter.
 * Корневой layout не задаёт canonical/og:title/og:url, поэтому всё берётся отсюда.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  socialTitle,
  noindex = false,
  type = 'website',
}: PageSeo): Metadata {
  const ogTitle = socialTitle ?? title;
  const images = [
    {
      url: image,
      width: 1200,
      height: 630,
      alt: imageAlt ?? ogTitle,
      type: 'image/jpeg',
    },
  ];
  return {
    title: { absolute: title },
    description,
    alternates: noindex ? undefined : { canonical: path },
    robots: noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : undefined,
    openGraph: {
      type,
      locale: 'ru_RU',
      siteName: BRAND,
      title: ogTitle,
      description,
      url: path,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@minenkovrehab',
      creator: '@minenkovrehab',
      title: ogTitle,
      description,
      images: [image],
    },
  };
}

/** Служебная страница: свой title, noindex, без canonical. */
export function privateMetadata(title: string, description?: string): Metadata {
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}
