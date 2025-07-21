import { Metadata } from 'next';
import { getProductById } from '../productAdapter';
import ProductPageProxy from '../[id]/page-proxy';

export const metadata: Metadata = {
  title: 'Протоколы реабилитации | Миненков Вадим',
  description:
    'Пошаговые алгоритмы с подробным объяснением и демонстрацией упражнений при различных состояниях опорно-двигательного аппарата.',
};

export default async function RehabilitationProtocolsPage() {
  const product = await getProductById('rehabilitation-protocols');
  const productExists = !!product;

  return <ProductPageProxy product={product} productExists={productExists} />;
}
