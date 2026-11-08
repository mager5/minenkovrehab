'use client';

// Восстановление пароля: форма email → «Письмо отправлено» в той же карточке.
// Логика прежняя: POST /api/auth/forgot-password через authPost.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth';
import { authPost } from '@/lib/auth-client';
import { TextField } from '@/components/ds/Field';
import { Button } from '@/components/ds/Button';
import { AuthShell, BackLink, CardHead } from '@/components/account/AuthShell';
import { BigIcon, ErrorAlert } from '@/components/account/Alert';

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const send = async (email: string) => {
    const response = await authPost('/api/auth/forgot-password', { email });
    if (!response.ok) throw new Error('queue');
  };

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setIsLoading(true);
    try {
      await send(data.email);
      setSentTo(data.email);
    } catch {
      setError('Не удалось отправить запрос. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const resend = async () => {
    if (!sentTo) return;
    setIsLoading(true);
    setError(null);
    try {
      await send(sentTo);
      setResent(true);
    } catch {
      setError('Не удалось отправить запрос. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title='Забыли пароль?'
      lead='Пришлём на почту ссылку, по которой можно задать новый пароль.'
    >
      {sentTo ? (
        <div className='text-center'>
          <BigIcon name='mail' />
          <h2 className='mt-[18px] mb-2 text-[24px] dsk:text-[26px] font-extrabold text-navy'>
            Письмо отправлено
          </h2>
          <p className='m-0 mb-6 text-[17px] text-muted' role='status'>
            Если аккаунт с адресом{' '}
            <strong className='text-ink break-all'>{sentTo}</strong> существует,
            на него придёт инструкция по восстановлению пароля. Проверьте папку
            «Спам».
            {resent ? ' Письмо отправлено повторно.' : ''}
          </p>
          {error ? (
            <div className='mb-4 text-left'>
              <ErrorAlert title='Ошибка'>{error}</ErrorAlert>
            </div>
          ) : null}
          <Button
            variant='secondary'
            size='md'
            block
            onClick={resend}
            disabled={isLoading || resent}
          >
            {isLoading ? 'Отправляем…' : resent ? 'Отправлено повторно' : 'Отправить повторно'}
          </Button>
          <div className='mt-3'>
            <BackLink href='/login'>Вернуться на страницу входа</BackLink>
          </div>
        </div>
      ) : (
        <>
          <CardHead
            title='Восстановление пароля'
            sub='Введите ваш email, и мы отправим вам инструкции'
          />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-[18px]'
            noValidate
          >
            {error ? <ErrorAlert title='Ошибка'>{error}</ErrorAlert> : null}
            <TextField
              id='forgot-email'
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
            <Button type='submit' size='lg' block disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Отправляем…' : 'Отправить инструкцию'}
            </Button>
          </form>
          <div className='mt-4'>
            <BackLink href='/login'>Вернуться на страницу входа</BackLink>
          </div>
        </>
      )}
    </AuthShell>
  );
}
