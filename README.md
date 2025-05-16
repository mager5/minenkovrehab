# Сайт Миненков Реабилитация

Проект создан на [Next.js](https://nextjs.org) с использованием TypeScript и Tailwind CSS.

## Структура проекта

После рефакторинга проект имеет следующую структуру:

```
minenkovrehab/
├── content/              # JSON-файлы с контентом страниц
│   ├── home.json         # Контент главной страницы
│   ├── about.json        # Контент страницы "Обо мне"
│   ├── products.json     # Контент страницы услуг
│   └── contacts.json     # Контент страницы контактов
├── public/               # Статические файлы (изображения, иконки)
├── src/                  # Исходный код
│   ├── app/              # Next.js App Router страницы
│   ├── components/       # Компоненты
│   │   ├── ui/           # Базовые UI-компоненты (кнопки, формы и т.д.)
│   │   ├── sections/     # Секции страниц
│   │   │   ├── home/     # Компоненты главной страницы
│   │   │   ├── about/    # Компоненты страницы "Обо мне"
│   │   │   └── contact/  # Компоненты страницы контактов
│   │   └── shared/       # Общие компоненты (хедер, футер и т.д.)
│   ├── hooks/            # React-хуки
│   ├── lib/              # Вспомогательные функции
│   │   └── content.ts    # Адаптер для работы с контентом
│   └── types/            # TypeScript типы
└── tailwind.config.ts    # Конфигурация Tailwind CSS
```

## Запуск проекта

Для запуска проекта в режиме разработки:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Работа с контентом

Весь статический контент сайта хранится в JSON-файлах в директории `content/`. Для загрузки контента используется централизованный адаптер `src/lib/content.ts`.

Пример загрузки контента в компоненте:

```typescript
import { getHomeContent } from '@/lib/content';

// В React-компоненте
const [content, setContent] = useState<HomeContent | null>(null);

useEffect(() => {
  async function loadContent() {
    const data = await getHomeContent<HomeContent>();
    setContent(data);
  }
  loadContent();
}, []);
```

## Добавление новых компонентов

### UI-компоненты

Базовые UI-компоненты следует размещать в директории `src/components/ui/`.

Пример создания нового UI-компонента:

1. Создайте файл в директории `src/components/ui/`, например, `Alert.tsx`
2. Реализуйте компонент
3. Экспортируйте компонент в индексном файле `src/components/ui/index.ts`

### Секции страниц

Компоненты, представляющие отдельные секции страниц, размещаются в соответствующих директориях:

- `src/components/sections/home/` - для главной страницы
- `src/components/sections/about/` - для страницы "Обо мне"
- `src/components/sections/contact/` - для страницы контактов

После создания компонента, добавьте его в соответствующий индексный файл.

### Общие компоненты

Общие компоненты, используемые на нескольких страницах, размещаются в директории `src/components/shared/`.

## Соглашения об именовании

- **Компоненты**: PascalCase (например, `Button.tsx`, `HeroSection.tsx`)
- **Хуки**: camelCase с префиксом `use` (например, `useAuth.ts`)
- **Утилиты**: camelCase (например, `formatDate.ts`)
- **Директории**: kebab-case (например, `content-types`)

## Развертывание

Проект настроен для развертывания на GitHub Pages. Для запуска процесса деплоя:

```bash
npm run deploy
```

## Полезные ссылки

- [Next.js Документация](https://nextjs.org/docs)
- [Tailwind CSS Документация](https://tailwindcss.com/docs)
- [TypeScript Документация](https://www.typescriptlang.org/docs)
