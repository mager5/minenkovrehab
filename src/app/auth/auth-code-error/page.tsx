'use client';

import { Button } from '@/components/ui/auth/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/auth/Card';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCodeError() {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'
      >
        <Card className='border-0 shadow-lg sm:border sm:shadow-sm'>
          <CardHeader className='space-y-1 text-center'>
            <div className='flex justify-center mb-4'>
              <div className='rounded-full bg-red-100 p-3'>
                <AlertCircle className='h-8 w-8 text-red-600' />
              </div>
            </div>
            <CardTitle className='text-2xl font-bold tracking-tight text-red-600'>
              Ошибка авторизации
            </CardTitle>
            <CardDescription className='text-center'>
              Не удалось подтвердить ваш email или код восстановления устарел.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-sm text-center text-gray-500'>
              Попробуйте запросить ссылку снова или обратитесь в поддержку, если
              ошибка повторяется.
            </p>
            <Button asChild className='w-full' variant='primary'>
              <Link href='/login'>Вернуться на страницу входа</Link>
            </Button>
            <Button asChild className='w-full' variant='outline'>
              <Link href='/'>На главную</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
