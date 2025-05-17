/**
 * Утилиты для работы с JSON-контентом
 * 
 * Этот модуль предоставляет функции для загрузки JSON-контента
 * с поддержкой как новой структуры (директория content/),
 * так и старой (файлы в корне проекта).
 */

/**
 * Загружает JSON-контент из файлов
 * @param contentType Тип контента (home, about, products, contacts)
 * @returns Содержимое JSON-файла
 */
export async function getContent<T>(contentType: string): Promise<T> {
  // Моки данных для статического сайта
  if (contentType === 'products') {
    return {
      title: "Услуги",
      description: "Выберите подходящую услугу для ваших потребностей в реабилитации",
      services: [
        {
          id: "consultation",
          title: "Консультация",
          description: "Первичная консультация с анализом текущего состояния и рекомендациями",
          price: "3000₽",
          image: "/images/services/consultation.jpg"
        },
        {
          id: "movement-analysis",
          title: "Анализ движения",
          description: "Детальный анализ паттернов движения с выявлением проблемных зон",
          price: "5000₽",
          image: "/images/services/movement.jpg"
        },
        {
          id: "personal-program",
          title: "Индивидуальная программа",
          description: "Разработка персонализированной программы реабилитации",
          price: "7000₽",
          image: "/images/services/program.jpg"
        },
        {
          id: "online-support",
          title: "Онлайн сопровождение",
          description: "Дистанционное сопровождение процесса реабилитации",
          price: "от 10000₽",
          image: "/images/services/online.jpg"
        }
      ]
    } as T;
  }
  
  if (contentType === 'about') {
    return {
      hero: {
        title: "Обо мне",
        subtitle: "Физический реабилитолог Вадим Миненков",
        description: "Я — специалист по физической реабилитации с опытом более 8 лет. Помогаю людям восстанавливаться после травм, операций и хронических заболеваний опорно-двигательного аппарата."
      },
      mission: {
        title: "Моя миссия",
        description: "Сделать профессиональную физическую реабилитацию доступной для каждого, кто в ней нуждается, независимо от местоположения.",
        values: [
          {
            title: "Профессионализм",
            description: "Постоянное обучение и применение современных методик реабилитации"
          },
          {
            title: "Индивидуальный подход",
            description: "Разработка программ с учетом особенностей и потребностей каждого клиента"
          },
          {
            title: "Доступность",
            description: "Онлайн-формат делает реабилитацию доступной из любой точки мира"
          }
        ]
      },
      experience: {
        title: "Мой опыт",
        description: "За годы работы я помог сотням людей восстановиться после травм и операций, избавиться от хронических болей и вернуться к активному образу жизни.",
        stats: [
          {
            value: 500,
            label: "Довольных клиентов"
          },
          {
            value: 2000,
            label: "Проведенных консультаций"
          },
          {
            value: 50,
            label: "Разработанных программ"
          },
          {
            value: 8,
            label: "Лет опыта"
          }
        ],
        yearsText: "8+ лет опыта"
      },
      approach: {
        title: "Мой подход",
        steps: [
          {
            title: "Диагностика",
            description: "Тщательный анализ состояния здоровья и определение проблемных зон"
          },
          {
            title: "Планирование",
            description: "Разработка индивидуальной программы реабилитации"
          },
          {
            title: "Реализация",
            description: "Регулярные тренировки и контроль прогресса"
          },
          {
            title: "Поддержка",
            description: "Постоянное сопровождение и корректировка программы"
          }
        ]
      },
      team: {
        title: "Обо мне",
        description: "Я профессионал с многолетним опытом в физической реабилитации. Постоянно повышаю свою квалификацию и слежу за последними исследованиями в области реабилитации."
      },
      photo: "/images/about/profile.jpg",
      heroBg: "/images/about/hero-bg.jpg",
      advantages: [
        "Индивидуальный подход к каждому клиенту",
        "Современные методики и научный подход",
        "Постоянное обучение и повышение квалификации"
      ]
    } as T;
  }
  
  if (contentType === 'contacts') {
    return {
      title: "Контакты",
      email: "info@minenkovrehab.ru",
      phone: "+7 (901) 347-87-67",
      address: "Москва",
      social: {
        vk: "https://vk.com/minenkovrehab",
        telegram: "https://t.me/minenkov_rehab"
      }
    } as T;
  }
  
  if (contentType === 'home') {
    return {
      hero: {
        title: "Физическая реабилитация с профессиональным подходом",
        subtitle: "Верните тело к здоровому состоянию",
        cta: "Записаться на консультацию"
      },
      services: {
        title: "Услуги",
        description: "Индивидуальный подход к каждому пациенту",
        items: [
          {
            title: "Консультация",
            description: "Анализ состояния и рекомендации",
            icon: "consultation"
          },
          {
            title: "Реабилитация",
            description: "Программы восстановления",
            icon: "rehabilitation"
          },
          {
            title: "Онлайн поддержка",
            description: "Дистанционное сопровождение",
            icon: "online"
          }
        ]
      }
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