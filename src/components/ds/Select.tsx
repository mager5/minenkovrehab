'use client';
// Кастомный выпадающий список (role=listbox): управление стрелками, Enter/Space, Esc, Home/End.
// Значение уходит в форму через скрытое поле с name.
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from './Icon';
import { FieldError } from './Field';

export type SelectOption = { value: string; label: string };

export function Select({
  label,
  name,
  options,
  value,
  onChange,
  placeholder = 'Выберите',
  error,
  id: idProp,
}: {
  label: string;
  name?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  id?: string;
}) {
  const auto = useId().replace(/:/g, '');
  const id = idProp ?? `sel-${auto}`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      options.findIndex(o => o.value === value)
    )
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const choose = (i: number) => {
    const opt = options[i];
    if (opt) onChange(opt.value);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onBtnKey = (e: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setActive(
        Math.max(
          0,
          options.findIndex(o => o.value === value)
        )
      );
      setOpen(true);
    }
  };

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(options.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(0, a - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div className='relative flex flex-col gap-2' ref={rootRef}>
      <span id={`${id}-l`} className='ds-label'>
        {label}
      </span>
      {name ? <input type='hidden' name={name} value={value} /> : null}
      <button
        ref={btnRef}
        type='button'
        id={id}
        className='ds-field flex items-center justify-between gap-3 text-left cursor-pointer whitespace-nowrap'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-labelledby={`${id}-l ${id}-v`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onClick={() => {
          setActive(
            Math.max(
              0,
              options.findIndex(o => o.value === value)
            )
          );
          setOpen(o => !o);
        }}
        onKeyDown={onBtnKey}
      >
        <span
          id={`${id}-v`}
          className={`min-w-0 truncate ${current ? '' : 'text-[#7A8896]'}`}
        >
          {current ? current.label : placeholder}
        </span>
        <Icon
          name={open ? 'chev-up' : 'chev-down'}
          size={22}
          strokeWidth={2.5}
          color='var(--c-blue)'
          className='flex-none'
        />
      </button>
      {open ? (
        <ul
          ref={listRef}
          role='listbox'
          tabIndex={-1}
          aria-labelledby={`${id}-l`}
          aria-activedescendant={`${id}-o${active}`}
          onKeyDown={onListKey}
          className='absolute left-0 right-0 top-full z-30 mt-2 list-none m-0 p-2 rounded-[18px] bg-white shadow-pop text-[17px] outline-none max-h-[320px] overflow-auto'
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${id}-o${i}`}
                role='option'
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex min-h-[44px] items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer ${
                  selected
                    ? 'bg-sky text-navy font-bold'
                    : i === active
                      ? 'bg-[#F3F7FA]'
                      : ''
                }`}
              >
                {o.label}
                {selected ? (
                  <Icon
                    name='check'
                    size={20}
                    strokeWidth={3}
                    color='var(--c-blue)'
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {error ? <FieldError id={`${id}-err`}>{error}</FieldError> : null}
    </div>
  );
}
