import html
D='https://minenkovrehab.ru'
GEN_PT='Услуги - МиненковRehab'
GEN_PD='Выберите подходящую услугу для вашего восстановления и реабилитации. Онлайн-консультации, персональные программы, тренировки.'
GEN_RT='МиненковRehab | Физический реабилитолог'
GEN_RD='Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями.'
def ogx(path):  # теги, которых нет на страницах с собственным openGraph
    return (f'<meta property="og:url" content="{D}{path}"/><meta property="og:type" content="website"/>'
            '<meta property="og:locale" content="ru_RU"/><meta property="og:site_name" content="МиненковRehab"/>')
def esc(s): return html.escape(s, quote=True)
products={
 '/products/formula-movement':('Программа тренировок «Формула Движения» | Миненков Вадим','Авторская программа тренировок для всего тела. Занимайтесь по готовым комплексам — улучшайте подвижность суставов, развивайте силу и укрепляйте контроль движений.'),
 '/products/personal-program':('Восстановление после резекции мениска — программа | Миненков Вадим','Подробный информационный материал в формате пошагового алгоритма для восстановления после операции.'),
 '/products/consultation':('Онлайн-консультация | Миненков Вадим','Индивидуальный разбор вашей ситуации: анализ текущего состояния, разъяснение ограничений и принципы корректной двигательной активности. Видеозвонок 60 минут.'),
 '/products/express-consultation':('Экспресс онлайн-консультация | Миненков Вадим','Быстрая консультация для разбора конкретного вопроса и получения рекомендаций.'),
 '/products/online-training':('Онлайн-тренировка | Миненков Вадим','Индивидуальная онлайн-тренировка в формате видеозвонка по согласованному времени. Продолжительность занятия — около 60 минут.'),
}
roots={
 '/about':('Обо мне | Миненков Вадим — физический реабилитолог','Персональные восстановительные программы и программы тренировок от врача ЛФК Миненкова Вадима. Восстановление после травм и операций.'),
 '/reviews':('Отзывы клиентов | Миненков Вадим','Ознакомьтесь с отзывами клиентов о методиках реабилитации, индивидуальном подходе и результатах занятий с Вадимом Миненковым.'),
 '/policy':('Политика конфиденциальности | Миненков Вадим','Политика конфиденциальности для клиентов физического реабилитолога Миненкова Вадима.'),
 '/offer':('Договор-оферта | Миненков Вадим','Публичная оферта на оказание услуг ИП Миненков Вадим Леонидович.'),
 '/consent':('Согласие на обработку персональных данных | Миненков Вадим','Согласие на обработку персональных данных в соответствии с 152-ФЗ.'),
}
noindex=['/login','/forgot-password','/reset-password','/confirm-email','/terms']
def bt(s):
    assert '`' not in s; return '`'+s+'`'
def pair(a,b): return '\t\t\t'+bt(a)+' '+bt(b)+'\n'
L=[]
L.append('https://minenkovrehab.ru {\n\ttls /certs/main.crt /certs/main.key\n\timport secure\n')
L.append('\t# Актуальная карта сайта (в коде сайта устарела).\n\thandle /sitemap.xml {\n\t\troot * /srv/rx\n\t\theader Cache-Control "public, max-age=3600"\n\t\tfile_server\n\t}\n')
L.append('\t# Картинки превью (OG/Twitter) с правильным доменом; в образе сайта — с опечаткой.\n\t@ogimg path /images/og-image.jpg /images/og/services-og.jpg /images/og/contacts-og.jpg\n\thandle @ogimg {\n\t\troot * /srv/rx\n\t\theader Cache-Control "public, max-age=86400"\n\t\tfile_server\n\t}\n')
L.append('\thandle /_rx/* {\n\t\troot * /srv/rx\n\t\turi strip_prefix /_rx\n\t\theader Cache-Control "public, max-age=600"\n\t\tfile_server\n\t}\n')
L.append('\thandle {\n\t\t@pages not path /_next/* /api/* *.js *.css *.json *.map *.png *.jpg *.jpeg *.webp *.avif *.gif *.svg *.ico *.woff *.woff2 *.ttf *.txt *.xml *.mp4 *.webm *.pdf\n')
# per-page matchers
names={}
for i,p in enumerate(list(products)+list(roots)+['/products','/contacts']):
    n='p'+str(i); names[p]=n; L.append(f'\t\t@{n} path {p}\n')
L.append('\t\t@noindex path '+' '.join(noindex)+'\n')
# global rules: canonical/og:url по пути страницы — до общей замены опечатки
L.append('\t\treplace @pages stream {\n')
L.append(pair('<link rel="canonical" href="https://minekovrehab.ru"/>','<link rel="canonical" href="https://minenkovrehab.ru{http.request.uri.path}"/>'))
L.append(pair('<meta property="og:url" content="https://minekovrehab.ru"/>','<meta property="og:url" content="https://minenkovrehab.ru{http.request.uri.path}"/>'))
L.append('\t\t\t"minekovrehab" "minenkovrehab"\n')
G='NfKG4Obn62C9l819n4oDFJbwo7YBssE1xKy-rGZWLPM'; Y='3cabca068319b035'
L.append(pair('<meta name="google-site-verification" content="xxxxxxxx"/>',f'<meta name="google-site-verification" content="{G}"/>'))
L.append(pair('<meta name="yandex-verification" content="xxxxxxxx"/>',f'<meta name="yandex-verification" content="{Y}"/>'))
L.append(pair('google-site-verification\\",\\"content\\":\\"xxxxxxxx','google-site-verification\\",\\"content\\":\\"'+G))
L.append(pair('yandex-verification\\",\\"content\\":\\"xxxxxxxx','yandex-verification\\",\\"content\\":\\"'+Y))
L.append('\t\t\t"</body>" "<script src=\\"/_rx/rx-scroll-top.js?v=1\\" defer></script><script src=\\"/_rx/rx-metrika.js?v=1\\" defer></script></body>"\n\t\t}\n')
for p,(t,d) in products.items():
    t,d=esc(t),esc(d)
    L.append(f'\t\treplace @{names[p]} stream {{\n')
    L.append(pair(f'<meta property="og:title" content="{GEN_PT}"/>',f'<meta property="og:title" content="{t}"/>'+ogx(p)))
    L.append(pair(f'<meta property="og:description" content="{GEN_PD}"/>',f'<meta property="og:description" content="{d}"/>'))
    L.append(pair(f'<meta name="twitter:title" content="{GEN_PT}"/>',f'<meta name="twitter:title" content="{t}"/>'))
    L.append(pair(f'<meta name="twitter:description" content="{GEN_PD}"/>',f'<meta name="twitter:description" content="{d}"/>'))
    if p=='/products/consultation':
        L.append(pair('<meta name="robots" content="index, follow"/>',f'<meta name="description" content="{d}"/><meta name="robots" content="index, follow"/>'))
    L.append('\t\t}\n')
for p,(t,d) in roots.items():
    t,d=esc(t),esc(d)
    L.append(f'\t\treplace @{names[p]} stream {{\n')
    L.append(pair(f'<meta property="og:title" content="{GEN_RT}"/>',f'<meta property="og:title" content="{t}"/>'))
    L.append(pair(f'<meta property="og:description" content="{GEN_RD}"/>',f'<meta property="og:description" content="{d}"/>'))
    L.append(pair(f'<meta name="twitter:title" content="{GEN_RT}"/>',f'<meta name="twitter:title" content="{t}"/>'))
    L.append(pair(f'<meta name="twitter:description" content="{GEN_RD}"/>',f'<meta name="twitter:description" content="{d}"/>'))
    if p=='/about':
        L.append(pair('<title>Миненков Вадим | Физический реабилитолог</title>',f'<title>{t}</title>'))
    L.append('\t\t}\n')
for p,tit in (('/products','Услуги - МиненковRehab'),('/contacts','Контакты - МиненковRehab')):
    L.append(f'\t\treplace @{names[p]} stream {{\n')
    L.append(pair(f'<meta property="og:title" content="{tit}"/>',f'<meta property="og:title" content="{tit}"/>'+ogx(p)))
    L.append('\t\t}\n')
L.append('\t\treplace @noindex stream {\n')
L.append(pair('<meta name="robots" content="index, follow"/>','<meta name="robots" content="noindex, follow"/>'))
L.append(pair('<meta name="googlebot" content="index, follow"/>','<meta name="googlebot" content="noindex, follow"/>'))
L.append('\t\t}\n')
L.append('\t\t# HTML всегда целиком от Next (без 304 по ETag), иначе браузер держит старую копию без вставок.\n')
L.append('\t\treverse_proxy frontend:3000 {\n\t\t\theader_up -Accept-Encoding\n\t\t\theader_up -If-None-Match\n\t\t\theader_up -If-Modified-Since\n\t\t\theader_down -ETag\n\t\t\theader_down -Last-Modified\n\t\t}\n\t}\n}\n')
open('main-block.caddy','w').write(''.join(L))
# sitemap
urls=['/','/about','/products','/products/formula-movement','/products/personal-program','/products/consultation','/products/express-consultation','/products/online-training','/reviews','/contacts','/policy','/offer','/consent']
pri={'/':'1.0','/products':'0.9','/about':'0.8','/reviews':'0.6','/contacts':'0.7','/policy':'0.3','/offer':'0.3','/consent':'0.3'}
sm=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    sm.append(f'  <url><loc>{D}{u}</loc><lastmod>2026-10-28</lastmod><priority>{pri.get(u,"0.8")}</priority></url>')
sm.append('</urlset>'); open('sitemap.xml','w').write('\n'.join(sm)+'\n')
