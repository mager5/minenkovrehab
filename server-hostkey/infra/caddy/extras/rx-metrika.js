/* Яндекс.Метрика для minenkovrehab.ru — только после согласия на аналитику.
   Согласие хранит баннер cookie сайта: localStorage.cookieConsent = 'all' (или старое 'true').
   'necessary' или отсутствие выбора — счётчик не загружается и cookie Метрики не ставятся.
   Вебвизор выключен намеренно: на сайте реабилитации в формах могут быть сведения о здоровье. */
(function () {
  var ID = 113852639;
  var KEY = 'cookieConsent';
  var loaded = false;

  function allowed() {
    try { var v = localStorage.getItem(KEY); return v === 'all' || v === 'true'; } catch (_) { return false; }
  }

  function load() {
    if (loaded || !allowed()) return;
    loaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) { return; } }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + ID, 'ym');
    window.ym(ID, 'init', { ssr: true, clickmap: true, accurateTrackBounce: true, trackLinks: true, webvisor: false });

    // Next.js переключает страницы без перезагрузки — отправляем просмотр вручную.
    var last = location.href;
    function hit() {
      setTimeout(function () {
        if (location.href === last) return;
        var ref = last; last = location.href;
        window.ym(ID, 'hit', last, { title: document.title, referer: ref });
      }, 300);
    }
    ['pushState', 'replaceState'].forEach(function (m) {
      var orig = history[m];
      history[m] = function () { var r = orig.apply(this, arguments); hit(); return r; };
    });
    window.addEventListener('popstate', hit);
  }

  // Согласие дали прямо сейчас в баннере — включаем без перезагрузки.
  try {
    var setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      var r = setItem.apply(this, arguments);
      if (this === window.localStorage && k === KEY) setTimeout(load, 0);
      return r;
    };
  } catch (_) {}
  window.addEventListener('storage', function (e) { if (e.key === KEY) load(); });

  load();
})();
