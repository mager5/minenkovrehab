// Страница услуги или программы: /products/<slug>.
// Адрес берётся из каталога (catalog.ts), содержимое — из data.ts по id продукта.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPageProxy from './page-proxy';
import { getProductById } from '../productAdapter';
import {
  catalog,
  getCatalogItemBySlug,
  productPath,
  REHAB_PROGRAMS_PATH,
} from '../catalog';
import { pageMetadata, privateMetadata, SERVICES_OG_IMAGE } from '@/lib/seo';
import { breadcrumbs, catalogItemNode } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-static';
// Только адреса из каталога; остальное — 404 (старые адреса перенаправляет next.config.js).
export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map(item => ({ id: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = getCatalogItemBySlug(id);
  if (!item) return privateMetadata('Страница не найдена | Вадим Миненков');
  return pageMetadata({
    title: item.seoTitle,
    description: item.seoDescription,
    path: productPath(item),
    image: SERVICES_OG_IMAGE,
    socialTitle: item.title,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getCatalogItemBySlug(id);
  if (!item) notFound();
  const product = await getProductById(item.id);
  if (!product) notFound();

  const trail =
    item.kind === 'program'
      ? [
          { name: 'Услуги', path: '/products' },
          { name: 'Восстановительные программы', path: REHAB_PROGRAMS_PATH },
          { name: item.title, path: productPath(item) },
        ]
      : [
          { name: 'Услуги', path: '/products' },
          { name: item.title, path: productPath(item) },
        ];

  return (
    <>
      <JsonLd nodes={[catalogItemNode(item), breadcrumbs(trail)]} />
      <ProductPageProxy product={product} productExists />
    </>
  );
}
