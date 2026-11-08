'use client';
// Поле пароля в стиле дизайн-системы с кнопкой «показать / скрыть» (иконка-глаз, aria-label, aria-pressed).
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import { FieldError } from '@/components/ds/Field';

type Props = {
  id: string;
  label: ReactNode;
  error?: ReactNode;
  /** Ссылка или подсказка справа от подписи. */
  labelAside?: ReactNode;
  describedBy?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'>;

export const PasswordField = forwardRef<HTMLInputElement, Props>(
  function PasswordField(
    { id, label, error, labelAside, describedBy, className = '', ...rest },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const ids = [error ? `${id}-err` : null, describedBy || null]
      .filter(Boolean)
      .join(' ');
    return (
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between items-center gap-3'>
          <label htmlFor={id} className='ds-label'>
            {label}
          </label>
          {labelAside}
        </div>
        <div className='relative'>
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={`ds-field !pr-[64px] ${className}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={ids || undefined}
            autoCapitalize='none'
            autoCorrect='off'
            spellCheck={false}
            {...rest}
          />
          <button
            type='button'
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
            aria-pressed={visible}
            aria-controls={id}
            className='absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-0 bg-transparent flex items-center justify-center cursor-pointer text-muted hover:text-navy hover:bg-sky ds-focus'
          >
            <Icon name={visible ? 'eye-off' : 'eye'} size={22} />
          </button>
        </div>
        {error ? <FieldError id={`${id}-err`}>{error}</FieldError> : null}
      </div>
    );
  }
);

/** Требования к паролю — те же, что в resetPasswordSchema. */
export const PASSWORD_RULES = [
  { id: 'len', label: 'Минимум 8 символов', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'Заглавная латинская буква', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'digit', label: 'Цифра', test: (v: string) => /[0-9]/.test(v) },
  { id: 'special', label: 'Специальный символ (например, ! - _ #)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

/** Чек-лист требований: пункты отмечаются по мере ввода. */
export function PasswordChecklist({
  id,
  value,
}: {
  id: string;
  value: string;
}) {
  const done = PASSWORD_RULES.filter(r => r.test(value)).length;
  return (
    <div
      id={id}
      className='-mt-1 px-4 py-3.5 rounded-2xl bg-canvas text-[15px]'
    >
      <p className='m-0 mb-1.5 font-bold text-ink'>Требования к паролю:</p>
      <ul className='list-none m-0 p-0 flex flex-col gap-1.5'>
        {PASSWORD_RULES.map(r => {
          const ok = r.test(value);
          return (
            <li
              key={r.id}
              className={`flex gap-2 items-center ${
                ok ? 'text-mint-ink font-semibold' : 'text-muted'
              }`}
            >
              <span
                aria-hidden='true'
                className={`flex-none w-[22px] h-[22px] rounded-full flex items-center justify-center ${
                  ok ? 'bg-mint' : 'bg-white shadow-[inset_0_0_0_2px_var(--c-line)]'
                }`}
              >
                {ok ? (
                  <Icon name='check' size={13} strokeWidth={3.2} color='var(--c-mint-ink)' />
                ) : null}
              </span>
              {r.label}
              <span className='sr-only'>{ok ? ' — выполнено' : ' — не выполнено'}</span>
            </li>
          );
        })}
      </ul>
      <p className='sr-only' aria-live='polite'>
        Выполнено требований: {done} из {PASSWORD_RULES.length}
      </p>
    </div>
  );
}
