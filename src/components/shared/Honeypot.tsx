// Скрытое поле-ловушка для ботов: людям не видно и недоступно с клавиатуры; заполнено — заявка молча отбрасывается.
import { forwardRef } from 'react';

export const Honeypot = forwardRef<HTMLInputElement, { id: string }>(function Honeypot({ id }, ref) {
  return (
    <div
      aria-hidden='true'
      style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label htmlFor={id}>Оставьте это поле пустым</label>
      <input ref={ref} id={id} name='website' type='text' tabIndex={-1} autoComplete='off' defaultValue='' />
    </div>
  );
});
