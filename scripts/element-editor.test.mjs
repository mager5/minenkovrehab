import { test, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (
        error.code === 'ERR_MODULE_NOT_FOUND' &&
        specifier.startsWith('.') &&
        !path.extname(specifier)
      )
        return next(specifier + '.ts', context);
      throw error;
    }
  },
});
const { configureKey } = await import('../src/lib/ai-title.ts');
const {
  elementStatus,
  editElement,
  undoElement,
  proposeElementEdit,
  transcribeVoice,
} = await import('../src/lib/element-editor.ts');
const previous = process.cwd(),
  originalFetch = globalThis.fetch;
const root = await mkdtemp(path.join(tmpdir(), 'minenkov-elements-'));
execFileSync('git', ['init', '-b', 'ai-test', root], { stdio: 'ignore' });
await mkdir(path.join(root, 'content'));
process.chdir(root);
process.env.NODE_ENV = 'development';
process.env.AI_TEST_ENABLED = '1';
configureKey('sk-' + 'synthetic'.repeat(4));
const target = {
  root: 'main',
  path: [{ tag: 'a', index: 0 }],
  kind: 'element',
  textIndex: 0,
  tag: 'a',
  label: 'Synthetic button',
  textEditable: true,
  styles: { color: '#ffffff' },
};
const response = changes =>
  Response.json({
    status: 'completed',
    output: [
      {
        content: [
          {
            type: 'output_text',
            text: JSON.stringify({
              summary: 'Синтетическая проверка',
              changes,
            }),
          },
        ],
      },
    ],
  });
beforeEach(async () => {
  await writeFile('content/ai-element-overrides.json', '[]');
  await writeFile('.ai-element-history.json', '[]');
  globalThis.fetch = originalFetch;
});
after(async () => {
  globalThis.fetch = originalFetch;
  process.chdir(previous);
  await rm(root, { recursive: true, force: true });
});
test('only selected-element metadata is sent to the provider; key stays in Authorization', async () => {
  const result = await proposeElementEdit(
    'Синий фон',
    target,
    'synthetic-key',
    async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/responses');
      assert.equal(options.headers.Authorization, 'Bearer synthetic-key');
      assert.equal(options.body.includes('synthetic-key'), false);
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.deepEqual(Object.keys(JSON.parse(body.input)).sort(), [
        'message',
        'selectedElement',
      ]);
      return response([{ property: 'backgroundColor', value: '#0000ff' }]);
    }
  );
  assert.equal(result.changes[0].value, '#0000ff');
});
test('edits persist only as overrides and undo restores the preceding state', async () => {
  globalThis.fetch = async () =>
    response([{ property: 'backgroundColor', value: '#0000ff' }]);
  const before = await elementStatus();
  const result = await editElement(target, 'Синий фон', before.revision);
  assert.equal(result.overrides.length, 1);
  assert.equal(result.canUndo, true);
  assert.equal(result.overrides[0].target.root, 'main');
  const restored = await undoElement(result.revision);
  assert.deepEqual(restored.overrides, []);
  assert.equal(restored.canUndo, false);
});
test('invalid edits and stale revisions produce no partial writes', async () => {
  const before = await elementStatus();
  globalThis.fetch = async () =>
    response([
      { property: 'color', value: '#ff0000' },
      { property: 'href', value: 'javascript:bad()' },
    ]);
  await assert.rejects(() => editElement(target, 'test', before.revision));
  await assert.rejects(
    () => editElement(target, 'test', 'stale'),
    /stale_page/
  );
  assert.deepEqual((await elementStatus()).overrides, []);
});
test('production mode cannot mutate overrides', async () => {
  const before = await elementStatus();
  process.env.NODE_ENV = 'production';
  await assert.rejects(
    () => editElement(target, 'test', before.revision),
    /test_only/
  );
  process.env.NODE_ENV = 'development';
  assert.equal(
    await readFile('content/ai-element-overrides.json', 'utf8'),
    '[]'
  );
});
test('voice transcription uses the documented multipart model and returns text without editing the page', async () => {
  const before = await elementStatus();
  const text = await transcribeVoice(
    new Uint8Array(300),
    'audio/webm;codecs=opus',
    'synthetic-key',
    async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/audio/transcriptions');
      assert.equal(options.headers.Authorization, 'Bearer synthetic-key');
      assert.equal(options.body.get('model'), 'gpt-transcribe');
      assert.equal(options.body.get('languages[]'), 'ru');
      assert.equal(options.body.get('file').name, 'voice.webm');
      return Response.json({ text: 'Сделай кнопку синей' });
    }
  );
  assert.equal(text, 'Сделай кнопку синей');
  assert.deepEqual(await elementStatus(), before);
});
test('unsupported, empty and oversized audio is rejected before transmission', async () => {
  const fail = async () => {
    throw Error('must not request');
  };
  for (const [bytes, mime] of [
    [new Uint8Array(1), 'audio/webm'],
    [new Uint8Array(300), 'text/html'],
    [new Uint8Array(5 * 1024 * 1024 + 1), 'audio/webm'],
  ])
    await assert.rejects(
      () => transcribeVoice(bytes, mime, 'synthetic-key', fail),
      /invalid_audio/
    );
});
