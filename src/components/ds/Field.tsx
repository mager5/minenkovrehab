'use client';
// Поля ввода: высота 60, радиус 16, рамка 2px, фокус — синее кольцо 4px,
// ошибка — красная рамка и текст с иконкой. Без нативных стилей браузера.
import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon } from './Icon';

export function FieldError({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <span id={id} className='ds-error' role='alert'>
      <Icon name='alert' size={18} color='var(--c-danger-ink)' />
      {children}
    </span>
  );
}

type Base = {
  label: ReactNode;
  id: string;
  error?: ReactNode;
  hint?: ReactNode;
  srOnlyLabel?: boolean;
};

export const TextField = forwardRef<
  HTMLInputElement,
  Base & InputHTMLAttributes<HTMLInputElement>
>(function TextField(
  { label, id, error, hint, srOnlyLabel, className = '', ...rest },
  ref
) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={id} className={srOnlyLabel ? 'sr-only' : 'ds-label'}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`ds-field ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <FieldError id={`${id}-err`}>{error}</FieldError>
      ) : hint ? (
        <span id={`${id}-hint`} className='ds-hint'>
          {hint}
        </span>
      ) : null}
    </div>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Base & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(
  { label, id, error, hint, srOnlyLabel, className = '', rows = 4, ...rest },
  ref
) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={id} className={srOnlyLabel ? 'sr-only' : 'ds-label'}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`ds-field ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <FieldError id={`${id}-err`}>{error}</FieldError>
      ) : hint ? (
        <span id={`${id}-hint`} className='ds-hint'>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
