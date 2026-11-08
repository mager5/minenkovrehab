import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { catalog, productPath, REHAB_PROGRAMS_PATH } from './products/catalog';

// Карта сайта строится из того же каталога, что и список /products.
// lastmod — дата последнего изменения содержимого страницы.
const pages: { path: string; updated: string; priority: number }[] = [
  { path: '/', updated: '2026-11-08', priority: 1 },
  { path: '/about', updated: '2026-11-08', priority: 0.8 },
  { path: '/products', updated: '2026-11-08', priority: 0.9 },
  { path: REHAB_PROGRAMS_PATH, updated: '2026-11-08', priority: 0.8 },
  { path: '/reviews', updated: '2026-11-08', priority: 0.6 },
  { path: '/contacts', updated: '2026-11-08', priority: 0.7 },
  { path: '/policy', updated: '2026-09-23', priority: 0.2 },
  { path: '/offer', updated: '2026-03-23', priority: 0.2 },
  { path: '/consent', updated: '2026-09-23', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = pages.map(p => ({
    url: new URL(p.path, SITE_URL).toString(),
    lastModified: p.updated,
    priority: p.priority,
  }));
  const products = catalog.map(item => ({
    url: new URL(productPath(item), SITE_URL).toString(),
    lastModified: item.updated,
    priority: 0.8,
  }));
  return [...staticPages, ...products];
}
