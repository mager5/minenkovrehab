'use client';
import { useRef, useState } from 'react';
import { ImagePlus, SlidersHorizontal } from 'lucide-react';
import type { EditTarget, ElementOverride } from '@/lib/element-editor-schema';
export type EditorResult = {
  overrides: ElementOverride[];
  revision: string;
  canUndo?: boolean;
  actions?: { step: number; label: string }[];
  reply?: string;
};
type Props = {
  selected: EditTarget | null;
  revision: string;
  disabled: boolean;
  onBusy: (_busy: boolean) => void;
  onSaved: (_data: EditorResult) => void;
  onError: (_text: string) => void;
};
function hex(value: string | undefined) {
  if (value?.startsWith('#')) return value;
  const match = value?.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return match
    ? '#' +
        match
          .slice(1)
          .map(number => Number(number).toString(16).padStart(2, '0'))
          .join('')
    : '#ffffff';
}
export default function AiElementInspector({
  selected,
  revision,
  disabled,
  onBusy,
  onSaved,
  onError,
}: Props) {
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const file = useRef<HTMLInputElement>(null);
  if (!selected) return null;
  const image =
    selected.tag === 'img' ||
    Boolean(
      selected.styles.backgroundImage &&
        selected.styles.backgroundImage !== 'none'
    );
  const textOnly = selected.kind === 'text';
  const baseline: Record<string, string> = {
    color: hex(selected.styles.color),
    backgroundColor: hex(selected.styles.backgroundColor),
    fontSize: `${parseFloat(selected.styles.fontSize || '16')}px`,
    fontWeight: selected.styles.fontWeight || '400',
    borderRadius: `${parseFloat(selected.styles.borderRadius || '0')}px`,
    padding: selected.styles.padding || '0px',
  };
  const change = (property: string, value: string) =>
    setDirty(previous => {
      const next = { ...previous };
      if (baseline[property] === value) delete next[property];
      else next[property] = value;
      return next;
    });
  const number = (value: string) =>
    Number.isFinite(parseFloat(value)) ? parseFloat(value) : '';
  async function apply() {
    if (disabled || !Object.keys(dirty).length) return;
    onBusy(true);
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'settings',
          page: '/',
          target: selected,
          changes: Object.entries(dirty).map(([property, value]) => ({
            property,
            value,
          })),
          revision,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось сохранить настройки.');
      onSaved(data);
      setDirty({});
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      onBusy(false);
    }
  }
  async function upload(imageFile: File) {
    if (disabled) return;
    if (imageFile.size > 10 * 1024 * 1024) {
      onError('Изображение должно быть не больше 10 МБ.');
      return;
    }
    onBusy(true);
    try {
      const form = new FormData();
      form.append('file', imageFile);
      form.append('target', JSON.stringify(selected));
      form.append('revision', revision);
      const response = await fetch('/api/ai-test/image', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось заменить картинку.');
      onSaved(data);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Ошибка загрузки.');
    } finally {
      onBusy(false);
      if (file.current) file.current.value = '';
    }
  }
  return (
    <div className='ai-inspector'>
      {image && (
        <div className='ai-image-actions'>
          <button
            type='button'
            disabled={disabled}
            onClick={() => file.current?.click()}
          >
            <ImagePlus size={14} />
            Заменить изображение
          </button>
          <input
            ref={file}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            aria-label='Новое изображение'
            hidden
            onChange={event => {
              const chosen = event.target.files?.[0];
              if (chosen) void upload(chosen);
            }}
          />
          <small>JPG, PNG, WebP · до 10 МБ. Размер блока сохраняется.</small>
        </div>
      )}
      <details
        className='ai-element-settings'
        key={JSON.stringify(selected.path) + selected.kind}
      >
        <summary>
          <SlidersHorizontal size={13} />
          Настройки элемента
        </summary>
        <div className='ai-setting-fields'>
          <label>
            Цвет текста
            <input
              type='color'
              disabled={disabled}
              value={dirty.color || hex(selected.styles.color)}
              onChange={event => change('color', event.target.value)}
            />
          </label>
          {!textOnly && (
            <label>
              Фон
              <input
                type='color'
                disabled={disabled}
                value={
                  dirty.backgroundColor || hex(selected.styles.backgroundColor)
                }
                onChange={event =>
                  change('backgroundColor', event.target.value)
                }
              />
            </label>
          )}
          <label>
            Размер текста, px
            <input
              type='number'
              min={8}
              max={120}
              disabled={disabled}
              value={number(dirty.fontSize ?? selected.styles.fontSize ?? '16')}
              onChange={event => change('fontSize', `${event.target.value}px`)}
            />
          </label>
          <label>
            Насыщенность
            <select
              disabled={disabled}
              value={dirty.fontWeight || selected.styles.fontWeight || '400'}
              onChange={event => change('fontWeight', event.target.value)}
            >
              {['300', '400', '500', '600', '700', '800', '900'].map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {!textOnly && (
            <>
              <label>
                Скругление, px
                <input
                  type='number'
                  min={0}
                  max={200}
                  disabled={disabled}
                  value={number(
                    dirty.borderRadius ?? selected.styles.borderRadius ?? '0'
                  )}
                  onChange={event =>
                    change('borderRadius', `${event.target.value}px`)
                  }
                />
              </label>
              <label>
                Отступ со всех сторон, px
                <input
                  type='number'
                  min={0}
                  max={200}
                  disabled={disabled}
                  value={
                    dirty.padding !== undefined
                      ? number(dirty.padding)
                      : (selected.styles.padding || '').includes(' ')
                        ? ''
                        : number(selected.styles.padding || '0')
                  }
                  placeholder='Разные'
                  onChange={event =>
                    change('padding', `${event.target.value}px`)
                  }
                />
              </label>
            </>
          )}
        </div>
        {textOnly && (
          <small>
            Для фона и отступов выберите кнопку или контейнер целиком через
            «Родитель».
          </small>
        )}
        <button
          className='ai-setting-save'
          type='button'
          disabled={disabled || !Object.keys(dirty).length}
          onClick={() => void apply()}
        >
          Сохранить настройки
        </button>
      </details>
    </div>
  );
}
