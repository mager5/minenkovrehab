# Frontend Authorization Module

Этот документ описывает архитектуру и использование модуля авторизации, реализованного для демонстрации frontend-возможностей.

## 🚀 Обзор

Модуль представляет собой автономную frontend-реализацию системы аутентификации, использующую Mock-данные и localStorage для симуляции backend-логики.

**Демонстрационные маршруты:**
- `/auth-demo/login` - Страница входа
- `/auth-demo/forgot-password` - Восстановление пароля
- `/auth-demo/reset-password` - Смена пароля (имитация перехода по ссылке из письма)

## 🛠 Технический стек

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Radix UI (Slot), Custom UI Components
- **Animations**: Framer Motion
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## 🧩 Архитектура

### Компоненты UI (`src/components/ui/auth`)

Мы создали набор переиспользуемых компонентов, следующих принципам атомарного дизайна:

1.  **Button**: Поддерживает варианты (`primary`, `secondary`, `outline`, `ghost`, `link`), размеры и состояние загрузки (`isLoading`).
2.  **Input**: Поле ввода с встроенной поддержкой отображения ошибок и переключением видимости пароля (`Eye`/`EyeOff`).
3.  **Alert**: Компонент уведомлений с вариантами (`default`, `destructive`, `success`, `warning`) и анимацией.
4.  **Card**: Набор компонентов для построения карточек (Header, Title, Content, Footer).

### Хуки (`src/hooks`)

- **`useMockAuth`**: Контекст, предоставляющий методы `signIn`, `signOut`, `resetPassword` и состояние пользователя. Данные сохраняются в `localStorage`.

### Валидация (`src/lib/validations/auth.ts`)

Используются схемы Zod для строгой типизации и валидации форм:
- `loginSchema`: Email + Password (min 8 chars)
- `forgotPasswordSchema`: Email
- `resetPasswordSchema`: Password validation (A-Z, 0-9, special char) + Confirm Password matching

## 🎨 Style Guide & UX

### Цветовая палитра
- Primary: Indigo-600 (`#4f46e5`)
- Error: Red-500 (`#ef4444`)
- Success: Green-500 (`#22c55e`)

### Анимации
- **Page Transitions**: Плавное появление форм (`opacity`, `y-axis`).
- **Error Messages**: AnimatePresence для плавного разворачивания/сворачивания алертов.
- **Micro-interactions**: Hover-эффекты на кнопках, фокус на полях ввода.

### Accessibility (A11y)
- Все поля имеют `label` или `aria-label`.
- Интерактивные элементы доступны с клавиатуры (`focus-visible`).
- Используются семантические теги HTML (`form`, `button type="submit"`).
- Цветовой контраст соответствует стандартам WCAG.

## 🔄 User Flow

1.  **Login**:
    - Пользователь вводит Email/Password.
    - При ошибке -> Показывается Alert с анимацией.
    - При успехе -> Редирект в `/dashboard` (или сохранение в context).
2.  **Forgot Password**:
    - Ввод Email.
    - Успех -> Форма заменяется на сообщение об успехе (AnimatePresence mode="wait").
3.  **Reset Password**:
    - Ввод нового пароля с подтверждением.
    - Валидация в реальном времени.
    - Успех -> Показ Success State -> Автоматический редирект на Login через 3 секунды.

## 📦 Установка и запуск

Для работы модуля требуются следующие зависимости (уже установлены):
```bash
npm install framer-motion zod react-hook-form @hookform/resolvers clsx tailwind-merge lucide-react class-variance-authority @radix-ui/react-slot
```

Запуск проекта:
```bash
npm run dev
```
Перейдите по адресу `http://localhost:3000/auth-demo/login`.
