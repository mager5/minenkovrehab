#!/bin/bash
# Деплой фронтенда (Next.js) из GitHub: собирает образ из ветки (по умолчанию master) и выкатывает
# с проверкой здоровья и страниц; при ошибке возвращает прежний образ.
#   /opt/rehab/scripts/deploy-frontend.sh            # master
#   /opt/rehab/scripts/deploy-frontend.sh <ветка>
#   SKIP_INDEXNOW=1 /opt/rehab/scripts/deploy-frontend.sh <ветка>   # без отправки URL в IndexNow
# Откат на прежний образ: /opt/rehab/scripts/rollback-frontend.sh
set -euo pipefail
BRANCH=${1:-master}
SRC=/opt/rehab-src
APP=/opt/rehab
LOG=$APP/deploy.log

cd "$SRC"
git fetch -q origin "$BRANCH"
SHA=$(git rev-parse --short=7 FETCH_HEAD)
TAG=rehab-frontend:src-$SHA
echo "$(date -Is) frontend: $BRANCH $SHA — старт" | tee -a "$LOG"

if ! sudo docker image inspect "$TAG" >/dev/null 2>&1; then
  BUILD=$(mktemp -d)
  git archive FETCH_HEAD | tar -x -C "$BUILD"
  sudo docker build --label org.opencontainers.image.revision="$(git rev-parse FETCH_HEAD)" \
    --label org.opencontainers.image.ref.name="$BRANCH" \
    -f "$BUILD/deploy/timeweb/frontend.Dockerfile" -t "$TAG" "$BUILD"
  rm -rf "$BUILD"
fi

cd "$APP"
OLD=$(grep '^FRONTEND_IMAGE=' .env | cut -d= -f2)
if [ "$OLD" = "$TAG" ]; then
  echo "уже работает $TAG" | tee -a "$LOG"; exit 0
fi
TS=$(date +%Y%m%d-%H%M%S)
cp .env ".env.bak-$TS"

rollback() {
  echo "$(date -Is) frontend: ОТКАТ на $OLD — $1" | tee -a "$LOG"
  cat ".env.bak-$TS" > .env
  sudo docker compose up -d frontend </dev/null
  exit 1
}

sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=$TAG|" .env
sudo docker compose up -d frontend </dev/null
st=""
for _ in $(seq 1 40); do
  st=$(sudo docker inspect -f '{{.State.Health.Status}}' "$(sudo docker compose ps -q frontend </dev/null)" 2>/dev/null || true)
  [ "$st" = healthy ] && break
  sleep 3
done
[ "$st" = healthy ] || rollback "контейнер не стал healthy"

C="curl -sk --resolve minenkovrehab.ru:443:127.0.0.1 -o /dev/null -w %{http_code}"
for u in / /products /products/meniscus-resection /about /contacts /sitemap.xml /robots.txt; do
  code=$($C "https://minenkovrehab.ru$u")
  [ "$code" = 200 ] || rollback "$u ответил $code"
done

echo "$SHA $BRANCH $(date -Is)" > "$APP/FRONTEND_COMMIT"
echo "$(date -Is) frontend: $TAG выкачен (был $OLD)" | tee -a "$LOG"

# IndexNow: сообщить Яндексу обо всех URL из sitemap. Сбой отправки деплой не ломает.
if [ "${SKIP_INDEXNOW:-0}" = 1 ]; then
  echo "$(date -Is) indexnow: пропущено (SKIP_INDEXNOW=1)" | tee -a "$LOG"; exit 0
fi
"$APP/scripts/indexnow-submit.sh" || echo "$(date -Is) indexnow: не отправлено (деплой при этом успешен)" | tee -a "$LOG"
