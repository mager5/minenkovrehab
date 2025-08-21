/**
 * Утилиты для работы с JSON-контентом
 *
 * Этот модуль предоставляет функции для загрузки JSON-контента
 * с поддержкой как новой структуры (директория content/),
 * так и старой (файлы в корне проекта).
 */

import { promises as fs } from 'fs';
import path from 'path';
import { formatPrice } from '@/app/products/data';

/**
 * Загружает JSON-контент из файлов
 * @param contentType Тип контента (home, about, products, contacts)
 * @returns Содержимое JSON-файла
 */
export async function getContent<T>(contentType: string): Promise<T> {
  // Моки данных для статического сайта
  if (contentType === 'products') {
    return {
      title: 'Услуги',
      description: 'Выберите подходящую услугу для ваших потребностей',
      services: [
        {
          id: 'consultation',
          title: 'Онлайн-консультация',
          description:
            'Индивидуальный разбор вашей ситуации с подбором эффективных решений',
          price: formatPrice('consultation', 5000),
          image: '/images/products/consultation.jpg',
        },
        {
          id: 'personal-program',
          title: 'Резекция мениска. Восстановительная программа.',
          description:
            'Пошаговый алгоритм действий после операции коленного сустава (резекция мениска)',
          price: formatPrice('personal-program', 8000),
          image: '/images/products/personal-program.jpg',
        },
        {
          id: 'formula-movement',
          title: 'Программа тренировок "Формула Движения"',
          description:
            'Авторская программа тренировок для всего тела. Занимайтесь по готовым комплексам — улучшайте подвижность суставов, развивайте силу и укрепляйте контроль движений. Всего 20 МИН. в удобное для вас время.',
          price: formatPrice('formula-movement', 6000),
          image: '/images/products/formula-movement.jpg',
        },
        // {
        //   id: 'movement-analysis', // Удален продукт
        //   title: 'Анализ движения',
        //   description: 'Детальный анализ биомеханики движений с рекомендациями по коррекции',
        //   price: formatPrice('movement-analysis', 7500),
        //   image: '/images/services/analysis.jpg',
        // },
        {
          id: 'online-training',
          title: 'Онлайн-тренировка',
          description:
            'Индивидуальная онлайн-тренировка в формате видеозвонка проводится по предварительному согласованию времени и даты.',
          price: formatPrice('online-training', 5000),
          image: '/images/products/online_training.jpg',
        },
        {
          id: 'express-consultation',
          title: 'Экспресс онлайн-консультация',
          description:
            'Быстрая консультация в формате видеозвонка для решения конкретных вопросов. Продолжительность — 20 минут. Идеально подходит для получения рекомендаций по упражнениям, разбора техники выполнения или консультации по текущему состоянию.',
          price: formatPrice('express-consultation', 3000),
          image: '/images/products/consultation.jpg',
        },
        // {
        //   id: 'online-support', // Удален продукт
        //   title: 'Онлайн-сопровождение (1 месяц)',
        //   description: 'Ежедневная поддержка и корректировка программы через Telegram в течение 30 дней.',
        //   price: formatPrice('online-support', 5000),
        //   image: '/images/products/online-support.jpg',
        // },
      ],
    } as T;
  }

  if (contentType === 'about') {
    return {
      hero: {
        title: 'Обо мне',
        subtitle: 'Физический реабилитолог Вадим Миненков',
        description:
          'Я - специалист по спортивной  тренировке и физической реабилитации (кинезоспециалист), инструктор-методист ЛФК. Подбираю упражнения и создаю программы, помогающие выстраивать правильную двигательную активность, с учетом индивидуальности каждого случая.',
      },
      mission: {
        title: 'Моя миссия',
        description:
          'Продвигать физическую культуру в массы, делая её понятной, доступной и применимой в повседневной жизни. Я хочу, чтобы как можно больше людей осознали ценность движения и научились использовать его для здоровья, восстановления и полноценной, активной жизни.',
        values: [
          {
            title: 'Профессионализм',
            description:
              'Работа на первой линии помощи, постоянное повышение квалификации',
          },
          {
            title: 'Индивидуальный подход',
            description:
              'Подбор упражнений, адаптированных под ваши цели с учетом состояния вашего здоровья и уровня физической подготовки',
          },
          {
            title: 'Доступность',
            description:
              'Онлайн-формат позволяет тренироваться из любой точки мира в удобное для вас время',
          },
        ],
      },
      experience: {
        title: 'Мой опыт',
        description:
          'За годы моей работы я помог сотням людей обрести свободу и радость в движении',
        stats: [
          {
            value: 500,
            label: 'Индивидуальных программ',
          },
          {
            value: 2000,
            label: 'Проведенных консультаций',
          },
          {
            value: 100,
            label: 'Разработанных программ',
          },
          {
            value: 8,
            label: 'Лет опыта',
          },
        ],
        yearsText: '8+ лет опыта',
      },
      approach: {
        title: 'Мой подход',
        steps: [
          {
            title: 'Диагностика',
            description:
              'Определение исходного уровня возможностей тела воспринимать физическую нагрузку. Определение целей и задач',
          },
          {
            title: 'Планирование',
            description: 'Разработка индивидуальной тренировочной программы',
          },
          {
            title: 'Реализация',
            description: 'Регулярные тренировки и контроль прогресса',
          },
          {
            title: 'Поддержка',
            description: 'Постоянное сопровождение и корректировка программы',
          },
        ],
      },
      team: {
        title: 'Обо мне',
        description:
          'Я профессионал в области физической реабилитации и спортивной тренировки. Моя цель вернуть вам радость и свободу в движении',
      },
      photo: '/images/about/profile.jpg',
      heroBg: '/images/about/hero-bg.jpg',
      advantages: [
        'Индивидуальный подход к каждому клиенту',
        'Современные методики и научный подход',
        'Постоянное обучение и повышение квалификации',
      ],
    } as T;
  }

  if (contentType === 'contacts') {
    return {
      title: 'Контакты',
      email: 'minenkov.rehab@yandex.ru',
      phone: '+7 928 328 70 52',
      address: 'Москва',
      social: {
        vk: 'https://vk.com/minenkov_rehab',
        telegram: 'https://t.me/MV_Rehab',
      },
    } as T;
  }

  if (contentType === 'home') {
    return {
      hero: {
        title: 'Физическая реабилитация с профессиональным подходом',
        subtitle: 'Верните тело к здоровому состоянию',
        cta: 'Записаться на консультацию',
      },
      services: {
        title: 'Услуги',
        description: 'Индивидуальный подход к каждому пациенту',
        items: [
          {
            title: 'Консультация',
            description: 'Анализ состояния и рекомендации',
            icon: 'consultation',
          },
          {
            title: 'Реабилитация',
            description: 'Программы восстановления',
            icon: 'rehabilitation',
          },
          {
            title: 'Онлайн поддержка',
            description: 'Дистанционное сопровождение',
            icon: 'online',
          },
        ],
      },
    } as T;
  }

  return {} as T;
}

/**
 * Загружает контент главной страницы
 */
export function getHomeContent<T>(): Promise<T> {
  return getContent<T>('home');
}

/**
 * Загружает контент страницы "О нас"
 */
export function getAboutContent<T>(): Promise<T> {
  return getContent<T>('about');
}

/**
 * Загружает контент продуктов
 */
export function getProductsContent<T>(): Promise<T> {
  return getContent<T>('products');
}

/**
 * Загружает контактную информацию
 */
export function getContactsContent<T>(): Promise<T> {
  return getContent<T>('contacts');
}
