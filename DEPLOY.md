# Выкладка minenkovrehab.ru

Инструкция для агентов, работающих с этим репозиторием.

## Сервер

- Сервер сайта: **185.149.147.209** (HostKey), пользователь `ubuntu`, ключ на Маке `~/.ssh/minenkov_rehab`.
- Подключаться только так, по IP:
  `ssh -i ~/.ssh/minenkov_rehab -o IdentitiesOnly=yes -o BatchMode=yes ubuntu@185.149.147.209`
- Другие адреса:
  - **77.91.72.97 — это не сервер сайта.** Если в `~/.ssh/config` у `Host minenkov-rehab` указан `HostName 77.91.72.97`, исправьте на `185.149.147.209`.
  - `77.91.72.36` — сервер radar152, его не трогать.
- Не подключаться по имени `minenkovrehab.ru`: на Маке VPN подменяет DNS (отдаёт 240.x).
- На сервере не трогать: radar152, `/avatar`, «помощников», чужие контейнеры. Блок Caddy для `new.minenkovrehab.ru` менять только по прямой задаче.

## Ветки и коммиты

- **Боевой сайт собирается из `master`.**
- Тестовая копия new.minenkovrehab.ru собирается из любой ветки.
- Коммиты только от `mager5 <132098062+mager5@users.noreply.github.com>`.
- В `master` вливать без потерь: fast-forward или merge. Не делать force-push и rebase опубликованных коммитов.
- Бэкенд (API, worker) живёт в ветке `server-hostkey`, папки `server-hostkey/api` и `server-hostkey/worker`. Папка `robokassa-api/` в master боевым бэкендом **не** является.

## 1. Сначала тестовая копия

```bash
ssh … ubuntu@185.149.147.209 '/opt/rehab/scripts/deploy-staging.sh <ветка>'
```

- Сборка идёт 6–8 минут. Скрипт сам проверяет здоровье контейнера и страницы, при ошибке возвращает прежний образ.
- Тестовая копия: noindex, без Метрики и IndexNow, заявки уходят с пометкой «[ТЕСТ new]».
- Оплата на тестовой копии **боевая**: платёж настоящий. Самим не оплачивать.

## 2. Выкладка на боевой

```bash
# 1) влить ветку в master и запушить
git fetch origin && git checkout master && git merge --ff-only origin/<ветка> && git push origin master
# 2) выкатить (долгое — в фоне, ход смотреть в /opt/rehab/deploy.log)
ssh … ubuntu@185.149.147.209 'nohup setsid /opt/rehab/scripts/deploy-frontend.sh master >/dev/null 2>&1 </dev/null &'
ssh … ubuntu@185.149.147.209 'tail -5 /opt/rehab/deploy.log'
```

- **Без ошибок** в логе появится строка `frontend: rehab-frontend:src-<коммит> выкачен (был …)`, затем отправка адресов в IndexNow.
- **При ошибке** сборки или проверки страниц скрипт сам вернёт прежнюю версию: в логе будет `ОТКАТ`.
- Если адреса страниц не менялись, IndexNow можно пропустить: `SKIP_INDEXNOW=1 /opt/rehab/scripts/deploy-frontend.sh master`.
- Если нужен и бэкенд, он выкатывается **раньше** фронтенда:
  - `/opt/rehab-src/server-hostkey/infra/scripts/deploy.sh api|worker|all` (собирает из ветки `server-hostkey`);
  - миграции — по README ветки `server-hostkey`.

## 3. Проверка после выкладки

- Главная, /about, /products, /products/meniscus-resection, услуга, /reviews, /contacts, 404. Смотреть на десктопе и на ширине 390 px, консоль без ошибок.
- SEO не должно измениться: один canonical на свой адрес, правильный title, нет noindex и X-Robots-Tag, robots.txt и sitemap.xml как раньше.
- Покупка: дойти до перехода на auth.robokassa.ru и **не оплачивать**.
- Форма заявки: одна заявка с именем «[ТЕСТ …]», должна прийти на info@minenkovrehab.ru.
- Метрика загружается только после «Принять» в баннере cookie.
- Пароли на боевом сайте не вводить. Вход в кабинет проверяет владелец тестовым аккаунтом.

## 4. Откат (~30 секунд, без пересборки)

```bash
ssh … ubuntu@185.149.147.209 '/opt/rehab/scripts/rollback-frontend.sh'          # на предыдущую версию
ssh … ubuntu@185.149.147.209 '/opt/rehab/scripts/rollback-frontend.sh rehab-frontend:src-<коммит>'
ssh … ubuntu@185.149.147.209 'sudo docker images rehab-frontend'               # какие версии есть
```

Если что-то сломалось — сразу откат, потом отчёт.
