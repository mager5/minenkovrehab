/* Кнопка «Наверх» для minenkovrehab.ru. Подключается Caddy на все HTML-страницы.
   Сайт прокручивается не окном, а внутренней обёрткой (.min-h-screen), поэтому
   следим за любым крупным прокручиваемым контейнером. */
(function () {
  if (window.__rxScrollTop) return;
  window.__rxScrollTop = true;

  var css =
    '.rx-top{position:fixed;right:calc(16px + env(safe-area-inset-right,0px));bottom:calc(20px + env(safe-area-inset-bottom,0px));' +
    'z-index:45;width:48px;height:48px;padding:0;margin:0;border:0;border-radius:9999px;background:#0063A5;color:#fff;' +
    'display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,63,105,.28);' +
    'opacity:0;visibility:hidden;transform:translateY(12px);-webkit-tap-highlight-color:transparent;' +
    'transition:opacity .25s ease,transform .25s ease,visibility .25s,background-color .2s ease,box-shadow .2s ease}' +
    '.rx-top svg{width:22px;height:22px;display:block}' +
    '.rx-top.rx-top--on{opacity:1;visibility:visible;transform:none}' +
    '.rx-top:hover{background:#004F84;box-shadow:0 8px 22px rgba(0,63,105,.34)}' +
    '.rx-top:active{transform:scale(.94)}' +
    '.rx-top:focus{outline:none}' +
    '.rx-top:focus-visible{outline:3px solid #2BAA7E;outline-offset:3px}' +
    '@media (min-width:768px){.rx-top{right:32px;bottom:32px;width:52px;height:52px}.rx-top svg{width:24px;height:24px}}' +
    '@media (prefers-reduced-motion:reduce){.rx-top{transition:opacity .01s,visibility .01s}}' +
    '@media print{.rx-top{display:none!important}}';

  var current = null;

  function rootScroller() {
    return document.scrollingElement || document.documentElement;
  }

  function isBig(el) {
    return el && el.nodeType === 1 && el.clientHeight >= window.innerHeight * 0.6;
  }

  function findScroller() {
    if (current && document.contains(current) && current.scrollHeight > current.clientHeight + 10) return current;
    var root = rootScroller();
    if (root.scrollHeight > root.clientHeight + 10) return root;
    var wrap = document.querySelector('body > div.min-h-screen, body > div > div.min-h-screen');
    if (wrap && wrap.scrollHeight > wrap.clientHeight + 10) return wrap;
    return root;
  }

  function topOf(el) {
    var y = el.scrollTop || 0;
    var root = rootScroller();
    if (el !== root) y = Math.max(y, root.scrollTop || 0);
    return y;
  }

  function init() {
    if (document.querySelector('.rx-top')) return;
    var style = document.createElement('style');
    style.id = 'rx-top-style';
    style.textContent = css;
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rx-top';
    btn.setAttribute('aria-label', 'Наверх');
    btn.title = 'Наверх';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
    btn.tabIndex = -1;
    document.body.appendChild(btn);

    var ticking = false;
    function update() {
      ticking = false;
      var on = topOf(findScroller()) > Math.max(400, window.innerHeight * 0.6);
      if (on !== btn.classList.contains('rx-top--on')) {
        btn.classList.toggle('rx-top--on', on);
        btn.tabIndex = on ? 0 : -1;
      }
    }
    function schedule() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }

    document.addEventListener('scroll', function (e) {
      var t = e.target === document ? rootScroller() : e.target;
      if (isBig(t)) current = t;
      schedule();
    }, { capture: true, passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    // Next.js меняет страницы без перезагрузки — пересчитываем после перехода.
    ['pushState', 'replaceState'].forEach(function (m) {
      var orig = history[m];
      history[m] = function () {
        var r = orig.apply(this, arguments);
        setTimeout(schedule, 150);
        return r;
      };
    });
    window.addEventListener('popstate', function () { setTimeout(schedule, 150); });

    btn.addEventListener('click', function () {
      var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      var el = findScroller();
      var root = rootScroller();
      try { el.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }); } catch (_) { el.scrollTop = 0; }
      if (el !== root && root.scrollTop) {
        try { root.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }); } catch (_) { root.scrollTop = 0; }
      }
      btn.blur();
    });

    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
