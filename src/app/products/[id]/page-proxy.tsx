'use client';

import { Product } from '../data';
import ProductClient from './client';
import ProductNotFound from './not-found';

// Прокси-компонент для решения проблемы с типами
export default function ProductPageProxy({ 
  product, 
  productExists 
}: { 
  product?: Product, 
  productExists: boolean
}) {
  if (!productExists || !product) {
    return <ProductNotFound />;
  }
  
  return <ProductClient product={product} />;
} 