> **Действующий выбор владельца11.10.2026: один private Compose, default_db/gen_user, явный disabled-private. Инструкция [PRIVATE_APP.md](PRIVATE_APP.md) имеет приоритет. Ниже сохранён предыдущий staging/public TLS план, больше не применяемый автоматически.**

# Синтетический staging на Timeweb App Platform

Обновлено 11.10.2026 в migration/timeweb по ответу поддержки №12811919, переданному владельцем. Private TLS исключён. Новый маршрут — публичный TLS endpoint и Firewall только app/admin IP; подробный порядок и вопросы в [PUBLIC_TLS.md](PUBLIC_TLS.md). Ресурсы, базы, сеть и DNS не изменялись; `.env` не читался, подключение minenkov-db не проверялось.

Выбранный тариф Compose по поддержке: 2 CPU / 4 ГБ / 50 ГБ, 1500 ₽/мес; сборка на сервере приложения, рекомендуемый минимум 3 ГБ. Текущие БД+S3 вместе — 1327 ₽/мес. Это сведения ответа владельца, не публичный расчёт аккаунта.

## Выбранная схема и проверенные возможности платформы

Одно приложение **Docker Compose**: frontend (Next.js SSR), backend (Express), worker (постоянный Node process), migrate (одноразовый процесс перед запуском API/worker). Три постоянных контейнера размещаются на одном управляемом сервере App Platform. Отдельный Cloud Server для каждого процесса не требуется.

[Инструкция Compose](https://timeweb.cloud/docs/apps/deploying-with-docker-compose) прямо предусматривает выбор приватной сети/IP при создании приложения, а [настройки приложения](https://timeweb.cloud/docs/apps/upravlenie-apps-v-paneli) уточняют, что сеть потом менять нельзя. **По документации схема поддерживается**. В панели ещё нужно убедиться, что Friendly Halimede доступна для выбранной зоны/типа приложения; её фактический тип, зона и свободный IP неизвестны. Обобщённый список VPC неполон для этого вопроса; инструкция App Platform содержит прямое подтверждение.

Worker допустим как отдельный контейнер Compose; платформа также [документирует постоянный Celery worker](https://timeweb.cloud/docs/apps/deploying-backend-applications/celery). Наш Node worker не требует cron или входящего запроса. VM в прежнем плане была консервативным вариантом контроля постоянных процессов и приватного подключения, а не обязательным условием. App Platform сам использует облачный сервер; **дополнительные самостоятельно управляемые VM не нужны для выбранной схемы**. Это не обещание бесплатного приложения: платные ресурсы сейчас не создавались.

## Файлы и команды

`docker-compose.yml` в корне — манифест App Platform. Первый service frontend: только он получает доменное проксирование. API и worker без host ports, доступны внутри Compose как backend:3101 и worker:3102. Postgres не включён в Compose: данные хранятся во внешней изолированной rehab_staging. Нет volumes, host network, extra_hosts, внешних сетей и env_file. Приватная сеть подключается настройкой Timeweb, **не** объявлением Friendly Halimede как Docker network.

| Процесс | Dockerfile / сборка | Команда запуска | Порт / health |
|---|---|---|---|
| Frontend | deploy/timeweb/frontend.Dockerfile; npm ci --ignore-scripts; npm run build; npm prune --omit=dev --ignore-scripts | node node_modules/next/dist/bin/next start -H 0.0.0.0 -p 3000 | 3000; /api/health/live (liveness), /api/health (API readiness) |
| API | deploy/timeweb/backend.Dockerfile; npm ci --omit=dev --ignore-scripts | node timeweb/server.js | 3101; /health/live, /health/ready |
| Worker | deploy/timeweb/worker.Dockerfile; npm ci --omit=dev --ignore-scripts | node timeweb/queue-worker.js | 3102 только внутри; /health/live, /health/ready; heartbeat в БД |
| Migrator | backend.Dockerfile | node timeweb/migrate.js --grants --synthetic-seed | без публикации HTTP; exit 0 разрешает запуск API/worker |

Node22 закреплён digest в Dockerfiles. Сборка использует dummy local конфигурацию и не нуждается в подключении БД. Секреты не передаются build.args и не записываются в образ. Выбрать в панели framework **Docker Compose**, директорию проекта — корень, ветку migration/timeweb, утверждённый commit, отключить автодеплой/автоматические PR-стенды. Пока код локальный и push запрещён: удалённый репозиторий не содержит этих подготовленных изменений.

Dockerfile HEALTHCHECK проверяет liveness раз в 30s, timeout 5s, 3 попытки. Для Compose поле healthcheck path панели не поддерживается; [документация рекомендует Dockerfile HEALTHCHECK](https://timeweb.cloud/docs/apps/healthcheck-path). Readiness зависит от БД и проверяется отдельно после запуска. Зелёный liveness не подтверждает доступ к курсам/работу worker; Docker restart policy перезапускает завершившийся процесс, не гарантирует restart при одном Docker unhealthy. Фактическое поведение Timeweb для каждого контейнера Compose ещё не проверено. Контролировать свежий heartbeat (<30s), возраст pending и failed во всех трёх очередях. При недоступности БД worker продолжает retry, readiness=503; frontend показывает недоступность авторизации, без обхода.

## Настройки панели и переменные

Проект: **Minenkov Rehab**. Имя нового приложения: отдельное staging имя, не рабочее. Friendly Halimede не является TLS маршрутом к БД. Для подключения нужен подтверждённый постоянный app egress IP; dashboard IP ещё не доказывает SNAT/стабильность. HTTPS origin: отдельный технический домен приложения, не рабочий домен; вписать точное значение в MIGRATION_SITE_ORIGIN. Если технический домен ещё неизвестен, не запускать функциональные проверки с placeholder; после назначения домена заменить origin и повторить запуск. Рабочие домены не привязывать.

Переменные создавать как [локальные переменные приложения](https://timeweb.cloud/docs/apps/variables), без глобального распространения. Значения секретов приватные, здесь приведены только требования. Не выгружать `docker compose config` с реальными значениями в логи; для проверки использовать --quiet и отдельный пустой env-file.

| Переменная | Значение / назначение |
|---|---|
| MIGRATION_SITE_ORIGIN | точный отдельный https://технический-staging-домен без slash |
| MIGRATION_DATABASE_URL | URL роли rehab_payment, публичный TLS DNS hostname из панели, порт5432, **только /rehab_staging**, без SSL query parameters |
| MIGRATION_AUTH_DATABASE_URL | тот же host/port/db, роль rehab_auth |
| MIGRATION_WORKER_DATABASE_URL | тот же host/port/db, роль rehab_worker |
| MIGRATION_MIGRATOR_DATABASE_URL | тот же host/port/db, rehab_migrator, только для одноразового migrator |
| MIGRATION_DATABASE_TARGET | тот же URL с username rehab_payment **без пароля**, используется worker/migrator только для сравнения цели |
| MIGRATION_RESET_KEY | отдельные случайные 32 байта в hex (64 символа); API/worker должны использовать одинаковое значение |
| STAGE1_TEST_PASSWORD2 | случайный искусственный ключ подписанных test-уведомлений, не ключ рабочего Robokassa |
| MIGRATION_PG_CA | PEM доверенного CA именно этого кластера; не тестовый сертификат |
| MIGRATION_SYNTHETIC_PASSWORD | отдельный искусственный пароль >=16 символов и <=72 UTF-8 байт; только migrator seed |

Фиксированы в манифесте: MIGRATION_ENV=staging; MIGRATION_STAGING_CONFIRM=synthetic-rehab-staging; MIGRATION_PG_TLS=verify-full; MIGRATION_API_INTERNAL_URL=http://backend:3101; STAGE1_PORT=3101; MIGRATION_WORKER_PORT=3102; MIGRATION_VIDEO_PROVIDER=disabled; MIGRATION_MAIL_PROVIDER=test; MIGRATION_MAIL_NETWORK_ENABLED=false. Kinescope/RuSender/рабочие Supabase/Robokassa ключи не нужны. Никаких NEXT_PUBLIC_* секретов. В worker/migrator не передаётся пароль payment роли. Test sender staging не хранит/не показывает reset links: ручное восстановление без доставки по этой конфигурации недоступно; сквозная локальная репетиция получает ссылку через IPC только между локальными тестовыми процессами. Публичный «почтовый ящик» с токенами не добавлен.

## Изоляция rehab_staging и необходимые права

Существование minenkov-db PostgreSQL17, IP192.168.10.4:5432/default_db, gen_user и Friendly Halimede — сведения владельца, не результат проверки соединения. **Не использовать default_db/gen_user для приложения**. Предложение — новая база rehab_staging в том же кластере, без восстановления архива и без реальных аккаунтов.

По [документации создания БД](https://timeweb.cloud/docs/dbaas/postgresql/create-db), минимальный тариф 1CPU/1GB/8GB не позволяет дополнительные базы; необходим тариф с >=2GB. По [пользователям и привилегиям](https://timeweb.cloud/docs/dbaas/postgresql/users-and-privileges), дополнительные пользователи также недоступны на минимальном тарифе. Новые пользователи по умолчанию получают полные права всех БД: при будущем создании обязательно выбрать права **только rehab_staging**, отключив «Одинаковые для всех баз». Тариф существующего minenkov-db подтверждён владельцем: 1 ГБ RAM / 8 ГБ диска; права gen_user не проверены. На нём дополнительные базы/пользователи запрещены документацией. Вариант default_db требует проверки пустоты/потребителей и отдельного подтверждения ограниченных SQL ролей, сейчас guards приложения его отвергают. Увеличение тарифа/новый кластер сейчас не разрешены и не выполнялись.

Предусмотреть четыре LOGIN роли без SUPERUSER/CREATEDB/CREATEROLE/BYPASSRLS и без членства в gen_user: rehab_migrator — владелец новой БД/схемы; rehab_payment; rehab_auth; rehab_worker. Runtime роли не владельцы, без CREATE/DELETE/TRUNCATE и доступа к hash таблице credentials (кроме auth). Для raw SQL CREATE DATABASE нужны CREATEDB либо superuser и возможность SET ROLE к назначаемому owner; для CREATE ROLE нужны соответствующие административные права. Нельзя считать gen_user superuser. Управляемая панель/поддержка может provision базу/роли вместо выдачи этих прав приложению. [PostgreSQL17 CREATE DATABASE](https://www.postgresql.org/docs/17/sql-createdatabase.html).

После provision оператор применяет `deploy/timeweb/staging-isolation.sql` **через публичный verify-full TLS из разрешённого admin /32**; source IP/TLS Adminer пока не подтверждены, в новой rehab_staging. Файл отвергает другую базу, отзывает PUBLIC CONNECT/CREATE только здесь. Затем мигратор применяет схему и `roles.sql` с точечными GRANT. Это не меняет default_db. Database-level CREATE не заменяет USAGE/табличные/sequence права; runtime получает только перечень roles.sql. Если платформа автоматически выдаёт широкие grants, проверить и убрать их только у новых staging ролей; не менять существующие роли/БД.

Будущая read-only проверка без вывода секретов: current_database()=rehab_staging; current_user соответствует роли; pg_roles flags false; pg_has_role(...,'gen_user','MEMBER')=false; has_database_privilege(...,'rehab_staging','CONNECT')=true; runtime CREATE=false; has_table_privilege(...,'rehab.credentials','SELECT')=false у payment/worker. Проверить также права новых ролей на default_db. PUBLIC CONNECT может позволять соединение даже без индивидуального GRANT; это не означает право чтения таблиц. Если изоляция от default_db недостаточна, остановиться и согласовать provider per-database ограничения — не отзывать PUBLIC/изменять ACL существующей БД автоматически. Локально разделение ролей проверено реальными запросами, Timeweb права ещё не проверены.

## Публичный TLS и Firewall: обязательный маршрут

[Инструкция подключения](https://timeweb.cloud/docs/dbaas/postgresql/connect-to-database) требует публичный IP для TLS. Ответ №12811919 исключает TLS одновременно с private PostgreSQL. Нужны публичное TLS DNS имя из панели, CA и Firewall whitelist TCP5432 только от подтверждённого APP_EGRESS_IP/32 и необходимого временного ADMIN_IP/32. Не использовать 192.168.10.4 как fallback. Включение IP/TLS без отдельного разрешения запрещено.

До запуска подтвердить постоянный исходящий IPv4 backend/worker/migrate: dashboard IP не является документированной гарантией SNAT/стабильности. Подготовить непустой whitelist до public exposure, проверить остальные allow-группы и IPv6. Firewall не фильтрует private traffic. [PUBLIC_TLS.md](PUBLIC_TLS.md) содержит точные инструкции hostname/CA/verify-full, миграций из runtime и вопросы для продолжения обращения. Friendly Halimede не является TLS маршрутом к БД.

Код требует rejectUnauthorized=true, CA и проверку имени/IP, не допускает SSL-параметры в URL, которые [node-postgres может использовать для замены ssl options](https://node-postgres.com/features/ssl). Нет fallback на ssl=false/no-verify; локальный loopback использует SCRAM без TLS только в временном cluster. [PostgreSQL verify-full](https://www.postgresql.org/docs/17/libpq-ssl.html) проверяет цепочку и имя сервера. Фактическую TLS-сессию Timeweb подтверждать read-only `pg_stat_ssl` для своего backend PID и успешной проверкой сертификата; не утверждать её по одному флагу конфигурации.

## Порядок будущего запуска

1. После отдельного разрешения подтвердить постоянный app egress /32, Firewall-before-public, публичный TLS hostname/CA, роли и полный бюджет. До подтверждения не выполнять deploy. Private TLS не рассматривается.
2. По PUBLIC_TLS.md подготовить whitelist, публичный IP/TLS; provision только rehab_staging и четыре роли, staging-isolation.sql через разрешённый admin /32 с verify-full. Никакого database.dump. Подготовить приватные переменные; проверить schema отсутствует либо имеет валидный migration ledger.
3. Перед разрешённым push/выбором commit сохранить проверенные версии кода/lockfiles. App Platform: Docker Compose, root, migration/timeweb, автодеплой off, проект Minenkov Rehab, подтверждённый постоянный egress IP, отдельный HTTPS origin и public TLS hostname БД в runtime URLs.
4. Платформа собирает Dockerfiles; migrate стартует первым по зависимостям, 001–005 atomic/advisory lock/checksum ledger, затем transaction grants и transaction synthetic seed. Seed создаёт одного подтверждённого искусственного пользователя staging@example.invalid, один personal-program ценой 8000; **не** реальные покупки/видео. Повтор сохраняет UUID/hash и не меняет пароль; непохожая существующая база отвергается. Ошибка любого шага даёт nonzero и блокирует API/worker. Каждая transaction отдельная: после успешной схемы и ошибки seed схема остаётся явно записана в ledger, а приложение не запускается. Никакого незаметного частичного архивного импорта здесь нет.
5. API/worker запускаются после exit0 migrator, frontend после старта API. Readiness обоих, frontend /api/health, свежий heartbeat; 1 synthetic user, 1 product, orders/payments/purchases=0 до checkout. Migrator secret доступен только его одноразовому контейнеру; после первого seed для дальнейших обновлений можно убрать --synthetic-seed и его пароль, сохранив migration gate. Проверенный локально Compose parsing не заменяет проверку зависимостей/health на Timeweb.
6. Через отдельный HTTPS hostname повторить synthetic browser сценарий и вручную эмулированный **test** ResultURL с искусственным ключом из приватного harness: pending до callback, 1 payment/purchase/job после повторов, Secure/HttpOnly/SameSite cookie, logout, чужой курс403. Не ходить на Robokassa. Password reset через API+очередь работает, но ручной UI consume в удалённом staging с discard test sender требует отдельно разрешённого приватного test-only инструмента получения ссылки; локально весь flow проверен IPC. Real video disabled503, никаких uploads.
7. После запуска наблюдать очереди/heartbeat/ошибки без recipient/tokens. При провале остановить staging, вернуть предыдущий утверждённый commit/образы, проверить schema compatibility; не откатывать SQL автоматически и не восстанавливать существующую default_db. Рабочий сайт/DNS остаются независимыми.

## Оставшиеся блокеры внешнего synthetic staging

- Тариф/возможность новой БД и ограниченных ролей; provider ACL и фактические права не проверены.
- Постоянный egress IPv4 всех Compose runtime services, whitelist до public exposure, публичный TLS endpoint/CA/SAN и реальная проверка; поведение private listener/TLS-only и точные расходы/лимиты ролей ещё требуют ответа.
- Отдельный HTTPS origin, приватные staging переменные, утверждённый commit и отдельно разрешённое создание платного приложения/push/deploy; фактические migration gates/healthchecks App Platform пока не испытаны.
- Для ручной удалённой проверки password recovery нужен безопасный приватный synthetic mail sink либо разрешённый тестовый harness; текущий test sender намеренно не раскрывает ссылки.

Решение по реальным видео и проверка внешних провайдеров **не блокируют synthetic staging** с disabled/test. Они остаются блокерами следующего этапа с реальными уроками. Никакого подключения с Мака к 192.168.10.4 не выполнялось.

## Проверка GitHub Actions перед будущим push

Локально проверены все 6 workflows. Push migration/timeweb не совпадает с publish triggers: deploy.yml — master; nextjs.yml — main; оба preview — feature/ios-26-design. CI workflows — main/develop и PR в main, без публикации сайта. Обнаруженный ручной workflow_dispatch обход закрыт локальными job.if по соответствующей ветке. Concurrency для запрещённых refs отделена: ручной запуск из migration/timeweb не отменяет активную production публикацию. YAML всех workflows разобран, 5 publishing/build jobs имеют guards, git diff --check прошёл. Изменения ещё не отправлены в GitHub, удалённые настройки аккаунта/Pages и сторонние auto-deploy не проверялись.

## Уточнение 10.10.2026: тариф, память и приватный тестовый ящик

См. [сравнение и измерения](../../reports/MIGRATION_STAGING_OPTIONS.md): рекомендация — отдельная rehab_staging на>=2ГБ и публичный TLS+Firewall; цена upgrade по аккаунту требует подтверждения. Никаких изменений тарифа сейчас. Для приложения общий builder/runtime —4ГБ RAM;По уточнению11.10 builder на app сервере, выбираем2CPU/4ГБ/50ГБ1500₽/мес, минимум3ГБ от поддержки. Linux полный build peak1,93ГиБ; runtime smoke frontend/API/worker280МиБ RSS. Цена Compose1500₽ подтверждена ответом №12811919; текущие БД+S31327₽, дополнительные расходы PUBLIC_TLS.md.

Теперь подготовлен опциональный staging-mailbox provider и staging-mailbox.compose.yml: явное включение сетевой доставки только reset/confirmation искусственных @example.invalid на один приватный выделенный ящик. Основной manifest остаётся test/discard, network=false. Не включать override до отдельного разрешения тестовой отправки и подтверждения способа объединить manifests в App Platform. Дополнительные приватные env описаны в override/report; токенов в public endpoints/logs нет. Это заменяет прежний незавершённый план ручного remote reset; реальная доставка ещё не проверена.
