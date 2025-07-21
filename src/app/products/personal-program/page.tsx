import { Metadata } from 'next';
import { getProductById } from '../productAdapter';
import ProductPageProxy from '../[id]/page-proxy';

export const metadata: Metadata = {
  title: 'Резекция мениска. Протокол реабилитации. | Миненков Вадим',
  description:
    'Подробный информационный материал в формате пошагового алгоритма для восстановления после операции.',
};

export default async function PersonalProgramPage() {
  const product = await getProductById('personal-program');
  const productExists = !!product;

  return <ProductPageProxy product={product} productExists={productExists} />;
}
