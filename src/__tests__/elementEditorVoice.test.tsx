import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import AiElementEditor from '@/components/AiElementEditor';

const stopTrack = jest.fn();
const getUserMedia = jest.fn();
const request = jest.fn();
class FakeRecorder {
  static isTypeSupported() {
    return true;
  }
  state = 'inactive';
  mimeType = 'audio/webm';
  onstop: (() => void) | null = null;
  ondataavailable: ((_event: { data: Blob }) => void) | null = null;
  onerror: (() => void) | null = null;
  start() {
    this.state = 'recording';
  }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({
      data: new Blob([new Uint8Array(300)], { type: 'audio/webm' }),
    });
    this.onstop?.();
  }
}
const originalFetch = global.fetch;
const originalMedia = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices'
);
const originalRecorder = Object.getOwnPropertyDescriptor(
  window,
  'MediaRecorder'
);
const originalFlag = process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
beforeEach(() => {
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '1';
  sessionStorage.clear();
  document.body.innerHTML =
    '<header><span data-ai-picker-slot data-ai-editor></span></header><main id="main-content"><h1>Original</h1></main><footer></footer>';
  stopTrack.mockReset();
  getUserMedia
    .mockReset()
    .mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  request.mockReset().mockImplementation(async (url: string) => ({
    ok: true,
    json: async () =>
      url === '/api/ai-test/transcribe'
        ? { text: 'Сделай кнопку синей' }
        : {
            configured: true,
            overrides: [],
            revision: 'test-revision',
            canUndo: false,
          },
  }));
  global.fetch = request;
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
  Object.defineProperty(window, 'MediaRecorder', {
    configurable: true,
    value: FakeRecorder,
  });
});
afterEach(() => {
  cleanup();
  global.fetch = originalFetch;
  if (originalMedia)
    Object.defineProperty(navigator, 'mediaDevices', originalMedia);
  else delete (navigator as unknown as Record<string, unknown>).mediaDevices;
  if (originalRecorder)
    Object.defineProperty(window, 'MediaRecorder', originalRecorder);
  else delete (window as unknown as Record<string, unknown>).MediaRecorder;
  if (originalFlag === undefined)
    delete process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
  else process.env.NEXT_PUBLIC_AI_TEST_ENABLED = originalFlag;
});

test('microphone starts only on click and recognized speech fills the draft without applying any edit', async () => {
  render(<AiElementEditor />);
  const mic = await screen.findByRole('button', { name: 'Голосовой ввод' });
  expect(getUserMedia).not.toHaveBeenCalled();
  fireEvent.click(mic);
  const stop = await screen.findByRole('button', { name: 'Остановить запись' });
  expect(getUserMedia).toHaveBeenCalledTimes(1);
  fireEvent.click(stop);
  await waitFor(() =>
    expect(
      screen.getByLabelText('Что изменить в выбранном элементе?')
    ).toHaveValue('Сделай кнопку синей')
  );
  expect(stopTrack).toHaveBeenCalled();
  expect(
    request.mock.calls.some(
      ([url, options]) => url === '/api/ai-test' && options?.method === 'POST'
    )
  ).toBe(false);
});
test('unmount stops recording and does not upload audio', async () => {
  const view = render(<AiElementEditor />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Голосовой ввод' })
  );
  await screen.findByRole('button', { name: 'Остановить запись' });
  view.unmount();
  expect(stopTrack).toHaveBeenCalled();
  expect(
    request.mock.calls.some(([url]) => url === '/api/ai-test/transcribe')
  ).toBe(false);
});
test('a late microphone permission result is cleaned up after the editor closes', async () => {
  let grant: ((_value: unknown) => void) | undefined;
  getUserMedia.mockImplementation(
    () =>
      new Promise(resolve => {
        grant = resolve;
      })
  );
  const view = render(<AiElementEditor />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Голосовой ввод' })
  );
  view.unmount();
  await act(async () => {
    grant?.({ getTracks: () => [{ stop: stopTrack }] });
  });
  expect(stopTrack).toHaveBeenCalled();
  expect(
    request.mock.calls.some(([url]) => url === '/api/ai-test/transcribe')
  ).toBe(false);
});
test('denied permission produces a useful message without recording or sending audio', async () => {
  getUserMedia.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
  render(<AiElementEditor />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Голосовой ввод' })
  );
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'Браузер не разрешил микрофон'
    )
  );
  expect(
    request.mock.calls.some(([url]) => url === '/api/ai-test/transcribe')
  ).toBe(false);
});

test('a missing AI connection opens setup instead of silently disabling the command', async () => {
  request.mockResolvedValue({
    ok: true,
    json: async () => ({
      configured: false,
      overrides: [],
      revision: 'test',
      canUndo: false,
    }),
  });
  render(<AiElementEditor />);
  const command = await screen.findByLabelText(
    'Что изменить в выбранном элементе?'
  );
  fireEvent.change(command, { target: { value: 'сделай текст красным' } });
  const apply = screen.getByRole('button', {
    name: 'Подключить AI для применения',
  });
  expect(apply).toBeEnabled();
  fireEvent.click(apply);
  expect(await screen.findByLabelText('OpenAI API-ключ')).toBeVisible();
  expect(command).toHaveValue('сделай текст красным');
  expect(screen.getByRole('status')).toHaveTextContent('после перезапуска');
  expect(
    request.mock.calls.some(([, options]) => options?.method === 'POST')
  ).toBe(false);
});

test('selected element and command survive an editor reload without storing the API key', async () => {
  const selected = {
    root: 'main',
    path: [{ tag: 'h1', index: 0 }],
    kind: 'text',
    textIndex: 0,
    tag: 'h1',
    label: 'Original',
    textEditable: true,
    styles: {},
  };
  sessionStorage.setItem(
    'ai-element-draft',
    JSON.stringify({ selected, message: 'сделай текст красным' })
  );
  const view = render(<AiElementEditor />);
  expect(
    await screen.findByRole('button', { name: 'Убрать выбранный элемент' })
  ).toBeVisible();
  expect(
    screen.getByLabelText('Что изменить в выбранном элементе?')
  ).toHaveValue('сделай текст красным');
  view.unmount();
  render(<AiElementEditor />);
  expect(
    await screen.findByRole('button', { name: 'Применить к элементу' })
  ).toBeEnabled();
  expect(JSON.parse(sessionStorage.getItem('ai-element-draft')!)).toEqual({
    selected,
    message: 'сделай текст красным',
  });
});
