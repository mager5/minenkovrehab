'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BREADCRUMB_LABELS: Record<string, string> = {
  'admin': 'Админка',
  'home-content': 'Главная',
  'about-content': 'Обо мне',
  'products-content': 'Услуги',
  'reviews-content': 'Отзывы',
  'contacts-content': 'Контакты',
  'materials': 'Материалы',
  'images': 'Изображения',
  'settings': 'Настройки',
};

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.slice(0, parts[0] === 'admin' ? undefined : 1); // только путь внутри админки

  let path = '';

  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center space-x-2">
        {crumbs.map((part, idx) => {
          path += '/' + part;
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={path} className="flex items-center">
              {!isLast ? (
                <Link href={path} className="hover:underline text-accent">
                  {BREADCRUMB_LABELS[part] || part}
                </Link>
              ) : (
                <span className="font-semibold text-primary">{BREADCRUMB_LABELS[part] || part}</span>
              )}
              {!isLast && <span className="mx-2">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 