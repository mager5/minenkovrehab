'use client';
// Фильтр-чипы (aria-pressed). Высота 48.
export function Chips<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role='group' aria-label={label} className='flex flex-wrap gap-2.5'>
      {items.map(it => (
        <button
          key={it.value}
          type='button'
          className='ds-chip ds-focus'
          aria-pressed={it.value === value}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
