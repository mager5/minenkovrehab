// Разметка schema.org (JSON-LD). Только факты, которые есть на страницах сайта.
import {
  BRAND,
  CONTACTS,
  SITE_URL,
  SOCIAL_PROFILES,
  absoluteUrl,
} from '@/lib/seo';
import {
  type CatalogItem,
  catalog,
  productPath,
} from '@/app/products/catalog';
import { educationContent } from '@/data/content';

type Node = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#org`;
const PERSON_ID = `${SITE_URL}/#person`;
const SITE_ID = `${SITE_URL}/#site`;

const orgRef: Node = { '@type': 'Organization', '@id': ORG_ID, name: BRAND, url: `${SITE_URL}/` };

export const organization: Node = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: BRAND,
  url: `${SITE_URL}/`,
  legalName: CONTACTS.legalName,
  taxID: CONTACTS.inn,
  identifier: { '@type': 'PropertyValue', propertyID: 'ОГРНИП', value: CONTACTS.ogrnip },
  telephone: CONTACTS.phoneE164,
  email: CONTACTS.email,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/images/logo.png'),
    width: 512,
    height: 512,
  },
  founder: { '@id': PERSON_ID },
  sameAs: SOCIAL_PROFILES,
};

export const person: Node = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Вадим Миненков',
  givenName: 'Вадим',
  familyName: 'Миненков',
  url: absoluteUrl('/about'),
  jobTitle: 'Специалист по физической реабилитации, инструктор-методист ЛФК',
  image: {
    '@type': 'ImageObject',
    url: absoluteUrl('/images/hero/blue-stripe.JPG'),
    width: 1200,
    height: 1600,
  },
  worksFor: { '@id': ORG_ID },
  knowsAbout: [
    'Физическая реабилитация',
    'ЛФК',
    'Восстановление после травм и операций',
    'Спортивная тренировка',
  ],
  sameAs: SOCIAL_PROFILES,
  // Образование и сертификаты — из educationContent (страница /about); пока пусто, поля не выводятся.
  ...(educationContent.institutions.length
    ? {
        alumniOf: educationContent.institutions.map(i => ({
          '@type': 'EducationalOrganization',
          name: i.name,
          ...(i.url ? { url: i.url } : {}),
        })),
      }
    : {}),
  ...(educationContent.items.length
    ? {
        hasCredential: educationContent.items.map(c => ({
          '@type': 'EducationalOccupationalCredential',
          name: c.title,
          ...(c.org ? { recognizedBy: { '@type': 'Organization', name: c.org } } : {}),
          ...(c.year ? { dateCreated: c.year } : {}),
          image: absoluteUrl(c.image),
        })),
      }
    : {}),
};

export const website: Node = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: `${SITE_URL}/`,
  name: BRAND,
  inLanguage: 'ru-RU',
  publisher: { '@id': ORG_ID },
};

export type Crumb = { name: string; path: string };

export function breadcrumbs(items: Crumb[]): Node {
  const all = [{ name: 'Главная', path: '/' }, ...items];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

function offer(item: CatalogItem): Node {
  return {
    '@type': 'Offer',
    price: String(item.price),
    priceCurrency: 'RUB',
    availability: 'https://schema.org/InStock',
    url: absoluteUrl(productPath(item)),
    seller: orgRef,
  };
}

/** Product для программ и «Формулы Движения», Service для консультаций и тренировок. */
export function catalogItemNode(item: CatalogItem): Node {
  const base: Node = {
    name: item.title,
    description: item.seoDescription,
    url: absoluteUrl(productPath(item)),
    image: absoluteUrl(item.image),
    offers: offer(item),
  };
  if (item.kind === 'program' || item.id === 'formula-movement') {
    return { '@type': 'Product', ...base, brand: { '@type': 'Brand', name: BRAND } };
  }
  return {
    '@type': 'Service',
    ...base,
    serviceType: item.title,
    provider: orgRef,
    areaServed: { '@type': 'Country', name: 'Россия' },
    availableChannel: {
      '@type': 'ServiceChannel',
      name: 'Видеозвонок',
      serviceUrl: absoluteUrl(productPath(item)),
    },
  };
}

export function itemList(name: string, items: CatalogItem[] = catalog): Node {
  return {
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(productPath(item)),
      name: item.title,
    })),
  };
}

export function graph(...nodes: Node[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(
    /</g,
    '\\u003c'
  );
}

/** Видимый текст ответа: без HTML-тегов (ссылки в ответах остаются просто текстом). */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** FAQPage: ровно те вопросы и ответы, что видны в блоке «Частые вопросы» на странице. */
export function faqPage(items: { q: string; a: string }[]): Node {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(it => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: plainText(it.a) },
    })),
  };
}

type Video = {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  embedUrl: string;
};

/**
 * Публичные видео на страницах продуктов (данные из Kinescope).
 * Если видео в Kinescope заменят — обновить embedUrl, thumbnailUrl, uploadDate и duration.
 */
export const productVideos: Record<string, Video> = {
  'personal-program': {
    name: 'Презентация программы восстановления после резекции мениска',
    description:
      'Видеопрезентация программы: из чего состоит программа восстановления после резекции мениска, как устроены этапы и видео упражнений.',
    thumbnailUrl:
      'https://edge-ams-1.kinescopecdn.net/d69b8c22-fa90-4413-b2a1-908d3f57e051/posters/09cdccd4-938e-4db6-bdf0-052d863f36ee/poster_lg/01a16513-5158-7986-85a3-458ef86a2a63.jpg',
    uploadDate: '2026-10-22T19:23:43+00:00',
    duration: 'PT8M43S',
    embedUrl: 'https://kinescope.io/embed/o7Uc52w89oCL6xMmFkukyR',
  },
};

export function videoObject(v: Video): Node {
  return { '@type': 'VideoObject', ...v, inLanguage: 'ru-RU', publisher: { '@id': ORG_ID } };
}
