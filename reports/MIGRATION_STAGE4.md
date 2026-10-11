# Этап 4: разрешения владельца, интеграции и подготовка staging

**Уточнение следующего этапа:** [MIGRATION_SYNTHETIC_STAGING.md](MIGRATION_SYNTHETIC_STAGING.md) и [APP_PLATFORM.md](../deploy/timeweb/APP_PLATFORM.md) заменяют прежний VM план и список synthetic staging блокеров. App Platform поддерживает приватную сеть и отдельный worker; дополнительные VM не обязательны.

10.10.2026, `/Users/imax/dev/minenkovrehab-migration`, branch migration/timeweb. Прочитаны MIGRATION_TIMEWEB.md, reports/MIGRATION_REHEARSAL.md и reports/MIGRATION_DEPENDENCIES.md. Их прежние разделы описывают этапы 1–3; состояние ниже актуальнее. .env не читался; Timeweb/рабочий Supabase/старая копия/backup не менялись. Только локальные зависимости, код, mock services и временные PostgreSQL/Chrome/Docker. Никаких push/deploy/видео upload/реальных писем/платежей.

## Таблица соответствий и источник решений

| Исходные записи | Целевое соответствие | Факт / решение | Что не назначается |
|---|---|---|---|
| P1–P5 (UUID-order пяти покупок) | UUID покупки/user/product/dates/invoice сохраняются; personal-program; status=active; mode=NULL (unknown), source='legacy migration', order_id=NULL | **Явное решение владельца 10.10.2026** сохранить исторический доступ. Это не подтверждение оплаты или её режима | Никаких orders/payments/outbox, test/live и денежных доказательств |
| Пять пользователей без profile | users/credentials/identities сохраняются; profile отсутствует | **Код** sessionUser LEFT JOIN profiles; signin/SSR кабинет не требуют profile. Синтетический browser проверил вход/кабинет без него | Ни имён/данных профиля из предположений, ни изменения UUID/пароля. При первой настоящей покупке существующий payment transaction создаёт минимальный profile; для входа это не требуется |
| Один email_confirmed_at=NULL | UUID/hash/account/state сохраняются; обычный вход закрыт | **Дамп** unconfirmed=1; **решение владельца** не подтверждать автоматически; новая explicit одноразовая confirmation workflow | Никакого удаления пользователя/покупок или confirmation при reset/import/payment |
| V1–V6 (UUID-order шести видео) | Все UUID/user/title/paths/dates/size/duration/views/metadata сохранены; course_videos пустая, ready=false | **Решение владельца** оставить все записи, пока не выбран урок | Не назначаются stage/product/weekly/presentation/archive по названию |

P/V aliases воспроизводимы сортировкой UUID в указанном архиве; настоящие UUID используются только в памяти/local DB, в отчётах отсутствуют. Import flag preserveLegacyGrants включён только для локальной репетиции решения владельца; проверяет ровно пять active personal-program среди ровно пяти source purchases, иначе transaction отказывается. Без flag неизвестный режим сам доступа не даёт. В access API, auth purchases, video entitlement и Kinescope callback действует одинаковое условие: explicit mode **или** утверждённое legacy grant с NULL mode/source. Новые заказы по-прежнему строго test/live; historical invoices резервируются sequence, не превращаются в payments. Password credentials не меняются покупкой.

### Видео: доказательства и вопросы владельцу

Подробное обезличенное сравнение — [MIGRATION_VIDEO_MAPPING.md](MIGRATION_VIDEO_MAPPING.md): названия, длительность, даты, редактированные пути, место использования. Read-only script scripts/migration-video-evidence.cjs читает dump и mvhd локальных файлов, не проигрывает/не загружает их.

Legacy resolveStagePath: instructor-owned videos; сначала preferred exact path, затем titleLike candidates по created_at.desc, затем hardcoded path; выдаётся **первый существующий в Storage**. Даже exact reference не доказывает, что этот объект фактически обслуживается сейчас. Клиент обращается к stage-video API; его videoPath остался конфигурационной ссылкой, не прямым выбором URL. Текущее migration API не использует legacy resolver: только утверждённая course_videos binding и серверная покупка.

V1 preferred stage-3, V3 explicit stage-3/client reference; V4 explicit stage-2/client reference; V2 содержит 0-2 и соответствует одному из titleLike candidates stage-1; V5 — titleLike weekly-test candidate; V6 — подтверждённого назначения нет. TitleLike не превращён в import rule. Во всех шести metadata duration=NULL. Локальная mvhd длительность V1 и basename-кандидата V3 одинаковая 1261.8s; проверка размера/SHA локальных кандидатов вынесена в таблицу. У V2–V6 **точного исходного path в backup/storage нет**, но найден по одному одноимённому файлу в My Bucket; это кандидаты для owner review, не доказанное соответствие source object. Без сетевых запросов нельзя подтвердить наличие исходных UUID paths на рабочем Storage.

Остались конкретные вопросы:

1. После просмотра двух stage-3 кандидатов: какой станет уроком stage-3, либо нужны два отдельных урока? Все шесть source rows останутся в любом случае.
2. Утвердить для каждой V1–V6 productSlug/lessonKey либо «сохранить без публикации». Подтвердить stage-1, stage-2, weekly-test и presentation; совпадение названия не является утверждением.
3. Являются ли файлы с тем же basename в My Bucket разрешёнными копиями исходных UUID paths? Если нет, нужен read-only локальный источник недостающих оригиналов. До ответа импорт метаданных полный, media mapping незавершён.

Вопросы об unknown purchase mode, отсутствии profiles и автоматическом confirmation **закрыты решениями владельца/проверкой кода**, повторное подтверждение не требуется.

## Изменения и проверки

- Миграции 004 providers (provider IDs, sent/failed, heartbeat), 005 historical grant provenance и email confirmation. Email token хранится как hash, 30min TTL, предыдущие tokens invalidated; consume под блокировками, повтор отвергается. URL в очереди — AES-GCM ciphertext; reset не подтверждает адрес. CSRF/origin/rate limits применяются также к confirmation. Тестовый отправитель по умолчанию; обычный вход остаётся закрыт до подтверждения.
- Kinescope JWT playback/callback и stage iframe; purchase/session/confirmed-account recheck, Basic callback, no-store, Authorization proxy только на callback path. Внешняя сеть не нужна для mock tests.
- RuSender adapter, три durable очереди (purchase/reset/confirmation), SKIP LOCKED, стабильный provider idempotency key, exponential retries/Retry-After, 8 attempts, deadletter, safe error codes. После 200 сохраняется provider UUID, это acceptance, не delivered. Покупка остаётся paid при недоставленном письме.
- Самостоятельный queue-worker.js, readiness/heartbeat/graceful stop. Конфигурация явная, пустые env отказывают; test sender не сохраняет реальные payload в памяти. Реальный RuSender требует staging + network opt-in + recipient allowlist, сейчас **не включён**.
- Контролируемые dependency updates и Next16 compatibility; полный разбор оставшихся 28 dev findings — [MIGRATION_DEPENDENCIES.md](MIGRATION_DEPENDENCIES.md). Production root/backend audit=0; полный audit critical=0, high=7, moderate=21. Для доверенного prebuilt staging HTTP runtime подтверждённых dependency release blockers из старого списка не осталось. Недоверенные PR builds всё ещё нельзя включать до устранения dev glob/YAML chains.
- Timeweb Cloud Server + Docker Compose frontend/backend/worker, migration CLI с atomic ledger/checksum/replay guard, least-privilege grants, health checks, future deployment/rollback steps — [deploy/timeweb/README.md](../deploy/timeweb/README.md). Контейнеры и команды собраны локально, Timeweb не проверялся.

Проверки: **49/49 tests, 0 fail/skip**, включая сохранённые 21 payment tests, SSR/Chrome, CSRF/rate/session/reset, историческое право/unknown fail-closed, confirmation, actual DB Kinescope callback/logout, Swiper carousel browser navigation, mail retry after commit failure/budget, mock RuSender и protobuf, atomic migration replay/checksum. Отдельный настоящий worker process: synthetic job sent, readiness=200, heartbeat, SIGTERM. **23/23 Jest tests, 6 suites**, изолированно без .env. Next16 production build и Docker frontend/backend Node22 build прошли. В контейнере без сети публичный SSR=200, dashboard=503 и health=503 при missing env; старый рабочий API не используется. Mock adapter tests на Node22 network=none прошли (3/3). Targeted ESLint: 0 errors, 1 existing payment/fail effect warning. git diff --check прошёл.

Через UI проверены: login→SSR кабинет без profile→чужой курс denied→checkout pending→status→logout, reset→новый login; request confirmation→test sender→confirm page→login. Только API/mock: Kinescope playback/callback/revocation, реальное принятие RuSender не проверялось. Реальные видео/лицензии, browser iframe playback и SDK timecodes не проверялись; никаких live mail/payment/provider calls.

## Репетиция архива

| Объект | До | После |
|---|---:|---:|
| Users | 10 | 10 |
| Profiles | 5 | 5 |
| Products | 3 | 3 |
| Purchases | 5 | 5 |
| Videos | 6 | 6 |
| Identities | 10 | 10 |
| Credentials/hash exact | 10 | 10 |

39 source rows сравниваются по перенесённым полям, metadata отдельно, 10 хешей точны без вывода. UUID/даты/связи/покупки не потеряны, duplicate/missing FK=0. Все пять source active rights сохранены с owner provenance/unknown mode. Orders/payments/mail=0; course binding=0; старые sessions/reset tokens не переносятся. Проверены wrong database/nonce refusal, injected/SQL error full rollback, concurrent exactly-once, повтор отказ, unchanged archive. Временный loopback SCRAM cluster удалён. **Вход с настоящими паролями не проверялся**, равенство hash не объявляется проверкой реального пароля.

## Оставшиеся блокеры staging

1. Для staging с настоящими учебными видео: не утверждены lesson bindings шести видео и storage path соответствия; нет согласованных Kinescope provider IDs/ready flags. Synthetic/mock staging без публикации реальных уроков этим не блокируется.
2. Не provisioned/не проверены изолированные VM+rehab_staging, совместимость приватной сети/зоны, TLS reverse proxy/CA, ограниченные LOGIN роли, секреты и отдельный hostname. Runbook/image commands готовы, реального Timeweb deploy ещё не было и он не разрешён.
3. Для staging с включёнными внешними провайдерами: необходимо подтвердить Kinescope protection/strict/account capability и выполнить разрешённую playback/длинную сессию/мобильную проверку; для RuSender — activated key/domain, allowlist и окно idempotency retention. Пока обе интеграции проверены mock-ами; test mail/disabled video позволяют начать isolated synthetic staging. Реальные вызовы требуют отдельного разрешения.

Signup/OAuth, live Robokassa URL/receipt, production import/ledger, реальный password login, финальная дельта/полный Storage/rollback остаются за пределами этого **synthetic staging** и не объявляются завершённым отказом от Supabase. Никаких рабочих сервисов не менялось.
