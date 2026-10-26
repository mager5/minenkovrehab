#!/bin/bash
# Ночная копия базы (схема rehab + журнал миграций) в /opt/rehab/backups, хранится 14 дней.
# Ставится таймером: scripts/install-backup-timer.sh. Копии забирает на Мак LaunchAgent (rsync).
set -euo pipefail
cd /opt/rehab
P=$(cat secrets/rehab_migrator)
mkdir -p backups && chmod 700 backups
F="backups/rehab-$(date +%Y%m%d-%H%M).dump"
docker compose exec -T -e PGPASSWORD="$P" postgres pg_dump -h 127.0.0.1 -U rehab_migrator -d rehab \
  --schema=rehab --schema=public -Fc > "$F.tmp"
# Проверка, что копия читается
docker compose exec -T postgres pg_restore --list < "$F.tmp" > /dev/null
mv "$F.tmp" "$F"; chmod 600 "$F"
find backups -name 'rehab-*.dump' -mtime +14 -delete
echo "backup ok: $F $(stat -c %s "$F") bytes"
