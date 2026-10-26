#!/bin/bash
# Заменяет схему rehab на содержимое import/rehab-prod.dump. Перед этим — копия текущей базы в backups/.
# Запускать на сервере: sudo systemd-run --unit=rehab-reload --collect --uid=ubuntu bash /opt/rehab/scripts/reload-db.sh
set -euo pipefail
cd /opt/rehab
exec > /opt/rehab/reload-db.log 2>&1
echo "start $(date)"
P=$(cat secrets/rehab_migrator)
X(){ docker compose exec -T -e PGPASSWORD="$P" postgres "$@"; }
mkdir -p backups; chmod 700 backups
X pg_dump -h 127.0.0.1 -U rehab_migrator -d rehab --schema=rehab -Fc > "backups/before-reload-$(date +%Y%m%d-%H%M).dump"
docker compose stop backend worker
docker compose cp import/rehab-prod.dump postgres:/tmp/p.dump
X psql -h 127.0.0.1 -U rehab_migrator -d rehab -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA rehab CASCADE"
X pg_restore -h 127.0.0.1 -U rehab_migrator -d rehab --no-owner --no-privileges --exit-on-error /tmp/p.dump
X rm -f /tmp/p.dump
X psql -h 127.0.0.1 -U rehab_migrator -d rehab -v ON_ERROR_STOP=1 -q < import/roles.sql
for t in users profiles products purchases orders credentials; do printf "%s=" $t; X psql -h 127.0.0.1 -U rehab_migrator -d rehab -At -c "select count(*) from rehab.$t"; done
docker compose up -d --pull never backend worker
echo "done $(date)"
