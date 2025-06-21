/**
 * Главный индексный файл всех компонентов
 *
 * Централизованный экспорт всех компонентов приложения
 */

// Общие компоненты
export * from './shared';

// UI компоненты
export * from './ui';

// Компоненты секций
export * from './sections';

// Layout компоненты
export * from './layout';

// Анимации
export { default as LottieAnimation } from './animations/LottieAnimation';

// Отдельные компоненты
export { default as AdminBreadcrumbs } from './AdminBreadcrumbs';
export { default as CookieBanner } from './CookieBanner';
