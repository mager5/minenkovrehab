// Заставка как у приложения (по образцу NKX Padel): логотип, имя и бегущая полоска, пока страница грузится.
// Показывается ТОЛЬКО в установленном приложении (PWA: display-mode standalone/fullscreen/minimal-ui,
// на iPhone — navigator.standalone). На сайте в обычном и мобильном браузере скрыта (display:none) и
// ничего не грузит: логотип задан фоном, а фон скрытого блока браузер не скачивает. Причина — заставка
// закрывала первый экран и ухудшала LCP в PageSpeed Insights.
// Исчезает, когда страница загружена: не раньше чем через 1,7 с (чтобы логотип успели увидеть) и не позже 8 с.
// Только при полной загрузке/перезагрузке страницы; переходы внутри сайта её не показывают.

const CSS = `
#mr-splash{display:none}
@media (display-mode:standalone),(display-mode:fullscreen),(display-mode:minimal-ui){#mr-splash{display:grid}}
#mr-splash.pwa{display:grid}
#mr-splash{position:fixed;inset:0;z-index:2147483000;place-items:center;color:#0D3C63;
  background:radial-gradient(120% 90% at 0% 0%,#dcebf7 0%,rgba(220,235,247,0) 60%),radial-gradient(90% 90% at 100% 100%,#d9f1e6 0%,rgba(217,241,230,0) 60%),#F3F7FA;
  transition:opacity .7s ease,visibility .7s ease}
#mr-splash.hide{opacity:0;visibility:hidden;pointer-events:none}
#mr-splash .box{display:flex;flex-direction:column;align-items:center;gap:18px;transform:translateY(-4vh);
  transition:transform .7s cubic-bezier(.4,0,.2,1),opacity .5s ease}
#mr-splash.hide .box{transform:translateY(-4vh) scale(1.12);opacity:0}
#mr-splash .mark{position:relative;width:104px;height:104px}
#mr-splash .logo{display:block;width:100%;height:100%;border-radius:50%;background:#fff url(/images/logo-splash.webp) center/cover no-repeat;
  box-shadow:0 14px 34px rgba(13,60,99,.16);opacity:0;transform:scale(.6) rotate(-8deg);
  animation:mrIn .6s cubic-bezier(.2,.9,.3,1.3) .05s forwards}
#mr-splash .word{display:flex;flex-direction:column;align-items:center;line-height:1;opacity:0;animation:mrFade .5s ease .35s forwards}
#mr-splash .word b{font:800 28px/1 var(--font-manrope),Manrope,system-ui,sans-serif;letter-spacing:-.01em}
#mr-splash .word i{font:700 11px/1 var(--font-manrope),Manrope,system-ui,sans-serif;font-style:normal;letter-spacing:.32em;
  text-transform:uppercase;color:#4B5A68;margin-top:9px;padding-left:.32em}
#mr-splash .bar{width:120px;height:3px;border-radius:3px;background:rgba(13,60,99,.1);overflow:hidden;opacity:0;animation:mrFade .4s ease .6s forwards}
#mr-splash .bar:after{content:"";display:block;width:40%;height:100%;border-radius:3px;background:#2E8A64;animation:mrBar 1.1s ease-in-out infinite}
@keyframes mrIn{to{opacity:1;transform:none}}
@keyframes mrFade{to{opacity:1}}
@keyframes mrBar{0%{transform:translateX(-110%)}100%{transform:translateX(280%)}}
@media (prefers-reduced-motion:reduce){#mr-splash *{animation-duration:.01s!important;animation-iteration-count:1!important}}
`;

const JS = `(function(){var s=document.getElementById('mr-splash');if(!s)return;
if(window.navigator.standalone)s.classList.add('pwa');
if(getComputedStyle(s).display==='none')return;var t0=Date.now(),done=false;
function hide(){if(done)return;done=true;var w=Math.max(0,1700-(Date.now()-t0));setTimeout(function(){s.classList.add('hide');setTimeout(function(){s.style.display='none'},800)},w)}
if(document.readyState==='complete')hide();else window.addEventListener('load',hide);setTimeout(hide,8000);})();`;

export default function Splash() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* Без JavaScript заставку не показываем совсем — иначе она закрыла бы страницу */}
      <noscript>
        <style>{'#mr-splash{display:none!important}'}</style>
      </noscript>
      <div id='mr-splash' aria-hidden='true' suppressHydrationWarning>
        <div className='box'>
          <div className='mark'>
            {/* Логотип — фоном из CSS: на сайте (заставка скрыта) он не скачивается */}
            <span className='logo' />
          </div>
          <div className='word'>
            <b>Вадим Миненков</b>
            <i>физическая реабилитация</i>
          </div>
          <div className='bar' />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: JS }} />
    </>
  );
}
