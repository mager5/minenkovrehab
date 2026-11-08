import React from 'react';

// Метаданные задаёт каждая страница раздела сама — здесь их нет, чтобы ничего не наследовалось.
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
