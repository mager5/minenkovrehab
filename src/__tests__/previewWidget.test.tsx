import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AiPreviewWidget from '@/components/AiPreviewWidget';

const originalFlag = process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
let stageSize: { width: number; height: number };
let geometry: jest.SpyInstance;
function frame() {
  return screen.getByTitle(
    'Главная страница — предпросмотр'
  ) as HTMLIFrameElement;
}
function start(device = 'Телефон') {
  render(<AiPreviewWidget />);
  fireEvent.click(screen.getByRole('button', { name: device }));
  return frame();
}
function dimensions(width: number, height: number) {
  expect(frame()).toHaveAttribute('width', String(width));
  expect(frame()).toHaveAttribute('height', String(height));
  expect(frame().style.width).toBe(`${width}px`);
  expect(frame().style.height).toBe(`${height}px`);
}
beforeEach(() => {
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '1';
  document.body.innerHTML =
    '<main id="main-content"><h1>Исходная главная</h1></main>';
  stageSize = { width: 1000, height: 700 };
  geometry = jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    // eslint-disable-next-line no-unused-vars -- TypeScript receiver annotation.
    .mockImplementation(function (this: HTMLElement) {
      const size = this.classList.contains('ai-preview-stage')
        ? stageSize
        : { width: 0, height: 0 };
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: size.width,
        bottom: size.height,
        ...size,
        toJSON: () => size,
      } as DOMRect;
    });
});
afterEach(() => {
  cleanup();
  geometry.mockRestore();
  document.body.style.overflow = '';
  if (originalFlag === undefined)
    delete process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
  else process.env.NEXT_PUBLIC_AI_TEST_ENABLED = originalFlag;
});

test('the test-only host widget has three device buttons without altering the parent viewport', () => {
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '0';
  const view = render(<AiPreviewWidget />);
  expect(
    screen.queryByRole('button', { name: 'Телефон' })
  ).not.toBeInTheDocument();
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '1';
  view.rerender(<AiPreviewWidget />);
  expect(screen.getByRole('button', { name: 'Компьютер' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(screen.getByRole('button', { name: 'Планшет' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  expect(screen.getByRole('button', { name: 'Телефон' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  expect(document.querySelector('iframe')).not.toBeInTheDocument();
});

test('phone preview has a real 390 by 844 viewport and a fitted display scale', () => {
  const main = document.querySelector('main')!;
  const original = main.outerHTML;
  start();
  expect(screen.getByRole('dialog', { name: 'Предпросмотр' })).toContainElement(
    frame()
  );
  expect(frame()).toHaveAttribute('src', '/?ai-preview=phone');
  dimensions(390, 844);
  const expectedScale = 650 / 844;
  expect(frame().style.transform).toBe(`scale(${expectedScale})`);
  expect(parseFloat(frame().parentElement!.style.width)).toBeCloseTo(
    390 * expectedScale
  );
  expect(parseFloat(frame().parentElement!.style.height)).toBeCloseTo(650);
  expect(screen.getByRole('button', { name: 'Вписать · 77%' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(main.outerHTML).toBe(original);
  expect(document.body.style.overflow).toBe('hidden');
  expect(
    screen.getByRole('button', { name: 'Закрыть предпросмотр' })
  ).toHaveFocus();
});

test('device categories change actual iframe dimensions and preset choices without remounting it', () => {
  const originalFrame = start();
  fireEvent.click(screen.getByRole('button', { name: 'Планшет' }));
  dimensions(768, 1024);
  expect(screen.getByRole('button', { name: 'Планшет' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(
    screen.getByRole('option', { name: '800 × 1280' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('option', { name: '414 × 896' })
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Предустановленный размер'), {
    target: { value: '820x1180' },
  });
  dimensions(820, 1180);
  fireEvent.click(screen.getByRole('button', { name: 'Компьютер' }));
  dimensions(1536, 864);
  fireEvent.change(screen.getByLabelText('Предустановленный размер'), {
    target: { value: '2560x1440' },
  });
  dimensions(2560, 1440);
  expect(frame()).toBe(originalFrame);
  expect(frame()).toHaveAttribute('src', '/?ai-preview=phone');
  expect(
    screen.getByRole('option', { name: '1440 × 900' })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Телефон' }));
  dimensions(390, 844);
  fireEvent.change(screen.getByLabelText('Предустановленный размер'), {
    target: { value: '414x896' },
  });
  dimensions(414, 896);
});

test('custom dimensions preserve partial typing, update valid viewport values and clamp on blur', () => {
  start();
  const width = screen.getByLabelText('Ширина, px');
  const height = screen.getByLabelText('Высота, px');
  fireEvent.change(width, { target: { value: '1' } });
  expect(width).toHaveValue(1);
  dimensions(390, 844);
  fireEvent.change(width, { target: { value: '1280' } });
  dimensions(1280, 844);
  fireEvent.change(height, { target: { value: '900' } });
  dimensions(1280, 900);
  expect(screen.getByLabelText('Предустановленный размер')).toHaveValue(
    'custom'
  );
  fireEvent.change(width, { target: { value: '100' } });
  fireEvent.blur(width);
  dimensions(280, 900);
  expect(width).toHaveValue(280);
  fireEvent.change(height, { target: { value: '9999' } });
  fireEvent.blur(height);
  dimensions(280, 2160);
  expect(height).toHaveValue(2160);
  fireEvent.change(width, { target: { value: '9999' } });
  fireEvent.blur(width);
  fireEvent.change(height, { target: { value: '1' } });
  fireEvent.blur(height);
  dimensions(3840, 320);
});

test('rotate swaps actual dimensions and respects each axis bounds', () => {
  start();
  fireEvent.click(screen.getByRole('button', { name: 'Повернуть экран' }));
  dimensions(844, 390);
  expect(screen.getByLabelText('Ширина, px')).toHaveValue(844);
  expect(screen.getByLabelText('Высота, px')).toHaveValue(390);
  fireEvent.change(screen.getByLabelText('Ширина, px'), {
    target: { value: '3840' },
  });
  fireEvent.change(screen.getByLabelText('Высота, px'), {
    target: { value: '2160' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Повернуть экран' }));
  dimensions(2160, 2160);
});

test('fit responds to available space, and 100 percent changes scaling rather than the media viewport', () => {
  start('Компьютер');
  dimensions(1536, 864);
  expect(frame().style.transform).toBe(`scale(${950 / 1536})`);
  stageSize = { width: 600, height: 400 };
  fireEvent(window, new Event('resize'));
  expect(frame().style.transform).toBe(`scale(${550 / 1536})`);
  dimensions(1536, 864);
  fireEvent.click(screen.getByRole('button', { name: '100%' }));
  expect(frame().style.transform).toBe('scale(1)');
  expect(frame().parentElement!.style.width).toBe('1536px');
  dimensions(1536, 864);
  fireEvent.click(screen.getByRole('button', { name: /^Вписать/ }));
  expect(frame().style.transform).toBe(`scale(${550 / 1536})`);
});

test('closing preview restores the parent scrolling state and the selected device trigger focus', () => {
  document.body.style.overflow = 'auto';
  start('Планшет');
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть предпросмотр' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.querySelector('iframe')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('auto');
  expect(screen.getByRole('button', { name: 'Планшет' })).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Компьютер' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

test('Escape works from the toolbar and inside the iframe; unmount restores scrolling', () => {
  const view = render(<AiPreviewWidget />);
  fireEvent.click(screen.getByRole('button', { name: 'Телефон' }));
  fireEvent.keyDown(
    screen.getByRole('button', { name: 'Закрыть предпросмотр' }),
    { key: 'Escape' }
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Телефон' }));
  fireEvent.load(frame());
  fireEvent.keyDown(frame().contentDocument!, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Компьютер' }));
  view.unmount();
  expect(document.body.style.overflow).toBe('');
});

test('device controls are always external to the landing content', () => {
  render(
    <main data-testid='landing'>
      <h1>Исходный заголовок</h1>
      <AiPreviewWidget />
    </main>
  );
  const landing = screen.getByTestId('landing');
  expect(landing).not.toContainElement(
    screen.getByRole('region', { name: 'Устройство для просмотра главной' })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Телефон' }));
  expect(landing).not.toContainElement(screen.getByRole('dialog'));
  expect(landing.textContent).toBe('Исходный заголовок');
});
