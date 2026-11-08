> **Действующий выбор владельца11.10.2026: один private Compose, default_db/gen_user, явный disabled-private. Инструкция [PRIVATE_APP.md](PRIVATE_APP.md) имеет приоритет. Ниже сохранён предыдущий staging/public TLS план, больше не применяемый автоматически.**

# Публичный TLS PostgreSQL и Firewall — план, не выполненные изменения

Актуально 11.10.2026, migration/timeweb. Ответ поддержки №12811919 передан владельцем: приватное подключение одновременно с TLS не поддерживается; Compose собирается на сервере приложения; минимум3ГБ RAM; Compose2CPU/4ГБ/50ГБ1500₽/мес; текущие БД+S3 вместе1327₽/мес. Подлинник обращения агентом не читался. **Private TLS исключён.** Никакого переключения на plaintext при ошибках TLS.

## Рекомендация и IP приложения

Compose2CPU/4ГБ/50ГБ, отдельная rehab_staging на тарифе БД>=2ГБ, публичное DNS имя TLS endpoint PostgreSQL, CA и hostname verification, входящий Firewall БД только от подтверждённого исходящего IP приложения и временного административного IP. API, auth, worker и migrate используют одинаковый endpoint, разные ограниченные роли. Frontend обращается к API внутри Compose. Friendly Halimede не является маршрутом подключения к БД; наличие сети не доказывает TLS. Дополнительная VM для постоянного worker не нужна.

[Compose](https://timeweb.cloud/docs/apps/deploying-with-docker-compose) показывает IP приложения на дашборде, [управление](https://timeweb.cloud/docs/apps/upravlenie-apps-v-paneli) подтверждает отдельный облачный сервер. **Это не документированная гарантия постоянного egress IP/SNAT** всех контейнеров. До разрешённого запуска получить подтверждение совпадения egress с dashboard IP и его сохранения при redeploy/restart/resize/maintenance. Адреса backend/worker/migrate необходимо проверить отдельно; наблюдение один раз не гарантирует постоянство. Не разрешать все IP Timeweb, CDN, GitHub Actions или весь CIDR провайдера. Если адрес нестабилен, остановиться: нужна поддерживаемая выделенная фиксированная egress схема; общий NAT других сервисов не обеспечивает «только приложение».

[Публичные IP](https://timeweb.cloud/docs/public-ip) закрепляются за аккаунтом и могут переноситься; это не доказательство управляемого переназначения IP App Platform. Возможность dedicated IP/NAT для Compose, цену и эксплуатационный порядок уточнить, не создавать обходную VM/роутер автоматически.

## Будущий порядок Firewall и TLS

1. После отдельного разрешения provision приложение без старта DB-dependent миграций, получить/закрепить egress IP по поддерживаемому процессу. Возможность paused/provision-before-deploy пока требует подтверждения поддержки. Не открывать БД для всего интернета ради определения IP.
2. Создать разрешающую **непустую** группу Firewall для minenkov-db: входящий TCP5432 от APP_EGRESS_IPV4/32 и только при необходимости ADMIN_EGRESS_IPV4/32. Проверить все остальные связанные разрешающие группы: правила суммируются. Не задавать 0.0.0.0/0 или ::/0. Не добавлять исходящие whitelist правила без полного плана обратного/служебного трафика.
3. Привязать Firewall до публичного доступа БД; если панель не позволяет сделать это без окна доступности — остановиться и запросить атомарную настройку у поддержки. Не считать TLS аутентификацию заменой сетевой фильтрации. [Правила Firewall](https://timeweb.cloud/docs/firewall/upravlenie-fajrvolom): пустая группа ничего не блокирует, whitelist отсекает прочие источники, правила ingress/egress независимы, приватная сеть не фильтруется.
4. На вкладке «Сеть» БД разрешить публичный IPv4 и назначить адрес; публичный IPv6 оставить выключенным, чтобы не получить второй неконтролируемый путь. Сам факт подключения IPv4 не означает отключение приватного доступа: [инструкция](https://timeweb.cloud/docs/dbaas/dbaas-manage/public-ip-access) говорит о его сохранении. Нужны ответ поддержки о TLS-only enforcement/частном listener и инвентаризация существующих потребителей; не менять их маршруты/ACL автоматически.
5. «Подключение» → «Включить защищённое подключение», если ещё не включено. Из этой вкладки взять **точное TLS DNS имя, порт и команды установки CA**, не придумывать endpoint/URL CA/SAN по private IP. [Инструкция TLS](https://timeweb.cloud/docs/dbaas/postgresql/connect-to-database). CA скачать по официальной инструкции по HTTPS с обычной проверкой сертификата, подтвердить источник/цепочку и порядок ротации. CA публичен, но пароли/URL с паролями не выводить. Сертификат сайта Let's Encrypt и CA БД — разные настройки.
6. Все MIGRATION_*DATABASE_URL и passwordless MIGRATION_DATABASE_TARGET должны содержать одинаковый публичный TLS hostname:5432/rehab_staging. Ни 192.168.10.4, ни произвольный IP вместо имени; не добавлять SSL query parameters. MIGRATION_PG_TLS=verify-full, MIGRATION_PG_CA=доверенный PEM. В коде rejectUnauthorized=true и tls.checkServerIdentity(hostname,cert); настройки не изменены.
7. С разрешённого административного источника или поддерживаемого runtime процесса выполнить preflight: разрешение DNS в публичный endpoint; verify-full handshake; SELECT ssl,version,cipher FROM pg_stat_ssl WHERE pid=pg_backend_pid(); ssl=true. SQL сам по себе не доказывает проверку hostname: её обеспечивает клиент. Отдельно убедиться в отказе при неверном CA/hostname и недоступности TCP5432 с неразрешённого контролируемого адреса. Не отключать Firewall для теста. Выполнить read-only проверку actual roles/ACL/target; не считать подключение уже проверенным.

Пример будущего psql: задать PGHOST точным DNS из панели, PGPORT=5432, PGDATABASE=rehab_staging, PGUSER административной/миграционной ролью, PGSSLMODE=verify-full, PGSSLROOTCERT локальным CA файлом и PGCONNECT_TIMEOUT=5; пароль вводить интерактивно через psql -W либо приватный secret store. Не включать shell tracing и не печатать окружение. Административный доступ только после отдельного разрешения, с заранее разрешённого фиксированного /32, не с Мака к private IP. [libpq verify-full](https://www.postgresql.org/docs/17/libpq-ssl.html).

## Миграции без широкого публичного доступа

Роли/rehab_staging provision через панель или разрешённый операторский канал. Для SQL staging-isolation.sql временный admin /32 с verified TLS; Adminer не считать готовым решением — его source IP, TLS и прохождение Firewall в документации не подтверждены. После настройки убрать ненужный admin rule, закрыть admin сессии. Если административный IP меняется, остановиться и согласовать новый /32, не расширять подсеть.

Миграции **в runtime одноразовом service migrate**, не в Docker build и не в GitHub Actions. Команда `node timeweb/migrate.js --grants --synthetic-seed`; origin/секреты только приватные runtime variables. Источник соединения тот же подтверждённый APP_EGRESS IP. Backend/worker ждут service_completed_successfully; ошибка не разрешает запуск. Atomic миграции, advisory lock, checksums/ledger, guards rehab_staging остаются. Seed только искусственный, архив не загружается. После первоначального seed убрать --synthetic-seed/его пароль при подготовке будущего manifest. Миграционная роль должна сохранять ownership для обновлений; её secret не передавать API/worker. Удаление секретов/ротация при следующем deploy требует согласованного операционного порядка, не обещания мгновенного revocation.

## Права и число пользователей на2ГБ

[Базы](https://timeweb.cloud/docs/dbaas/postgresql/create-db) разрешают дополнительные БД на>=2ГБ; [пользователи](https://timeweb.cloud/docs/dbaas/postgresql/users-and-privileges) ограничивают их создание только минимальным1ГБ/8ГБ тарифом. **Точное максимальное число LOGIN-пользователей на2ГБ не указано**; не объявлять его неограниченным. Нужно подтверждение минимум четырёх новых ролей (payment/auth/worker/migrator) плюс существующего gen_user и фактического max_connections/резерва провайдера.

Панель поддерживает SELECT/INSERT/UPDATE/DELETE/TRUNCATE/CREATE/REFERENCES/TRIGGER/TEMPORARY/CREATEDB/CREATE_ROLE и per-database права. Новые пользователи по умолчанию широкие: сразу выбрать только rehab_staging. Runtime без SUPERUSER/CREATEDB/CREATEROLE/BYPASSRLS/ownership, credentials читает только auth; точечные schema/table/sequence grants в roles.sql. [SQL роли](https://timeweb.cloud/docs/dbaas/postgresql/roles) доступны обладателю CREATE ROLE; gen_user superuser/CREATEROLE не считать доказанными. Bootstrap operator provision owner/роли, мигратор не требует CREATEDB/CREATEROLE после provision. Проверить PUBLIC/membership/default privileges и отсутствие доступа к default_db, не менять существующую default_db без разрешения.

## Расходы

| Статья | Подтверждение/оценка в месяц |
|---|---|
| Существующие БД+S3 |1327₽, ответ №12811919; это общая сумма, не отдельная цена minenkov-db |
| Compose2CPU/4ГБ/50ГБ |+1500₽, тот же ответ; сборка на его сервере, минимум3ГБ от поддержки, выбираем4ГБ |
| IPv4 БД |публичный конфигуратор показывает200₽/мес; точный аккаунтный расчёт/повторное использование выделенного IP уточнить |
| Повышение minenkov-db до2ГБ |дельта по вашему аккаунту неизвестна; прежние публичные пресеты1200→2000 не позволяют вычитать1200 из общей суммы1327 |
| Egress IP приложения / Firewall / TLS |отдельная стоимость/включённость в1500 не подтверждена; не считать автоматически бесплатными |
| Дополнительные опции |backup/S3 storage/traffic/test mailbox/RuSender — только выбранные будущие расходы; не включать автоматически |

Условный subtotal с прежними услугами+Compose+новым IPv4 БД: **3027₽/мес** (=1327+1500+200), **ещё без** дельты upgrade и возможных network/mail услуг. Не окончательная смета; если IPv4 включён/переиспользуется, доплата отличается. [IPv4 billing](https://timeweb.cloud/docs/public-ip) почасовой, даже непривязанный IP платный; [публичный PostgreSQL конфигуратор](https://timeweb.cloud/services/postgresql) показывает200₽ и backup6₽/ГБ/мес. Не использовать устаревший общий публичный тариф вместо предложения поддержки. HTTPS технический домен и Let's Encrypt документированы как бесплатные в [App settings](https://timeweb.cloud/docs/apps/upravlenie-apps-v-paneli); это не подтверждение нулевой цены database TLS.

## Продолжение обращения №12811919 — не отправлено

1. Для Compose2CPU/4ГБ/50ГБ: какой постоянный **исходящий IPv4** увидит публичный PostgreSQL от backend/worker/одноразового migrator? Совпадает ли он с дашбордом? Сохраняется ли при redeploy/restart/resize/maintenance, можно ли закрепить, включён ли в1500₽? Можно ли provision paused приложение и получить IP до первого DB-dependent deploy? Если SNAT общий/динамический — какой поддерживаемый dedicated вариант и полная цена?
2. Для minenkov-db: как применить whitelist TCP5432 от app/admin /32 **до** включения публичного IP без окна доступа всем? Распространяется ли он на весь TLS endpoint/реплики, и какой source IP используют Adminer/панель? Нужны ли служебные исключения? Стоимость Firewall отдельно?
3. Укажите точный публичный TLS hostname/порт, SAN, официальный CA download/chain и порядок ротации. После включения TLS сервер запрещает non-TLS на всех listener или приватный остаётся plaintext? Можно ли закрыть именно приватный DB listener без изменения Friendly Halimede/других сервисов? Есть ли перезапуск/перерыв при TLS/upgrade? TLS отдельно оплачивается?
4. Подтвердите тариф PostgreSQL17>=2ГБ: итоговую цену/дельту с текущим1327₽ за БД+S3, число БД и максимум LOGIN пользователей. Доступны ли четыре дополнительные restricted роли+gen_user, ownership rehab_staging, точечные SQL GRANT/REVOKE/default privileges? Каковы max_connections и provider reserved connections? IPv4 БД200₽ отдельно или включён? Какие ещё обязательные расходы?

До ответов на egress/Firewall-before-public/TLS-only/roles-cost staging остаётся подготовленным локально. Ни ресурсы, ни ACL, ни Timeweb не менялись; push/deploy запрещены. Ответы поддержки передаст владелец.
