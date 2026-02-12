'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth';
import { useMockAuth } from '@/hooks/useMockAuth';
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
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading: isAuthLoading } = useMockAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setSuccess(false);
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError('Не удалось отправить запрос. Попробуйте позже.');
    }
  };

  return (
    <Card className='border-0 shadow-lg sm:border sm:shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold tracking-tight text-center'>
          Восстановление пароля
        </CardTitle>
        <CardDescription className='text-center'>
          Введите ваш email, и мы отправим вам инструкции
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode='wait'>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert variant='success' className='mb-6'>
                <AlertTitle>Письмо отправлено</AlertTitle>
                <AlertDescription>
                  Проверьте вашу почту для продолжения процесса восстановления
                  пароля.
                </AlertDescription>
              </Alert>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => setSuccess(false)}
              >
                Отправить повторно
              </Button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-4'
            >
              {error && (
                <Alert variant='destructive'>
                  <AlertTitle>Ошибка</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
              <Button
                type='submit'
                className='w-full'
                isLoading={isSubmitting || isAuthLoading}
              >
                Сбросить пароль
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Link
          href='/auth-demo/login'
          className='flex items-center text-sm font-medium text-gray-500 hover:text-gray-900'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Вернуться на страницу входа
        </Link>
      </CardFooter>
    </Card>
  );
}
