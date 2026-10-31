import Link from 'next/link';
import type { ReactNode } from 'react';

type Action = { href: string; label: string };

export default function NoticePage({
  title,
  children,
  primary,
  secondary,
}: {
  title: string;
  children: ReactNode;
  primary?: Action;
  secondary?: Action;
}) {
  return (
    <main className='flex-1 bg-secondary/40 px-4 py-16 sm:py-24'>
      <div className='mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-10'>
        <div className='mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary'>
          <svg aria-hidden='true' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' className='h-7 w-7'>
            <rect x='4' y='10' width='16' height='10' rx='2' />
            <path d='M8 10V7a4 4 0 1 1 8 0v3' strokeLinecap='round' />
          </svg>
        </div>
        <h1 className='text-2xl font-semibold text-gray-900 sm:text-3xl'>{title}</h1>
        <div className='mt-3 text-base leading-relaxed text-gray-600'>{children}</div>
        {(primary || secondary) && (
          <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
            {primary && (
              <Link href={primary.href} className='rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark'>
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} className='rounded-lg px-6 py-3 font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary-light'>
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
