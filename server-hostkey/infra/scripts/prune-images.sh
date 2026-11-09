#!/bin/bash
# Чистка старых образов после удачной выкладки: оставляет KEEP последних сборок репозитория,
# образ, который сейчас работает, и закреплённые теги (PINNED). Плюс кэш сборки старше 3 суток.
#   prune-images.sh <репозиторий> [KEEP=3] [закреплённые теги через пробел]
# Пример: prune-images.sh rehab-frontend 3 src-d3a351b
# Удаляет только образы, которые не используются контейнерами (docker rmi без -f).
set -u
REPO=$1; KEEP=${2:-3}; shift 2 2>/dev/null || shift $#; PINNED=" $* "
LOG=/opt/rehab/deploy.log
USED=$(sudo docker ps -a --format '{{.Image}}')
n=0; removed=0
while read -r tag; do
  n=$((n + 1))
  [ "$n" -le "$KEEP" ] && continue
  case "$PINNED" in *" $tag "*) continue ;; esac
  echo "$USED" | grep -qx "$REPO:$tag" && continue
  sudo docker rmi "$REPO:$tag" >/dev/null 2>&1 && removed=$((removed + 1))
done < <(sudo docker images "$REPO" --format '{{.CreatedAt}}\t{{.Tag}}' | sort -r | cut -f2)
sudo docker builder prune -f --filter until=72h >/dev/null 2>&1 || true
echo "$(date -Is) prune: $REPO — удалено старых образов: $removed, свободно на диске: $(df -h / | awk 'NR==2{print $4}')" | tee -a "$LOG"
