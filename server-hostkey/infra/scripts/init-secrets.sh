#!/bin/bash
# Запускается НА СЕРВЕРЕ один раз: генерирует пароли БД и ключи, пишет env-файлы (600).
# Повторный запуск ничего не перезаписывает. Секреты не выводятся.
set -euo pipefail
cd /opt/rehab
SITE_HOST="${1:?usage: init-secrets.sh <host> e.g. new.minenkovrehab.ru}"
umask 077
mkdir -p secrets env
gen(){ [ -s "secrets/$1" ] || openssl rand -hex 24 > "secrets/$1"; }
for r in pg_owner_password rehab_migrator rehab_payment rehab_auth rehab_worker; do gen "$r"; done
[ -s secrets/reset_key ] || openssl rand -hex 32 > secrets/reset_key
pw(){ cat "secrets/$1"; }
url(){ echo "postgresql://$1:$(pw $1)@postgres:5432/rehab"; }
common="MIGRATION_ENV=vps
MIGRATION_VPS_CONFIRM=hostkey-minenkov-rehab
MIGRATION_SITE_ORIGIN=https://${SITE_HOST}
MIGRATION_RESET_KEY=$(pw reset_key)
MIGRATION_DATABASE_URL=$(url rehab_payment)"
[ -s env/backend.env ] || printf '%s\nMIGRATION_AUTH_DATABASE_URL=%s\nMIGRATION_VIDEO_PROVIDER=disabled\nSTAGE1_PORT=3101\nNODE_ENV=production\n' "$common" "$(url rehab_auth)" > env/backend.env
[ -s env/worker.env ] || printf '%s\nMIGRATION_AUTH_DATABASE_URL=%s\nMIGRATION_WORKER_DATABASE_URL=%s\nMIGRATION_MAIL_PROVIDER=test\nMIGRATION_MAIL_NETWORK_ENABLED=false\nMIGRATION_WORKER_PORT=3102\nNODE_ENV=production\n' "$common" "$(url rehab_auth)" "$(url rehab_worker)" > env/worker.env
[ -s env/migrator.env ] || printf '%s\nMIGRATION_AUTH_DATABASE_URL=%s\nMIGRATION_MIGRATOR_DATABASE_URL=%s\nMIGRATION_MIGRATION_CONFIRM=isolated-rehab-schema\n' "$common" "$(url rehab_auth)" "$(url rehab_migrator)" > env/migrator.env
[ -s env/frontend.env ] || printf 'MIGRATION_ENV=vps\nMIGRATION_SITE_ORIGIN=https://%s\nMIGRATION_API_INTERNAL_URL=http://backend:3101\nNODE_ENV=production\nNEXT_TELEMETRY_DISABLED=1\n' "$SITE_HOST" > env/frontend.env
# Заглушка пароля №2: без настоящего (env/robokassa.env) уведомления Робокассы просто не пройдут проверку подписи.
for f in env/backend.env env/worker.env; do grep -q '^STAGE1_TEST_PASSWORD2=' "$f" || echo "STAGE1_TEST_PASSWORD2=$(openssl rand -hex 32)" >> "$f"; done
# Робокасса: заполняется отдельно (scripts/set-robokassa.sh). Пустой файл = оплата не настроена.
[ -e env/robokassa.env ] || : > env/robokassa.env
[ -s .env ] || printf 'SITE_HOST=%s\n' "$SITE_HOST" > .env
chmod 600 secrets/* env/* .env
chmod 644 secrets/pg_owner_password  # читает postgres внутри контейнера (uid 999); каталог secrets закрыт 700
echo "secrets ready for $SITE_HOST"
