# minenkov-app 268279: ошибка fca4429 и минимальное исправление

> Для нового image-only исправления использовать [IMAGE_ONLY_268279.md](IMAGE_ONLY_268279.md). Описание source-build ниже относится к fca4429/5b44ddc; возвращаться к нему для нового запуска не нужно.

Проверка11.10.2026, migration/timeweb. Прочитана страница «Деплой» приложения268279, без изменения настроек/запуска команд. Полный журнал содержит конкретную причину:

> required variable STAGE1_TEST_PASSWORD2 is missing a value

Ошибка возникла при интерполяции `x-private.STAGE1_TEST_PASSWORD2`, после «Configuring logging and hardening». Затем rollback сообщил об отсутствии предыдущего деплоя и удалил неудачный deploy. Это подтверждённая причина текущей попытки, **не доказательство OOM или ошибки Next.js build**. Автоматическая рекомендация TimewebGPT на странице не учитывает эту строку, поэтому не использована как диагноз.

## Что реально отправлено

В `fca4429:docker-compose.yml` три сервиса: frontend, backend, worker; каждый содержит `build`, ни один не содержит `image`. Frontend Dockerfile выполняет `npm ci`, **npm run build Next.js на сервере**, затем prune. API и worker тоже устанавливают зависимости на сервере. Локальные готовые образы и `/Users/imax/Minenkov-deploy/rehab-prebuilt-amd64.tar` платформа не получает автоматически. `deploy/timeweb/prebuilt.compose.yml` был только локальным неподготовленным к registry-публикации вариантом и не является корневым отправленным manifest. Git push не доставляет Docker images.

По [ограничениям Compose](https://timeweb.cloud/docs/apps/deploying-with-docker-compose) в исходном manifest нет запрещённых volumes, host network, privileged, security_opt, extra_hosts, external или host ports80/443. Frontend первый с3000:3000, API/worker только expose. Алиасы/yaml anchor распознаются локальным Docker Compose; на платформе sanitizer прошёл и журнал указывает именно отсутствующую переменную. Из этого нельзя заключать, что все последующие этапы Timeweb уже проверены.

Исходные обязательные переменные интерполяции: MIGRATION_SITE_ORIGIN, MIGRATION_DATABASE_URL, MIGRATION_RESET_KEY, STAGE1_TEST_PASSWORD2; при отсутствии/пустом значении любой из них Compose отказывается ещё до build. MIGRATION_DB_READY_CONFIRM по умолчанию пустой: API и worker запускают private-boot, только live200/ready503, без чтения DB config/подключения к БД/SQL. Никаких migrate/import/seed сервисов или команд startup нет.

## Исправление

В корневом Compose `STAGE1_TEST_PASSWORD2` теперь передаётся пустым при отсутствии. Это **не пароль по умолчанию** и не отключение проверки подписи: ключ нужен только после явной активации API/worker. Runtime `loadConfig` по-прежнему отказывает при пустом ключе, до создания Pool. Waiting-режим не использует платёжный handler. Другие три Compose переменные остаются обязательными; секреты не читались и не добавлялись в код/тесты.

Manifest остаётся source-build, архитектура и тариф не менялись. Превращать его в `image` с локальными тегами нельзя: на Timeweb их нет. Private registry credentials/delivery не подтверждены и образы не опубликованы; это отдельный нерешённый путь запуска без серверной сборки. На1ГБ source build может оказаться недостаточен, но текущий журнал этого не доказывает. Не повышать тариф без нового конкретного журнала/измерения.

## Проверки

`node --test robokassa-api/timeweb/test/timeweb-compose-start.test.js`: **5/5 прошли**, искусственные значения, `.env` не читается, `--env-file /dev/null`:

- исходный fca4429 воспроизводит именно отсутствующий callback key при Compose config, без build;
- исправленный root Compose успешно разрешается без ключа; gates/noSQL/internal ports сохранены, service directives проверены против запрещённого списка;
- активная конфигурация с пустым ключом отвергается;
- API waiting: live200/ready503, без DB URL/ключа;
- worker waiting: live200/ready503, без DB URL/ключа.

Первый запуск двух сетевых тестов был ограничен sandbox EPERM; повтор с разрешением локальных listener прошёл. Это не ошибка приложения. Next.js/images повторно не собирались, БД/импорт/платежи/почта не запускались. Изменённые пути — интерполяция Compose и проверка закрытого startup. GitHub Actions публикуют master/main или отдельную feature-ветку, migration/timeweb не запускает рабочую публикацию.

## После push — только ручной повтор владельцем

1. App Platform → minenkov-app268279 → настройки деплоя: сохранить migration/timeweb и выключенный автодеплой. Выбрать новый SHA из отчёта исправления; master не выбирать. Не менять сеть/тариф/DNS.
2. В приватных переменных приложения должны быть MIGRATION_SITE_ORIGIN (точный HTTPS origin платформы), MIGRATION_DATABASE_URL (существующая private default_db/gen_user конфигурация), MIGRATION_RESET_KEY (32байта hex). Не копировать значения в журналы/сообщения. STAGE1_TEST_PASSWORD2 для waiting теперь можно оставить отсутствующим; перед будущим включением функций задать отдельный искусственный ключ, не реальные Robokassa credentials.
3. **MIGRATION_DB_READY_CONFIRM оставить пустым.** Миграции/импорт не запускать. Не выполнять команды доступа к БД для «проверки сборки».
4. Вручную запустить новый деплой выбранного SHA. Он по-прежнему собирает Next.js на сервере. Проверить полный журнал: прежняя ошибка интерполяции должна исчезнуть. Этот локальный fix не подтверждает успешность всей последующей серверной сборки.
5. Если build пройдёт: frontend `/api/health/live`200; API/worker live200 и ready503 ожидаемы до ручной проверки/инициализации, недоступная авторизация в waiting тоже ожидаема. Наличие live не означает готовность сайта или разрешение записи в БД.

Если понадобится следующий полный журнал, один запрос браузерному агенту: **«Открой App Platform → minenkov-app268279 → Деплой → попытку нового SHA; скопируй весь стандартный build log от Repository cloned до последней строки, включая первую ERROR, exit code/OOM/failed step и rollback; значения переменных, URL с credentials, токены и строки окружения замени на [REDACTED], ничего не запускай и не меняй».** Не включать DEBUG наугад: он может раскрывать секретные параметры.
