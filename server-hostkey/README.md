# server-hostkey — снимок того, что работает на сервере HostKey

Снято 26.10.2026 с `185.149.147.209`, каталог `/opt/rehab`. Это **резервная копия кода с сервера**,
а не исходники проекта: рабочая копия с коммитами `dd8354d` / `af5284f` лежит на Mac и в GitHub пока не запушена.
Когда её запушат в `master`, изменения отсюда нужно перенести в настоящие файлы проекта и проверить сборку.

## Что внутри

| Папка | Откуда | Что это |
|---|---|---|
| `api/` | образ `rehab-api:hk-dd8354d-fiscal`, `/app` без `node_modules` | backend (оплата, вход, доступ к видео). В проекте это `robokassa-api/` |
| `worker/` | образ `rehab-worker:hk-af5284f`, `/app` без `node_modules` | отправка писем. Тот же код, но более старый коммит |
| `infra/compose.yaml` | `/opt/rehab/compose.yaml` | сервисы: postgres, backend, worker, frontend, caddy |
| `infra/caddy/` | `/opt/rehab/Caddyfile`, `patches/rx/Dockerfile` | Caddy с модулем `replace-response` |
| `infra/caddy/extras/` | `/opt/rehab/extras/` (в контейнере `/srv/rx`) | кнопка «Наверх», Метрика, `sitemap.xml`, картинки превью |
| `infra/seo/` | — | генераторы SEO-блока Caddyfile и картинок превью |
| `infra/backend-fiscal-patch/` | `/opt/rehab/patches/fiscal-names/` | как собран `rehab-api:hk-dd8354d-fiscal` поверх `hk-dd8354d` |
| `infra/scripts/` | `/opt/rehab/scripts/` | бэкап базы, сертификаты, инициализация секретов |

Frontend (Next.js) сюда не входит: в образе `rehab-frontend:hk-dd8354d` лежит только собранный `.next`, исходников нет.

## Изменения на сервере 26.10.2026, которых нет в коде на Mac

1. **Ошибка 29 Робокассы у «Формулы Движения».** В `api/timeweb/robokassa-url.js` (`FISCAL_NAMES`) названия без апострофов:
   `Программа тренировок Формула Движения, N уровень`. Перенести в `robokassa-api/timeweb/robokassa-url.js`.
   В базе `rehab.products.title` для уровней 3 и 4 переименованы так же (старые значения — `rehab.products_title_bak_20261026_184359`).
2. **Почта на любые адреса.** Из `env/worker.env` удалена строка `MIGRATION_MAIL_ALLOWED_RECIPIENTS` (файл с секретами, в git его нет).
3. **Кнопка «Наверх».** Не в коде сайта: Caddy вставляет `<script src="/_rx/rx-scroll-top.js">` перед `</body>` каждой HTML-страницы.
   Нужен образ `rehab-caddy:2-replace` (`infra/caddy/Dockerfile`). Можно позже перенести кнопку в layout Next.js и убрать замену из Caddy.

4. **Метрика и вебмастера (27–28.10.2026).** Счётчик Метрики `113852639` — `extras/rx-metrika.js`, грузится только после согласия на cookie.
   Коды подтверждения Яндекс.Вебмастера и Google Search Console Caddy вставляет вместо заглушек `xxxxxxxx`.
5. **SEO и превью (28.10.2026)** — блок `https://minenkovrehab.ru` в Caddyfile генерирует `infra/seo/gen-main-block.py`:
   - опечатка `minekovrehab.ru` → `minenkovrehab.ru` во всём HTML;
   - `canonical` и `og:url` — адрес текущей страницы (в коде у всех страниц был адрес главной);
   - отдельные `og:title`/`og:description`/`twitter:*` для страниц услуг, описание для `/products/consultation`;
   - `noindex` для `/login`, `/forgot-password`, `/reset-password`, `/confirm-email`, `/terms` (`/terms` — старая оферта про стретчинг);
   - `/sitemap.xml` — из `extras/sitemap.xml` (13 страниц, в коде сайта устаревшая карта с несуществующим `/services`);
   - картинки превью `/images/og-image.jpg`, `/images/og/services-og.jpg`, `/images/og/contacts-og.jpg` — из `extras/images/`
     (в образе сайта все три одинаковые и с опечаткой). Пересоздать: `infra/seo/make-og-images.py` (шрифт Inter);
   - у прокси к frontend убраны `ETag`/`Last-Modified`: иначе браузер получал 304 и показывал HTML без вставок Caddy.
6. **Тексты и разметка (28.10.2026).** Там же, в генераторе:
   - «врача ЛФК» → «инструктора-методиста ЛФК» во всём HTML (Вадим не врач, услуги «не являются медицинскими»);
   - новые `<title>`/`description` для `/about`, `/reviews`, `/contacts`, `/products`, `/products/personal-program`
     (заменяется текст, поэтому меняется и в HTML, и в данных для переходов внутри сайта);
   - JSON-LD schema.org перед `</head>`: главная — WebSite, Organization (ИП, ИНН, ОГРНИП, телефон, почта, соцсети), Person;
     `/about` — ProfilePage; `/contacts` — ContactPage; `/products` — ItemList; услуги — Service/Product с ценой; везде хлебные крошки.
     Цены взяты со страниц: консультация 7000, экспресс 4000, тренировка 5000, «Формула Движения» 6000, мениск 8000.
     Отзывы и рейтинг в разметку не добавлены намеренно. **При смене цен на сайте — поправить `svc` в генераторе.**

### Что поправить в исходниках сайта на Mac, чтобы убрать замены из Caddy

- `src/app/layout.tsx`: `metadataBase`, `canonical`, `openGraph.url`, `authors`, `twitter.creator` — `minekovrehab` → `minenkovrehab`;
  коды `verification` вместо `xxxxxxxx`; опечатка «дегенератика» в keywords.
- canonical/`og:url` задавать в каждой странице (`alternates.canonical: '/путь'`), а не наследовать из корневого layout.
- `public/images/og-image.svg` и JPG-превью — взять из `infra/caddy/extras/images/`.
- `public/sitemap.xml` — заменить на `infra/caddy/extras/sitemap.xml`; `/terms` удалить или закрыть от индексации.
- Кнопку «Наверх» и Метрику перенести в layout.

## Деплой с сервера

На сервере есть клон этой ветки: `/opt/rehab-src` (deploy key `hostkey-185.149.147.209`, только чтение).
Порядок: изменения коммитятся в `server-hostkey` → на сервере
`/opt/rehab-src/server-hostkey/infra/scripts/deploy.sh [api|worker|all]`.
Скрипт забирает ветку, собирает образ `rehab-<api|worker>:src-<коммит>` поверх базового (`hk-dd8354d` / `hk-af5284f`, в них node_modules),
переключает сервис, ждёт healthcheck и ответ сайта, при сбое откатывает. Журнал — `/opt/rehab/deploy.log`.
Если меняются зависимости (`package-lock.json`), скрипт останавливается: нужна полная сборка образа.

## Миграции базы

`migrate.js` запускается одноразовым контейнером под ролью `rehab_migrator`. `loadConfig` требует `STAGE1_TEST_PASSWORD2`,
которого нет в `env/migrator.env`, поэтому его передают временным env-файлом:

```sh
cd /opt/rehab; X=$(mktemp); chmod 600 $X; sudo grep '^STAGE1_TEST_PASSWORD2=' env/worker.env > $X
sudo docker run --rm --network rehab_db --env-file env/migrator.env --env-file $X "$(grep ^WORKER_IMAGE= .env | cut -d= -f2)" node timeweb/migrate.js; rm -f $X
```

Применены: 001–006. 006 (27.10.2026) — `admin_outbox` + триггер: уведомление владельцу о каждой оплате
на `MIGRATION_ADMIN_NOTIFY_EMAIL` (в `env/worker.env`, сейчас `info@minenkovrehab.ru`).

## Чего здесь нет намеренно

`env/*.env`, `secrets/`, `certs/`, `lego/`, `.env`, `import/` (дампы базы), `backups/`, `timeweb/runtime-roles.sql`.
Email для Let's Encrypt заменён на заглушку (`<acme-email>` в Caddyfile, `ACME_EMAIL` в `cert-renew.sh`).
