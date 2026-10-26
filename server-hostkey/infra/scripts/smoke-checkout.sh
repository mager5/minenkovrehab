#!/bin/bash
# Сквозная проверка оформления заказа на сервере от имени тестового покупателя checkout-test@example.invalid.
# Сессия создаётся в БД напрямую (без пароля), живёт 10 минут и отзывается в конце.
set -euo pipefail
cd /opt/rehab
HOST=$(grep '^SITE_HOST=' .env | cut -d= -f2); SITE="https://$HOST"; PRODUCT="${1:-personal-program}"
P=$(cat secrets/rehab_migrator)
q(){ docker compose exec -T -e PGPASSWORD="$P" postgres psql -h 127.0.0.1 -U rehab_migrator -d rehab -At -v ON_ERROR_STOP=1 -c "$1"; }
TOKEN=$(openssl rand -hex 32); HASH=$(printf %s "$TOKEN" | sha256sum | cut -d' ' -f1)
q "INSERT INTO rehab.sessions(token_hash,user_id,expires_at) SELECT '$HASH',id,now()+interval '10 minutes' FROM rehab.users WHERE email='checkout-test@example.invalid'" >/dev/null
JAR=$(mktemp); trap 'rm -f "$JAR"; q "UPDATE rehab.sessions SET revoked_at=now() WHERE token_hash='"'"'$HASH'"'"'" >/dev/null' EXIT
C=(curl -s -m 20 --resolve "$HOST:443:127.0.0.1" -b "mr_session=$TOKEN" -b "$JAR" -c "$JAR")
echo "me:       $("${C[@]}" -o /dev/null -w '%{http_code}' "$SITE/api/auth/me")"
CSRF=$("${C[@]}" -H "origin: $SITE" "$SITE/api/auth/csrf" | sed -n 's/.*"csrfToken":"\([a-f0-9]*\)".*/\1/p')
echo "csrf:     ${CSRF:+получен}"
R=$("${C[@]}" -X POST -H "origin: $SITE" -H "sec-fetch-site: same-origin" -H "content-type: application/json" -H "x-csrf-token: $CSRF" \
   -d "{\"productId\":\"$PRODUCT\",\"agreement\":true}" -w '\n%{http_code}' "$SITE/api/checkout")
echo "checkout: $(echo "$R" | tail -1)"; echo "$R" | head -1 | sed -E 's/SignatureValue=[a-f0-9]+/SignatureValue=…/' | cut -c1-400
