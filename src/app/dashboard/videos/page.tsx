import NoticePage from '@/components/shared/NoticePage';

export default function VideosPage() {
  return (
    <NoticePage title='Личные видео' secondary={{ href: '/dashboard', label: 'В личный кабинет' }}>
      Загрузка личных видео будет доступна после переноса хранилища.
    </NoticePage>
  );
}
