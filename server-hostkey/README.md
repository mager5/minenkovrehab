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
| `infra/caddy/` | `/opt/rehab/Caddyfile`, `patches/rx/Dockerfile`, `extras/rx-scroll-top.js` | Caddy с модулем `replace-response` и кнопка «Наверх» |
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

## Деплой с сервера

На сервере есть клон этой ветки: `/opt/rehab-src` (deploy key `hostkey-185.149.147.209`, только чтение).
Порядок: изменения коммитятся в `server-hostkey` → на сервере
`/opt/rehab-src/server-hostkey/infra/scripts/deploy.sh [api|worker|all]`.
Скрипт забирает ветку, собирает образ `rehab-<api|worker>:src-<коммит>` поверх базового (`hk-dd8354d` / `hk-af5284f`, в них node_modules),
переключает сервис, ждёт healthcheck и ответ сайта, при сбое откатывает. Журнал — `/opt/rehab/deploy.log`.
Если меняются зависимости (`package-lock.json`), скрипт останавливается: нужна полная сборка образа.

## Чего здесь нет намеренно

`env/*.env`, `secrets/`, `certs/`, `lego/`, `.env`, `import/` (дампы базы), `backups/`, `timeweb/runtime-roles.sql`.
Email для Let's Encrypt заменён на заглушку (`<acme-email>` в Caddyfile, `ACME_EMAIL` в `cert-renew.sh`).
