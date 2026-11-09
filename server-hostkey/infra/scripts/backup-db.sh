#!/bin/bash
# Ночная копия базы (схема rehab + журнал миграций) в /opt/rehab/backups, хранится 14 дней.
# Ставится таймером: scripts/install-backup-timer.sh. Копии забирает на Мак LaunchAgent (rsync).
# Проверки: pg_dump без ошибок, копия читается (pg_restore --list), размер не меньше MIN_BYTES
# и не меньше половины прошлой удачной копии. Любая ошибка — код 1, и systemd запускает
# rehab-backup-alert.service (письмо на MIGRATION_ADMIN_NOTIFY_EMAIL). Недописанный .tmp всегда удаляется.
set -euo pipefail
cd /opt/rehab
MIN_BYTES=${MIN_BYTES:-20000}
mkdir -p backups && chmod 700 backups
F="backups/rehab-$(date +%Y%m%d-%H%M).dump"
trap 'rm -f "$F.tmp"' EXIT
find backups -maxdepth 1 -name 'rehab-*.dump.tmp' -mmin +60 -delete
PREV=$(ls -1t backups/rehab-*.dump 2>/dev/null | head -1 || true)
P=$(cat secrets/rehab_migrator)
docker compose exec -T -e PGPASSWORD="$P" postgres pg_dump -h 127.0.0.1 -U rehab_migrator -d rehab \
  --schema=rehab --schema=public -Fc > "$F.tmp"
# Проверка, что копия читается
docker compose exec -T postgres pg_restore --list < "$F.tmp" > /dev/null
SIZE=$(stat -c %s "$F.tmp")
if [ "$SIZE" -lt "$MIN_BYTES" ]; then
  echo "backup FAILED: размер копии $SIZE байт — меньше минимума $MIN_BYTES"; exit 1
fi
if [ -n "$PREV" ]; then
  PS=$(stat -c %s "$PREV")
  if [ $((SIZE * 2)) -lt "$PS" ]; then
    echo "backup FAILED: размер копии $SIZE байт — меньше половины прошлой ($PREV, $PS байт)"; exit 1
  fi
fi
mv "$F.tmp" "$F"; chmod 600 "$F"
find backups -maxdepth 1 -name 'rehab-*.dump' -mtime +14 -delete
echo "backup ok: $F $SIZE bytes"
