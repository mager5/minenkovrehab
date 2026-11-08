import NoticePage from '@/components/shared/NoticePage';

export default function AuthCallback() {
  return (
    <NoticePage title='Ссылка больше не действует' primary={{ href: '/login', label: 'Войти' }} secondary={{ href: '/forgot-password', label: 'Восстановить пароль' }}>
      Для входа используйте email и пароль. Старые ссылки авторизации не поддерживаются.
    </NoticePage>
  );
}
