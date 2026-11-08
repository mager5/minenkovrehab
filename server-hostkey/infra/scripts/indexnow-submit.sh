#!/bin/bash
# IndexNow для Яндекса: отправляет все URL из sitemap.xml в https://yandex.com/indexnow.
# Ключ — публичный файл https://minenkovrehab.ru/<KEY>.txt (лежит в public/ сайта).
# Вызывается из deploy-frontend.sh после успешного деплоя; можно запускать и вручную:
#   /opt/rehab/scripts/indexnow-submit.sh
# Ошибки не валят вызывающий скрипт: deploy-frontend.sh вызывает его через «|| true».
set -uo pipefail
HOST=minenkovrehab.ru
KEY=bcc8f8593ece76dda52e5a727c39f4b8
ENDPOINT=https://yandex.com/indexnow
LOG=/opt/rehab/deploy.log
C="curl -sk --max-time 20 --resolve $HOST:443:127.0.0.1"

log() { echo "$(date -Is) indexnow: $*" | tee -a "$LOG"; }

key_body=$($C "https://$HOST/$KEY.txt") || { log "файл ключа недоступен"; exit 1; }
[ "$key_body" = "$KEY" ] || { log "файл ключа не совпадает с ключом"; exit 1; }

urls=$($C "https://$HOST/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g')
n=$(printf '%s\n' "$urls" | grep -c .)
[ "$n" -gt 0 ] || { log "в sitemap.xml нет URL"; exit 1; }

body=$(printf '%s\n' "$urls" | jq -R . | jq -s --arg host "$HOST" --arg key "$KEY" \
  --arg loc "https://$HOST/$KEY.txt" '{host:$host, key:$key, keyLocation:$loc, urlList:.}')

resp=$(curl -s --max-time 30 -o /tmp/indexnow-resp.txt -w '%{http_code}' \
  -H 'Content-Type: application/json; charset=utf-8' -d "$body" "$ENDPOINT") || resp=000
log "отправлено URL: $n, ответ $ENDPOINT: HTTP $resp $(head -c 300 /tmp/indexnow-resp.txt 2>/dev/null | tr '\n' ' ')"
[ "$resp" = 200 ] || [ "$resp" = 202 ]
