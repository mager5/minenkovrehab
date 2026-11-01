import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AiBlockReorder from '@/components/AiBlockReorder';

const onMove = jest.fn().mockResolvedValue(undefined);
const onNotice = jest.fn();
const originalPointerEvent = Object.getOwnPropertyDescriptor(
  window,
  'PointerEvent'
);
let geometry: jest.SpyInstance;

function rectangle(
  left: number,
  top: number,
  width: number,
  height: number
): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({ left, top, width, height }),
  } as DOMRect;
}

beforeAll(() => {
  // JSDOM has mouse coordinates but does not supply PointerEvent in every version.
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: MouseEvent,
  });
});
afterAll(() => {
  if (originalPointerEvent)
    Object.defineProperty(window, 'PointerEvent', originalPointerEvent);
  else delete (window as unknown as Record<string, unknown>).PointerEvent;
});
beforeEach(() => {
  onMove.mockClear();
  onNotice.mockClear();
  document.body.innerHTML = `<main id="main-content"><section>
    <div id="group-a" data-ai-sortable-group="hero-actions">
      <a href="/about" data-ai-order-index="0">Первый блок</a>
      <a href="/contacts" data-ai-order-index="1">Второй блок</a>
      <a href="/products" data-ai-order-index="2">Третий блок</a>
    </div>
    <div id="group-b" data-ai-sortable-group="other-group">
      <div data-ai-order-index="0">Другая группа — первый</div>
      <div data-ai-order-index="1">Другая группа — второй</div>
    </div>
  </section></main>`;
  geometry = jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    // eslint-disable-next-line no-unused-vars -- TypeScript receiver annotation, not a runtime argument.
    .mockImplementation(function (this: HTMLElement) {
      if (this.id === 'group-a') return rectangle(100, 190, 290, 70);
      if (this.id === 'group-b') return rectangle(100, 310, 290, 70);
      if (this.hasAttribute('data-ai-order-index')) {
        const index = Number(this.dataset.aiOrderIndex);
        const top = this.parentElement?.id === 'group-b' ? 320 : 200;
        return rectangle(100 + index * 100, top, 80, 40);
      }
      return rectangle(0, 0, 0, 0);
    });
});
afterEach(() => {
  cleanup();
  geometry.mockRestore();
});

function enable() {
  render(
    <AiBlockReorder disabled={false} onMove={onMove} onNotice={onNotice} />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Переставить блоки' }));
  onNotice.mockClear();
  return screen.getByRole('button', { name: 'Переместить: Первый блок' });
}
const groupTarget = expect.objectContaining({
  root: 'main',
  kind: 'element',
  tag: 'div',
  path: [
    { tag: 'section', index: 0 },
    { tag: 'div', index: 0 },
  ],
});

test('handles are available only after the reorder mode is enabled', () => {
  render(
    <AiBlockReorder disabled={false} onMove={onMove} onNotice={onNotice} />
  );
  const toggle = screen.getByRole('button', { name: 'Переставить блоки' });
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(
    screen.queryByRole('button', { name: 'Переместить: Первый блок' })
  ).not.toBeInTheDocument();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('button', { name: /^Переместить:/ })).toHaveLength(
    5
  );
  fireEvent.click(toggle);
  expect(
    screen.queryByRole('button', { name: 'Переместить: Первый блок' })
  ).not.toBeInTheDocument();
  expect(onMove).not.toHaveBeenCalled();
});

test('an arrow key requests the exact permutation within the original container', () => {
  const handle = enable();
  fireEvent.keyDown(handle, { key: 'ArrowRight' });
  expect(onMove).toHaveBeenCalledTimes(1);
  expect(onMove).toHaveBeenCalledWith(groupTarget, 'hero-actions', [1, 0, 2]);
  onMove.mockClear();
  fireEvent.keyDown(handle, { key: 'ArrowLeft' });
  expect(onMove).not.toHaveBeenCalled();
});

test('pointer movement below six pixels is a click, without a reorder or preview', () => {
  const handle = enable();
  fireEvent.pointerDown(handle, { button: 0, clientX: 110, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 114, clientY: 213 });
  expect(document.querySelector('.ai-layout-source')).not.toBeInTheDocument();
  fireEvent.pointerUp(window, { clientX: 114, clientY: 213 });
  expect(onMove).not.toHaveBeenCalled();
  expect(onNotice).not.toHaveBeenCalled();
});

test('a valid drag requests a permutation and leaves the other group untouched', () => {
  const handle = enable();
  const otherGroup = document.querySelector('#group-b')!.innerHTML;
  fireEvent.pointerDown(handle, { button: 0, clientX: 110, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 375, clientY: 220 });
  expect(document.querySelector('.ai-layout-insertion')).toBeInTheDocument();
  fireEvent.pointerUp(window, { clientX: 375, clientY: 220 });
  expect(onMove).toHaveBeenCalledTimes(1);
  expect(onMove).toHaveBeenCalledWith(groupTarget, 'hero-actions', [1, 2, 0]);
  expect(document.querySelector('#group-b')!.innerHTML).toBe(otherGroup);
  expect(document.querySelector('.ai-layout-source')).not.toBeInTheDocument();
});

test('moving into another group and releasing cancels instead of transferring the block', () => {
  const handle = enable();
  fireEvent.pointerDown(handle, { button: 0, clientX: 110, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 375, clientY: 220 });
  fireEvent.pointerMove(window, { clientX: 140, clientY: 340 });
  fireEvent.pointerUp(window, { clientX: 140, clientY: 340 });
  expect(onMove).not.toHaveBeenCalled();
  expect(onNotice).toHaveBeenCalledWith(
    expect.stringContaining('Перенос отменён')
  );
  expect(document.querySelector('.ai-layout-source')).not.toBeInTheDocument();
});

test('Escape cancels a drag and removes all pending pointer listeners', () => {
  const handle = enable();
  fireEvent.pointerDown(handle, { button: 0, clientX: 110, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 375, clientY: 220 });
  fireEvent.keyDown(window, { key: 'Escape' });
  fireEvent.pointerUp(window, { clientX: 375, clientY: 220 });
  expect(onMove).not.toHaveBeenCalled();
  expect(document.querySelector('.ai-layout-source')).not.toBeInTheDocument();
  expect(onNotice).toHaveBeenCalledWith('Перестановка отменена.');
});

test('an outside release cancels even if its coordinates differ from the last pointer move', () => {
  const handle = enable();
  fireEvent.pointerDown(handle, { button: 0, clientX: 110, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 375, clientY: 220 });
  fireEvent.pointerUp(window, { clientX: 600, clientY: 500 });
  expect(onMove).not.toHaveBeenCalled();
  expect(onNotice).toHaveBeenCalledWith(
    expect.stringContaining('Перенос отменён')
  );
});

test('vertical dragging in the external handle lane shows insertion feedback and reorders', () => {
  document.querySelector('#group-b')!.remove();
  // eslint-disable-next-line no-unused-vars -- TypeScript receiver annotation, not a runtime argument.
  geometry.mockImplementation(function (this: HTMLElement) {
    if (this.id === 'group-a') return rectangle(100, 190, 200, 200);
    if (this.hasAttribute('data-ai-order-index'))
      return rectangle(
        100,
        200 + Number(this.dataset.aiOrderIndex) * 60,
        180,
        40
      );
    return rectangle(0, 0, 0, 0);
  });
  const handle = enable();
  fireEvent.pointerDown(handle, { button: 0, clientX: 80, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 80, clientY: 350 });
  expect(document.querySelector('.ai-layout-insertion')).not.toBeNull();
  fireEvent.pointerUp(window, { clientX: 80, clientY: 350 });
  expect(onMove).toHaveBeenCalledWith(groupTarget, 'hero-actions', [1, 2, 0]);
});

test('vertical dragging far outside the handle lane remains cancelled', () => {
  document.querySelector('#group-b')!.remove();
  // eslint-disable-next-line no-unused-vars -- TypeScript receiver annotation, not a runtime argument.
  geometry.mockImplementation(function (this: HTMLElement) {
    if (this.id === 'group-a') return rectangle(100, 190, 200, 200);
    if (this.hasAttribute('data-ai-order-index'))
      return rectangle(
        100,
        200 + Number(this.dataset.aiOrderIndex) * 60,
        180,
        40
      );
    return rectangle(0, 0, 0, 0);
  });
  const handle = enable();
  fireEvent.pointerDown(handle, { button: 0, clientX: 80, clientY: 210 });
  fireEvent.pointerMove(window, { clientX: 20, clientY: 350 });
  fireEvent.pointerUp(window, { clientX: 20, clientY: 350 });
  expect(onMove).not.toHaveBeenCalled();
});
