import { Metadata } from 'next';
import { getProductById } from '../productAdapter';
import ProductPageProxy from '../[id]/page-proxy';

export const metadata: Metadata = {
  title: 'Программа тренировок "Формула Движения" | Миненков Вадим',
  description:
    'Авторская программа тренировок для всего тела. Занимайтесь по готовым комплексам — улучшайте подвижность суставов, развивайте силу и укрепляйте контроль движений.',
};

export default async function FormulaMovementPage() {
  const product = await getProductById('formula-movement');
  const productExists = !!product;

  return <ProductPageProxy product={product} productExists={productExists} />;
}
