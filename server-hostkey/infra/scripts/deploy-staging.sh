#!/bin/bash
# Обновление тестовой копии new.minenkovrehab.ru из ветки redesign (или другой) одной командой:
#   /opt/rehab/scripts/deploy-staging.sh            # redesign
#   /opt/rehab/scripts/deploy-staging.sh <ветка>
# Собирает образ rehab-frontend-staging:src-<sha> с NEXT_PUBLIC_PAYMENTS_DISABLED=1 (оплата отключена),
# перезапускает только контейнер rehab-staging (боевой frontend не трогает), проверяет здоровье и ответы,
# при сбое возвращает прежний образ. IndexNow не отправляет.
set -euo pipefail
BRANCH=${1:-redesign}
SRC=/opt/rehab-src
STG=/opt/rehab/staging
LOG=/opt/rehab/deploy.log
DC="sudo docker compose --project-directory $STG -f $STG/compose.yaml"

cd "$SRC"
git fetch -q origin "$BRANCH"
SHA=$(git rev-parse --short=7 FETCH_HEAD)
TAG=rehab-frontend-staging:src-$SHA
echo "$(date -Is) staging: $BRANCH $SHA — старт" | tee -a "$LOG"

if ! sudo docker image inspect "$TAG" >/dev/null 2>&1; then
  BUILD=$(mktemp -d)
  git archive FETCH_HEAD | tar -x -C "$BUILD"
  sudo docker build --build-arg NEXT_PUBLIC_PAYMENTS_DISABLED=1 \
    --label org.opencontainers.image.revision="$(git rev-parse FETCH_HEAD)" \
    --label org.opencontainers.image.ref.name="$BRANCH" \
    -f "$BUILD/deploy/timeweb/frontend.Dockerfile" -t "$TAG" "$BUILD"
  rm -rf "$BUILD"
fi

OLD=$(grep -s '^STAGING_IMAGE=' "$STG/.env" | cut -d= -f2 || true)
if [ "$OLD" = "$TAG" ] && [ -n "$($DC ps -q frontend-staging </dev/null)" ]; then
  echo "staging: уже работает $TAG" | tee -a "$LOG"; exit 0
fi

rollback() {
  echo "$(date -Is) staging: ОТКАТ на ${OLD:-ничего} — $1" | tee -a "$LOG"
  if [ -n "$OLD" ]; then echo "STAGING_IMAGE=$OLD" > "$STG/.env"; $DC up -d frontend-staging </dev/null; fi
  exit 1
}

echo "STAGING_IMAGE=$TAG" > "$STG/.env"
$DC up -d frontend-staging </dev/null
st=""
for _ in $(seq 1 40); do
  st=$(sudo docker inspect -f '{{.State.Health.Status}}' "$($DC ps -q frontend-staging </dev/null)" 2>/dev/null || true)
  [ "$st" = healthy ] && break
  sleep 3
done
[ "$st" = healthy ] || rollback "контейнер не стал healthy"

# Страницы изнутри контейнера (минуя basic auth Caddy).
for u in / /products /products/formula-movement /about /contacts /login; do
  code=$($DC exec -T frontend-staging node -e "fetch('http://127.0.0.1:3000$u',{redirect:'manual'}).then(r=>console.log(r.status)).catch(()=>console.log(0))" </dev/null)
  [ "$code" = 200 ] || rollback "$u ответил $code"
done
# Снаружи без пароля — только 401.
code=$(curl -sk --resolve new.minenkovrehab.ru:443:127.0.0.1 -o /dev/null -w '%{http_code}' https://new.minenkovrehab.ru/)
[ "$code" = 401 ] || echo "$(date -Is) staging: ВНИМАНИЕ — без пароля ответ $code, ожидался 401" | tee -a "$LOG"

echo "$(date -Is) staging: $TAG выкачен (был ${OLD:-ничего})" | tee -a "$LOG"
