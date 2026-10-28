from PIL import Image, ImageDraw, ImageFont
F='/usr/share/fonts/opentype/inter/'
def f(w,s): return ImageFont.truetype(F+f'Inter-{w}.otf', s)
BLUE=(0,99,165); DEEP=(0,63,107); GREEN=(43,170,126); WHITE=(255,255,255); SOFT=(214,231,244)
def make(path, eyebrow, title, subtitle, bullets):
    W,H=1200,630
    im=Image.new('RGB',(W,H),BLUE); d=ImageDraw.Draw(im)
    # мягкий вертикальный градиент
    for y in range(H):
        t=y/H; c=tuple(int(BLUE[i]*(1-t)+DEEP[i]*t) for i in range(3)); d.line([(0,y),(W,y)],fill=c)
    # декоративные дуги справа
    for r,a in ((420,40),(330,55),(240,70)):
        ov=Image.new('RGBA',(W,H),(0,0,0,0)); od=ImageDraw.Draw(ov)
        od.ellipse([W-120-r,H//2-r,W-120+r,H//2+r],outline=(43,170,126,a),width=18)
        im.paste(ov,(0,0),ov)
    d=ImageDraw.Draw(im)
    x=80
    d.rounded_rectangle([x,86,x+8,86+56],radius=4,fill=GREEN)
    d.text((x+28,84),eyebrow,font=f('SemiBold',30),fill=SOFT)
    sz=76
    while d.textlength(title,font=f('Bold',sz))>1040: sz-=2
    d.text((x,150+(76-sz)//2),title,font=f('Bold',sz),fill=WHITE)
    d.text((x,250),subtitle,font=f('SemiBold',40),fill=GREEN)
    y=330
    for b in bullets:
        d.ellipse([x,y+14,x+12,y+26],fill=GREEN)
        d.text((x+28,y),b,font=f('Medium',30),fill=WHITE); y+=48
    dom='minenkovrehab.ru'; fd=f('Bold',30)
    tw=d.textlength(dom,font=fd)
    d.rounded_rectangle([x,H-118,x+tw+56,H-62],radius=28,fill=GREEN)
    d.text((x+28,H-112),dom,font=fd,fill=WHITE)
    im.save(path,'JPEG',quality=88,optimize=True,progressive=True)
make('og-image.jpg','Миненков Вадим','Физическая реабилитация','Восстановление после травм и операций',
     ['Персональные программы восстановления','Онлайн-консультации и тренировки','Программа «Формула Движения»'])
make('services-og.jpg','Услуги','Восстановление и тренировки','Онлайн, в удобном для вас формате',
     ['Онлайн-консультация и экспресс-консультация','Онлайн-тренировки и «Формула Движения»','Восстановление после резекции мениска'])
make('contacts-og.jpg','Контакты','Запишитесь на консультацию','Миненков Вадим, физический реабилитолог',
     ['Онлайн-консультация по видеосвязи','Подбор программы под вашу ситуацию','Почта: info@minenkovrehab.ru'])
