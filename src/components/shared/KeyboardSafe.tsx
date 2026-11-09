'use client';

// Телефон (≤768px): поле в фокусе не должно уходить под экранную клавиатуру.
// iOS Safari сам прокручивает к полю не всегда (особенно при липкой шапке), поэтому после открытия
// клавиатуры (событие resize у visualViewport) поле, оказавшееся под ней или под шапкой, выводится в центр.
import { useEffect } from 'react';

const FIELD =
  'input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea, [contenteditable=true]';

export default function KeyboardSafe() {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const vv = window.visualViewport;
    let timer: number | undefined;

    const ensureVisible = () => {
      if (!mq.matches) return;
      const el = document.activeElement as HTMLElement | null;
      if (!el || !el.matches?.(FIELD)) return;
      const r = el.getBoundingClientRect();
      const top = (vv?.offsetTop ?? 0) + 88; // под липкой шапкой
      const bottom =
        (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight) - 16;
      if (r.top < top || r.bottom > bottom)
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches || !(e.target as HTMLElement)?.matches?.(FIELD)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(ensureVisible, 350);
    };

    document.addEventListener('focusin', onFocus);
    vv?.addEventListener('resize', ensureVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('focusin', onFocus);
      vv?.removeEventListener('resize', ensureVisible);
    };
  }, []);
  return null;
}
