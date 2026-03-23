import { Metadata } from 'next';
import { getProductById } from '../productAdapter';
import ProductPageProxy from '../[id]/page-proxy';

export const metadata: Metadata = {
  title: 'Онлайн-тренировка | Миненков Вадим',
  description:
    'Индивидуальная онлайн-тренировка в формате видеозвонка проводится по предварительному согласованию времени и даты. Продолжительность занятия — около 60 МИН.',
};

export default async function OnlineTrainingPage() {
  const product = await getProductById('online-training');
  const productExists = !!product;

  return <ProductPageProxy product={product} productExists={productExists} />;
}
