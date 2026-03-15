'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/validations/auth';
// import { createClient } from '@/lib/supabase/client';
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

function getRailwayApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
    'https://minenkovrehab-production-15cc.up.railway.app'
  );
}

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email');

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsLoading(true);

    try {
      // const { error } = await supabase.auth.signInWithPassword({
      //   email: data.email,
      //   password: data.password,
      // });
      //
      // if (error) {
      //   throw error;
      // }

      const response = await fetch(
        `${getRailwayApiBaseUrl()}/api/auth/signin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        }
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const message =
          payload?.error || 'Не удалось войти. Пожалуйста, проверьте данные.';
        throw new Error(message);
      }

      router.push('/dashboard');
      router.refresh();
      // Не сбрасываем isLoading при успехе, чтобы показать спиннер до редиректа
    } catch (err: any) {
      let errorMessage =
        err.message || 'Не удалось войти. Пожалуйста, проверьте данные.';

      // Перевод ошибок на русский язык
      if (errorMessage === 'Invalid login credentials') {
        errorMessage = 'Неверный email или пароль';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Email не подтвержден. Пожалуйста, проверьте почту.';
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
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
      </AnimatePresence>

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
          value={emailValue}
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
            href='/forgot-password'
            className={`text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          >
            Забыли пароль?
          </Link>
        </div>
        <Input
          id='password'
          type='password'
          error={errors.password?.message || ''}
          disabled={isLoading}
          className='transition-all duration-300 ease-in-out'
          {...register('password')}
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
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
      </motion.div>
    </form>
  );
}

function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const emailValue = watch('email');

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // const { data: authData, error } = await supabase.auth.signUp({
      //   email: data.email,
      //   password: data.password,
      //   options: {
      //     data: {
      //       full_name: data.name,
      //     },
      //   },
      // });
      //
      // if (error) {
      //   throw error;
      // }
      //
      // if (authData.session) {
      //   router.push('/dashboard');
      //   router.refresh();
      //   // Не сбрасываем isLoading при успехе, чтобы показать спиннер до редиректа
      // } else {
      //   // Если сессия не создана, значит требуется подтверждение email
      //   setSuccess(
      //     'На вашу почту отправлено письмо для подтверждения регистрации. Пожалуйста, проверьте email.'
      //   );
      //   setIsLoading(false);
      // }

      const response = await fetch(
        `${getRailwayApiBaseUrl()}/api/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.name,
          }),
        }
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const message =
          payload?.error || 'Не удалось зарегистрироваться. Попробуйте позже.';
        throw new Error(message);
      }

      if (payload?.data?.requiresEmailConfirmation) {
        setSuccess(
          'На вашу почту отправлено письмо для подтверждения регистрации. Пожалуйста, проверьте email.'
        );
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(
        err.message || 'Не удалось зарегистрироваться. Попробуйте позже.'
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
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
          value={emailValue}
          autoComplete='email'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Input
            id='password'
            type='password'
            label='Пароль'
            error={errors.password?.message || ''}
            disabled={isLoading}
            className='transition-all duration-300 ease-in-out'
            {...register('password')}
            autoComplete='new-password'
          />
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
            autoComplete='new-password'
          />
        </div>
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
  );
}

interface AuthFormProps {
  initialMode: 'login' | 'register';
}

export function AuthForm({ initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const router = useRouter();

  const handleTabChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    // Update URL without full navigation
    window.history.pushState(null, '', `/${newMode}`);
  };

  return (
    <Card className='border-0 shadow-lg sm:border sm:shadow-sm bg-white overflow-hidden'>
      <div className='flex border-b border-gray-100'>
        <button
          onClick={() => handleTabChange('login')}
          className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
            mode === 'login'
              ? 'text-indigo-600 bg-white'
              : 'text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          Войти
          {mode === 'login' && (
            <motion.div
              layoutId='activeTab'
              className='absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600'
              initial={false}
            />
          )}
        </button>
        <button
          onClick={() => handleTabChange('register')}
          className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
            mode === 'register'
              ? 'text-indigo-600 bg-white'
              : 'text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          Зарегистрироваться
          {mode === 'register' && (
            <motion.div
              layoutId='activeTab'
              className='absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600'
              initial={false}
            />
          )}
        </button>
      </div>

      <CardHeader className='space-y-1 pb-2 pt-6'>
        <CardTitle className='text-2xl font-bold tracking-tight text-center'>
          {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация аккаунта'}
        </CardTitle>
        <CardDescription className='text-center'>
          {mode === 'login'
            ? 'Введите email и пароль для доступа к личному кабинету'
            : 'Создайте аккаунт для доступа к личному кабинету'}
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-6 pt-4'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className='w-full'
          >
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
