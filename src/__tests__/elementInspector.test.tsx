import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import AiElementInspector from '@/components/AiElementInspector';
import type { EditTarget } from '@/lib/element-editor-schema';

const request = jest.fn();
const onBusy = jest.fn();
const onSaved = jest.fn();
const onError = jest.fn();
const originalFetch = global.fetch;
const revision = 'synthetic-revision-before';
const saved = {
  overrides: [],
  revision: 'synthetic-revision-after',
  canUndo: true,
  reply: 'Настройки сохранены.',
};
const button: EditTarget = {
  root: 'main',
  path: [
    { tag: 'section', index: 0 },
    { tag: 'button', index: 1 },
  ],
  kind: 'element',
  textIndex: 0,
  tag: 'button',
  label: 'Синтетическая кнопка',
  textEditable: true,
  styles: {
    color: 'rgb(12, 34, 56)',
    backgroundColor: 'rgb(250, 251, 252)',
    fontSize: '18px',
    fontWeight: '500',
    borderRadius: '12px',
    padding: '16px',
    backgroundImage: 'none',
  },
};
const image: EditTarget = {
  root: 'main',
  path: [
    { tag: 'section', index: 0 },
    { tag: 'img', index: 0 },
  ],
  kind: 'element',
  textIndex: 0,
  tag: 'img',
  label: 'Синтетическое изображение',
  textEditable: false,
  styles: {
    src: '/images/original.webp',
    width: '240px',
    height: '180px',
    backgroundImage: 'none',
  },
};
function props(selected: EditTarget | null = button, disabled = false) {
  return { selected, revision, disabled, onBusy, onSaved, onError };
}
function openSettings() {
  fireEvent.click(screen.getByText('Настройки элемента'));
  return screen.getByRole('button', { name: 'Сохранить настройки' });
}
function syntheticImage() {
  return new File(
    [new Uint8Array([82, 73, 70, 70, 12, 0, 0, 0, 87, 69, 66, 80])],
    'synthetic.webp',
    { type: 'image/webp' }
  );
}
beforeEach(() => {
  request.mockReset().mockResolvedValue({ ok: true, json: async () => saved });
  onBusy.mockReset();
  onSaved.mockReset();
  onError.mockReset();
  global.fetch = request;
});
afterEach(() => {
  cleanup();
  global.fetch = originalFetch;
});

test('without a selection the inspector is absent, and unchanged settings cannot be saved', () => {
  const view = render(<AiElementInspector {...props(null)} />);
  expect(screen.queryByText('Настройки элемента')).not.toBeInTheDocument();
  view.rerender(<AiElementInspector {...props()} />);
  const save = openSettings();
  expect(save).toBeDisabled();
  fireEvent.click(save);
  expect(request).not.toHaveBeenCalled();
  expect(onBusy).not.toHaveBeenCalled();
});

test('manual settings send only changed properties to the local route without an AI key', async () => {
  const original = JSON.stringify(button);
  let complete:
    | ((_response: { ok: boolean; json: () => Promise<typeof saved> }) => void)
    | undefined;
  request.mockImplementation(
    () =>
      new Promise(resolve => {
        complete = resolve;
      })
  );
  render(<AiElementInspector {...props()} />);
  const save = openSettings();
  fireEvent.change(screen.getByLabelText('Размер текста, px'), {
    target: { value: '24' },
  });
  fireEvent.change(screen.getByLabelText('Фон'), {
    target: { value: '#00ff00' },
  });
  fireEvent.click(save);
  expect(onBusy).toHaveBeenCalledWith(true);
  expect(onSaved).not.toHaveBeenCalled();
  const [url, options] = request.mock.calls[0]!;
  expect(url).toBe('/api/ai-test');
  expect(options.method).toBe('POST');
  expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
  const body = JSON.parse(options.body);
  expect(body).toEqual({
    action: 'settings',
    page: '/',
    target: button,
    changes: [
      { property: 'fontSize', value: '24px' },
      { property: 'backgroundColor', value: '#00ff00' },
    ],
    revision,
  });
  expect(body).not.toHaveProperty('key');
  expect(body).not.toHaveProperty('model');
  await act(async () => complete?.({ ok: true, json: async () => saved }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
  expect(onBusy.mock.calls.map(([value]) => value)).toEqual([true, false]);
  expect(save).toBeDisabled();
  expect(onError).not.toHaveBeenCalled();
  expect(JSON.stringify(button)).toBe(original);
});

test('returning a changed field to its original value leaves no dirty settings to save', () => {
  render(<AiElementInspector {...props()} />);
  const save = openSettings();
  const size = screen.getByLabelText('Размер текста, px');
  fireEvent.change(size, { target: { value: '24' } });
  expect(save).toBeEnabled();
  fireEvent.change(size, { target: { value: '18' } });
  expect(save).toBeDisabled();
  fireEvent.click(save);
  expect(request).not.toHaveBeenCalled();
});

test('a text-node selection exposes typography without background, radius or container padding', () => {
  const text: EditTarget = {
    ...button,
    kind: 'text',
    tag: 'p',
    path: [{ tag: 'p', index: 0 }],
    label: 'Только надпись',
  };
  render(<AiElementInspector {...props(text)} />);
  openSettings();
  expect(screen.getByLabelText('Цвет текста')).toBeInTheDocument();
  expect(screen.getByLabelText('Размер текста, px')).toBeInTheDocument();
  expect(screen.getByLabelText('Насыщенность')).toBeInTheDocument();
  expect(screen.queryByLabelText('Фон')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Скругление, px')).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText('Отступ со всех сторон, px')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Заменить изображение' })
  ).not.toBeInTheDocument();
});

test('image replacement sends synthetic File, exact target and revision as FormData to the local upload route', async () => {
  const original = JSON.stringify(image);
  render(<AiElementInspector {...props(image)} />);
  const file = syntheticImage();
  fireEvent.change(screen.getByLabelText('Новое изображение'), {
    target: { files: [file] },
  });
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
  expect(request).toHaveBeenCalledTimes(1);
  const [url, options] = request.mock.calls[0]!;
  expect(url).toBe('/api/ai-test/image');
  expect(options.method).toBe('POST');
  expect(options.headers).toBeUndefined();
  expect(options.body).toBeInstanceOf(FormData);
  const form = options.body as FormData;
  expect([...form.keys()]).toEqual(['file', 'target', 'revision']);
  const upload = form.get('file') as File;
  expect(upload.name).toBe('synthetic.webp');
  expect(upload.type).toBe('image/webp');
  expect(upload.size).toBe(file.size);
  expect(JSON.parse(form.get('target') as string)).toEqual(image);
  expect(form.get('revision')).toBe(revision);
  expect(onBusy.mock.calls.map(([value]) => value)).toEqual([true, false]);
  expect(onError).not.toHaveBeenCalled();
  expect(JSON.stringify(image)).toBe(original);
});

test('a selected background image offers the same replacement flow for its own container', async () => {
  const background: EditTarget = {
    ...button,
    tag: 'section',
    path: [{ tag: 'section', index: 0 }],
    styles: {
      ...button.styles,
      backgroundImage: 'url("/images/background.webp")',
    },
  };
  render(<AiElementInspector {...props(background)} />);
  expect(
    screen.getByRole('button', { name: 'Заменить изображение' })
  ).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Новое изображение'), {
    target: { files: [syntheticImage()] },
  });
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  const form = request.mock.calls[0]![1].body as FormData;
  expect(JSON.parse(form.get('target') as string)).toEqual(background);
});

test('a failed settings request reports the error and keeps the draft retryable without changing the original', async () => {
  const original = JSON.stringify(button);
  request.mockResolvedValue({
    ok: false,
    json: async () => ({
      error: 'Список правок изменился. Обновите страницу.',
    }),
  });
  render(<AiElementInspector {...props()} />);
  const save = openSettings();
  const size = screen.getByLabelText('Размер текста, px');
  fireEvent.change(size, { target: { value: '24' } });
  fireEvent.click(save);
  await waitFor(() =>
    expect(onError).toHaveBeenCalledWith(
      'Список правок изменился. Обновите страницу.'
    )
  );
  expect(onSaved).not.toHaveBeenCalled();
  expect(onBusy).toHaveBeenLastCalledWith(false);
  expect(size).toHaveValue(24);
  expect(save).toBeEnabled();
  expect(JSON.stringify(button)).toBe(original);
});

test('a failed upload leaves the original image intact and does not report a saved replacement', async () => {
  const original = JSON.stringify(image);
  request.mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Файл не является допустимым изображением.' }),
  });
  render(<AiElementInspector {...props(image)} />);
  fireEvent.change(screen.getByLabelText('Новое изображение'), {
    target: { files: [syntheticImage()] },
  });
  await waitFor(() =>
    expect(onError).toHaveBeenCalledWith(
      'Файл не является допустимым изображением.'
    )
  );
  expect(onSaved).not.toHaveBeenCalled();
  expect(onBusy).toHaveBeenLastCalledWith(false);
  expect(JSON.stringify(image)).toBe(original);
  expect(
    screen.getByRole('button', { name: 'Заменить изображение' })
  ).toBeEnabled();
});

test('oversized synthetic files are rejected before a request or a busy transition', () => {
  render(<AiElementInspector {...props(image)} />);
  const file = new File(
    [new Uint8Array(10 * 1024 * 1024 + 1)],
    'oversized.png',
    { type: 'image/png' }
  );
  fireEvent.change(screen.getByLabelText('Новое изображение'), {
    target: { files: [file] },
  });
  expect(onError).toHaveBeenCalledWith(
    'Изображение должно быть не больше 10 МБ.'
  );
  expect(request).not.toHaveBeenCalled();
  expect(onBusy).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('disabled inspector does not apply settings or start an upload', () => {
  render(<AiElementInspector {...props(image, true)} />);
  const save = openSettings();
  expect(save).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'Заменить изображение' })
  ).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Новое изображение'), {
    target: { files: [syntheticImage()] },
  });
  expect(request).not.toHaveBeenCalled();
  expect(onBusy).not.toHaveBeenCalled();
});

test('a color restored to its RGB baseline is omitted while another property remains dirty', async () => {
  render(<AiElementInspector {...props()} />);
  const save = openSettings();
  const color = screen.getByLabelText('Цвет текста');
  expect(color).toHaveValue('#0c2238');
  fireEvent.change(color, { target: { value: '#ff0000' } });
  fireEvent.change(color, { target: { value: '#0c2238' } });
  fireEvent.change(screen.getByLabelText('Размер текста, px'), {
    target: { value: '24' },
  });
  fireEvent.click(save);
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
  const body = JSON.parse(request.mock.calls[0]![1].body);
  expect(body.changes).toEqual([{ property: 'fontSize', value: '24px' }]);
});

test('mixed padding is not silently normalized, but an explicit uniform value is a real change', async () => {
  const mixed: EditTarget = {
    ...button,
    styles: { ...button.styles, padding: '16px 32px' },
  };
  render(<AiElementInspector {...props(mixed)} />);
  const save = openSettings();
  const padding = screen.getByLabelText('Отступ со всех сторон, px');
  expect(padding).toHaveValue(null);
  expect(padding).toHaveAttribute('placeholder', 'Разные');
  expect(save).toBeDisabled();
  fireEvent.change(padding, { target: { value: '16' } });
  expect(save).toBeEnabled();
  fireEvent.click(save);
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
  const body = JSON.parse(request.mock.calls[0]![1].body);
  expect(body.changes).toEqual([{ property: 'padding', value: '16px' }]);
  expect(mixed.styles.padding).toBe('16px 32px');
});
