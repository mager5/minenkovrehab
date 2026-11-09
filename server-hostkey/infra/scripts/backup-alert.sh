#!/bin/bash
# Письмо о сбое ночного бэкапа. Запускает systemd (OnFailure у rehab-backup.service).
# Отправка напрямую через SMTP Reg.ru (env/mail.env), без базы и worker — работает, даже если база недоступна.
# Получатель — MIGRATION_ADMIN_NOTIFY_EMAIL из env/worker.env (по умолчанию info@minenkovrehab.ru).
# Проверка отправки: sudo /opt/rehab/scripts/backup-alert.sh --test
set -euo pipefail
cd /opt/rehab
get() { grep -m1 "^$1=" "$2" 2>/dev/null | cut -d= -f2- || true; }
HOST=$(get SMTP_HOST env/mail.env); PORT=$(get SMTP_PORT env/mail.env)
USER_=$(get SMTP_USER env/mail.env); PASS=$(get SMTP_PASSWORD env/mail.env); FROM=$(get SMTP_FROM env/mail.env)
TO=$(get MIGRATION_ADMIN_NOTIFY_EMAIL env/worker.env); TO=${TO:-info@minenkovrehab.ru}
FROM=${FROM:-$USER_}
FROM_ADDR=$(printf '%s' "$FROM" | grep -oE '[^<> ]+@[^<> ]+' | head -1)
[ -n "$HOST" ] && [ -n "$USER_" ] && [ -n "$PASS" ] && [ -n "$FROM_ADDR" ] || { echo "backup-alert: SMTP не настроен в env/mail.env" >&2; exit 1; }

if [ "${1:-}" = "--test" ]; then
  SUBJECT="[ТЕСТ] Проверка уведомления о бэкапе minenkovrehab.ru"
  INTRO="Это тестовое письмо: проверка, что уведомления о сбое ночного бэкапа доходят. Ничего делать не нужно."
else
  SUBJECT="Ночной бэкап базы minenkovrehab.ru НЕ сделан"
  INTRO="Ночной бэкап базы на сервере 185.149.147.209 завершился ошибкой или получился подозрительно маленьким. Копия не сохранена."
fi
WORK=$(mktemp -d); chmod 700 "$WORK"; trap 'rm -rf "$WORK"' EXIT
{
  printf 'From: %s\r\nTo: %s\r\nSubject: =?UTF-8?B?%s?=\r\nDate: %s\r\nMessage-ID: <backup-%s@minenkovrehab.ru>\r\n' \
    "$FROM" "$TO" "$(printf '%s' "$SUBJECT" | base64 -w0)" "$(LC_ALL=C date -R)" "$(date +%s%N)"
  printf 'MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n'
  echo "$INTRO"
  echo
  echo "Время: $(TZ=Europe/Moscow date '+%d.%m.%Y %H:%M') МСК"
  echo
  echo "Последние строки журнала бэкапа:"
  journalctl -u rehab-backup.service -n 15 --no-pager -o short-iso 2>/dev/null | sed 's/^/  /' || true
  echo
  echo "Последние удачные копии:"
  ls -lt --time-style='+%d.%m.%Y %H:%M' backups/rehab-*.dump 2>/dev/null | head -5 | awk '{print "  "$6" "$7"  "$5" байт  "$8}' || true
  echo
  echo "Что сделать: проверить вручную — sudo systemctl start rehab-backup.service; sudo journalctl -u rehab-backup.service -n 20"
} > "$WORK/msg"
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
printf 'user = "%s:%s"\n' "$(esc "$USER_")" "$(esc "$PASS")" > "$WORK/curlrc"
curl -sS --ssl-reqd --max-time 60 -K "$WORK/curlrc" --url "smtps://$HOST:${PORT:-465}" \
  --mail-from "$FROM_ADDR" --mail-rcpt "$TO" --upload-file "$WORK/msg"
echo "backup-alert: письмо отправлено на $TO"
