'use client';

import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div className='min-h-[100dvh] flex items-start justify-center bg-gray-50 pt-24 sm:pt-32 pb-8 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <AuthForm initialMode='login' />
      </div>
    </div>
  );
}
