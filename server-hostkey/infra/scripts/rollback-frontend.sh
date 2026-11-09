#!/bin/bash
# Откат боевого фронтенда на прежний образ без пересборки (~30 секунд).
#   /opt/rehab/scripts/rollback-frontend.sh            # на образ, который был до последнего деплоя
#   /opt/rehab/scripts/rollback-frontend.sh <образ>    # например rehab-frontend:src-d3a351b
# Список доступных образов: sudo docker images rehab-frontend
set -euo pipefail
APP=/opt/rehab
LOG=$APP/deploy.log
cd "$APP"
CUR=$(grep '^FRONTEND_IMAGE=' .env | cut -d= -f2)
TARGET=${1:-}
if [ -z "$TARGET" ]; then
  TARGET=$(grep "frontend: .* выкачен (был " "$LOG" | tail -1 | sed -E 's/.*\(был ([^)]+)\).*/\1/')
fi
[ -n "$TARGET" ] || { echo "Не найден прежний образ — укажите его аргументом"; exit 1; }
sudo docker image inspect "$TARGET" >/dev/null || { echo "Образа $TARGET нет на сервере"; exit 1; }
cp .env ".env.bak-rollback-$(date +%Y%m%d-%H%M%S)"
sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=$TARGET|" .env
sudo docker compose up -d frontend </dev/null
for _ in $(seq 1 40); do
  st=$(sudo docker inspect -f '{{.State.Health.Status}}' "$(sudo docker compose ps -q frontend </dev/null)" 2>/dev/null || true)
  [ "$st" = healthy ] && break; sleep 3
done
code=$(curl -sk --resolve minenkovrehab.ru:443:127.0.0.1 -o /dev/null -w '%{http_code}' https://minenkovrehab.ru/)
echo "$(date -Is) frontend: ОТКАТ $CUR -> $TARGET (health=$st, / -> $code)" | tee -a "$LOG"
