// Единый каталог услуг и программ: из него строятся список /products,
// хаб восстановительных программ, sitemap.xml, schema.org и метаданные страниц услуг.
// Полные описания для страниц услуг лежат в ./data.ts (по тому же id).
import { formatPrice } from './data';

export type CatalogKind = 'consultation' | 'training' | 'program';

export interface CatalogItem {
  /** id продукта в оплате и в личном кабинете — не менять. */
  id: string;
  /** Часть адреса: /products/<slug>. */
  slug: string;
  /** Название на карточке и в H1. */
  title: string;
  /** Короткое описание для карточки. */
  description: string;
  price: number;
  image: string;
  kind: CatalogKind;
  /** Продолжительность в минутах (для консультаций и тренировок). */
  durationMinutes?: number;
  seoTitle: string;
  /** 140–160 символов. */
  seoDescription: string;
  /** Дата последнего изменения страницы (для sitemap). */
  updated: string;
}

export const catalog: CatalogItem[] = [
  {
    id: 'consultation',
    slug: 'consultation',
    title: 'Онлайн-консультация',
    description:
      'Индивидуальный разбор вашей ситуации с подбором эффективных решений.',
    price: 7000,
    image: '/images/products/consultation.jpg',
    kind: 'consultation',
    durationMinutes: 60,
    seoTitle: 'Онлайн-консультация по реабилитации | Вадим Миненков',
    seoDescription:
      'Онлайн-консультация 60 минут: разбор вашего состояния, ограничений и движений, первичные упражнения и план дальнейших шагов. Запись консультации остаётся у вас.',
    updated: '2026-11-08',
  },
  {
    id: 'express-consultation',
    slug: 'express-consultation',
    title: 'Экспресс онлайн-консультация',
    description:
      'Короткая консультация по видеосвязи (20 минут) для разбора одного конкретного вопроса и получения рекомендаций.',
    price: 4000,
    image: '/images/products/consultation.jpg',
    kind: 'consultation',
    durationMinutes: 20,
    seoTitle: 'Экспресс онлайн-консультация | Вадим Миненков',
    seoDescription:
      'Экспресс-консультация по видеосвязи на 20 минут: разбор истории вашего состояния, ответы на вопросы, цели и вектор действий по одному конкретному вопросу.',
    updated: '2026-11-08',
  },
  {
    id: 'online-training',
    slug: 'online-training',
    title: 'Онлайн-тренировка',
    description:
      'Индивидуальная онлайн-тренировка в формате видеозвонка по предварительному согласованию времени и даты.',
    price: 5000,
    image: '/images/products/online_training.jpg',
    kind: 'training',
    durationMinutes: 60,
    seoTitle: 'Онлайн-тренировка с инструктором ЛФК | Вадим Миненков',
    seoDescription:
      'Индивидуальная онлайн-тренировка 60 минут по видеосвязи: сила, подвижность, баланс и контроль движений с коррекцией техники в реальном времени.',
    updated: '2026-11-08',
  },
  {
    id: 'formula-movement',
    slug: 'formula-movement',
    title: 'Программа тренировок «Формула Движения»',
    description:
      'Авторская программа тренировок для всего тела. Занимайтесь по готовым комплексам — улучшайте подвижность суставов, развивайте силу и укрепляйте контроль движений. Всего 30 минут в удобное для вас время.',
    price: 6000,
    image: '/images/products/formula-movement.jpg',
    kind: 'training',
    seoTitle: 'Программа тренировок «Формула Движения» | Вадим Миненков',
    seoDescription:
      'Авторская программа тренировок на всё тело: 4 уровня по 2 месяца, 9 тренировок по 30 минут на уровне. Осанка, мышцы кора и подвижность суставов.',
    updated: '2026-11-08',
  },
  {
    id: 'personal-program',
    slug: 'meniscus-resection',
    title: 'Программа восстановления после резекции мениска',
    description:
      'Пошаговый алгоритм действий после операции коленного сустава (резекция мениска).',
    price: 8000,
    image: '/images/products/personal-program.jpg',
    kind: 'program',
    seoTitle: 'Резекция мениска: программа восстановления | Вадим Миненков',
    seoDescription:
      'Программа восстановления после резекции мениска: 5 этапов от первого дня после операции до возвращения в спорт, текст на 16 страниц и видео упражнений.',
    updated: '2026-11-08',
  },
  /* plantar-fasciopathy — СКРЫТО 09.11.2026: оплата не подключена + медицинские формулировки (модерация Яндекс Директа). Чтобы вернуть — раскомментировать.
  {
    id: 'plantar-fasciopathy',
    slug: 'plantar-fasciopathy',
    title: 'Плантарный фасциит «Пяточная шпора». Восстановительная программа',
    description:
      'Подробный информационный материал в формате пошагового алгоритма для восстановления при плантарной фасциопатии.',
    price: 10000,
    image: '/images/products/protocols.jpg',
    kind: 'program',
    seoTitle: 'Пяточная шпора: программа восстановления | Вадим Миненков',
    seoDescription:
      'Программа восстановления при плантарном фасциите (пяточной шпоре): 6 этапов от острого периода до спорта, текст на 12 страниц и видео упражнений.',
    updated: '2026-11-08',
  },
  */
  /* low-back-pain — СКРЫТО 09.11.2026: оплата не подключена + медицинские формулировки (модерация Яндекс Директа). Чтобы вернуть — раскомментировать.
  {
    id: 'low-back-pain',
    slug: 'low-back-pain',
    title:
      'Восстановительная программа «Поясница» (неспецифическая боль в нижней части спины)',
    description:
      'Пошаговый информационный материал по работе с поясничным отделом — от мягкого снятия напряжения до формирования «мышечного корсета».',
    price: 10000,
    image: '/images/products/protocols.jpg',
    kind: 'program',
    seoTitle: 'Боль в пояснице: программа восстановления | Вадим Миненков',
    seoDescription:
      'Программа «Поясница» при неспецифической боли в нижней части спины: 5 этапов упражнений с видео — от снятия напряжения до уверенного контроля движений.',
    updated: '2026-11-08',
  },
  */
  /* neck-thoracic-pain — СКРЫТО 09.11.2026: оплата не подключена + медицинские формулировки (модерация Яндекс Директа). Чтобы вернуть — раскомментировать.
  {
    id: 'neck-thoracic-pain',
    slug: 'neck-thoracic-pain',
    title:
      'Восстановительная программа «Шея + грудной отдел» (неспецифическая боль в верхней части спины)',
    description:
      'Пошаговый информационный материал по работе с шеей и грудным отделом — от мягкого снятия напряжения до постепенного укрепления и улучшения контроля движений.',
    price: 10000,
    image: '/images/products/protocols.jpg',
    kind: 'program',
    seoTitle: 'Боль в шее и грудном отделе: программа | Вадим Миненков',
    seoDescription:
      'Программа «Шея + грудной отдел» при боли в верхней части спины: 5 этапов упражнений с видео — от снятия напряжения до укрепления и контроля движений.',
    updated: '2026-11-08',
  },
  */
];

export const REHAB_PROGRAMS_PATH = '/products/rehab-programs';

export const rehabPrograms = catalog.filter(item => item.kind === 'program');

export function productPath(item: Pick<CatalogItem, 'slug'>): string {
  return `/products/${item.slug}`;
}

export function getCatalogItemById(id: string): CatalogItem | undefined {
  return catalog.find(item => item.id === id);
}

export function getCatalogItemBySlug(slug: string): CatalogItem | undefined {
  return catalog.find(item => item.slug === slug);
}

/** Путь страницы продукта по его id (personal-program → /products/meniscus-resection). */
export function pathForProductId(id: string): string {
  const item = getCatalogItemById(id);
  return item ? productPath(item) : `/products/${id}`;
}

export function priceLabel(item: CatalogItem): string {
  return formatPrice(item.id, item.price);
}
