'use client';
// Кастомный чекбокс 28×28 (зелёный при отметке). Нативный input скрыт, но доступен клавиатуре и скринридеру;
// зона нажатия ≥44px.
import type { ReactNode, ChangeEvent } from 'react';
import { Icon } from './Icon';
import { FieldError } from './Field';

export function Checkbox({
  id,
  name,
  checked,
  onChange,
  children,
  error,
  required,
  className = '',
}: {
  id: string;
  name?: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className='ds-check'>
        <input
          type='checkbox'
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          aria-required={required ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <span className='ds-check-box' aria-hidden='true'>
          <Icon name='check' size={17} strokeWidth={3} color='currentColor' />
        </span>
        <span className='ds-check-text'>{children}</span>
      </label>
      {error ? (
        <div className='pl-[42px]'>
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </div>
      ) : null}
    </div>
  );
}
