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
  worksFor: { '@id': ORG_ID },
  knowsAbout: [
    'Физическая реабилитация',
    'Лечебная физкультура',
    'Восстановление после травм и операций',
    'Спортивная тренировка',
  ],
  sameAs: SOCIAL_PROFILES,
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
