#!/bin/bash
# Деплой backend/worker из ветки server-hostkey на HostKey.
#   /opt/rehab-src  — клон репозитория (только чтение, deploy key), руками там ничего не правим
#   /opt/rehab      — compose, env, секреты (в git не попадают)
# Запуск:  /opt/rehab-src/server-hostkey/infra/scripts/deploy.sh [api|worker|all]   (по умолчанию all)
# Образ собирается поверх базового (в нём уже есть node_modules): меняется только код.
# Если поменялись зависимости (package-lock.json) — скрипт остановится: такой образ надо собирать полностью.
# После переключения ждём healthcheck контейнера и ответ сайта; если не дождались — откат на прежний образ.
set -euo pipefail

SRC=/opt/rehab-src
APP=/opt/rehab
BRANCH=server-hostkey
LOG=$APP/deploy.log
TARGET=${1:-all}

API_BASE=rehab-api:hk-dd8354d
WORKER_BASE=rehab-worker:hk-af5284f

exec 9>/tmp/rehab-deploy.lock
flock -n 9 || { echo "Деплой уже идёт"; exit 1; }

log() { echo "$(date '+%F %T') $*" | tee -a "$LOG"; }

cd "$SRC"
git fetch -q origin "$BRANCH"
git reset -q --hard "origin/$BRANCH"
SHA=$(git rev-parse --short HEAD)
log "== деплой $TARGET, коммит $SHA ($(git log -1 --format=%s))"

env_get() { grep "^$1=" "$APP/.env" | cut -d= -f2-; }
env_set() { sed -i "s#^$1=.*#$1=$2#" "$APP/.env"; }

site_ok() {
  local code
  code=$(curl -sk -o /dev/null -w '%{http_code}' --resolve minenkovrehab.ru:443:127.0.0.1 https://minenkovrehab.ru/ || true)
  [ "$code" = 200 ]
}

wait_healthy() {
  local svc=$1 i cid st
  for i in $(seq 1 30); do
    cid=$(sudo docker compose -f "$APP/compose.yaml" --project-directory "$APP" ps -q "$svc" </dev/null)
    st=$(sudo docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || echo none)
    [ "$st" = healthy ] && return 0
    [ "$st" = unhealthy ] && return 1
    sleep 3
  done
  return 1
}

deploy_one() {
  local name=$1 dir=$2 base=$3 var=$4 svc=$5
  local tag="rehab-$name:src-$SHA" prev ctx
  prev=$(env_get "$var")
  if [ "$prev" = "$tag" ]; then log "$svc: уже на $tag"; return 0; fi

  # Зависимости должны совпадать с базовым образом.
  if ! sudo docker run --rm --entrypoint cat "$base" /app/package-lock.json </dev/null | cmp -s - "$SRC/$dir/package-lock.json"; then
    log "$svc: package-lock.json отличается от $base — нужна полная сборка образа, деплой остановлен"; return 1
  fi

  ctx=$(mktemp -d)
  cp -a "$SRC/$dir/timeweb" "$SRC/$dir/utils" "$ctx/"
  printf 'FROM %s\nCOPY timeweb /app/timeweb\nCOPY utils /app/utils\n' "$base" > "$ctx/Dockerfile"
  sudo docker build -q -t "$tag" "$ctx" </dev/null >/dev/null
  rm -rf "$ctx"
  sudo docker run --rm --entrypoint node "$tag" -e "require('/app/timeweb/app.js');require('/app/timeweb/queue-worker.js')" </dev/null >/dev/null

  cp "$APP/.env" "$APP/.env.bak-deploy"
  env_set "$var" "$tag"
  (cd "$APP" && sudo docker compose up -d "$svc" </dev/null >/dev/null 2>&1)
  if wait_healthy "$svc" && site_ok; then
    log "$svc: $prev -> $tag OK"
  else
    log "$svc: $tag не поднялся, откат на $prev"
    env_set "$var" "$prev"
    (cd "$APP" && sudo docker compose up -d "$svc" </dev/null >/dev/null 2>&1)
    wait_healthy "$svc" || true
    return 1
  fi
}

case "$TARGET" in
  api)    deploy_one api    server-hostkey/api    "$API_BASE"    API_IMAGE    backend ;;
  worker) deploy_one worker server-hostkey/worker "$WORKER_BASE" WORKER_IMAGE worker ;;
  all)    deploy_one api    server-hostkey/api    "$API_BASE"    API_IMAGE    backend
          deploy_one worker server-hostkey/worker "$WORKER_BASE" WORKER_IMAGE worker ;;
  *) echo "usage: deploy.sh [api|worker|all]"; exit 2 ;;
esac
log "== готово"
