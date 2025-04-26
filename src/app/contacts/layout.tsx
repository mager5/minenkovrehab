import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты | Физическая реабилитация | Миненков Вадим',
  description: 'Свяжитесь со мной для записи на консультацию или по вопросам физической реабилитации. Онлайн-консультации и индивидуальные программы.',
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 