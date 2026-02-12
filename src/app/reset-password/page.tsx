'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validations/auth';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/auth/Card';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Не удалось изменить пароль. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className='border-0 shadow-lg sm:border sm:shadow-sm'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <CheckCircle2 className='h-16 w-16 text-green-500' />
            </motion.div>
            <div className='space-y-2'>
              <h3 className='text-xl font-bold'>Пароль успешно изменен</h3>
              <p className='text-gray-500'>
                Теперь вы можете войти в систему с новым паролем.
                <br />
                Вы будете перенаправлены на страницу входа...
              </p>
            </div>
            <Button className='w-full' onClick={() => router.push('/login')}>
              Перейти ко входу
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-0 shadow-lg sm:border sm:shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold tracking-tight text-center'>
          Новый пароль
        </CardTitle>
        <CardDescription className='text-center'>
          Придумайте надежный пароль для вашего аккаунта
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
              id='password'
              type='password'
              label='Новый пароль'
              error={errors.password?.message || ''}
              {...register('password')}
            />
            <div className='text-xs text-gray-500 space-y-1 mt-2'>
              <p>Требования к паролю:</p>
              <ul className='list-disc list-inside pl-2 space-y-0.5'>
                <li
                  className={
                    !errors.password?.message && !errors.password
                      ? 'text-green-600'
                      : ''
                  }
                >
                  Минимум 8 символов
                </li>
                <li
                  className={
                    !errors.password?.message && !errors.password
                      ? 'text-green-600'
                      : ''
                  }
                >
                  Заглавная буква и цифра
                </li>
                <li
                  className={
                    !errors.password?.message && !errors.password
                      ? 'text-green-600'
                      : ''
                  }
                >
                  Специальный символ
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
              {...register('confirmPassword')}
            />
          </div>

          <Button type='submit' className='w-full' isLoading={isLoading}>
            Сохранить пароль
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
