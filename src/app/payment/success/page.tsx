'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type State = 'checking' | 'pending' | 'paid' | 'login' | 'missing' | 'error';

const TEXT: Record<State, { title: string; body: string }> = {
  checking: { title: 'Проверяем оплату', body: 'Проверяем статус заказа…' },
  pending: { title: 'Ждём подтверждения', body: 'Заказ ожидает подтверждения оплаты.' },
  paid: { title: 'Оплата прошла', body: 'Оплата подтверждена. Доступ открыт в личном кабинете.' },
  login: { title: 'Спасибо за заказ', body: 'Доступ придёт на email, указанный при покупке, сразу после подтверждения оплаты. Чтобы посмотреть статус заказа, войдите в аккаунт.' },
  missing: { title: 'Заказ не найден', body: 'Номер заказа не указан.' },
  error: { title: 'Не удалось проверить', body: 'Не удалось проверить статус. Попробуйте позже.' },
};

function StatusIcon({ state }: { state: State }) {
  if (state === 'paid')
    return (
      <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent'>
        <svg aria-hidden='true' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' className='h-8 w-8'>
          <path d='M5 12.5l4.5 4.5L19 7.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </div>
    );
  if (state === 'checking' || state === 'pending')
    return (
      <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary'>
        <svg aria-hidden='true' viewBox='0 0 24 24' fill='none' className='h-8 w-8 animate-spin'>
          <circle cx='12' cy='12' r='9' stroke='currentColor' strokeOpacity='0.2' strokeWidth='2.5' />
          <path d='M21 12a9 9 0 0 0-9-9' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' />
        </svg>
      </div>
    );
  return (
    <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600'>
      <svg aria-hidden='true' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='h-8 w-8'>
        <path d='M12 8v5M12 16.5v.01' strokeLinecap='round' />
        <circle cx='12' cy='12' r='9' />
      </svg>
    </div>
  );
}

function PaymentStatus() {
  const params = useSearchParams();
  const invoice = params?.get('InvId') || params?.get('invId');
  const [state, setState] = useState<State>('checking');

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const check = async () => {
      if (!invoice) { setState('missing'); return; }
      try {
        const response = await fetch(`/api/robokassa/orders/${encodeURIComponent(invoice)}/status`, { credentials: 'same-origin', cache: 'no-store' });
        const payload = await response.json().catch(() => null);
        if (stopped) return;
        const next: State = response.ok && payload?.data?.status === 'paid' ? 'paid' : response.ok ? 'pending' : 'login';
        setState(next);
        if (next === 'paid' && timer) clearInterval(timer);
      } catch {
        if (!stopped) setState('error');
      }
    };
    check();
    timer = setInterval(check, 5000);
    return () => { stopped = true; if (timer) clearInterval(timer); };
  }, [invoice]);

  const text = TEXT[state];
  return (
    <main className='flex-1 bg-secondary/40 px-4 py-16 sm:py-24'>
      <div className='mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-10'>
        <StatusIcon state={state} />
        <h1 className='text-2xl font-semibold text-gray-900 sm:text-3xl'>{text.title}</h1>
        <p role='status' className='mt-3 text-base leading-relaxed text-gray-600'>{text.body}</p>
        {state === 'pending' && (
          <p className='mt-2 text-sm text-gray-500'>Обычно это занимает до минуты. Страница обновится сама.</p>
        )}
        {invoice && state !== 'missing' && (
          <p className='mt-6 inline-block rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-500'>
            Номер заказа: <span className='font-medium text-gray-800'>{invoice}</span>
          </p>
        )}
        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
          {state === 'login' ? (
            <Link href={`/login?next=${encodeURIComponent('/payment/success?InvId=' + (invoice || ''))}`} className='rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark'>
              Войти
            </Link>
          ) : (
            <Link href='/dashboard' className='rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark'>
              Личный кабинет
            </Link>
          )}
          <Link href='/contacts' className='rounded-lg px-6 py-3 font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary-light'>
            Связаться с нами
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className='flex-1 px-4 py-24 text-center text-gray-500'>Проверяем статус заказа…</main>}>
      <PaymentStatus />
    </Suspense>
  );
}
