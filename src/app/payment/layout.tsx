import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

// Служебная страница: не индексируется, без canonical.
export const metadata: Metadata = privateMetadata('Оплата | Вадим Миненков');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
