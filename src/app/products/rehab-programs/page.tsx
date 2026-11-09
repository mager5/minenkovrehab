import type { Metadata } from 'next';
import ProductsList from '../ProductsList';
import {
  priceLabel,
  productPath,
  rehabPrograms,
  REHAB_PROGRAMS_PATH,
} from '../catalog';
import { pageMetadata, SERVICES_OG_IMAGE } from '@/lib/seo';
import { breadcrumbs, itemList } from '@/lib/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Восстановительные программы | Вадим Миненков',
  description:
    'Готовые восстановительные программы с видео упражнений: после резекции мениска. Пошаговые этапы, текст и видео упражнений.',
  path: REHAB_PROGRAMS_PATH,
  image: SERVICES_OG_IMAGE,
  socialTitle: 'Восстановительные программы',
});

// Хаб всех восстановительных программ: сюда ведут пункты «Восстановительные программы» в шапке, подвале и на главной.
export default function RehabProgramsPage() {
  const services = rehabPrograms.map(item => ({
    href: productPath(item),
    title: item.title,
    description: item.description,
    price: priceLabel(item),
    image: item.image,
    tag: 'Восстановительная программа',
  }));

  return (
    <>
      <JsonLd
        nodes={[
          itemList('Восстановительные программы', rehabPrograms),
          breadcrumbs([
            { name: 'Услуги', path: '/products' },
            { name: 'Восстановительные программы', path: REHAB_PROGRAMS_PATH },
          ]),
        ]}
      />
      <ProductsList
        title='Восстановительные программы'
        description='Пошаговые алгоритмы с подробным объяснением и демонстрацией упражнений при различных состояниях опорно-двигательного аппарата'
        services={services}
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Услуги', href: '/products' },
          { label: 'Восстановительные программы' },
        ]}
      />
    </>
  );
}
