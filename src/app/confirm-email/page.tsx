'use client';

// Подтверждение email по ссылке из письма и повторный запрос письма.
// Логика прежняя: токен из #token=… (сразу убирается из адреса), POST /api/auth/confirm-email;
// POST /api/auth/request-confirmation.
import { useEffect, useState } from 'react';
import { authPost } from '@/lib/auth-client';
import { TextField } from '@/components/ds/Field';
import { Button, ButtonLink } from '@/components/ds/Button';
import { AuthShell, BackLink, CardHead } from '@/components/account/AuthShell';
import { ErrorAlert, StatusBox } from '@/components/account/Alert';

type Result =
  | { kind: 'confirmed' }
  | { kind: 'requested' }
  | { kind: 'error'; title: string; text: string }
  | null;

export default function ConfirmEmail() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  useEffect(() => {
    setHasToken(
      !!new URLSearchParams(window.location.hash.slice(1)).get('token')
    );
  }, []);

  async function request(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Некорректный формат email');
      return;
    }
    setEmailError(null);
    setBusy(true);
    try {
      const response = await authPost('/api/auth/request-confirmation', {
        email: email.trim(),
      });
      setResult(
        response.ok
          ? { kind: 'requested' }
          : { kind: 'error', title: 'Запрос временно недоступен', text: 'Попробуйте позже.' }
      );
    } catch {
      setResult({ kind: 'error', title: 'Сервис временно недоступен', text: 'Попробуйте позже.' });
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    window.history.replaceState(null, '', window.location.pathname);
    setHasToken(false);
    setBusy(true);
    try {
      const response = await authPost('/api/auth/confirm-email', { token });
      setResult(
        response.ok
          ? { kind: 'confirmed' }
          : {
              kind: 'error',
              title: 'Ссылка недействительна или истекла',
              text: 'Запросите новое письмо ниже.',
            }
      );
    } catch {
      setResult({ kind: 'error', title: 'Сервис временно недоступен', text: 'Попробуйте позже.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title='Подтверждение email'
      lead='Подтвердите адрес, чтобы входить в личный кабинет.'
    >
      <CardHead
        title='Подтверждение email'
        sub={
          hasToken
            ? 'Нажмите кнопку, чтобы подтвердить адрес по ссылке из письма.'
            : 'Откройте ссылку из письма — здесь появится кнопка подтверждения.'
        }
      />
      {result?.kind === 'confirmed' ? (
        <div className='flex flex-col gap-4'>
          <StatusBox title='Email подтверждён'>Теперь можно войти.</StatusBox>
          <ButtonLink href='/login' size='md' block>
            Войти
          </ButtonLink>
        </div>
      ) : (
        <>
          {result?.kind === 'error' ? (
            <div className='mb-4'>
              <ErrorAlert title={result.title}>{result.text}</ErrorAlert>
            </div>
          ) : null}
          {hasToken ? (
            <Button size='lg' block onClick={confirm} disabled={busy} aria-busy={busy}>
              {busy ? 'Подтверждаем…' : 'Подтвердить email'}
            </Button>
          ) : null}
          <div className={hasToken ? 'h-px bg-line my-7' : 'hidden'} />
          <p className='m-0 mb-3.5 text-[16px] font-bold text-ink'>Письмо не пришло?</p>
          {result?.kind === 'requested' ? (
            <StatusBox title='Запрос принят'>
              Если подтверждение необходимо, инструкция придёт на почту.
            </StatusBox>
          ) : (
            <form onSubmit={request} className='flex flex-col gap-4' noValidate>
              <TextField
                id='confirm-email'
                label='Email'
                type='email'
                inputMode='email'
                autoComplete='email'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='name@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={emailError}
                disabled={busy}
              />
              <Button type='submit' variant='secondary' size='md' block disabled={busy}>
                Запросить подтверждение
              </Button>
            </form>
          )}
        </>
      )}
      <div className='mt-4'>
        <BackLink href='/login'>Войти</BackLink>
      </div>
    </AuthShell>
  );
}
