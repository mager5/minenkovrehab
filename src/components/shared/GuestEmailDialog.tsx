'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Окно «Куда отправить доступ?» для покупки без входа. ask() возвращает email или null (отмена).
export function useGuestEmailDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const resolver = useRef<((value: string | null) => void) | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const ask = useCallback(() => {
    try { setEmail(localStorage.getItem('mr_checkout_email') || ''); } catch { /* приватный режим */ }
    setError('');
    setOpen(true);
    return new Promise<string | null>(resolve => { resolver.current = resolve; });
  }, []);

  const close = useCallback((value: string | null) => {
    setOpen(false);
    resolver.current?.(value);
    resolver.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(null); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open, close]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) { setError('Проверьте адрес: например, name@mail.ru'); return; }
    try { localStorage.setItem('mr_checkout_email', value); } catch { /* приватный режим */ }
    close(value);
  };

  const dialog = open ? (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4' onMouseDown={e => { if (e.target === e.currentTarget) close(null); }}>
      <form onSubmit={submit} role='dialog' aria-modal='true' aria-labelledby='guest-email-title'
        className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-8'>
        <h2 id='guest-email-title' className='text-xl font-semibold text-gray-900'>Куда отправить доступ?</h2>
        <p className='mt-2 text-sm leading-relaxed text-gray-600'>
          Укажите email: после оплаты на него придут доступ к программе и чек. Если у вас уже есть аккаунт — укажите его email.
        </p>
        <label htmlFor='guest-email' className='mt-5 block text-sm font-medium text-gray-700'>Email</label>
        <input id='guest-email' ref={input} type='email' inputMode='email' autoComplete='email' value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          className='mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
          placeholder='name@mail.ru' />
        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
        <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <button type='button' onClick={() => close(null)} className='rounded-lg px-5 py-3 font-medium text-gray-600 hover:bg-gray-100'>Отмена</button>
          <button type='submit' className='rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark'>Перейти к оплате</button>
        </div>
      </form>
    </div>
  ) : null;

  return { ask, dialog };
}
