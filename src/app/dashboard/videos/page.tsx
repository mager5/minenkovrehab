import NoticePage from '@/components/shared/NoticePage';

export default function VideosPage() {
  return (
    <NoticePage
      title='Личные видео'
      icon='video'
      tone='sky'
      primary={{ href: '/dashboard', label: 'В личный кабинет' }}
    >
      Загрузка личных видео будет доступна после переноса хранилища.
    </NoticePage>
  );
}
