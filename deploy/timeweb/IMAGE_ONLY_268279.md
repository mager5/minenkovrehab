# minenkov-app268279: готовые образы вместо серверной компиляции

Подготовка11.10.2026. Ветка migration/timeweb. Приложение уже оплачено:1CPU/1ГБ/15ГБ, менять тариф/архитектуру не требуется. Новый корневой `docker-compose.yml` запускает frontend/API/worker по `image`, **не содержит build**, миграций/seed/import и не исполняет npm/Next.js build. Отсутствующий или недоступный image reference вызывает ошибку, без fallback к исходной сборке. Этот документ заменяет указание о source-build в BUILD_FAILURE_268279.md для нового коммита.

## Диагноз по приложенному журналу

Источник только для чтения: Downloads/deploy-logs-268279-2026-10-11T15_55_54.825Z.txt. API/worker экспортированы16:33:58. Попытки16:33/17:03/17:48/18:14/18:29 снова запускают frontend npm run build → next build --webpack. Последняя видимая стадия — Creating an optimized production build; явного OOM/137 в файле нет. Нельзя утверждать доказанную нехватку RAM. Исправляется подтверждённая тяжёлая операция на сервере, а не предполагаемая OOM. Новую source build попытку не запускали.

## Доставка и её границы

В актуальной авторизованной форме App Platform раскрыты Compose-настройки: отдельного поля registry auth не найдено; Container image помечена«СКОРО». [Docker Hub](https://timeweb.cloud/docs/apps/deploying-with-docker-hub) документирует публичные образы. [Compose](https://timeweb.cloud/docs/apps/deploying-with-docker-compose) сохраняет три сервиса и первый frontend под доменным HTTPS, но не документирует credentials private pull. Это **не доказательство запрета private Compose**, однако проверенного private канала сейчас нет. Загрузка Docker-save архива по SSH в managed app тоже не подтверждена; нельзя считать копию на Маке доступной серверу.

Подготовленный путь — три публичных пакета GHCR, доступных для стандартного Compose pull без credentials. Публичный Container registry допускает анонимную загрузку по [GitHub docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), стоимость container storage/bandwidth сейчас0 по [billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages). Фактический anonymous pull из Timeweb и обработка image-only манифеста его sanitizer ещё не проверены на платформе: первый разрешённый запуск должен подтвердить их. Пока публикация не согласована и не выполнена, **этот SHA не запускать**: обязательные image refs отсутствуют. Не подменять их локальными тегами на Timeweb, не запускать старый build manifest.

## Что предлагается опубликовать — требуется решение владельца

Существующие локальные linux/amd64-образы, без пересборки:

| Local tag | Планируемый публичный пакет/тег |
|---|---|
|rehab-frontend:prebuilt-amd64|ghcr.io/mager5/minenkov-rehab-frontend:timeweb-amd64-20261011|
|rehab-api:prebuilt-amd64|ghcr.io/mager5/minenkov-rehab-api:timeweb-amd64-20261011|
|rehab-worker:prebuilt-amd64|ghcr.io/mager5/minenkov-rehab-worker:timeweb-amd64-20261011|

Frontend содержит уже скомпилированный Next.js server/client JS, публичные static/assets и content, production node_modules и runtime config. API/worker содержат JavaScript авторизации, заказов/платежей/доступа/очереди, SQL-миграции/импортер как код, искусственные тесты и зависимости. Публичность означает, что любой сможет скачать и исследовать эти программы и входящие assets; это не только открытие веб-интерфейса. Никакие реальные users/purchases/password hashes, dump, `.env`, архивы бэкапа, credentials Runtime или registry token не предполагаются в пакетах. **Образ rehab-import, бэкап и постоянный Docker-save архив не публикуются.** Публикация существующего пакета с совпавшим именем запрещена без проверки: создавать только новые выделенные packages.

Зафиксированы разрешённые локальные IDs в `publication-plan.json`. Проверен checksum постоянного архива и все32 runtime layers/34937 app entries; forbidden findings0. Автоматическая проверка путей/JWT/private-key literals не является универсальным доказательством отсутствия любого персонального текста, но источник реальных данных никогда не входил в COPY этих образов. Секреты должны задаваться только приватно в runtime приложения. Значения из панели не читались.

`python3 scripts/publish-timeweb-images.py` — **только dry run**, проверяетIDs/architecture/отсутствие secret Env и показывает ровно три назначения, без tag/push/login/build. После отдельного явного согласия владельца на эти публичные packages, отсутствия конфликта имён, повторной проверки содержимого и приватного login GHCR оператор может запустить `python3 scripts/publish-timeweb-images.py --execute-after-owner-approval`. Токен не передавать как CLI argument и не сохранять в Git. Использовать Docker credential helper/интерактивный login или password-stdin из защищённого источника. Скрипт не меняет visibility; новые GHCR packages обычно private. Их **public visibility** устанавливается отдельно через настройки каждого согласованного package, без расширения доступа к другим пакетам/репозиторию. Не менять visibility всего репозитория.

После push получить настоящие registry `@sha256` refs из вывода скрипта. Это не локальные image IDs. Проверить анонимную загрузку с пустым временным Docker config до задания refs Timeweb; никаких registry credentials приложению не нужны в публичном варианте. До согласия и публикации `docker push`/visibility change/Timeweb deploy не выполняются.

## Проверка исправления

`node --test robokassa-api/timeweb/test/timeweb-compose-start.test.js` —5/5. Root Compose resolves с искусственными IMAGE vars, no build; ограничения Timeweb проверены, callback key по-прежнему нужен для активной конфигурации; пустой ready gate и noSQL сохранены.

`node scripts/check-timeweb-prebuilt.cjs` —успешный actual Compose up существующих трёх образов: `--no-build --pull never`, memory512/128/96МиБ,CPU.50/.25/.25, internal-only network, без PostgreSQL и интеграций. Сам `docker compose build` с image-only manifest завершился без build stages/npm/Next.js. Frontend health/live200, frontend readiness503; API/worker live200/ready503; OOM=false. Memory в waiting режиме144.59МиБ+256МиБ **оценочный**, не измеренный системный запас. Это не замер production нагрузки. Первый probe host-port внутри internal-only Docker Desktop не достиг frontend; контейнерный loopback подтвердил успешный запуск, тест сохранён с этим способом проверки. Все временные контейнеры/сеть удалены. Образы не пересобраны. Ранее выполненная активная синтетическая проверка остаётся отдельным результатом.

Сводка этой проверки: reports/timeweb-image-only-start.json. Payment/auth код не менялся; старые общие тесты не повторялись. .env не читались, существующие Timeweb БД/DNS/интеграции не изменялись. GitHub Actions guards не допускают рабочую публикацию при push migration/timeweb. Отправляется код/план/обезличенный тестовый отчёт; образы этим Git push не публикуются.

## Точное задание браузерному ChatGPT после публикации

**Пока образы не согласованы, не опубликованы и не проверен anonymous pull — ничего не запускать.** Когда выполнены эти условия и получены три реальные digest refs:

> Открой существующее App Platform приложение **minenkov-app ID268279**, не создавай новое. В настройках деплоя сохрани framework **Docker Compose**, корень репозитория, ветку **migration/timeweb**, выбери новый SHA из отчёта, автодеплой оставь выключенным. Установи три несекретные переменные **FRONTEND_IMAGE**, **API_IMAGE**, **WORKER_IMAGE** в полученные опубликованные `ghcr.io/mager5/minenkov-rehab-…@sha256:…` refs. Не использовать local tags, placeholder digest, latest или исходные Dockerfiles. Значения существующих секретных переменных не копируй в чат/логи; не меняй DB URL, TLS/private mode, сеть Friendly Halimede, DNS, тариф1CPU/1ГБ/15ГБ. Проверь наличие существующих MIGRATION_SITE_ORIGIN, MIGRATION_DATABASE_URL, MIGRATION_RESET_KEY без раскрытия значений. **MIGRATION_DB_READY_CONFIRM должен остаться пустым**, платежи test, видео disabled, mail test/networkfalse. STAGE1_TEST_PASSWORD2 для waiting необязателен. Запусти вручную только один деплой нового SHA. В полном журнале ожидаются pull/create/start готовых образов, без npm ci/npm run build/next build. Строка “Building docker compose” может быть названием общего этапа и сама по себе не означает компиляцию. Если появились build stages/npm/Next.js — останови эту попытку и сообщиSHA/название service/строку, не повторяй. При pull/sanitizer error пришли конкретную обезличенную ошибку, без возврата к source build/повышения тарифа. После успешного старта проверь HTTPS технического адреса с обычной проверкой сертификата и `/api/health/live`200, `/api/health`503 ожидаем для waiting. При доступном exec backend/worker проверь live200/ready503. Миграции, импорт, платёжные запросы, отправку писем и рабочий домен не запускай и не меняй. Верни SHA, status, image digests и обезличенный журнал; секреты/токены скрывай.
