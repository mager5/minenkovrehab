#!/bin/bash
# Выпуск/продление сертификата Let's Encrypt через lego (HTTP-01, webroot, который отдаёт Caddy).
# Если API Let's Encrypt с сервера недоступен — использует SOCKS-прокси 127.0.0.1:1080,
# который поднимает Мак командой: ssh -N -R 127.0.0.1:1080 minenkov-rehab
# Запуск: scripts/cert-renew.sh          (продлит, если осталось < 30 дней; выпустит, если нет)
set -euo pipefail
cd /opt/rehab
HOST=$(grep '^SITE_HOST=' .env | cut -d= -f2)
EMAIL="${ACME_EMAIL:?set ACME_EMAIL}"
LE=https://acme-v02.api.letsencrypt.org/directory
if curl -s -m 10 -o /dev/null "$LE"; then echo "LE: напрямую"; unset HTTPS_PROXY
elif curl -s -m 10 -o /dev/null --socks5-hostname 127.0.0.1:1080 "$LE"; then echo "LE: через туннель с Мака"; export HTTPS_PROXY=socks5://127.0.0.1:1080
else echo "LE недоступен ни напрямую, ни через туннель (запусти на Маке: ssh -N -R 127.0.0.1:1080 minenkov-rehab)"; exit 2; fi
ARGS=(--accept-tos --email "$EMAIL" --path /opt/rehab/lego --domains "$HOST" --http --http.webroot /opt/rehab/acme-webroot)
if [ -s "lego/certificates/$HOST.crt" ]; then lego "${ARGS[@]}" renew --days 30; else lego "${ARGS[@]}" run; fi
install -m 644 "lego/certificates/$HOST.crt" certs/site.crt
install -m 640 "lego/certificates/$HOST.key" certs/site.key
openssl x509 -in certs/site.crt -noout -subject -enddate
