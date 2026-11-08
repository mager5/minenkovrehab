'use client';

// Новый пароль по ссылке из письма. Логика прежняя: токен из #token=…, POST /api/auth/reset-password,
// после успеха — переход на /login через 3 секунды.
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validations/auth';
import { authPost } from '@/lib/auth-client';
import { Button, ButtonLink } from '@/components/ds/Button';
import { AuthShell, CardHead } from '@/components/account/AuthShell';
import { BigIcon, ErrorAlert } from '@/components/account/Alert';
import { PasswordChecklist, PasswordField } from '@/components/account/PasswordField';

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noToken, setNoToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = watch('password') || '';

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) setNoToken(true);
  }, []);

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const token =
        new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
      const response = await authPost('/api/auth/reset-password', {
        token,
        password: data.password,
      });
      if (!response.ok)
        throw new Error('Ссылка недействительна или срок её действия истёк.');
      window.history.replaceState(null, '', '/reset-password');
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Не удалось изменить пароль. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const linkProblem = noToken || error;

  return (
    <AuthShell
      title='Задайте новый пароль'
      lead='Ссылка из письма действует ограниченное время.'
    >
      {success ? (
        <div className='text-center' role='status'>
          <BigIcon name='check' />
          <h2 className='mt-[18px] mb-2 text-[24px] dsk:text-[26px] font-extrabold text-navy'>
            Пароль успешно изменён
          </h2>
          <p className='m-0 mb-6 text-[17px] text-muted'>
            Теперь вы можете войти с новым паролем. Через несколько секунд
            откроется страница входа.
          </p>
          <ButtonLink href='/login' size='lg' block>
            Перейти ко входу
          </ButtonLink>
        </div>
      ) : (
        <>
          <CardHead
            title='Новый пароль'
            sub='Придумайте надёжный пароль для вашего аккаунта'
          />
          {linkProblem ? (
            <div className='mb-5 flex flex-col gap-3'>
              <ErrorAlert title='Ошибка'>
                {error || 'Ссылка недействительна или срок её действия истёк.'}
              </ErrorAlert>
              <ButtonLink href='/forgot-password' variant='secondary' size='md' block>
                Запросить новую ссылку
              </ButtonLink>
            </div>
          ) : null}
          {noToken ? null : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-[18px]'
              noValidate
            >
              <PasswordField
                id='reset-password'
                label='Новый пароль'
                autoComplete='new-password'
                describedBy='reset-rules'
                disabled={isLoading}
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordChecklist id='reset-rules' value={password} />
              <PasswordField
                id='reset-password2'
                label='Подтвердите пароль'
                autoComplete='new-password'
                disabled={isLoading}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type='submit' size='lg' block disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? 'Сохраняем…' : 'Сохранить пароль'}
              </Button>
            </form>
          )}
        </>
      )}
    </AuthShell>
  );
}
