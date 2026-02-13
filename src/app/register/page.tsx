'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/auth/Button';
import { Input } from '@/components/ui/auth/Input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/auth/Alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/auth/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (authData.session) {
        router.push('/dashboard');
        router.refresh();
        // Не сбрасываем isLoading при успехе, чтобы показать спиннер до редиректа
      } else {
        // Если сессия не создана, значит требуется подтверждение email
        setSuccess(
          'На вашу почту отправлено письмо для подтверждения регистрации. Пожалуйста, проверьте email.'
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(
        err.message || 'Не удалось зарегистрироваться. Попробуйте позже.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[100dvh] flex items-start justify-center bg-gray-50 pt-24 sm:pt-32 pb-8 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <Card className='border-0 shadow-lg sm:border sm:shadow-sm bg-white'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold tracking-tight text-center'>
              Регистрация аккаунта
            </CardTitle>
            <CardDescription className='text-center'>
              Создайте аккаунт для доступа к личному кабинету
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <AnimatePresence mode='wait'>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className='overflow-hidden'
                  >
                    <Alert variant='destructive' className='mb-4'>
                      <AlertTitle>Ошибка</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className='overflow-hidden'
                  >
                    <Alert variant='success' className='mb-4'>
                      <AlertTitle>Успешно</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='space-y-2'>
                <Input
                  id='name'
                  type='text'
                  label='Имя'
                  placeholder='Иван Иванов'
                  error={errors.name?.message || ''}
                  disabled={isLoading}
                  className='transition-all duration-300 ease-in-out'
                  {...register('name')}
                />
              </div>

              <div className='space-y-2'>
                <Input
                  id='email'
                  type='email'
                  label='Email'
                  placeholder='name@example.com'
                  error={errors.email?.message || ''}
                  disabled={isLoading}
                  className='transition-all duration-300 ease-in-out'
                  {...register('email')}
                />
              </div>

              <div className='space-y-2'>
                <Input
                  id='password'
                  type='password'
                  label='Пароль'
                  error={errors.password?.message || ''}
                  disabled={isLoading}
                  className='transition-all duration-300 ease-in-out'
                  {...register('password')}
                />
                <div
                  className={`text-xs text-gray-500 space-y-1 mt-2 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                >
                  <p>Требования к паролю:</p>
                  <ul className='list-disc list-inside pl-2 space-y-0.5'>
                    <li
                      className={password.length >= 8 ? 'text-green-600' : ''}
                    >
                      Минимум 8 символов
                    </li>
                    <li
                      className={/[A-Z]/.test(password) ? 'text-green-600' : ''}
                    >
                      Заглавная буква
                    </li>
                    <li
                      className={/[0-9]/.test(password) ? 'text-green-600' : ''}
                    >
                      Цифра
                    </li>
                  </ul>
                </div>
              </div>

              <div className='space-y-2'>
                <Input
                  id='confirmPassword'
                  type='password'
                  label='Подтвердите пароль'
                  error={errors.confirmPassword?.message || ''}
                  disabled={isLoading}
                  className='transition-all duration-300 ease-in-out'
                  {...register('confirmPassword')}
                />
              </div>

              <motion.div
                animate={{
                  opacity: isLoading ? 0.8 : 1,
                  scale: isLoading ? 0.98 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  type='submit'
                  className='w-full transition-all duration-300'
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className='flex flex-col space-y-2 text-center text-sm text-gray-500'>
            <p>
              Уже есть аккаунт?{' '}
              <Link
                href='/login'
                className={`font-medium text-indigo-600 hover:text-indigo-500 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
              >
                Войти
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
