import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import AiBlockReorder from '@/components/AiBlockReorder';

const onDelete = jest.fn().mockResolvedValue(undefined);
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
  onDelete.mockReset().mockResolvedValue(undefined);
  onMove.mockClear();
  onNotice.mockClear();
  // Original IDs deliberately differ from visual positions after a previous reorder.
  document.body.innerHTML = `<main id="main-content"><section>
    <div id="delete-group-a" data-ai-sortable-group="hero-actions">
      <a href="/about" data-ai-order-index="2"><svg><path/></svg>Первый блок</a>
      <a href="/contacts" data-ai-order-index="0">Второй блок</a>
      <a href="/products" data-ai-order-index="1">Третий блок</a>
    </div>
    <div id="delete-group-b" data-ai-sortable-group="help-items">
      <article data-ai-order-index="3">Другая группа — первый</article>
      <article data-ai-order-index="1">Другая группа — второй</article>
    </div>
  </section><p id="outside-delete">Вне подтверждения</p></main>`;
  geometry = jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    // eslint-disable-next-line no-unused-vars -- This is a TypeScript receiver annotation.
    .mockImplementation(function (this: HTMLElement) {
      if (this.id === 'delete-group-a') return rectangle(100, 190, 290, 70);
      if (this.id === 'delete-group-b') return rectangle(100, 310, 290, 70);
      if (this.hasAttribute('data-ai-order-index')) {
        const position = Array.from(this.parentElement!.children).indexOf(this);
        return rectangle(
          100 + position * 100,
          this.parentElement?.id === 'delete-group-b' ? 320 : 200,
          80,
          40
        );
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
    <AiBlockReorder
      disabled={false}
      onMove={onMove}
      onNotice={onNotice}
      onDelete={onDelete}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Переставить блоки' }));
  onNotice.mockClear();
}
function open(label = 'Первый блок') {
  fireEvent.click(screen.getByRole('button', { name: `Удалить: ${label}` }));
  return screen.getByRole('dialog');
}
const firstGroupTarget = expect.objectContaining({
  root: 'main',
  kind: 'element',
  tag: 'div',
  path: [
    { tag: 'section', index: 0 },
    { tag: 'div', index: 0 },
  ],
});

test('delete controls require the explicit block-editing mode', () => {
  render(
    <AiBlockReorder
      disabled={false}
      onMove={onMove}
      onNotice={onNotice}
      onDelete={onDelete}
    />
  );
  expect(
    screen.queryByRole('button', { name: 'Удалить: Первый блок' })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Переставить блоки' }));
  expect(
    screen.getByRole('button', { name: 'Удалить: Первый блок' })
  ).toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
});

test('opening confirmation preserves the block and focuses the safe cancel action', async () => {
  enable();
  const group = document.querySelector('#delete-group-a')!;
  const block = group.firstElementChild!;
  const before = group.innerHTML;
  const dialog = open();
  expect(dialog).toHaveAccessibleName('Удалить блок?');
  expect(within(dialog).getByText(/Первый блок/)).toBeInTheDocument();
  await waitFor(() =>
    expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus()
  );
  expect(onDelete).not.toHaveBeenCalled();
  expect(onMove).not.toHaveBeenCalled();
  expect(group.firstElementChild).toBe(block);
  expect(group.innerHTML).toBe(before);
});

test('Cancel closes confirmation without a deletion or a reorder', () => {
  enable();
  const before = document.querySelector('#delete-group-a')!.innerHTML;
  const dialog = open();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
  expect(onMove).not.toHaveBeenCalled();
  expect(document.querySelector('#delete-group-a')!.innerHTML).toBe(before);
});

test('Escape dismisses confirmation without removing any block', () => {
  enable();
  const before = document.querySelector('#delete-group-a')!.innerHTML;
  const dialog = open();
  fireEvent.keyDown(within(dialog).getByRole('button', { name: 'Отмена' }), {
    key: 'Escape',
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
  expect(document.querySelector('#delete-group-a')!.innerHTML).toBe(before);
});

test('an outside pointer down dismisses confirmation without a deletion', () => {
  enable();
  const before = document.querySelector('#delete-group-a')!.innerHTML;
  open();
  fireEvent.pointerDown(document.querySelector('#outside-delete')!, {
    button: 0,
    clientX: 700,
    clientY: 500,
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
  expect(document.querySelector('#delete-group-a')!.innerHTML).toBe(before);
});

test('only explicit confirmation deletes the exact original ID in its own container', async () => {
  enable();
  const otherGroup = document.querySelector('#delete-group-b')!.innerHTML;
  const dialog = open();
  expect(onDelete).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }));
  await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  expect(onDelete).toHaveBeenCalledWith(firstGroupTarget, 'hero-actions', 2);
  expect(onMove).not.toHaveBeenCalled();
  expect(document.querySelector('#delete-group-b')!.innerHTML).toBe(otherGroup);
});

test('cancelled selection cannot leak into a later confirmation from another group', async () => {
  enable();
  fireEvent.click(within(open()).getByRole('button', { name: 'Отмена' }));
  const dialog = open('Другая группа — первый');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }));
  await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  expect(onDelete).toHaveBeenCalledWith(
    expect.objectContaining({
      root: 'main',
      tag: 'div',
      path: [
        { tag: 'section', index: 0 },
        { tag: 'div', index: 1 },
      ],
    }),
    'help-items',
    3
  );
});
