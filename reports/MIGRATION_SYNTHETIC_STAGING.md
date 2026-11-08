# Этап 5 — локальный синтетический staging

10.10.2026. Фактическая папка `/Users/imax/dev/minenkovrehab-migration`, ветка `migration/timeweb`. Прочитаны MIGRATION_TIMEWEB.md и отчёты предыдущих этапов; применимых AGENTS.md нет. Исходные незакоммиченные изменения сохранены. `.env`, рабочие API/БД и Timeweb не использовались. Старый проект, backup, DNS и инфраструктура не менялись; push/deploy/реальные платежи, письма и видео upload не выполнялись.

## Что запущено и проверено локально

Четыре настоящих отдельных процесса: PostgreSQL17, Express `server.js`, Next production `next start`, непрерывный `queue-worker.main`. Новый временный cluster, случайные свободные loopback порты, SCRAM host authentication, отдельные migrator/payment/auth/worker роли. HOME временный, окружение явно составлено без наследования URL/секретов; данные только искусственные. Chrome headless — настоящий браузер, внешние запросы страницы блокируются. После завершения процессы остановлены, временный cluster и его логи удалены.

Worker использует обычный цикл/очереди/heartbeat; локальный тестовый sender передаёт искусственные purchase/reset payload по IPC родительскому harness. Это позволяет открыть reset ссылку в браузере без SMTP/API, файлов токенов или публичного inbox. В staging injection запрещён; стандартный test sender отбрасывает payload. Никакие реальные email/пароли/hash/token не использовались и не выводились.

| Сценарий | Результат |
|---|---|
| Вход → SSR кабинет без profile | Прошёл; отсутствие profile не мешает, искусственный UUID сохранён |
| Курс до покупки | SSR «Доступ к курсу закрыт», access API403 |
| Checkout через существующий интерфейс | Прошёл; цена 8000 определяется серверным искусственным каталогом; заказ pending, доступа ещё нет |
| Тестовое подтверждение оплаты | Эмуляция подписанного IsTest=1 ResultURL через Next proxy; **не** обращение в Robokassa, даже sandbox |
| Последовательный и 6 конкурентных повторов | Всего 8 уведомлений, все получили OK после commit/проверки обработанной оплаты; ровно 1 payment/1 purchase/1 purchase job |
| Страница статуса и доступ после оплаты | UI показывает paid; access API200, защищённая SSR-страница курса открывается |
| Пароль при оплате | Hash искусственного пользователя не изменился |
| Чужой курс | API403 при наличии своей покупки |
| Реальные видео отключены | Проверен synthetic binding: после entitlement video API503; до него нет доступа. Playback Kinescope не включён |
| Purchase письмо отдельным worker | Одна обработка тестовым sender, outbox sent, heartbeat/readiness работают |
| Выход | UI logout200, me401, кабинет перенаправляет на login |
| Восстановление пароля | UI request → очередь → отдельный worker → IPC ссылка → UI reset → новый вход; ciphertext очищен |
| Повтор reset ссылки | UI POST400, одноразовый токен повторно не принимается |
| Ограниченные роли | payment/auth/worker не могут CREATE DATABASE/CREATE TABLE; payment/worker не читают credentials |
| Synthetic seed | Повтор не создаёт дублей и не меняет hash; несовпадающие существующие данные отвергаются transaction-ом |

Итог основной репетиции: **1 synthetic user, 2 synthetic products (включая чужой), 1 order, 1 payment, 1 purchase, 1 purchase message, 1 reset message**. Synthetic video placeholder используется только для проверки fail-closed, исходные видео не импортировались. До основной цепочки отдельно проверен seed/replay/refusal и его данные очищены в той же временной БД.

Первый прогон остановился на ошибке имени столбца в самом harness при проверке очищенного ciphertext. Проверка исправлена на фактический ciphertext; повторные полные прогоны прошли. Ошибка не затронула приложение/рабочие данные; каждый cluster изолирован и удалён.

Повторно прошли **49/49** backend/payment/auth/import/provider/migration/SSR/browser tests, **0 fail/skip**, включая сохранённые проверки неверных signature/amount/order/mode, последовательные/конкурентные ResultURL, DB rollback, ошибки sender после commit, CSRF/rate/session/reset и callback authorization. Отдельный worker smoke также прошёл. Next production build без .env — успешно; targeted ESLint новой health route и git diff --check — успешно. Обновлённые Dockerfiles frontend/backend/worker собраны локально на Node22; root App Platform Compose проверен `config --quiet` с dummy переменными и пустым env-file. Docker образы никуда не публиковались. Jest не перезапускался: существующие 23/23 из этапа 4 остаются историческим результатом, в этом этапе изменены backend/config/deploy и новая health route.

## Что изменено для запуска

- Root `docker-compose.yml` для App Platform: первый frontend, внутренние API/worker, migration gate, никаких volumes/host network/env_file; отдельный worker Dockerfile.
- EXPOSE и Dockerfile liveness HEALTHCHECK, новая frontend /api/health/live; прежний /api/health остаётся readiness API.
- Staging config разрешает отдельную rehab_staging на существующем cluster IP при явном synthetic подтверждении. default_db/gen_user/Supabase/SSL overrides отвергаются; обязательны CA, проверка цепочки и hostname/IP. Возможность TLS соединения с minenkov-db этим **не проверена**.
- Pool connection timeout5s; одинаковые TLS настройки API/auth/worker/migrator; роли разделены. Короткий local-only injected sender предназначен исключительно для воспроизводимого браузерного harness.
- Migrator --grants и --synthetic-seed, guarded transaction grants, proposal staging-isolation.sql. Seed не читает dump, не создаёт purchases/payments/mail, сохраняет существующий synthetic пароль при повторе, отказывает при несовпадающей базе.
- Прежний VM runbook отмечен альтернативным. Основная инструкция: [APP_PLATFORM.md](../deploy/timeweb/APP_PLATFORM.md). Полные env/commands/ports/health/migration order/private network/roles/TLS и условия будущего запуска — там.
- Сравнение stage-3 для владельца: [MIGRATION_VIDEO_DECISION.md](MIGRATION_VIDEO_DECISION.md), включая ссылки на оба локальных файла и остальные незавершённые связи. Все шесть исходных записей/файлы сохранены без автоматических назначений.

## Как воспроизвести локально

Из рабочей папки, при установленной PostgreSQL17 Homebrew и Chrome:

```sh
node scripts/build-migration.cjs
STAGE2_NEXT_BUILD="$(cat /private/tmp/rehab-next-build-path)" node robokassa-api/timeweb/test/run-staging-local.js
STAGE2_NEXT_BUILD="$(cat /private/tmp/rehab-next-build-path)" STAGE3_BROWSER=1 node robokassa-api/timeweb/test/run-local.js
node scripts/check-app-platform.cjs
```

Первая команда собирает в новой временной папке, не в рабочем .next. Harness не принимает внешний database URL и сам создаёт/удаляет собственную БД. PostgreSQL требует разрешённых локальных сокетов/shared memory. Последняя команда только проверяет Compose с искусственной конфигурацией; `--build` дополнительно собирает локальные образы, **никогда не up/deploy/push**. Staging манифест нельзя использовать для подключения с Мака к private DB.

## Оставшиеся блокеры внешнего synthetic staging

1. **Тариф и права minenkov-db:** возможность rehab_staging и четырёх ограниченных ролей. На минимальном тарифе дополнительные БД/пользователи недоступны; текущий тариф не известен. Нельзя заменять изоляцию использованием default_db/gen_user.
2. **Фактическая сеть и TLS:** App Platform документированно поддерживает выбор приватной сети при создании; Friendly Halimede/зону/свободный IP/route ещё проверить. Timeweb docs описывают настройку TLS через public access; у кластера publicIP нет. Нужны подтверждённые private TLS endpoint/CA/SAN, без отключения проверки сертификата.
3. **Конфигурация/разрешённый запуск:** отдельный HTTPS технический origin, приватные переменные, утверждённый commit; отдельно разрешённые push/deploy/создание платного App Platform. Реальные healthchecks, migration gates, HTTPS cookies и сеть Timeweb пока не проверялись.
4. **Удалённый ручной recovery flow:** discard test sender не показывает reset links. Для UI consume нужен отдельно подготовленный приватный synthetic harness/mail sink; локальный полный flow уже проверен IPC.

По [официальной инструкции App Platform Compose](https://timeweb.cloud/docs/apps/deploying-with-docker-compose) приложение можно добавить в приватную сеть при создании. Поэтому отдельные дополнительные VM **не обязательны**; они остаются альтернативой для самостоятельного управления. Существующее подключение не объявляется проверенным.

Real lesson mappings/Kinescope playback/RuSender/production import/реальные пароли/signup/OAuth/live Robokassa/cutover остаются задачами полного переноса. Неопределённость видео не блокирует текущий synthetic staging с disabled playback. [Список зависимостей](MIGRATION_DEPENDENCIES.md) остаётся актуальным: доверенный prebuilt runtime без старых production blockers; автоматические недоверенные PR builds пока не включать.
