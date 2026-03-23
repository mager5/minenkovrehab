import { Metadata } from 'next';
import { getProductById } from '../productAdapter';
import ProductPageProxy from '../[id]/page-proxy';

export const metadata: Metadata = {
  title: 'Онлайн-тренировка | Миненков Вадим',
  description:
    'Индивидуальная онлайн-тренировка в формате видеоконференцсвязи. Продолжительность — 60 минут. Услуга доступна только после прохождения первичной онлайн-консультации.',
};

export default async function OnlineTrainingPage() {
  const product = await getProductById('online-training');
  const productExists = !!product;

  return <ProductPageProxy product={product} productExists={productExists} />;
}
