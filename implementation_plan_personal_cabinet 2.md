# 🚀 План реализации личного кабинета и видеокурсов

Этот документ описывает архитектуру и этапы реализации личного кабинета с платным доступом к видеоматериалам.

---

## 📋 Общий обзор

**Цель:** Создать защищенный раздел сайта (личный кабинет), где пользователи могут просматривать купленные видеокурсы. Доступ предоставляется автоматически после оплаты через Robokassa.

**Стек технологий:**
- **Frontend:** Next.js (App Router)
- **Backend / Database:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Robokassa
- **Email:** Nodemailer (для отправки доступов)

---

## 🏗 Архитектура данных (Supabase)

### 1. Таблицы базы данных

#### `profiles` (Профили пользователей)
Связь один-к-одному с таблицей `auth.users` Supabase.
- `id`: uuid (PK, references auth.users.id)
- `email`: text
- `full_name`: text
- `created_at`: timestamp

#### `products` (Курсы/Услуги)
Список доступных для покупки материалов.
- `id`: uuid (PK)
- `slug`: text (unique, например, 'formula-movement-level-1')
- `title`: text (Название курса)
- `description`: text
- `price`: numeric

#### `purchases` (Покупки)
Запись о том, что пользователь купил продукт.
- `id`: uuid (PK)
- `user_id`: uuid (FK -> profiles.id)
- `product_id`: uuid (FK -> products.id)
- `status`: text ('active', 'expired', 'refunded')
- `created_at`: timestamp
- `robokassa_invoice_id`: text (для связи с платежом)

#### `videos` (Видеоматериалы)
Метаданные видеофайлов.
- `id`: uuid (PK)
- `product_id`: uuid (FK -> products.id)
- `title`: text
- `storage_path`: text (путь к файлу в Supabase Storage)
- `order`: integer (порядок вывода в курсе)
- `duration`: integer (секунды)

### 2. Хранилище файлов (Supabase Storage)

- **Bucket:** `course-videos`
- **Privacy:** Private (доступ только через подписанные URL или RLS)
- **Структура папок:** `/{product_slug}/{video_filename}`

---

## 🔄 Логика работы (Flows)

### 1. Процесс оплаты и регистрации (Webhook)

Когда Robokassa подтверждает успешную оплату (ResultURL):

1.  **Webhook Handler** (Next.js API Route `/api/robokassa/webhook`):
    *   Проверяет подпись (Signature) от Robokassa.
    *   Извлекает `email` пользователя из параметров платежа (`shp_email`).
    *   Проверяет, существует ли пользователь в Supabase Auth.
2.  **Если пользователь НОВЫЙ:**
    *   Генерирует случайный пароль.
    *   Создает пользователя в Supabase Auth (`supabase.auth.admin.createUser`).
    *   Создает запись в `profiles`.
    *   Отправляет email с логином и паролем пользователю.
3.  **Если пользователь СУЩЕСТВУЕТ:**
    *   Ничего не меняет в Auth (пароль остается старым).
    *   Отправляет уведомление, что курс доступен в личном кабинете.
4.  **Фиксация покупки:**
    *   Добавляет запись в таблицу `purchases` (связь User <-> Product).
5.  **Ответ Robokassa:** Возвращает `OK{InvId}`.

### 2. Процесс авторизации

1.  Пользователь заходит на `/login`.
2.  Вводит Email и Пароль (полученные на почту).
3.  Next.js использует Supabase Client для входа (`supabase.auth.signInWithPassword`).
4.  При успехе создается сессия, редирект в `/dashboard`.

### 3. Просмотр видео

1.  Пользователь заходит в `/dashboard`.
2.  Загружается список купленных курсов (запрос к `purchases` join `products`).
3.  Пользователь кликает на курс -> `/dashboard/course/[slug]`.
4.  Загружается список видео.
5.  Для воспроизведения видео:
    *   Клиент запрашивает подписанный URL (Signed URL) через Server Action или API Route.
    *   Сервер проверяет наличие записи в `purchases` для данного пользователя и продукта.
    *   Если доступ есть -> генерирует Signed URL (действует, например, 1 час).
    *   Видео проигрывается в плеере.

---

## 🛡 Безопасность

1.  **Row Level Security (RLS):**
    *   `profiles`: User может читать/обновлять только свой профиль.
    *   `purchases`: User может видеть только свои покупки.
    *   `videos`: Доступ на чтение только если есть соответствующая запись в `purchases` (через join или функцию БД).
2.  **Защита видео:**
    *   Прямые ссылки на Supabase Storage не работают (Private Bucket).
    *   Signed URL генерируется только после проверки прав на сервере.
3.  **Webhook Security:**
    *   Проверка IP адресов Robokassa (опционально).
    *   Строгая проверка MD5 подписи.

---

## 📝 План работ (Tasks)

### Этап 1: Настройка Supabase
- [ ] Создать проект в Supabase.
- [ ] Настроить таблицы БД (`profiles`, `products`, `purchases`, `videos`).
- [ ] Настроить Storage Bucket `course-videos`.
- [ ] Получить API ключи (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Этап 2: Интеграция с Robokassa (Backend)
- [ ] Создать API Route `/api/payment/webhook` в Next.js (или перенести логику в существующий Express, если удобнее, но лучше в Next.js для прямой работы с Supabase).
- [ ] Реализовать проверку подписи Robokassa.
- [ ] Реализовать логику создания пользователя в Supabase Auth (через `supabase-admin`).
- [ ] Реализовать отправку email через Nodemailer (шаблон письма с паролем).

### Этап 3: Frontend - Личный кабинет
- [ ] Создать страницу авторизации `/login`.
- [ ] Создать страницу личного кабинета `/dashboard` (список курсов).
- [ ] Создать страницу просмотра курса `/dashboard/course/[slug]`.
- [ ] Реализовать плеер видео.

### Этап 4: Загрузка контента
- [ ] Скрипт или админка для загрузки видео в Supabase Storage и заполнения таблицы `videos`.

### Этап 5: Тестирование
- [ ] Тестовая оплата через Robokassa (Test Mode).
- [ ] Проверка получения письма.
- [ ] Проверка входа в кабинет.
- [ ] Проверка воспроизведения видео.
