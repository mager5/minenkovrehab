# Аудит переноса Minenkov Rehab на Timeweb

Дата: 10 октября 2026, Москва. Папка: `/Users/imax/dev/minenkovrehab-migration`. Ветка: `migration/timeweb`. HEAD: `04a3b7a56a31e2af9d97bd971f132d0c143ce88c`. Перед аудитом рабочее дерево чистое.

Актуальные результаты этапа 4 находятся в конце документа и в [reports/MIGRATION_STAGE4.md](reports/MIGRATION_STAGE4.md); прежние разделы сохранены как история проверки.

## Область проверки

**Подтверждено чтением:** локальный код Next.js/Express, SQL проекта, указанные файлы старой копии, TOC и DDL резервной копии, число файлов storage. Использованы `pg_restore --list` и `--schema-only --file=-`, без подключения и восстановления. Строки данных дампа не извлекались. Значения секретов, персональные данные и хеши паролей в документ не включены.

`AGENTS.md` не найден в проекте вне зависимостей и родительских каталогах до корня; также не найден в сравниваемой старой копии вне зависимостей. Применены ограничения пользователя и навык `supabase:supabase` для Auth/RLS/Storage.

**Со слов пользователя:** PostgreSQL 17 в Timeweb, `192.168.10.4:5432/default_db`, пользователь `gen_user`, приватная сеть Friendly Halimede без публичного IP; зашифрованная копия в S3 сохранена и проверена. Инфраструктурная проверка этого не выполнялась. Прямых подключений с Мака не было.

**Не установлено:** фактически обслуживающий сайт commit, настройки кабинета Robokassa, права gen_user, доступность расширений и серверов Timeweb, полнота строк дампа, изменения после backup, конфигурация Kinescope/RuSender. `.env` не читались; запросы к рабочему API и платежи не выполнялись. Дефекты кода ниже не доказывают их эксплуатацию на production.

## Вывод и целевая архитектура

Нужен перенос сервисных контрактов, а не только PostgreSQL. Обычный PostgreSQL не заменяет Supabase Auth, PostgREST и Storage API. Цель: reverse proxy с HTTPS → Next.js SSR и Express → PostgreSQL в приватной сети; видео через Kinescope, письма через RuSender. Браузер работает с API, ключи провайдеров и БД остаются на сервере. Рабочий сайт и его база остаются источником истины до согласованного перехода.

## Карта зависимостей

| Область | Подтверждённый код | Требуемое изменение |
|---|---|---|
| SDK | `src/lib/supabase/{client,server,admin}.ts`, `@supabase/ssr`, `@supabase/supabase-js` | API Express и SQL-репозитории вместо SDK/REST |
| Вход/регистрация | `AuthForm.tsx` вызывает Express; `robokassa-api/routes/auth.js` обращается к `/auth/v1/token`, `/signup`, `/user` | Собственный сервис пользователей, проверка паролей, подтверждение почты |
| Сессии | Express `mr_auth`/HS256 JWT в `utils/jwt.js`; Next middleware — `supabase.auth.getUser()` | Один контракт сессий для SSR/API, отзыв и проверка blocked/deleted user |
| Recovery/callback | `forgot-password`, `reset-password`, `auth/callback`, `auth/signout`, Express exchange/magic | Одноразовые токены, хеш в БД, короткий TTL, атомарное погашение |
| Данные | Express `routes/{auth,robokassa,admin,courses}.js` использует `/rest/v1/*` | Параметризованный SQL, транзакции, проверка владельца/роли |
| Личные видео | `src/pages/api/videos/**`, `VideoList.tsx`, `VideoUploader.tsx` | API upload/list/delete/status с проверкой владельца; выбрать хранилище личных загрузок |
| Курсы | Next `pages/api/courses/meniscus/**`, `products/presentation-video*`; Express `routes/courses.js` | Каталог уроков, mapping пути → Kinescope ID, entitlement-check |
| Просмотры | RPC `increment_video_view` | Ограниченный серверный UPDATE/событие с проверкой доступа |
| Письма | Resend в Express и Next `_api`, зависимости resend/nodemailer | Адаптер RuSender и outbox; убрать пересылку паролей |
| Upload scripts | `scripts/supabase-upload.mjs` | Отдельный будущий importer медиа; существующий script не запускать |

Закомментированные обращения в dashboard и AuthForm не считать действующей реализацией. Дубликаты `* 2.*` и backup-файлы требуют проверки импортов перед будущим удалением зависимостей.

### SSR и маршруты

В основном package.json Next `^13.5.11`; Express расположен отдельно в `robokassa-api`. `next.config.js` включает `output: export` при production + GITHUB_ACTIONS; script export задаёт этот флаг. Timeweb должен использовать серверные build/start без статического export, отдельный Express и reverse proxy. Совместимость Node/Next и обновления зависимостей проверять отдельно.

Production rewrite `/api/auth/*` направлен на `api.minenkovrehab.ru`; Pages API проксируют auth/Robokassa, клиент использует API base. На новом стенде исключить случайную работу со старой базой. Предпочтителен единый origin `/api/*`. В `pages/api/robokassa/[...path].ts` объект form body сериализуется в JSON с возможным сохранением исходного Content-Type: проверить GET/POST form-urlencoded сквозным тестом.

Middleware пропускает localhost и `/api/robokassa`, обновляет Supabase cookies, защищает dashboard через Supabase. Это расходится с Express cookie. Заменить проверку единым серверным session API; не подключать PostgreSQL из Edge. Rate limit сейчас в памяти. CSP middleware и next.config расходятся; frame-src none/localhost не допускает встроенный Kinescope. Согласовать заголовки с проверенными доменами плеера/CDN. Защищённые SSR/API/медиа не кэшировать публично.

## Дамп и SQL

Файл `/Users/imax/Minenkov-backup/20261009-224214/database.dump`: 746818 байт, CUSTOM, gzip, формат 1.16; создан 09.10.2026 22:42:14 MSK. Источник PostgreSQL 17.6, pg_dump 17.11, 599 TOC entries. Это не проверка восстановления и не число строк.

Схемы: auth, extensions, graphql, graphql_public, pgbouncer, public, realtime, storage, vault. Расширения: pg_stat_statements, pgcrypto, uuid-ossp, supabase_vault. Владельцы/ACL зависят от сервисных ролей Supabase. Слепой full restore в default_db непригоден; `--no-owner --no-privileges` не устраняет все функции, расширения и auth/storage зависимости.

В public подтверждены четыре таблицы с TABLE DATA entries:

- products: UUID PK, unique slug, title/description, numeric price, created_at; default зависит от extensions.uuid_generate_v4().
- profiles: UUID PK, email/full_name, created_at; FK id → auth.users ON DELETE CASCADE.
- purchases: UUID PK, user_id → profiles, product_id → products, status active/expired/refunded, robokassa_invoice_id text, created_at. Unique invoice и active user/product в дампе нет.
- videos: UUID PK, user_id → auth.users, title/description, file_path/thumbnail_path, size/duration/mime_type/views, timestamps. Полей product_id/storage_path/order из `supabase/schema.sql` в дампе нет.

payment_invoices и payment_audit_logs отсутствуют в TOC, хотя текущие admin endpoints ожидают их. Наличие migration в старой копии не доказывает её применение.

Auth содержит users с колонкой encrypted_password, identities, sessions, refresh_tokens, MFA, SSO/OAuth/WebAuthn, flow_state и one_time_tokens. TABLE DATA entry не доказывает наличие строк или пригодных паролей. Storage содержит buckets/objects и служебные multipart/vector/analytics таблицы; байты файлов находятся отдельно. В соседнем storage подтверждено **3434 файла**. Это могут быть исходники, HLS-сегменты, плейлисты и thumbnails; не 3434 самостоятельных видео. Покрытие объектов БД этими файлами не проверено.

### Политики и функции

RLS включён на всех четырёх public таблицах: products читаются всеми; profiles/purchases ограничены auth.uid(); videos — владельцем user_id. Storage-policy дампа для INSERT/UPDATE/DELETE: authenticated, bucket videos, auth.uid() = owner; SELECT-policy storage.objects в просмотренном DDL не обнаружена. Миграция `20260213_fix_video_policy.sql` задаёт права по UUID-папке, а дамп содержит правила owner: история файлов расходится с состоянием базы.

`increment_video_view(uuid)` — SECURITY DEFINER, UPDATE views по UUID без проверки владельца и установленного search_path. Не переносить как общедоступную RPC: ограничить EXECUTE, проверять доступ; при сохранении функции закрепить схему/search_path и минимальные права.

В новой базе обязательны предикаты владельца/покупки в Express; RLS можно сохранить как дополнительный барьер через SET LOCAL в транзакции. Runtime-роль не должна обходить RLS. Не применять gen_user ко всем запросам до проверки его прав. Не использовать изменяемые user_metadata для ролей.

Express requireAuth в courses.js проверяет JWT/sub, но stage-video и HLS не проверяют active purchase; аналогично Next HLS проверяет auth/me и допустимый префикс пути. Вход не доказывает оплату. Service-role обходит RLS, поэтому требуется серверная проверка entitlement. В admin.js `/users/list` и `/users/count` не вызывают requireAdmin: список профилей нужно закрыть.

## Robokassa: критичные проблемы

Подтверждено в `robokassa-api/routes/robokassa.js`:

1. generate-payment-url принимает amount клиента, не сверяет серверную цену и не сохраняет invoice. Клиентская заниженная сумма может получить корректную подпись.
2. Result GET/POST проверяет Password #2 и сортирует shp_, но преобразует OutSum через parseFloat/toFixed(2), теряя исходную строку; параметры отбираются только по lower-case shp_. Проверить строковые форматы, регистр и алгоритм магазина по документации.
3. Result выдаёт доступ только personal-program при наличии email. Генератор исключает shp_email для этого продукта; Result ищет Email/email, а официальная документация описывает EMail. Возможен разрыв выдачи без browser callback.
4. Ошибки post-payment catch логируются, затем возвращается OK; HTTP-ошибки REST часто не проверяются. Платёж подтверждается без гарантии покупки. Result не создаёт profile перед purchase, хотя FK требует profile; пользовательский auth-trigger создания profile в дампе не обнаружен.
5. Повтор создаёт/ищет пользователя, меняет пароль существующего пользователя, шлёт письмо, затем проверяет покупку. Поиск ограничен 10 страницами по 200 пользователей. SELECT → INSERT без unique invoice и транзакции допускает конкурентные дубли.
6. `/complete-personal-program` проверяет Success-подпись Password #1, принимает email отдельно и создаёт/меняет пользователя и покупку без подтверждённого Result. Replay может перепривязать покупку по InvId к другому email; сумма не сверяется с заказом. Его вызывает `src/app/payment/success/page.tsx`.
7. `src/app/_api/robokassa/result/route.ts` обновляет лишь существующие purchases и игнорирует ошибки. `_api` — private folder App Router: этот файл нельзя считать активным ResultURL. Фактический callback кабинета не проверен.
8. В `src/lib/robokassa.ts` есть встроенные fallback-секреты; legacy handler логирует тестовые credentials. Значения здесь не приводятся. Перед публикацией убрать fallback/чувствительные логи и согласовать ротацию с работающим магазином.

Официальный контракт: [уведомления Robokassa](https://docs.robokassa.ru/ru/notifications-and-redirects): подтверждение через ResultURL, проверка подписи, ответ OK{InvId}. Настройки магазина и расписание retry не установлены.

### Новая обработка

До выдачи ссылки сохранять invoice с серверной ценой numeric/копейками, валютой, product UUID/slug, получателем, test/live и уникальным устойчивым InvId. Учитывать исторические номера. Result проверяет подпись по официальному контракту, известный invoice, режим и точную сумму; продукт/получателя берёт из заказа. Success/Fail только отображают статус.

Одна транзакция: invoice FOR UPDATE → проверить состояние → найти/создать user/profile → payment/purchase/entitlement → paid/processed → уникальная outbox-задача → COMMIT → OK. Сбой до COMMIT возвращает ошибку для повторной обработки. Уже обработанный Result возвращает тот же OK без дубля, изменения пароля и повторного письма. Ошибка RuSender после COMMIT не отменяет покупку.

Unique invoice/payment event обязательны. Повтор не переводит refunded/expired в active. Историю покупок хранить отдельно от текущего права; unique active user/product использовать лишь после проверки правил повторных покупок. Не менять пароль при покупке; новому пользователю отправлять одноразовую установку пароля. Токены magic/reset не принимать как обычные сессии.

## Сравнение старой копии

Источник только для чтения: `/Users/imax/Desktop/minenkovrehab/minenkovrehab`.

| Файл | Подтверждённая разница |
|---|---|
| scripts/supabase-upload.mjs | Единственная разница diff: старая версия создаёт SDK client лишь при mode=client, иначе null; текущая безусловно. Полезно для другого режима, но не заменяет Storage migration |
| src/components/checkout-form/CheckoutForm.tsx | В текущей копии каталога нет. Старая форма собирает email/phone/name/agreement, нормализует email, проверяет поля, блокирует повторный submit и вызывает onSubmit. Самостоятельно не сохраняет invoice и не подтверждает оплату; серверная валидация обязательна. После успешного submit состояние зависит от закрытия родителем |
| supabase/migrations/20260514_create_payment_invoices.sql | В текущей копии отсутствует. Создаёт invoice/audit tables, unique invoice_id и partial unique purchases invoice/active user-product. Нет RLS/политик новых таблиц, FK зависит от auth.users, нет атомарного обработчика/outbox. Объекты отсутствуют в дампе |

Автоматического переноса не было. Перед адаптацией SQL проверить исторические дубли, бизнес-смысл повторных покупок, auth FK и права runtime-ролей.

## Пользователи, покупки, пароли

Сохранить UUID auth.users/profiles/products/purchases/videos, timestamps, статусы покупок и invoice IDs. Создать собственные users/credentials и перепривязать profiles/videos к users. Перенести verification/blocked/deleted state и интерпретировать identities. Не сливать аккаунты только по нормализованному email без проверки коллизий и провайдеров. Покупка без invoice также может давать право.

**Сохранение паролей потенциально возможно:** колонка encrypted_password есть, [Supabase документирует bcrypt](https://supabase.com/docs/guides/auth/password-security). Наличие совместимого непустого хеша каждого пользователя не проверено. При реализации импортировать credentials закрыто, без вывода значений; проверить агрегатно форматы и совместимость на искусственном аккаунте. Проверять старый bcrypt, при успешном входе обновлять hash при необходимости. Не расшифровывать и не хешировать повторно существующий hash. Для OAuth/SSO/пустых/несовместимых хешей — установка/восстановление пароля через RuSender с тем же UUID и покупками.

Сессии — отдельная задача: Supabase refresh tokens не работают в собственном auth автоматически. Базовый безопасный вариант — повторный вход после перехода; это не потеря пароля. Мост JWT требует отдельного анализа назначения, issuer/audience, blocked state и отзыва. Старые confirmation/recovery tokens не переносить как действующие.

## Видео и письма

Создать закрытый manifest: старый bucket/path, размер/checksum, назначение, новый provider ID и статус. Не загружать каждый HLS segment как отдельное видео; выделить исходники, плейлисты, thumbnails, документы. Kinescope хранит/обрабатывает видео, PostgreSQL связывает product/lesson/video с provider ID. Для остальных файлов и личных загрузок выбрать отдельное закрытое хранилище. Проверить готовность транскодирования, каждый урок/weekly-test, мобильное воспроизведение и связь с купленным продуктом. Domain restriction плеера не заменяет проверку покупки. Конкретный механизм закрытых playback-токенов, API и тарифные ограничения Kinescope ещё требуют проверки официальной документации и аккаунта.

[RuSender Email API](https://rusender.ru/developer/api/email/) поддерживает транзакционные письма; актуальная документация описывает Bearer API token и sending key ID. Нужен серверный адаптер, подтверждённый отправитель, SPF/DKIM/DMARC, scopes/лимиты и обработка ошибок. Outbox с retry/backoff и статусами отправки отделить от выдачи доступа. Не хранить открытые пароли. Не отключать текущий канал до готовности нового; тестовая доставка только на стенде.

## Порядок переноса

1. Локально реализовать контракты/адаптеры DB/Auth/Video/Mail и схему users/credentials/sessions/invoices/payments/purchases/outbox с искусственными fixtures; начать с транзакционного Result. Production не переключать.
2. После отдельной авторизации подготовить изолированный стенд Timeweb в Friendly Halimede. По уточнению11.10 подключаться через публичный TLS hostname с verify-full и Firewall только app/admin /32; private TLS исключён №12811919. Проверить роли, TLS по требованиям сервиса, connection pool, backup и healthchecks.
3. Репетиция импорта: адаптированная схема, явный mapping нужных данных; не full restore Supabase. Исключить ненужные auth/realtime/graphql/vault объекты. Письма/live payments отключить, доступ к staging-данным ограничить. Исходный dump сохранить.
4. Импорт медиа по manifest, mapping старых путей, проверка всех материалов. Сохранить старое хранилище для отката.
5. Сквозные проверки и репетиция отката на тестовом домене. Стенд не получает production ResultURL и не отправляет production-письма.
6. Финальная актуализация: дамп 9 октября уже не финальное состояние. Нужны новый snapshot и изменения до границы перехода, включая удаления/refunds. У purchases нет updated_at: дельта по created_at пропустит изменение статуса. Согласовать короткую паузу изменяющих операций либо реализовать журнал/CDC и catch-up; нулевая пауза пока не доказана.
7. Переключение DNS/API/ResultURL — отдельное согласованное действие после сверки. Для открытых старых InvId определить единственного обработчика/источник истины и задержанные callbacks. Не допускать независимых записей в две базы.
8. Наблюдать registrations, payment → purchase → access, outbox/delivery, видео и ошибки. Старую систему сохранить до закрытия окна отката и ожидающих заказов.

## Критерии допуска

- Counts, UUID/FK и статусы users/profiles/products/purchases/videos совпадают; проверены orphan rows, duplicate invoice, email/provider collisions. Только агрегаты в отчёте.
- Проверены пароль, повторный вход, recovery/verification, logout/revocation, blocked/deleted user; magic/reset одноразовые и не принимаются как session.
- Result GET/POST: корректная/неверная подпись, другая сумма/режим, неизвестный invoice, регистр Shp и исходная строка суммы; последовательные/конкурентные повторы; crash до/после COMMIT; Result без Success и Success до Result; replay на другой email; повтор после refund. Ровно одна покупка, пароль неизменен.
- Недоступная БД не приводит к ложному OK. Недоступная почта не теряет покупку; outbox повторяет отправку без повторной выдачи. Проверить потерянный ответ провайдера.
- Гость, вошедший без покупки, покупатель другого курса, refunded/expired, чужой video/path и обычный пользователь на admin получают отказ. Публичная презентация имеет отдельное правило. Нет утечки private HLS через cache.
- SSR direct refresh, cookie через proxy, CSRF, HTTPS/CSP, Safari/Chrome, отсутствие обращений к Supabase в новом production пути.
- Сверка всех 3434 файлов с manifest, каждый этап/weekly-test воспроизводится; нет потерянных материалов.
- Проверены восстановление нового backup и откат. Тестовый, затем отдельно разрешённый боевой платёж проходит весь путь.

## Откат

До переключения production прежний. Несовпадение пользователей/покупок, потеря доступа, ошибки фиксации платежа/login/video и существенные 5xx — основания отменить переход.

После новых записей DNS-откат недостаточен. Остановить новые изменяющие операции, зафиксировать границу событий и snapshot новой БД; сверить/перенести обратно новых пользователей, покупки, refunds и платежи по UUID/InvId. Не перезаписывать старую базу вчерашним dump. Затем вернуть API/DNS/ResultURL и проверить pending invoices, вход и доступ.

Новые пароли могут быть несовместимы со старым Supabase: заранее выбрать временно совместимый формат либо принять необходимость bridge/recovery при откате. Задержанные callbacks и письма обрабатывать через единственный путь с дедупликацией. Отправленные письма и совершённые платежи откат не отменяет. Supabase и старую инфраструктуру не удалять до закрытия окна отката.

## Первый этап реализации

Отдельное локальное изменение: схема пользователей, invoices/payments/purchases/entitlements/outbox; PostgreSQL-репозиторий Express; атомарный ResultURL и read-only status для Success. Тесты concurrent retry, другой суммы, ошибок БД/почты и неизменности пароля — на искусственных данных. Не подключаться к Timeweb с Мака и не переключать production. Далее единый auth/SSR и media/mail adapters, затем импорт на изолированном стенде.

Первоначальный аудит создал только этот документ. Выполненная ниже реализация первого этапа — отдельное последующее изменение по разрешению пользователя.

## Результат первого этапа — 10 октября 2026

Реализован отдельный локальный backend в `robokassa-api/timeweb/`. Ветка остаётся `migration/timeweb`. `npm start` и legacy routes не переключены; новый entrypoint не загружает Supabase, dotenv, SDK callback или старые обработчики выдачи. Он разрешён только для локальной тестовой базы, test-режима и loopback HTTP; production-запуск заблокирован. Это позволяет проверить новый путь без воздействия на действующий сайт. Старые уязвимые пути из аудита остаются в legacy runtime и должны быть полностью исключены при будущем переключении, а не доступны параллельно новому API.

### Сделанные изменения

- `timeweb/migrations/001_payment_core.sql`: отдельная private schema rehab, users/credentials/profiles/products/videos по фактическим зависимостям дампа, orders/payments/purchases/mail_outbox/sessions/course_videos. У purchases сохранены исходные поля и UUID/FK; исторические строки могут иметь order_id NULL и дубли invoice. Unique введён для нового order/payment/outbox. Course mapping отделён от user-owned videos. У платежа FK закрепляет сумму/режим заказа, у новой покупки — продукт/режим. Миграция применялась только в новом временном кластере, дамп не импортировался.
- `timeweb/payments.js`: доверенное создание заказа по цене серверного каталога; сохранение recipient, mode и точных Shp-параметров. Резервирование InvId пропускает числовые исторические invoice. Result проверяет MD5 по исходной строке OutSum, сумму без floating point, существующий заказ, режим, подписанные параметры и состояние. Один pg client, FOR UPDATE заказа, resolve аккаунта с advisory lock, запись payment/purchase/outbox/paid и COMMIT. Только после commit возвращается OK. Повтор сверяет payment, purchase и outbox; повреждённое состояние возвращает ошибку. Refund не реактивируется.
- Credentials не читаются и не меняются при покупке; существующий UUID/profile сохраняется. Новому пользователю пароль не генерируется. Неоднозначные импортированные email не объединяются автоматически. Платёжная runtime-роль тестов не имеет прав на чтение/изменение credentials.
- `timeweb/mail-worker.js`: отдельная обработка outbox с FOR UPDATE SKIP LOCKED, состоянием attempts и retry. Только TestSender, без реальных писем и сетевого обращения к отправителю; фиксированные поля без паролей/подписей/секретных токенов. Сбой отправки не отменяет платёж. Внешняя доставка в будущем будет at-least-once, поэтому для crash после отправки нужен provider idempotency key/сверка.
- `timeweb/access.js` и `app.js`: серверная проверка отзыва/expiry сессии, blocked/deleted пользователя, active покупки именно product UUID видео, mode и expiry покупки перед вызовом videoProvider. Каталог определяет provider ID; произвольный path не допускается. Гость/чужой курс/нет покупки получают отказ. Ответы private/no-store. Добавлены generic course-video и meniscus stage/weekly-test маршруты. По умолчанию provider отсутствует: реальная выдача закрыта с 503. Legacy raw HLS и browser completion отключены в новом сервере.
- Read-only status endpoint ограничен владельцем заказа; Success не выдаёт доступ. Публичный checkout и генерация реальной платёжной ссылки в этом этапе не подключены.
- `timeweb/test/run-local.js`: автоматически создаёт собственную временную PostgreSQL 17, отдельную базу/роли/Unix socket без TCP; запускает реальные SQL и loopback HTTP тесты, останавливает кластер и удаляет временный каталог. `.env`, DATABASE_URL/PGHOST и существующие базы не используются.
- `robokassa-api/package.json`/lockfile: добавлен pinned pg 8.16.3, Express обновлён в рамках версии 4 до 4.22.3; обновлены транзитивные lodash/proxy-addr с исправлениями npm audit. Добавлены scripts test, test:timeweb, start:timeweb-local. По результату установки/аудита backend lockfile: 0 известных уязвимостей. Это не аудит root Next.js зависимостей и не доказательство отсутствия всех рисков.
- Подробные контракты, права, mapping будущего импорта и локальный запуск: `robokassa-api/timeweb/README.md`.

### Проверки

Финальная команда: `npm run test:timeweb` из robokassa-api. PostgreSQL 17.11, Node.js 20.20.2. **21 тест прошёл, 0 ошибок, 0 пропусков.** Бизнес-код выполнялся под отдельной ограниченной runtime-ролью; тестовый owner создавал fixtures и искусственные SQL-сбои.

| Проверка | Результат |
|---|---|
| Неверная подпись | Отказ, никаких payment/purchase/outbox |
| Подписанная неправильная сумма и невалидные суммы | Отказ, никаких записей |
| Неизвестный заказ, неверный режим, подмена IsTest | Отказ |
| Последовательный GET/POST replay, исходная строка суммы и Shp | Один payment/purchase/outbox, исходный UUID и credentials сохранены |
| 20 конкурентных callbacks | Все подтверждения после commit, ровно одна запись каждого эффекта |
| Несколько параллельных заказов нового email | Один новый аккаунт, credentials не созданы |
| Реальная SQL-ошибка вставки outbox | Полный rollback payment/purchase/user/profile/order; HTTP 503 без OK; повтор после устранения успешен |
| Deferred SQL-сбой на COMMIT | Нет OK и нет сохранённых эффектов; повтор успешен |
| Отказ тестового sender после оплаты | Активная покупка сохранена, задача остаётся pending/retry; успешная повторная отправка |
| Конкурентные mail workers | Один claim/одна тестовая отправка |
| Повторная покупка и replay | Старый password hash/profile не меняются |
| Replay после refund | Покупка не реактивируется |
| Защищённое видео | Гость, без покупки, другой курс, expired/refunded/истёкшая покупка/отозванная сессия отвергаются до provider; покупатель своего курса допущен |
| Test purchase в live | Не даёт доступ |
| Browser completion, raw HLS, SDK callback | Нет обходного пути выдачи в новом runtime |
| Коллизия email и другой подписанный Shp | Отказ без записи |
| Историческая покупка без order | UUID/FK/status остаются после нового checkout |
| Права credentials | Runtime не может читать и обновлять хеши |
| Исторический числовой invoice при отставшей sequence | Номер пропущен |
| Повреждённое уже обработанное состояние | 503, не ложное OK |
| Серверная цена и status endpoint | Клиентская amount игнорируется; status read-only и только владельцу |

`node --check` и `git diff --check` также прошли. Next build не запускался: компоненты фронтенда и его конфигурация этим этапом не изменялись. Временная тестовая база остановлена и удалена. Подключений к Timeweb/рабочему Supabase, реальных платежей/писем/пользователей/секретов, push/deploy и переключения домена не было.

### Что блокирует полный отказ от Supabase

1. Собственный login/signup/password verification/reset/email confirmation и выпуск сессий ещё не реализованы. Новый сервер принимает DB-сессии; тесты создают искусственные сессии. Старый mr_auth/Supabase JWT не используется как обход. Реальный импорт bcrypt и OAuth/identity mapping ещё не проверен.
2. Next SSR/middleware/auth callback и клиентские API bases/checkout ещё не переведены на новый backend; сохранён текущий production путь. Новые заказы сейчас создаются внутренним репозиторием, не публичным checkout. Требуются trusted session binding, согласия и контракт платёжной ссылки.
3. Нет Kinescope adapter/реального каталога course_videos и закрытых playback-токенов; Storage, личные загрузки, презентации и legacy HLS всё ещё требуют переноса. По умолчанию новая выдача закрыта до настройки провайдера.
4. RuSender и постоянно работающий worker ещё не подключены; есть только тестовый отправитель/worker-контракт. Новым аккаунтам нужна одноразовая установка пароля следующим этапом, без отправки самого пароля.
5. Импорт настоящих UUID/credentials/purchases/media, reseed InvId выше всех исторических/открытых счетов, сверка дублей/коллизий, финальная дельта и обратная синхронизация для отката ещё не выполнялись. Неопознанные mode исторических покупок нельзя назначать вслепую.
6. Для Timeweb нужны отдельные миграционная/payment/video/mail/auth роли, проверка TLS/сети и RLS defense-in-depth. Тестовая schema закрыта от PUBLIC, но production-права/инфраструктура не создавались. Миграция не предназначена для накатывания поверх исходного Supabase.
7. До разрешения production-запуска сверить настройки/алгоритм/секреты/ResultURL магазина, исключить старые альтернативные обработчики и выполнить репетицию полного переноса/отката. Обновление Express в legacy dependency tree требует его smoke-проверки перед отдельным будущим deploy; работающий deployment сейчас не менялся.

Следующий этап: единый собственный auth и SSR-сессии, затем checkout/status integration. После этого Kinescope/RuSender и репетиция импорта в отдельно разрешённой среде Timeweb.

## Второй этап: PostgreSQL Auth и Next.js SSR (10.10.2026)

Этот раздел заменяет устаревшие пункты первого этапа о незавершённом login/SSR/checkout. Действующий deployment не переключался. Реальные данные не импортировались.

### Реализовано и подтверждено тестами

- `002_auth.sql`, `auth.js`: вход по bcrypt, текущий пользователь, выход, серверные сессии. Cookie `mr_session`: HttpOnly, SameSite=Lax, Path=/, Secure при HTTPS в доверенной конфигурации. В БД хранится SHA-256 случайного токена; срок по умолчанию сутки, проверяются expiry/revoked_at/blocked/deleted. Вход отзывает прежнюю сессию данного cookie; выход отзывает текущую; сброс пароля — все сессии пользователя.
- Изменяющие браузерные POST требуют точного Origin и synchronizer CSRF: отдельный случайный cookie + header, хеш в БД, привязка к сессии, срок час. GET не выполняет logout/reset/checkout. Ограничение входа хранится в PostgreSQL и атомарно действует при конкурентных запросах: 5 попыток на аккаунт и 30 на IP за 15 минут, включая успешные попытки. Через Next-прокси адрес ограничителя общий для прокси; ограничения на аккаунт сохраняются. Перед production необходим отдельно доверенный proxy/IP-контракт, без доверия произвольному X-Forwarded-For.
- `auth-mail-worker.js`: восстановление пароля без раскрытия существования email, одноразовый токен с TTL и SHA-256 в password_resets. Для фоновой доставки копия токена зашифрована AES-256-GCM отдельным ключом, после тестовой отправки ciphertext очищается. Ссылка использует URL fragment; новый пароль не отправляется. Reset использует блокировки, инвалидирует все reset-токены и сессии атомарно. Только TestSender; реальных писем и daemon нет.
- `migration-config.ts`, `migration-proxy.ts`, middleware, dashboard layout используют один backend session endpoint. SSR и Express проверяют одну DB-сессию. Dashboard/courses динамические, ответы no-store; localhost не обходит проверку. Старые Supabase Auth handlers заменены прокси; старые Storage/video API не получают fallback. При отсутствующей конфигурации — 503, при отсутствии авторизации — redirect/401. GET auth/signout — 405.
- Существующие формы входа/восстановления/сброса/выхода подключены к собственному API. Регистрация явно обозначена недоступной, её endpoint не реализован. Старый Supabase callback больше не создаёт сессию.
- Checkout обоих существующих вариантов страницы продукта использует same-origin API и CSRF. Нужны действующая сессия и явное согласие. Цена/состав берутся из серверного каталога; клиентские email/amount/receipt не определяют заказ. Заказ и версия согласия сохраняются в одной транзакции. На этом этапе возвращается относительная страница **ожидания** заказа, без ссылки на реальную оплату и без симуляции ResultURL.
- Success page только читает статус принадлежащего пользователю заказа. Серверный SSR курса и video API отдельно проверяют активную покупку нужного продукта/режима/срока. Проверка покупки не заменяет авторизацию видео. Kinescope ещё не подключён; закрытая выдача без провайдера возвращает 503.

### Пароли: границы доказательства

Read-only `scripts/audit-bcrypt-dump.cjs` использует pg_restore без восстановления, разбирает auth.users в памяти и печатает только счётчики. В резервной копии: **10 записей, 10 непустых bcrypt, вариант 2a, стоимость 10; неподдерживаемых форматов 0**. Файл дампа не менялся, хеши/email/пароли/токены не выводились.

Искусственные bcrypt 2a/2b/2y успешно проверены с правильным паролем и отказом для неправильного. 2y нормализуется к 2b; поддерживаются costs 4–16, пароль длиннее 72 байт отклоняется без молчаливого усечения. Это подтверждает совместимость алгоритма на синтетике и формата исходных хешей. **Сохранение реальных паролей не проверено**: теста с заведомо известным реальным паролем не было. Будущий импорт должен перенести исходные UUID и хеши без повторного хеширования, проверить контролируемый аккаунт либо предложить восстановление. OAuth/identity mapping отдельно не реализован.

### Изолированная конфигурация и запуск

Ни новый Express entrypoint, ни изолированная сборка не читают .env. Для Next явно нужны `MIGRATION_ENV=local|staging`, `MIGRATION_SITE_ORIGIN`, `MIGRATION_API_INTERNAL_URL`. Для backend дополнительно `MIGRATION_DATABASE_URL`, опционально та же БД с отдельной auth-ролью `MIGRATION_AUTH_DATABASE_URL`, искусственный `STAGE1_TEST_PASSWORD2`, `MIGRATION_RESET_KEY` (64 hex). Значения секретов здесь не приводятся. Local принимает loopback и отдельную `rehab_stage1_test`; staging требует HTTPS origin и отдельную `rehab_staging`, отвергает адрес целевой рабочей БД и Supabase. Режим платежа принудительно test. Staging-конфигурация реализована, её инфраструктура не создавалась и не проверялась.

Безопасная сборка: `npm run build:migration` в корне. Скрипт копирует исходники/конфиги в временный каталог без .env, задаёт только синтетические local-переменные, выполняет Next build с lint/typecheck. Артефакт остаётся во временном каталоге для интеграционного теста; путь сохраняется в `/private/tmp/rehab-next-build-path`. Обычный build может читать .env и не использовался. Backend tests: `npm run test:timeweb` из robokassa-api; для настоящего Next SSR передать `STAGE2_NEXT_BUILD` с путём из указанного файла. Runner создаёт и удаляет собственные две тестовые базы/кластер PostgreSQL через Unix socket; внешние БД не используются.

### Проверки и доступность через интерфейс

Полный набор: **32 теста, 32 успешны, 0 ошибок, 0 пропусков**: все 21 тест первого этапа + 11 Auth/Next tests. Проверены bcrypt, login/logout/me, Secure cookie, expired/revoked/blocked/deleted sessions, CSRF (Origin/token/cookie/session), последовательный и конкурентный rate limit, reset expiry/replay/concurrency/revoke, checkout server price/ownership, статус без выдачи доступа, чужой курс и активная покупка. Реальный локальный Next server проверен HTTP-запросами: cookie через proxy, middleware redirect, authenticated SSR, запрет курса, checkout pending и отзыв сессии. Тесты используют исключительно искусственные данные.

Через интерфейс подключены вход/выход, запрос восстановления, форма сброса по тестовой ссылке, SSR личного кабинета/курса, checkout и страница статуса. Их API и SSR проверены интеграционно; **клики/гидратация в браузере отдельным E2E-тестом не проверялись**. Получение reset-ссылки пока только через тестовый worker; подпись ResultURL, конкурентные callbacks и отказ БД проверены только API/SQL-тестами. Реальный платёж, автоматическая доставка письма, регистрация, просмотр защищённых Kinescope-видео через UI пока недоступны.

Next.js production build с lint/typecheck проходит в изоляции. Имеются существующие предупреждения hooks/img/Browserslist; frontend dependency audit показывает 72 известных уязвимости (2 low, 10 moderate, 56 high, 4 critical), backend — 0. Нужен отдельный разбор/обновление frontend зависимостей перед production; произвольный audit fix не применялся.

### Что ещё блокирует полный отказ от Supabase

1. Реальный импорт пользователей/хешей/покупок/каталога с сохранением UUID, проверка известных паролей, OAuth/подтверждение email/регистрация. Сейчас только синтетические fixtures; новые пользователи не создаются через публичный checkout.
2. Kinescope adapter, закрытые playback-токены, каталог видео и перенос Storage/личных загрузок. Неиспользуемые legacy Supabase-компоненты/утилиты ещё есть в репозитории; SDK полностью не удалён. Старые недоступные функции нельзя считать мигрированными.
3. RuSender adapter и постоянно работающие workers с timeout, retries и внешней дедупликацией; тестовый sender не означает доставку настоящего письма.
4. Реальный payment URL/фискальный receipt/настройки магазина и отдельное разрешение live-режима. Пока только pending checkout и синтетический ResultURL.
5. Раздельные production runtime-роли/миграционная роль, публичный TLS+Firewall (private TLS исключён11.10), эксплуатационные настройки и trusted proxy/IP, cleanup expired sessions/CSRF/limits/reset jobs. Тесты выполнялись под ограниченными отдельными payment/auth ролями.
6. Изолированная staging-репетиция полного импорта, финальная дельта, сверка пользователей/покупок и rehearsal отката. Выполнить план переноса/отката выше; действующий сайт до этого продолжает работать. Frontend зависимости требуют отдельного устранения известных уязвимостей.

Следующий этап: Kinescope + RuSender adapters с искусственными контрактными тестами, затем отдельно разрешённая репетиция импорта/отката. До live-платежей добавить payment URL и фискальный контракт, проверить весь интерфейс браузерными E2E.

## Третий этап: импорт и локальная репетиция (10.10.2026)

Подробные обезличенные результаты: [reports/MIGRATION_REHEARSAL.md](reports/MIGRATION_REHEARSAL.md).
Разбор всех 72 npm findings: [reports/MIGRATION_DEPENDENCIES.md](reports/MIGRATION_DEPENDENCIES.md),
машиночитаемый snapshot — `reports/dependency-audit-20261010.json`. Этот раздел
уточняет прежние ограничения первого/второго этапа; deployment не менялся.

### Импорт и гарантии

Добавлены `robokassa-api/timeweb/import/{read-dump,import,rehearse}.js`, README,
собственная миграция `003_import.sql` и синтетические import tests. CLI:

```sh
node robokassa-api/timeweb/import/rehearse.js /Users/imax/Minenkov-backup/20261009-224214/database.dump
```

Runner сам создаёт и удаляет отдельный кластер PostgreSQL 17, слушающий только
127.0.0.1, со случайными портом/БД/SCRAM-паролем. Не принимает внешний database URL,
не читает .env/PGHOST/DATABASE_URL. Guard проверяет имя выделенной БД, серверный
loopback, realpath собственного data_directory и nonce marker. Production/Timeweb
режима нет. Миграции не применялись к существующим базам. Из архива читаются
только COPY users/identities/profiles/products/purchases/videos; исходный SQL,
Supabase DDL, ACL, functions, triggers, RLS, extensions не исполняются.

Одной транзакцией создаются собственная schema и таблицы, переносится содержимое,
проверяются количества, UUID, все выбранные поля, даты/числа/FK и хеши, затем
фиксируется import_runs. Advisory lock защищает конкурентные старты. Повтор
отказывается; нет merge/upsert и создания предполагаемых profiles/покупок.
SQL failure и искусственный сбой откатывают также создание schema. Ошибки данных
и параметры SQL не логируются; печатаются только агрегаты/обобщённые ошибки.
SHA-256 исходного файла до/после совпал, значение не публикуется.

Сохранены users 10, identities 10, profiles 5, products 3, purchases 5, videos 6
(39 строк), credentials 10. UUID/исходные FK/статусы/invoice/цены/пути/даты
проверены SQL-равенством без округления дат через JS. Все 10 password_hash равны
исходным encrypted_password **без изменения**, однако **реальный вход не
проверялся**. Дополнительные user timestamps/phone/verification/metadata/роль
сохранены как исходные inert legacy_attributes; они не назначают admin права.
Identity provider/subject/data/dates сохранены в собственной таблице; это ещё
не реализация OAuth. Старые sessions, refresh/confirmation/recovery/email-change/
reauth tokens, MFA/flow/служебные таблицы не импортированы. Orders/payments/reset/
sessions/course_videos остаются пустыми. Invoice sequence reseed выше исторических
числовых номеров, диапазон проверяется.

Дубли UUID, нормализованных email, provider+subject, invoice и user/product pairs:
0. Потерянные FK/покупки и несовпадающие profile/user email: 0. Пять users без
profile сохранены такими, как в источнике. Для пяти purchases test/live не
доказан: mode=NULL, исходный status сохранён; новый API не даёт им доступа.
Это новая допустимая форма **только исторической** записи, новые заказы/платежи
по-прежнему требуют явный режим и связанный заказ. Шесть videos не имеют
подтверждённого product/lesson mapping, course_videos не заполнен. Нельзя
считать перенос прав или Kinescope-видео завершённым до явной сверки.

### Подтверждение email и реально используемые способы регистрации

**Чтением кода подтверждено:** legacy `robokassa-api/server.js` подключает
`routes/auth.js`: email/password signin и `/auth/v1/signup` с full_name,
ветка email confirmation, выпуск mr_auth JWT. Legacy ResultURL/complete-personal-program
создавали пользователя через Supabase admin с сгенерированным паролем и могли
менять пароль существующего; `/api/auth/magic` принимал custom magic JWT.
`exchange-supabase` обменивает Supabase access token на локальную JWT-сессию,
но сам не выбирает OAuth provider. `src/app/auth/callback/route_backup.ts`
содержит exchangeCodeForSession, однако backup-файл не является активным route.
`src/app/_api` — private App Router folder, содержащиеся там mock/signup/magic
варианты не считать реально опубликованными endpoints.

В текущем migration UI signup явно недоступен; login/reset работают через
собственный API, Supabase callback не выдаёт сессию. Поиск по исходникам не
нашёл активных signInWithOAuth/provider-specific signup кнопок. В снимке все
10 identities — email, SSO/anonymous users — 0. **Не установлено:** реальные
production Auth settings, включённые провайдеры/redirect URLs и способы
регистрации после backup. Нельзя утверждать, что OAuth никогда не использовался.

При переезде сохранить UUID, email confirmation/blocked/deleted state,
profile/metadata и identity subject mapping; не включать роли из user_metadata.
Заново реализовать email signup/verification/invitation, одноразовую установку
пароля для нового покупателя, новый login/reset с существующим UUID. Если OAuth
нужен — отдельные OIDC callbacks/state/PKCE и привязка subject+provider к UUID,
без автоматического слияния по email. Старые JWT/magic/session/reset токены
отозваны фактом непереноса; пользователям нужен новый вход.

В дампе один email не подтверждён. Добавлена проверка email_confirmed_at на
выдаче сессии в signin под блокировкой пользователя; синтетический тест
подтверждает отказ и ноль sessions. Импорт не подтверждает email сам и не
назначает права. Reset не выставляет confirmation. Для этого аккаунта перед
полным переключением нужен явный workflow подтверждения, пока вход закрыт.

### Браузер и regression

Через отдельный headless Chrome/новый профиль, с блокировкой всех внешних
запросов, проверены синтетические формы: вход, SSR кабинет, запрет чужого курса,
checkout с обоими согласиями, pending status без покупки, выход, восстановление
через TestSender в памяти, reset-форма и вход новым паролем. Никаких реальных
писем/платежей. Реальные данные архива не использовались браузером/API/sender и
не добавлены в Git/fixtures/отчёты/логи. Результат расширяет HTTP-проверки второго
этапа; браузерная гидратация основных auth/checkout сценариев теперь проверена.

Итог: **38 тестов, 38 прошли, 0 ошибок, 0 пропусков**: прежние 21 payment +
14 auth/SSR/browser/imported-state + 3 synthetic COPY/preflight/guard. Отдельно
runner реального архива подтвердил полный rollback двух видов сбоя, один commit
при двух конкурирующих imports, отказ повтора, отсутствие предполагаемых прав
и неизменность архива. Syntax checks и git diff --check прошли. Frontend source
третьим этапом не менялся; браузер использовал последнюю успешную изолированную
сборку Next.js второго этапа. Временные PG кластеры/профиль Chrome остановлены и
удалены, только build artifact остался во временном каталоге.

Для повторения браузерного regression из robokassa-api:

```sh
STAGE3_BROWSER=1 STAGE2_NEXT_BUILD="$(cat /private/tmp/rehab-next-build-path)" npm run test:timeweb
```

Если отсутствует build artifact — сначала выполнить `npm run build:migration`
в корне. Без этих переменных optional Next/browser tests помечаются skipped;
обычный запуск не следует выдавать за полный браузерный regression.

### Зависимости и оставшиеся блокеры

Свежий npm audit подтвердил 72 vulnerable packages/metavulnerabilities:
critical 4/high 56/moderate 10/low 2. Production installation — 26
(critical 4/high 15/moderate 7), dev-only — 46 (high 41/moderate 3/low 2).
Backend с pinned playwright-core 1.58.2 dev dependency — 0. `audit fix --force`
не выполнялся. Production install не равен достижимости: Tailwind из-за peer
line-clamp присутствует там, хотя используется для build; некоторые legacy
mail/HTTP пакеты не используются новым runtime. Все 72 строки, версии,
диапазоны, via/advisories, условия достижимости и исправления перечислены в
отдельном отчёте; оценки достижимости статические, эксплуатация не тестировалась.

Блокеры выпуска: Next 13 SSR/framework обновление, критические runtime
Swiper/HeyGen→protobufjs и удаление/обновление неиспользуемых production цепочек;
затем согласованные Next/React/Node/ESLint/Jest/Tailwind/PostCSS обновления с
regression, не слепой major audit fix. Некоторые Next exploit-условия (Windows,
штатный image optimizer, i18n/rewrites/server actions) не соответствуют текущему
коду/окружению, но это не основание объявлять старый framework безопасным.

Для полного переноса остаются решения по пяти purchase modes, пяти отсутствующим
profiles, mapping шести videos, неподтверждённому email; проверка известного
реального пароля; signup/email verification/OAuth при необходимости; Kinescope,
RuSender/workers, Storage bytes/3434 файла, live payment URL/receipt, production
роли/публичный TLS+Firewall, финальная дельта и репетиция отката. Локальный importer
намеренно не допускает рабочую БД; production режим требует отдельной реализации
и явного разрешения. Timeweb, рабочий Supabase, архив, старая папка, инфраструктура
и домен не изменялись; push/deploy не выполнялись.

Следующий этап: сначала согласовать обезличенные правила разрешения исторических
покупок и course-video mapping, параллельно подготовить проверяемые обновления
runtime зависимостей; затем Kinescope/RuSender и отдельно разрешённая staging
репетиция с проверкой переноса и отката.

## Этап 4 — актуальное состояние 10.10.2026

Результаты, решения владельца и оставшиеся staging блокеры: [reports/MIGRATION_STAGE4.md](reports/MIGRATION_STAGE4.md). Таблица видео: [reports/MIGRATION_VIDEO_MAPPING.md](reports/MIGRATION_VIDEO_MAPPING.md). Команды/env/health/миграции/откат: [deploy/timeweb/README.md](deploy/timeweb/README.md). Эти результаты заменяют старые блокеры этапов 1–3 ниже в хронологии.

Пять active personal-program сохранены по решению владельца: UUID/связи/даты/invoice прежние, mode=NULL (unknown), source='legacy migration', order_id=NULL. Это исторические права доступа, не подтверждённые боевые оплаты. Importer не создаёт payments/orders/mail. Общий предикат доступа учитывает только явные test/live purchases либо утверждённые legacy grants; новый ResultURL по-прежнему проверяет подпись/сумму/заказ/режим и commit.

Profile не требуется для login/SSR (LEFT JOIN и браузерная проверка), поэтому пять отсутствующих profiles не созданы. Unconfirmed account сохранён без автоматического подтверждения; добавлены одноразовый confirmation token/hash/TTL, очередь и UI, проверены тестовым sender. Reset/payment/import не подтверждают email и покупка не меняет пароль.

Все шесть видео/метаданные сохранены без назначения уроков. Preferred stage-3 и legacy fallback сравнены: названия/даты/пути/длительность/место использования. Локальные кандидаты имеют одинаковую длительность, но разные байты. Для пяти source UUID paths точного файла в storage нет, одноимённые My Bucket files — только кандидаты. Нужны решения владельца по урокам и соответствиям; ничего не удалено/не опубликовано.

Kinescope authorization-backend: подписанный token, Basic callback, повторная проверка курса/активной покупки/сессии, обязательный strict провайдера. RuSender: stable key, bounded timeout, retry/Retry-After/exponential/max8/deadletter, три очереди и отдельный постоянный worker. Всё проверено mock/test sender, реальных вызовов нет. Cloud Server + Docker Compose с frontend/backend/worker подготовлены, образы локально собраны на Node22, backend/worker готовы для независимого запуска. Migrator atomic/ledger/checksum; importer по-прежнему loopback-only. После archive import deployment ledger не создан: migrator намеренно отвергает untracked schema; перед будущим production импортом согласовать ledger в той же import transaction, не обходить защиту.

Контролируемые зависимости: Next16.4.0/React18.3.1; root/backend production audit=0; full=28, все dev (7 high/21 moderate). Старые 72 findings сохранены как исторический snapshot в отчёте зависимостей. Недоверенные PR builds пока не включать из-за glob/YAML chains. **49/49** backend/SSR/browser/mock/migration tests, **23/23** Jest, отдельный worker smoke, Next production build и Docker Node22 frontend/backend builds прошли. Mock tests Docker network=none=3/3. Без env контейнер SSR=200, dashboard/health=503, без рабочего API fallback. Targeted lint=0 errors/1 existing warning; diff check прошёл.

Повторная loopback репетиция: 10 users/5 profiles/3 products/5 purchases/6 videos/10 identities; 39 rows и 10 exact hashes сверены, duplicate/missing links=0; wrong target/nonce, rollback, concurrent/replay и неизменность архива проверены. Реальные пароли входом не проверялись. UUID/хеши/PII в отчёт/fixtures/Git/внешние сервисы не попадали.

Остались staging блокеры: утверждение реальных lesson/media mappings; отдельная VM/rehab_staging/private network/TLS/ролей/секретов/hostname и разрешённая проверка запуска; при включении внешних провайдеров — Kinescope strict/account/playback и RuSender key/domain/idempotency retention. **Synthetic staging** возможен с disabled video/test sender, без signup/OAuth/live Robokassa/реальных данных. Полный отказ от Supabase/cutover не объявляется завершённым. Рабочие сервисы, Timeweb, backup, старая папка и домен не менялись; push/deploy не выполнялись.

## Этап 5 — синтетический staging, 10.10.2026

Актуальный результат: [reports/MIGRATION_SYNTHETIC_STAGING.md](reports/MIGRATION_SYNTHETIC_STAGING.md). Основной будущий runbook: [deploy/timeweb/APP_PLATFORM.md](deploy/timeweb/APP_PLATFORM.md); прежний VM runbook — альтернативный. Сравнение stage-3 для просмотра владельцем: [reports/MIGRATION_VIDEO_DECISION.md](reports/MIGRATION_VIDEO_DECISION.md). Эти уточнения заменяют требование отдельных VM из этапа 4.

Локально четыре отдельных процесса PostgreSQL17/API/Next SSR/worker на loopback с SCRAM и ограниченными ролями: browser login→кабинет→checkout pending→эмулированный signed test ResultURL→paid/access→logout→recovery через worker→новый login. Восемь уведомлений (включая 6 concurrent) дали 1 payment/1 purchase/1 job; password hash не изменён оплатой, чужой курс403, video disabled503. Реальных внешних запросов payment/mail/video нет. Reset token получен в памяти по IPC только для synthetic локального harness; ciphertext очищен, повтор reset400. Temporary cluster и процессы удалены.

49/49 повторных backend/payment/auth/import/providers/migrations/SSR/browser tests, 0 skip/fail, worker smoke, Next production build, Node22 Docker builds и App Platform manifest validation прошли. Проверены ограниченные роли и безопасный synthetic seed/replay/refusal. Добавлены root Compose с frontend первым/API+worker без host ports/migration gate, отдельный worker Dockerfile, liveness endpoints/HEALTHCHECK, guarded grants/isolation proposal. Staging требует rehab_staging, отдельные роли, явное synthetic подтверждение и TLS verify-full/CA/hostname проверку; default_db/gen_user/SSL overrides не допускаются.

Официальная инструкция App Platform прямо поддерживает Docker Compose, private network при создании и постоянные worker processes. Можно разместить три контейнера в одном App Platform приложении; отдельные самостоятельно управляемые VM не обязательны. Timeweb не подключался: реальная доступность Friendly Halimede/зоны/маршрута/TLS/прав не проверена. Дополнительные БД/роли требуют подходящего тарифа minenkov-db; текущий тариф неизвестен. Private-only TLS требует отдельного подтверждения, поскольку документация провайдера описывает его настройку через публичный доступ. Ни IP, ни тариф, ни базы не менялись.

Оставшиеся блокеры внешнего synthetic staging: тариф/rehab_staging/ограниченные роли; постоянный app egress IPv4 и публичный TLS/CA/SAN+Firewall; HTTPS origin/приватные переменные/утверждённый commit и отдельно разрешённый платный запуск/push/deploy; для ручного remote recovery — приватный synthetic способ получить ссылку (discard sender её не раскрывает). Real video mappings и внешние провайдеры не блокируют disabled/test staging и остаются следующим этапом. Все шесть videos/файлы сохранены, реальный password login не объявляется проверенным. Рабочие сервисы/DNS/backup/старая папка не менялись.

## Подготовка внешнего staging: уточнение тарифа и памяти, 10.10.2026

[Новый отчёт](reports/MIGRATION_STAGING_OPTIONS.md): фактический minenkov-db1ГБ/8ГБ, сравнение default_db и upgrade+rehab_staging, публичные цены, privateTLS вопрос поддержке, очистка synthetic данных, measured runtime/build RAM. default_db не исследована и не разрешена guards; рабочие сервисы не изменены. Подготовлен опциональный staging-mailbox provider с mock tests и отдельным Compose override, основной sender остаётся discard. Полноценная Linux Node22 сборка прошла с cgroup peak1,93ГиБ; рекомендованы4ГБ при общей build/runtime памяти,По уточнению11.10 builder на app сервере, выбран4ГБ. Уточнение11.10: Compose1500₽/мес, builder на сервере приложения; private TLS недоступен. Новый план PUBLIC_TLS.md.

Верификация уточнения: 50/50 regression tests, 0 skip, включая Next SSR/браузер и платежи; standalone worker smoke прошёл; merged mailbox Compose проверен с dummy env без .env/подключений. Новые агрегаты измерений — reports/staging-memory-20261010.json. Настоящая доставка и подключение Timeweb не выполнялись.

## Приоритетное уточнение №12811919, 11.10.2026

Ответ поддержки передан владельцем: TLS и приватный PostgreSQL одновременно не поддерживаются; Compose собирается на сервере приложения, рекомендуемый минимум3ГБ; тариф2CPU/4ГБ/50ГБ1500₽/мес; текущие БД+S3 вместе1327₽/мес. **Все прежние предложения private TLS и отдельного builder сняты.** Действующий маршрут: публичный TLS hostname PostgreSQL из панели, доверенный CA, verify-full/hostname verification, входящий Firewall TCP5432 только подтверждённый постоянный app egress /32 и необходимый временный admin /32. Без незашифрованного fallback. Friendly Halimede не используется как TLS маршрут БД.

[APP_PLATFORM.md](deploy/timeweb/APP_PLATFORM.md) обновлён; [PUBLIC_TLS.md](deploy/timeweb/PUBLIC_TLS.md) содержит порядок Firewall-before-public, получение CA/hostname, runtime миграции и подготовленные вопросы для продолжения того же обращения (не отправлены). Постоянство SNAT всех Compose services, защита при первоначальном включении public IP, поведение private listener/TLS-only, численный максимум LOGIN пользователей2ГБ и полный бюджет ещё не доказаны. Условно1327+1500+200=3027₽/мес, без дельты upgrade и неизвестных дополнительных услуг. Предыдущие публичные2000₽ не являются ценой аккаунтного upgrade. Код проверки сертификата сохранён. Никаких заказов/подключений/изменений Timeweb, push/deploy.

## Упрощение до одного private приложения, 11.10.2026

Новый выбор владельца имеет приоритет: один Compose Next.js+API+worker, существующая default_db/gen_user192.168.10.4:5432 через Friendly Halimede. [PRIVATE_APP.md](deploy/timeweb/PRIVATE_APP.md) — действующая инструкция; старые publicTLS/staging/four-role планы альтернативные и не применяются автоматически. Явный private/disabled-private режим привязан к endpoint/db/user и подтверждению сети, HTTPS сайта обязателен. Нет автоматического TLS fallback.

Владелец подтвердил отсутствие текущего SQL доступа. Это не блокирует подготовку/будущий waiting deploy: одноразовая read-only команда из контейнера после размещения показывает counts и названия таблиц/число строк без персональных данных. До проверки API/worker не подключаются к БД (private boot gate), миграции/import только manual, owner confirmation и empty-target guards; архивный импорт атомарен, UUID/hash/legacy grants сохранены, ledger записывается в том же commit и повтор отвергается. Обычный рестарт/деплой SQL не запускает. Реальные consumers/пустотаdefault_db ещё НЕ проверены. Новый сервер не создаётся.

Проверки изменённого кода:28/28 auth/SSR/browser/import/migrations/private guards; ещё2/2 boot/Compose safety, worker smoke, новый Next build и Compose config passed. Неизменённые payment/provider suites не повторялись. Private integration metadata симулирована только над искусственной локальной PG. Оплата остаётся test, видеоdisabled, почтаdiscard: full production провайдеры/неоднозначные video mappings ещё отдельные задачи. Timeweb, рабочие базы, архив и старую папку не меняли, push/deploy/DNS запрещены.
