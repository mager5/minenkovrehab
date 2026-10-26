#!/bin/bash
# На сервере после первого старта postgres: создаёт LOGIN-роли без лишних прав. Пароли берутся из secrets/.
set -euo pipefail
cd /opt/rehab
psql(){ docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U rehab_owner -d rehab -q "$@"; }
for r in rehab_migrator rehab_payment rehab_auth rehab_worker; do
  p=$(cat secrets/$r)
  psql <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='$r') THEN
    CREATE ROLE $r LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '$p';
  ELSE ALTER ROLE $r PASSWORD '$p'; END IF;
END \$\$;
SQL
done
psql <<'SQL'
REVOKE ALL ON DATABASE rehab FROM PUBLIC;
GRANT CONNECT ON DATABASE rehab TO rehab_migrator,rehab_payment,rehab_auth,rehab_worker;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CREATE ON DATABASE rehab TO rehab_migrator;
GRANT USAGE, CREATE ON SCHEMA public TO rehab_migrator;
SQL
echo "roles ready"
