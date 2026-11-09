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
import { pageMetadata, privateMetadata, productOgImage } from '@/lib/seo';
import { breadcrumbs, catalogItemNode, faqPage, productVideos, videoObject } from '@/lib/schema';
import { productPageContent } from '@/data/content';
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
    image: productOgImage(item.slug),
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

  // FAQPage — из того же блока «Частые вопросы», что выводится на странице; VideoObject — публичная видеопрезентация.
  const content = productPageContent[item.id];
  const video = productVideos[item.id];
  const extraNodes = [
    ...(content?.template === 'program' && content.faq.length ? [faqPage(content.faq)] : []),
    ...(video ? [videoObject(video)] : []),
  ];

  return (
    <>
      <JsonLd nodes={[catalogItemNode(item), breadcrumbs(trail), ...extraNodes]} />
      <ProductPageProxy product={product} productExists />
    </>
  );
}
