'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
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

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(
        err.message || 'Не удалось войти. Пожалуйста, проверьте данные.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-0 shadow-lg sm:border sm:shadow-sm bg-white'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold tracking-tight text-center'>
          Вход в аккаунт
        </CardTitle>
        <CardDescription className='text-center'>
          Введите email и пароль для доступа к личному кабинету
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant='destructive'>
                  <AlertTitle>Ошибка</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='space-y-2'>
            <Input
              id='email'
              type='email'
              label='Email'
              placeholder='name@example.com'
              error={errors.email?.message || ''}
              {...register('email')}
            />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='password'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700'
              >
                Пароль
              </label>
              <Link
                href='/auth-demo/forgot-password'
                className='text-sm font-medium text-indigo-600 hover:text-indigo-500'
              >
                Забыли пароль?
              </Link>
            </div>
            <Input
              id='password'
              type='password'
              error={errors.password?.message || ''}
              {...register('password')}
            />
          </div>
          <Button type='submit' className='w-full' isLoading={isLoading}>
            Войти
          </Button>
        </form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-2 text-center text-sm text-gray-500'>
        <p>
          Нет аккаунта?{' '}
          <Link
            href='/register'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Зарегистрироваться
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <LoginForm />
      </div>
    </div>
  );
}
