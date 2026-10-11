import Link from 'next/link';
export default function AuthCallback() { return <main className='p-12'><p>Для входа используйте email и пароль. Старые ссылки авторизации не поддерживаются.</p><Link href='/login'>Войти</Link></main>; }
