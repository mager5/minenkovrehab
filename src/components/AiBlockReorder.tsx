'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical } from 'lucide-react';
import { describeElement } from '@/lib/element-editor-dom';
import type { EditTarget } from '@/lib/element-editor-schema';

type Item = {
  group: HTMLElement;
  node: HTMLElement;
  id: number;
  rect: DOMRect;
  label: string;
  surface: 'light' | 'dark';
  above: boolean;
};
type Marker = { left: number; top: number; width: number; height: number };
type Preview = {
  group: DOMRect;
  source: DOMRect;
  line: Marker | null;
  x: number;
  y: number;
  label: string;
};
type Props = {
  disabled: boolean;
  onMove: (
    _target: EditTarget,
    _group: string,
    _order: number[]
  ) => Promise<void>;
  onNotice: (_text: string) => void;
};
const siblings = (group: Element) =>
  Array.from(group.children).filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && node.hasAttribute('data-ai-order-index')
  );
const ids = (nodes: HTMLElement[]) =>
  nodes.map(node => Number(node.dataset.aiOrderIndex));
export default function AiBlockReorder({ disabled, onMove, onNotice }: Props) {
  const [active, setActive] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const cancel = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!active || disabled) {
      cancel.current?.();
      return;
    }
    let frame = 0;
    const collect = () => {
      frame = 0;
      const next: Item[] = [];
      document
        .querySelectorAll<HTMLElement>(
          'main#main-content [data-ai-sortable-group]'
        )
        .forEach(group => {
          for (const node of siblings(group)) {
            const rect = node.getBoundingClientRect();
            if (
              rect.width > 10 &&
              rect.height > 10 &&
              rect.bottom > 80 &&
              rect.top < window.innerHeight - 12
            )
              next.push({
                group,
                node,
                id: Number(node.dataset.aiOrderIndex),
                rect,
                above:
                  node.matches('a,button') &&
                  getComputedStyle(group).display === 'flex' &&
                  getComputedStyle(group).flexDirection === 'row',
                surface: node
                  .closest('section')
                  ?.matches('.hero-section,[class*="bg-primary"]')
                  ? 'dark'
                  : 'light',
                label: (
                  node.getAttribute('aria-label') ||
                  node.textContent ||
                  'Блок'
                )
                  .trim()
                  .replace(/\s+/g, ' ')
                  .slice(0, 65),
              });
          }
        });
      setItems(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(collect);
    };
    collect();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const observer = new MutationObserver(records => {
      if (
        records.some(record => {
          const node =
            record.target instanceof Element
              ? record.target
              : record.target.parentElement;
          return node?.closest('main') && !node.closest('[data-ai-editor]');
        })
      )
        schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancel.current?.();
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [active, disabled]);
  function keyboard(event: React.KeyboardEvent, item: Item) {
    if (
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return;
    event.preventDefault();
    const order = ids(siblings(item.group)),
      from = order.indexOf(item.id);
    const to = from + (['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1);
    if (to < 0 || to >= order.length) return;
    order.splice(from, 1);
    order.splice(to, 0, item.id);
    const target = describeElement(item.group),
      group = item.group.dataset.aiSortableGroup;
    if (target && group) void onMove(target, group, order);
  }
  function begin(event: React.PointerEvent, item: Item) {
    if (event.button !== 0 || disabled) return;
    event.preventDefault();
    event.stopPropagation();
    cancel.current?.();
    const startX = event.clientX,
      startY = event.clientY;
    const nodes = siblings(item.group),
      original = ids(nodes);
    let order = original,
      moved = false,
      valid = false;
    const move = (pointer: PointerEvent) => {
      if (
        !moved &&
        Math.hypot(pointer.clientX - startX, pointer.clientY - startY) < 6
      )
        return;
      moved = true;
      pointer.preventDefault();
      const bounds = item.group.getBoundingClientRect();
      const first = nodes[0]?.getBoundingClientRect(),
        second = nodes[1]?.getBoundingClientRect();
      const horizontal = Boolean(
        first &&
          second &&
          Math.abs(first.top - second.top) < 12 &&
          Math.abs(first.left - second.left) > 12
      );
      // Handles sit outside the content: accept their narrow drag lane as well.
      // Otherwise a straight vertical drag stays to the left of the container.
      valid =
        pointer.clientX >= bounds.left - (horizontal ? 0 : 40) &&
        pointer.clientX <= bounds.right &&
        pointer.clientY >= bounds.top - (horizontal ? 36 : 0) &&
        pointer.clientY <= bounds.bottom;
      let line: Marker | null = null;
      if (valid) {
        let hit = nodes.find(node => {
          const r = node.getBoundingClientRect();
          return (
            pointer.clientX >= r.left &&
            pointer.clientX <= r.right &&
            pointer.clientY >= r.top &&
            pointer.clientY <= r.bottom
          );
        });
        if (!hit) {
          const distance = (node: HTMLElement) => {
            const rect = node.getBoundingClientRect();
            const x = Math.max(
              rect.left - pointer.clientX,
              0,
              pointer.clientX - rect.right
            );
            const y = Math.max(
              rect.top - pointer.clientY,
              0,
              pointer.clientY - rect.bottom
            );
            return x * x + y * y;
          };
          hit = [...nodes].sort(
            (left, right) => distance(left) - distance(right)
          )[0];
        }
        if (hit && hit !== item.node) {
          const r = hit.getBoundingClientRect();
          const after = horizontal
            ? pointer.clientX > r.left + r.width / 2
            : pointer.clientY > r.top + r.height / 2;
          const remaining = original.filter(id => id !== item.id);
          const index =
            remaining.indexOf(Number(hit.dataset.aiOrderIndex)) +
            (after ? 1 : 0);
          order = [
            ...remaining.slice(0, index),
            item.id,
            ...remaining.slice(index),
          ];
          line = horizontal
            ? {
                left: (after ? r.right : r.left) - 2,
                top: r.top,
                width: 3,
                height: r.height,
              }
            : {
                left: r.left,
                top: (after ? r.bottom : r.top) - 2,
                width: r.width,
                height: 3,
              };
        } else if (hit === item.node) order = original;
      }
      setPreview({
        group: bounds,
        source: item.node.getBoundingClientRect(),
        line,
        x: pointer.clientX,
        y: pointer.clientY,
        label: item.label,
      });
    };
    const clean = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', clean, true);
      window.removeEventListener('keydown', key, true);
      cancel.current = null;
      setPreview(null);
    };
    const up = (pointer: PointerEvent) => {
      move(pointer);
      pointer.preventDefault();
      const group = item.group.dataset.aiSortableGroup,
        target = describeElement(item.group);
      const changed =
        valid && moved && JSON.stringify(order) !== JSON.stringify(original);
      clean();
      if (changed && group && target) void onMove(target, group, order);
      else if (moved && !valid)
        onNotice('Перенос отменён: выберите место внутри того же контейнера.');
    };
    const key = (keyboard: KeyboardEvent) => {
      if (keyboard.key === 'Escape') {
        keyboard.preventDefault();
        clean();
        onNotice('Перестановка отменена.');
      }
    };
    window.addEventListener('pointermove', move, {
      capture: true,
      passive: false,
    });
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', clean, true);
    window.addEventListener('keydown', key, true);
    cancel.current = clean;
  }
  const visible = active && !disabled;
  return (
    <>
      <button
        type='button'
        className={
          active ? 'ai-layout-toggle ai-layout-active' : 'ai-layout-toggle'
        }
        disabled={disabled}
        title={
          disabled
            ? 'Завершите редактирование текста или выбор элемента'
            : 'Показать ручки для перестановки соседних блоков'
        }
        aria-pressed={active}
        onClick={() => {
          setActive(!active);
          if (!active)
            onNotice(
              'Тяните за ручку с точками. Блоки перемещаются только внутри своего контейнера. Стрелки на ручке тоже меняют порядок.'
            );
        }}
      >
        <GripVertical size={14} />
        Переставить блоки
      </button>
      {visible &&
        createPortal(
          <div data-ai-editor className='ai-layout-layer'>
            {items.map(item => (
              <button
                data-ai-editor
                type='button'
                key={`${item.group.dataset.aiSortableGroup}:${item.id}`}
                className='ai-block-handle'
                data-surface={item.surface}
                style={{
                  left: Math.max(
                    2,
                    item.above ? item.rect.left + 4 : item.rect.left - 34
                  ),
                  top: Math.max(
                    84,
                    item.above
                      ? item.rect.top - 28
                      : item.rect.top +
                          (item.node.matches('a,button')
                            ? Math.max(0, (item.rect.height - 32) / 2)
                            : 0)
                  ),
                }}
                aria-label={`Переместить: ${item.label}`}
                title='Потяните за точки или используйте стрелки'
                onPointerDown={event => begin(event, item)}
                onKeyDown={event => keyboard(event, item)}
              >
                <GripVertical size={13} strokeWidth={1.6} />
              </button>
            ))}
            {preview && (
              <>
                <div
                  className='ai-layout-bounds'
                  style={{
                    left: preview.group.left,
                    top: preview.group.top,
                    width: preview.group.width,
                    height: preview.group.height,
                  }}
                />
                <div
                  className='ai-layout-source'
                  style={{
                    left: preview.source.left,
                    top: preview.source.top,
                    width: preview.source.width,
                    height: preview.source.height,
                  }}
                />
                {preview.line && (
                  <div className='ai-layout-insertion' style={preview.line} />
                )}
                <div
                  className='ai-layout-ghost'
                  style={{
                    left: Math.min(
                      window.innerWidth - 250,
                      Math.max(8, preview.x + 16)
                    ),
                    top: Math.min(window.innerHeight - 55, preview.y + 16),
                  }}
                >
                  <GripVertical size={14} />
                  {preview.label}
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
