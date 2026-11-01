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
  editHeading,
  editText,
  reorderGroup,
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
process.env.AI_TEST_KEYCHAIN = '0';
await configureKey('sk-' + 'synthetic'.repeat(4));
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

test('direct heading edits persist without a provider call, preserve styles and support undo', async () => {
  const heading = { ...target, tag: 'h1', path: [{ tag: 'h1', index: 0 }] };
  const existing = [
    {
      target: { ...heading, kind: 'text' },
      changes: [
        { property: 'color', value: '#FF0000' },
        { property: 'text', value: 'Earlier title' },
      ],
    },
  ];
  await writeFile(
    'content/ai-element-overrides.json',
    JSON.stringify(existing)
  );
  globalThis.fetch = () => {
    throw Error('Provider must not be called');
  };
  const before = await elementStatus();
  const result = await editHeading(heading, 'Direct title', before.revision);
  assert.equal(result.overrides[0].changes.length, 1);
  assert.equal(result.overrides[0].changes[0].property, 'color');
  assert.equal(result.overrides[1].changes[0].value, 'Direct title');
  assert.equal((await elementStatus()).revision, result.revision);
  assert.deepEqual((await undoElement(result.revision)).overrides, existing);
});
test('direct heading rejects unsafe text, other elements, stale pages and production without writes', async () => {
  const heading = { ...target, tag: 'h1', path: [{ tag: 'h1', index: 0 }] };
  const before = await elementStatus();
  for (const text of ['', '<b>Title</b>', 'a'.repeat(161)])
    await assert.rejects(() => editHeading(heading, text, before.revision));
  await assert.rejects(() => editHeading(target, 'Title', before.revision));
  await assert.rejects(
    () => editHeading(heading, 'Title', 'stale'),
    /stale_page/
  );
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(
      () => editHeading(heading, 'Title', before.revision),
      /test_only/
    );
  } finally {
    process.env.NODE_ENV = 'development';
  }
  assert.deepEqual((await elementStatus()).overrides, []);
});

test('manual captions in header/main/footer persist and preserve sibling text overrides', async () => {
  globalThis.fetch = () => {
    throw Error('No AI required for manual editing');
  };
  for (const root of ['header', 'main', 'footer', 'topbar']) {
    const caption = { ...target, root, kind: 'text', textIndex: 1 };
    const sibling = { ...caption, textIndex: 0 };
    const before = [
      { target: sibling, changes: [{ property: 'text', value: 'Sibling' }] },
    ];
    await writeFile(
      'content/ai-element-overrides.json',
      JSON.stringify(before)
    );
    const revision = (await elementStatus()).revision;
    const result = await editText(caption, 'Manual caption', revision);
    assert.deepEqual(result.overrides[0], before[0]);
    assert.equal(result.overrides[1].changes[0].value, 'Manual caption');
    assert.deepEqual((await undoElement(result.revision)).overrides, before);
  }
});
test('manual captions reject containers, invalid text and stale revisions without writes', async () => {
  const caption = { ...target, kind: 'text' };
  const before = await elementStatus();
  for (const value of ['', '<script>', 'x'.repeat(2001)])
    await assert.rejects(() => editText(caption, value, before.revision));
  await assert.rejects(() =>
    editText(target, 'No container replacement', before.revision)
  );
  await assert.rejects(
    () => editText(caption, 'Caption', 'stale'),
    /stale_page/
  );
  assert.deepEqual((await elementStatus()).overrides, []);
});

test('reorder and text edits share revisions and undo without losing each other', async () => {
  const container = { ...target, tag: 'div', path: [{ tag: 'div', index: 0 }] };
  const first = await elementStatus();
  const moved = await reorderGroup(
    container,
    'hero-actions',
    [1, 0],
    first.revision
  );
  assert.deepEqual(moved.overrides[0].layout, {
    group: 'hero-actions',
    order: [1, 0],
  });
  const caption = {
    ...target,
    kind: 'text',
    path: [
      { tag: 'div', index: 0 },
      { tag: 'a', index: 1 },
    ],
  };
  const edited = await editText(caption, 'Second caption', moved.revision);
  assert.deepEqual(
    edited.overrides.find(item => item.layout)?.layout.order,
    [1, 0]
  );
  const undoText = await undoElement(edited.revision);
  assert.deepEqual(undoText.overrides, moved.overrides);
  assert.deepEqual((await undoElement(undoText.revision)).overrides, []);
});
test('reorder rejects cross-group, malformed permutation, stale page and production', async () => {
  const container = { ...target, tag: 'div' };
  const first = await elementStatus();
  for (const [group, order] of [
    ['other', [1, 0]],
    ['hero-actions', [0, 0]],
    ['hero-actions', [0, 1, 2]],
    ['hero-actions', [-1, 0]],
    ['hero-actions', [2, 0]],
  ])
    await assert.rejects(() =>
      reorderGroup(container, group, order, first.revision)
    );
  await assert.rejects(() =>
    reorderGroup(
      { ...container, root: 'header' },
      'hero-actions',
      [1, 0],
      first.revision
    )
  );
  await assert.rejects(
    () => reorderGroup(container, 'hero-actions', [1, 0], 'stale'),
    /stale_page/
  );
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(
      () => reorderGroup(container, 'hero-actions', [1, 0], first.revision),
      /test_only/
    );
  } finally {
    process.env.NODE_ENV = 'development';
  }
  assert.deepEqual((await elementStatus()).overrides, []);
});
