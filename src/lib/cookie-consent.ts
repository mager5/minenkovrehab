export const COOKIE_CONSENT_KEY = 'cookieConsent';
export const COOKIE_CONSENT_OPEN_EVENT = 'mr-open-cookie-settings';

export type CookieConsentValue = 'all' | 'necessary';

/**
 * Уже сделанный выбор:
 * - all / necessary — текущие значения;
 * - true — прежнее единственное «Принять» (считаем как all, баннер не показываем).
 */
export function isCookieConsentSettled(value: string | null): boolean {
  return value === 'all' || value === 'necessary' || value === 'true';
}

/** Для будущей аналитики: all и legacy true разрешают необязательные cookies. */
export function allowsOptionalAnalytics(value: string | null): boolean {
  return value === 'all' || value === 'true';
}

export function openCookieSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
