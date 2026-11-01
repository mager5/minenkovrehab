// Shared static manifest: safe to import in server-side validation code.
export interface LayoutGroup {
  count: number;
  label: string;
}
export interface LayoutCopy {
  id: number;
  source: number;
}
export const MAX_LAYOUT_COPIES = 20;

export const LAYOUT_GROUPS: Record<string, LayoutGroup> = {
  'home-sections': { count: 5, label: 'Разделы главной страницы' },
  'hero-points': { count: 3, label: 'Пункты первого экрана' },
  'hero-actions': { count: 2, label: 'Кнопки первого экрана' },
  services: { count: 4, label: 'Карточки услуг' },
  'help-items': { count: 4, label: 'Поводы для обращения' },
  'about-stats': { count: 4, label: 'Статистика' },
};

export function validLayoutCopies(
  group: string,
  value: unknown
): value is LayoutCopy[] {
  const definition = LAYOUT_GROUPS[group];
  if (
    !definition ||
    !Array.isArray(value) ||
    value.length > MAX_LAYOUT_COPIES ||
    (group === 'home-sections' && value.length > 0)
  )
    return false;
  return (
    Array.from(value).every(
      copy =>
        copy &&
        typeof copy === 'object' &&
        !Array.isArray(copy) &&
        Object.keys(copy).length === 2 &&
        Object.hasOwn(copy, 'id') &&
        Object.hasOwn(copy, 'source') &&
        Number.isInteger(copy.id) &&
        copy.id >= definition.count &&
        copy.id < definition.count + MAX_LAYOUT_COPIES &&
        Number.isInteger(copy.source) &&
        copy.source >= 0 &&
        copy.source < definition.count
    ) &&
    new Set(value.map(copy => copy.id)).size === value.length &&
    value
      .map(copy => copy.id)
      .sort((left, right) => left - right)
      .every((id, position) => id === definition.count + position)
  );
}

// Canonical DOM identity order. Copy ids are always after all original indices.
export function layoutItemIds(
  group: string,
  copies: unknown = []
): number[] | null {
  const definition = LAYOUT_GROUPS[group];
  if (!definition || !validLayoutCopies(group, copies)) return null;
  return [
    ...Array.from({ length: definition.count }, (_, index) => index),
    ...copies.map(copy => copy.id).sort((left, right) => left - right),
  ];
}

export function validLayoutOrder(
  group: string,
  value: unknown,
  copies: unknown = []
): value is number[] {
  const ids = layoutItemIds(group, copies);
  return Boolean(
    ids &&
      Array.isArray(value) &&
      value.length === ids.length &&
      new Set(value).size === ids.length &&
      Array.from(value).every(
        index => Number.isInteger(index) && ids.includes(index)
      )
  );
}

// Hidden indices are a subset; the order still contains original and copied items.
export function validLayoutHidden(
  group: string,
  value: unknown,
  copies: unknown = []
): value is number[] {
  const ids = layoutItemIds(group, copies);
  return Boolean(
    ids &&
      Array.isArray(value) &&
      value.length <= ids.length &&
      new Set(value).size === value.length &&
      Array.from(value).every(
        index => Number.isInteger(index) && ids.includes(index)
      )
  );
}
