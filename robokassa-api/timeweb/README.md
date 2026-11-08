# Текущее состояние: этап 4

Актуальные интеграции, запуск backend/worker, переменные и ограничения описаны в `../../deploy/timeweb/README.md` (из корня: `deploy/timeweb/README.md`) и `reports/MIGRATION_STAGE4.md`. Ниже — историческое описание первого этапа; auth/SSR/import и provider adapters уже добавлены.

# Timeweb: платежи и PostgreSQL Auth

Отдельный Express entrypoint `server.js`, без dotenv, legacy routes, Supabase,
реальных писем и сетевого доступа к видео. Обычный `npm start` остаётся прежним.
Этот этап не переключает действующий сайт на новый API.

## Проверка

Из `robokassa-api`:

```sh
npm ci --ignore-scripts
npm run test:timeweb
```

Нужны Node.js 20+ и PostgreSQL 17. По умолчанию PostgreSQL tools берутся из
`/opt/homebrew/opt/postgresql@17/bin`; другой каталог можно задать
`STAGE1_POSTGRES_BIN`. Runner создаёт свой временный cluster, роль и базу,
работает через отдельный Unix socket без TCP, применяет только новую миграцию,
проверяет HTTP на loopback, останавливает cluster и удаляет свой каталог.
DATABASE_URL, PGHOST и `.env` не используются. Все данные искусственные.
В sandbox macOS PostgreSQL может потребовать разрешения на shared memory.

Ручной entrypoint требует явно изолированную конфигурацию: MIGRATION_ENV,
MIGRATION_SITE_ORIGIN, MIGRATION_DATABASE_URL, STAGE1_TEST_PASSWORD2 и
MIGRATION_RESET_KEY. Local: loopback, rehab_stage1_test; staging: HTTPS,
отдельная rehab_staging. Рабочая Timeweb/Supabase не допускаются. Режим test.
Применить 001/002 только к новой отдельной базе. Полный контракт, роли и
безопасная сборка Next описаны в MIGRATION_TIMEWEB.md в корне проекта.

## Контракты

- `payments.createOrder(pool, { productSlug, buyerEmail, mode, userId?, shp? })`
  — внутренний доверенный метод; цена берётся только из products. Публичный POST /api/checkout требует сессию и CSRF. Если передаётся userId, его берёт будущий auth
  сервер из проверенной сессии, а не из тела клиентского запроса.
- `GET/POST /api/robokassa/result` — MD5 ResultURL, точная исходная строка OutSum,
  все Shp-параметры и Password #2; режим из доверенной конфигурации сервера.
  IsTest проверяется дополнительно, но не может выбирать режим. На live нужен
  отдельный проверенный запуск и соответствующий секрет/алгоритм магазина.
- Транзакция на одном pg client: lock order, проверить параметры/состояние,
  resolve user, profile, payment, purchase, outbox, paid, COMMIT. Ошибка или
  неопределённый исход commit возвращает 503; повтор сверяет уже записанное
  состояние. Повтор не реактивирует refunded/expired purchase.
- `GET /api/robokassa/orders/:invoice/status` — только своей сессии, только
  статус; не выдаёт доступ и не меняет заказ.
- `POST /api/robokassa/complete-personal-program` — 410. SDK callback и прочие
  legacy payment endpoints не загружаются в новом сервере.
- `GET /api/courses/:slug/videos/:lesson` и совместимые meniscus stage-video /
  weekly-test — проверяют `mr_session` через БД, текущую активную покупку данного
  product UUID, режим, expiry и blocked/deleted user. Только затем вызывают
  videoProvider.playback(providerId). ID берётся из доверенного каталога.
  По умолчанию provider отсутствует, поэтому даже разрешённое видео возвращает
  503. Скрытие кнопки не является защитой. Raw legacy HLS возвращает 410;
  signed URL не выдается по произвольному path. Ответы private/no-store.
- `mail-worker.deliverOne(pool, sender)` — отдельный процесс/worker-контракт.
  FOR UPDATE SKIP LOCKED, retry после отказа, независимость от платежной
  транзакции. Реализован только TestSender без внешних запросов. Фиксированные
  поля сообщения: job ID как idempotencyKey, recipient, kind и orderId;
  открытых паролей, подписей, magic/reset токенов нет.

Outbox гарантирует сохранённую задачу и повторные попытки. Внешняя доставка
в общем случае at-least-once: при crash после отправки до отметки sent нужен
провайдерский idempotency key либо сверка отправки. TestSender дедуплицирует
по job ID в рамках экземпляра, не является production хранилищем доставки.
Сейчас блокировка job удерживается до окончания sender; будущий сетевой
sender должен иметь ограниченный timeout. Worker daemon/RuSender ещё не включены.

## Схема и будущий импорт

Миграция создаёт private schema rehab в **пустой новой базе**. Нет зависимости
от auth.uid(), storage API, Supabase roles/extensions и public schema.
Миграцию применять один раз миграционной ролью, не runtime-ролью.

Сопоставление:

| Исходник | Назначение |
|---|---|
| auth.users.id / email / verification / banned / deleted | rehab.users, явный исходный UUID |
| auth.users.encrypted_password | rehab.credentials, закрытый импорт после проверки алгоритма |
| public.profiles | rehab.profiles, исходные id и timestamps |
| public.products | rehab.products, исходные id/slug; проверка положительной цены и двух знаков |
| public.purchases | rehab.purchases, исходные id/FK/status/invoice/timestamps; order_id NULL |
| public.videos | rehab.videos с user_id/file_path как в фактическом дампе |
| урок → продукт → медиа | rehab.course_videos; mapping создаётся отдельно, не угадывается из owner UUID |

Импорт не реализован и дамп не восстанавливался. Не генерировать заново UUID
импортируемых строк. Исторические дубли invoice/user-product не уничтожаются;
unique стоит на новых order/payment/outbox, не на старых invoice strings.
mode исторических покупок устанавливать после сверки test/live, а не по
умолчанию. Коллизии email сохраняются и приводят к отказу автоматического
resolve: требуются сверка identities и ручной mapping. Не объединять автоматически.

Импорт отдельно должен поднять identity sequence выше исторического максимума
InvId (включая ещё открытые счета старого магазина); createOrder дополнительно
пропускает числовые invoice из импортированных purchases и существующих orders.
При 1000 занятых номерах подряд возвращает отказ, требует reseed, а не
бесконечный цикл. UUID-покупки без invoice продолжают давать право при active.
Тестовые платежи никогда не дают live-доступ.

## Права

PUBLIC лишён доступа к schema/tables/sequences. Тесты запускают бизнес-код
под отдельной несуперпользовательской ролью без доступа к credentials и без
DDL/delete, а fixtures/ошибки создаются только owner тестового cluster.
Для локального runtime используется следующий минимальный набор grants:

```sql
GRANT USAGE ON SCHEMA rehab TO stage1_runtime;
GRANT SELECT, INSERT, UPDATE ON rehab.users, rehab.orders TO stage1_runtime;
GRANT SELECT, INSERT ON rehab.profiles, rehab.payments, rehab.purchases TO stage1_runtime;
GRANT SELECT, INSERT, UPDATE ON rehab.mail_outbox TO stage1_runtime;
GRANT SELECT ON rehab.products, rehab.sessions, rehab.course_videos TO stage1_runtime;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA rehab TO stage1_runtime;
```

Роль для реальной среды ещё не создавалась. Перед production разделить
payment/video/worker/auth-роли, выбрать RLS defense-in-depth и отозванные
сессии. Сейчас покупка не читает и не обновляет credentials даже с owner,
а ограниченная runtime-роль не может прочесть/изменить пароль и на уровне БД.
Собственный login/issuance/reset сессий — следующий этап: тесты вставляют
только искусственную сессию, старый mr_auth JWT новый сервер не принимает.

## Предел этапа

Старые endpoints/SSR/Supabase Auth/Storage продолжают существовать в legacy
entrypoint. Перед переключением фронтенда и proxy нужно заменить auth/SSR,
checkout и каталог медиа, подключить проверенный Kinescope provider и RuSender,
реализовать импорт/дельту и откат. Нельзя запускать новый защищённый endpoint
рядом с доступным старым HLS как доказательство безопасности всего сайта.
Новый entrypoint не монтирует такие fallback routes и не разрешён в production.
