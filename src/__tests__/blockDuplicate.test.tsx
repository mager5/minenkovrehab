import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AiBlockReorder from '@/components/AiBlockReorder';

const onDuplicate = jest.fn().mockResolvedValue(undefined);
const onMove = jest.fn().mockResolvedValue(undefined);
const onDelete = jest.fn().mockResolvedValue(undefined);
const onNotice = jest.fn();
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
beforeEach(() => {
  onDuplicate.mockClear();
  onMove.mockClear();
  onDelete.mockClear();
  onNotice.mockClear();
  document.body.innerHTML = `<main id="main-content">
    <div id="copy-actions" data-ai-sortable-group="hero-actions">
      <a href="/about" data-ai-order-index="2"><svg><path/></svg>Кнопка после перестановки</a>
      <a href="/contacts" data-ai-order-index="0">Другая кнопка</a>
    </div>
    <section id="copy-sections" data-ai-sortable-group="home-sections">
      <section data-ai-order-index="0">Первый раздел</section>
      <section data-ai-order-index="1">Второй раздел</section>
    </section>
  </main>`;
  geometry = jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    // eslint-disable-next-line no-unused-vars -- TypeScript receiver annotation, not an unused runtime argument.
    .mockImplementation(function (this: HTMLElement) {
      if (this.id === 'copy-actions') return rectangle(100, 190, 400, 70);
      if (this.id === 'copy-sections') return rectangle(100, 380, 400, 200);
      if (this.hasAttribute('data-ai-order-index')) {
        const index = Array.from(this.parentElement!.children).indexOf(this);
        return this.parentElement?.id === 'copy-actions'
          ? rectangle(100 + index * 160, 200, 140, 40)
          : rectangle(100, 390 + index * 90, 400, 70);
      }
      return rectangle(0, 0, 0, 0);
    });
});
afterEach(() => {
  cleanup();
  geometry.mockRestore();
});
function props() {
  return { disabled: false, onMove, onDelete, onNotice };
}
function enable() {
  fireEvent.click(screen.getByRole('button', { name: 'Переставить блоки' }));
}

test('copy is optional and only appears in the explicit block editing mode', () => {
  const view = render(<AiBlockReorder {...props()} />);
  enable();
  expect(
    screen.getByRole('button', {
      name: 'Переместить: Кнопка после перестановки',
    })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /^Дублировать:/ })
  ).not.toBeInTheDocument();
  view.rerender(<AiBlockReorder {...props()} onDuplicate={onDuplicate} />);
  expect(
    screen.getByRole('button', {
      name: 'Дублировать: Кнопка после перестановки',
    })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Переставить блоки' }));
  expect(
    screen.queryByRole('button', { name: /^Дублировать:/ })
  ).not.toBeInTheDocument();
  expect(onDuplicate).not.toHaveBeenCalled();
});

test('copy invokes only onDuplicate with its exact container and original ID, not the visual index', () => {
  render(<AiBlockReorder {...props()} onDuplicate={onDuplicate} />);
  enable();
  const source = document.querySelector('#copy-actions')!;
  const before = source.innerHTML;
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Дублировать: Кнопка после перестановки',
    })
  );
  expect(onDuplicate).toHaveBeenCalledTimes(1);
  expect(onDuplicate).toHaveBeenCalledWith(
    expect.objectContaining({
      root: 'main',
      tag: 'div',
      kind: 'element',
      path: [{ tag: 'div', index: 0 }],
    }),
    'hero-actions',
    2
  );
  expect(onMove).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(source.innerHTML).toBe(before);
});

test('full homepage sections can be moved and deleted but do not expose duplication', () => {
  render(<AiBlockReorder {...props()} onDuplicate={onDuplicate} />);
  enable();
  expect(
    screen.getByRole('button', { name: 'Переместить: Первый раздел' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Удалить: Первый раздел' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Дублировать: Первый раздел' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Дублировать: Второй раздел' })
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /^Дублировать:/ })).toHaveLength(
    2
  );
  expect(onDuplicate).not.toHaveBeenCalled();
});

test('busy mode hides copy controls without invoking a copy callback', () => {
  const view = render(
    <AiBlockReorder {...props()} onDuplicate={onDuplicate} />
  );
  enable();
  expect(
    screen.getByRole('button', { name: 'Дублировать: Другая кнопка' })
  ).toBeInTheDocument();
  view.rerender(
    <AiBlockReorder {...props()} disabled onDuplicate={onDuplicate} />
  );
  expect(
    screen.getByRole('button', { name: 'Переставить блоки' })
  ).toBeDisabled();
  expect(
    screen.queryByRole('button', { name: /^Дублировать:/ })
  ).not.toBeInTheDocument();
  expect(onDuplicate).not.toHaveBeenCalled();
});
