'use client';
// Отправка заявок с форм сайта (главная, /contacts, модалка «Записаться»): общая логика и проверка полей.
// Запрос: POST /api/leads (pages/api/leads.ts → бэкенд, rehab.leads). Цель Метрики form_sent — только после успеха.
import { useCallback, useRef, useState } from 'react';
import { authPost } from '@/lib/auth-client';

export type LeadSource = 'home' | 'contacts' | 'modal';
export type LeadErrors = Partial<Record<'name' | 'phone' | 'message' | 'consent' | 'offer', string>>;

export const METRIKA_ID = 113852639;
export const LEAD_GOAL = 'form_sent';

/** Форматирование номера при вводе: +7 (999) 123-45-67. */
export function formatPhone(value: string): string {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('8') || digits.startsWith('7') ? digits.substring(1) : digits;
  const n = local.length;
  let out = '+7';
  if (n > 0) out += ` (${local.substring(0, Math.min(3, n))}`;
  if (n > 3) out += `) ${local.substring(3, Math.min(6, n))}`;
  if (n > 6) out += `-${local.substring(6, Math.min(8, n))}`;
  if (n > 8) out += `-${local.substring(8, Math.min(10, n))}`;
  return out.slice(0, 18);
}

export const phoneComplete = (v: string) => v.replace(/\D/g, '').length === 11;

type Fields = { name: string; phone: string; service: string; message: string };

export function useLeadForm({
  source,
  requireMessage = false,
  requireOffer = false,
}: {
  source: LeadSource;
  requireMessage?: boolean;
  requireOffer?: boolean;
}) {
  const empty: Fields = { name: '', phone: '', service: '', message: '' };
  const [values, setValues] = useState<Fields>(empty);
  const [consent, setConsent] = useState(false);
  const [offer, setOffer] = useState(false);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const set = (key: keyof Fields, value: string) => {
    const v = key === 'phone' ? formatPhone(value) : value;
    setValues(prev => ({ ...prev, [key]: v }));
    setErrors(prev => {
      if (!prev[key as keyof LeadErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof LeadErrors];
      return next;
    });
  };
  const setConsentChecked = (v: boolean) => {
    setConsent(v);
    if (v) setErrors(({ consent: _c, ...rest }) => rest);
  };
  const setOfferChecked = (v: boolean) => {
    setOffer(v);
    if (v) setErrors(({ offer: _o, ...rest }) => rest);
  };

  const validate = (): LeadErrors => {
    const e: LeadErrors = {};
    if (values.name.trim().length < 2) e.name = 'Введите имя';
    if (!phoneComplete(values.phone)) e.phone = values.phone.replace(/\D/g, '').length > 1 ? 'Введите номер полностью' : 'Введите номер телефона';
    if (requireMessage && !values.message.trim()) e.message = 'Коротко опишите ситуацию';
    if (!consent) e.consent = 'Отметьте согласие на обработку персональных данных';
    if (requireOffer && !offer) e.offer = 'Отметьте согласие с условиями договора оферты';
    return e;
  };

  /** Фокус и прокрутка к первому полю с ошибкой (ids задаёт форма). */
  const focusFirst = (e: LeadErrors, ids: Record<keyof LeadErrors, string>) => {
    const order: (keyof LeadErrors)[] = ['name', 'phone', 'message', 'consent', 'offer'];
    const first = order.find(k => e[k]);
    if (!first) return;
    const el = document.getElementById(ids[first]);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el?.focus({ preventScroll: true });
  };

  const submit = useCallback(
    async (serviceLabel: string, ids: Record<keyof LeadErrors, string>) => {
      if (status === 'sending') return;
      setServerError(null);
      const e = validate();
      setErrors(e);
      if (Object.keys(e).length) {
        focusFirst(e, ids);
        return;
      }
      setStatus('sending');
      try {
        const response = await authPost('/api/leads', {
          source,
          name: values.name.trim(),
          phone: values.phone,
          service: serviceLabel || null,
          message: values.message.trim() || null,
          page: window.location.pathname,
          consent: true,
          website: honeypot.current?.value || '',
        });
        const payload = await response.json().catch(() => null);
        if (response.ok && payload?.success) {
          setStatus('sent');
          setValues(empty);
          setConsent(false);
          setOffer(false);
          try {
            const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym;
            if (typeof ym === 'function') ym(METRIKA_ID, 'reachGoal', LEAD_GOAL);
          } catch {
            /* Метрика недоступна — заявка всё равно отправлена */
          }
          return;
        }
        if (response.status === 400 && payload?.errors) {
          setErrors(payload.errors);
          focusFirst(payload.errors, ids);
        } else if (response.status === 429) {
          setServerError(payload?.error || 'Слишком много заявок подряд. Попробуйте через несколько минут.');
        } else {
          setServerError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните.');
        }
        setStatus('idle');
      } catch {
        setServerError('Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз или позвоните.');
        setStatus('idle');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, consent, offer, status, source, requireMessage, requireOffer]
  );

  const reset = () => {
    setValues(empty);
    setConsent(false);
    setOffer(false);
    setErrors({});
    setServerError(null);
    setStatus('idle');
  };

  return {
    values, set, consent, setConsent: setConsentChecked, offer, setOffer: setOfferChecked,
    errors, status, serverError, submit, honeypot, reset,
  };
}
