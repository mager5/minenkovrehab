#!/bin/bash
# Устанавливает systemd-таймер ночного бэкапа (03:30 МСК). Запуск: sudo bash scripts/install-backup-timer.sh
set -euo pipefail
cat > /etc/systemd/system/rehab-backup.service <<'EOF'
[Unit]
Description=Minenkov Rehab: nightly database backup
After=docker.service

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/opt/rehab
ExecStart=/bin/bash /opt/rehab/scripts/backup-db.sh
EOF
cat > /etc/systemd/system/rehab-backup.timer <<'EOF'
[Unit]
Description=Minenkov Rehab: nightly database backup

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now rehab-backup.timer
systemctl list-timers rehab-backup.timer --no-pager | head -3
