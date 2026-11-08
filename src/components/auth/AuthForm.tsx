'use client';

// Вход и экран «Регистрация недоступна» (концепт 2 «Мягкая забота»).
// Логика входа прежняя: CSRF + POST /api/auth/signin через authPost. Схема регистрации
// (registerSchema в lib/validations/auth) сохранена на случай, если регистрацию включат.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { authPost } from '@/lib/auth-client';
import { TextField } from '@/components/ds/Field';
import { Button, ButtonLink } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { AuthShell, CardHead, type AuthBullet } from '@/components/account/AuthShell';
import { ErrorAlert } from '@/components/account/Alert';
import { PasswordField } from '@/components/account/PasswordField';
import { CONTACTS } from '@/lib/seo';
import { accountContent } from '@/data/content';

const BULLETS: AuthBullet[] = [
  {
    icon: 'doc',
    text: 'Купленные восстановительные программы: текст и видео упражнений по этапам',
  },
  { icon: 'mail', text: 'Аккаунт создаётся по email, который вы указали при оплате' },
  {
    icon: 'send',
    text: (
      <>
        Вопросы по доступу —{' '}
        <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a> или{' '}
        <a href={CONTACTS.telegram} target='_blank' rel='noopener noreferrer'>
          Telegram
        </a>
      </>
    ),
  },
];

/** Куда вернуть после входа: только внутренний путь этого сайта. */
function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return '/dashboard';
  }
  if (/^\/(login|register)(\/|\?|$)/.test(raw)) return '/dashboard';
  return raw;
}

function LoginForm() {
  const [error, setError] = useState<{ title: string; text: string } | null>(
    null
  );
  const [badPassword, setBadPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setBadPassword(false);
    setIsLoading(true);
    try {
      const response = await authPost('/api/auth/signin', {
        email: data.email,
        password: data.password,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        if (response.status === 401) {
          setBadPassword(true);
          setError({
            title: 'Не удалось войти',
            text: 'Неверный email или пароль',
          });
        } else {
          setError({
            title: 'Не удалось войти',
            text:
              payload?.error ||
              'Сервис временно недоступен. Попробуйте ещё раз через минуту.',
          });
        }
        setIsLoading(false);
        return;
      }
      window.dispatchEvent(new Event('mr-auth-changed'));
      router.replace(safeNext(search?.get('next') ?? null));
      router.refresh();
      // isLoading не сбрасываем: кнопка показывает «Вход…» до перехода.
    } catch {
      setError({
        title: 'Не удалось войти',
        text: 'Сервис временно недоступен. Попробуйте ещё раз через минуту.',
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHead
        title='Вход в аккаунт'
        sub='Введите email и пароль для доступа к личному кабинету'
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-[18px]'
        noValidate
      >
        {error ? <ErrorAlert title={error.title}>{error.text}</ErrorAlert> : null}
        <TextField
          id='login-email'
          label='Email'
          type='email'
          inputMode='email'
          autoComplete='email'
          autoCapitalize='none'
          spellCheck={false}
          placeholder='name@example.com'
          disabled={isLoading}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          id='login-password'
          label='Пароль'
          autoComplete='current-password'
          disabled={isLoading}
          error={
            errors.password?.message ||
            (badPassword ? 'Проверьте пароль и раскладку клавиатуры' : undefined)
          }
          {...register('password', { onChange: () => setBadPassword(false) })}
        />
        <Button type='submit' size='lg' block disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? 'Вход…' : 'Войти'}
        </Button>
      </form>
      <div className='mt-6 pt-5 border-t border-line flex flex-col gap-2'>
        <p className='m-0 text-[15px] text-muted leading-normal'>
          {accountContent.loginNote}
        </p>
        <Link
          href='/forgot-password'
          className='self-start inline-flex items-center min-h-[44px] font-bold text-brand no-underline hover:text-navy ds-focus rounded-lg'
        >
          Забыли пароль?
        </Link>
      </div>
    </>
  );
}

function RegisterDisabled() {
  return (
    <>
      <CardHead title='Регистрация аккаунта' sub='Сейчас на сайте' />
      <div className='flex gap-3.5 p-5 rounded-[20px] bg-sky'>
        <span
          aria-hidden='true'
          className='flex-none w-11 h-11 rounded-[14px] bg-white flex items-center justify-center'
        >
          <Icon name='info' size={22} color='var(--c-blue)' />
        </span>
        <div className='leading-[1.55]'>
          <strong className='block text-[18px] text-navy'>
            Регистрация новых аккаунтов пока недоступна
          </strong>
          <span className='text-[16px] text-ink'>
            Для существующего аккаунта используйте вход или восстановление
            пароля. {accountContent.loginNote}
          </span>
        </div>
      </div>
      <div className='flex flex-col dsk:flex-row gap-3 mt-5'>
        <ButtonLink href='/login' size='md' className='flex-1'>
          Войти
        </ButtonLink>
        <ButtonLink href='/forgot-password' variant='secondary' size='md' className='flex-1'>
          Восстановить пароль
        </ButtonLink>
      </div>
    </>
  );
}

export function AuthForm({ initialMode }: { initialMode: 'login' | 'register' }) {
  if (initialMode === 'register') {
    return (
      <AuthShell
        title='Регистрация'
        lead='Аккаунт нужен, чтобы открывать купленные программы в личном кабинете.'
        bullets={BULLETS}
      >
        <RegisterDisabled />
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title='Вход в личный кабинет'
      lead='Здесь открываются программы, которые вы купили на сайте.'
      bullets={BULLETS}
    >
      <LoginForm />
    </AuthShell>
  );
}
