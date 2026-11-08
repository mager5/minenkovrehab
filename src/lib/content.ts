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
import { aboutContent } from '@/data/content';

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
          price: formatPrice('consultation', 7000),
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
          id: 'plantar-fasciopathy',
          title:
            'Плантарный фасциит "Пяточная шпора". Восстановительная программа',
          description:
            'Подробный информационный материал в формате пошагового алгоритма для восстановления при плантарной фасциопатии.',
          price: formatPrice('plantar-fasciopathy', 10000),
          image: '/images/products/protocols.jpg',
        },
        {
          id: 'low-back-pain',
          title:
            'Восстановительная программа "Поясница" (неспецифическая боль в нижней части спины)',
          description:
            'Пошаговый информационный материал по работе с поясничным отделом — от мягкого снятия напряжения до формирования "мышечного корсета".',
          price: formatPrice('low-back-pain', 10000),
          image: '/images/products/protocols.jpg',
        },
        {
          id: 'neck-thoracic-pain',
          title:
            'Восстановительная программа "Шея + грудной отдел" (неспецифическая боль в верхней части спины)',
          description:
            'Пошаговый информационный материал по работе с шеей и грудным отделом — от мягкого снятия напряжения до постепенного укрепления и улучшения контроля движений.',
          price: formatPrice('neck-thoracic-pain', 10000),
          image: '/images/products/protocols.jpg',
        },
        {
          id: 'formula-movement',
          title: 'Программа тренировок «Формула Движения»',
          description:
            'Авторская программа тренировок для всего тела. Занимайтесь по готовым комплексам — улучшайте подвижность суставов, развивайте силу и укрепляйте контроль движений. Всего 30 минут в удобное для вас время.',
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
          price: formatPrice('express-consultation', 4000),
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
    return aboutContent as T;
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
