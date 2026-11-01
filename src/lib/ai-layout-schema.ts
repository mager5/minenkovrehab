// Shared static manifest: safe to import in server-side validation code.
export interface LayoutGroup {
  count: number;
  label: string;
}

export const LAYOUT_GROUPS: Record<string, LayoutGroup> = {
  'home-sections': { count: 5, label: 'Разделы главной страницы' },
  'hero-points': { count: 3, label: 'Пункты первого экрана' },
  'hero-actions': { count: 2, label: 'Кнопки первого экрана' },
  services: { count: 4, label: 'Карточки услуг' },
  'help-items': { count: 4, label: 'Поводы для обращения' },
  'about-stats': { count: 4, label: 'Статистика' },
};

export function validLayoutOrder(
  group: string,
  value: unknown
): value is number[] {
  const definition = LAYOUT_GROUPS[group];
  return Boolean(
    definition &&
      Array.isArray(value) &&
      value.length === definition.count &&
      new Set(value).size === definition.count &&
      Array.from(value).every(
        index =>
          Number.isInteger(index) && index >= 0 && index < definition.count
      )
  );
}

// Hidden indices are a subset; the order must still contain every original item.
export function validLayoutHidden(
  group: string,
  value: unknown
): value is number[] {
  const definition = LAYOUT_GROUPS[group];
  return Boolean(
    definition &&
      Array.isArray(value) &&
      value.length <= definition.count &&
      new Set(value).size === value.length &&
      Array.from(value).every(
        index =>
          Number.isInteger(index) && index >= 0 && index < definition.count
      )
  );
}
