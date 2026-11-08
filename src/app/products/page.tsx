import type { Metadata } from 'next';
import ProductsList from './ProductsList';
import { catalog, priceLabel, productPath } from './catalog';
import { pageMetadata, SERVICES_OG_IMAGE } from '@/lib/seo';
import { breadcrumbs, itemList } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Услуги и цены | Вадим Миненков',
  description:
    'Онлайн-консультации, тренировки, программа «Формула Движения» и восстановительные программы после травм и операций. Цены и форматы работы с реабилитологом.',
  path: '/products',
  image: SERVICES_OG_IMAGE,
  socialTitle: 'Услуги и цены',
});

export default function ProductsPage() {
  const services = catalog.map(item => ({
    href: productPath(item),
    title: item.title,
    description: item.description,
    price: priceLabel(item),
    image: item.image,
  }));

  return (
    <>
      <JsonLd
        nodes={[
          itemList('Услуги', catalog),
          breadcrumbs([{ name: 'Услуги', path: '/products' }]),
        ]}
      />
      <ProductsList
        title='Услуги'
        description='Выберите подходящую услугу для вашего восстановления и реабилитации'
        services={services}
      />
    </>
  );
}
