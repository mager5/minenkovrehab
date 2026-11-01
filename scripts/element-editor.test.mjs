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
  deleteBlock,
  duplicateBlock,
  editDirect,
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

test('delete is its own persisted history step and undo restores order, content and styles', async () => {
  const container = { ...target, tag: 'div', path: [{ tag: 'div', index: 0 }] };
  const caption = {
    ...target,
    kind: 'text',
    path: [
      { tag: 'div', index: 0 },
      { tag: 'a', index: 0 },
    ],
  };
  const original = await elementStatus();
  const edited = await editText(caption, 'Saved caption', original.revision);
  const moved = await reorderGroup(
    container,
    'hero-actions',
    [1, 0],
    edited.revision
  );
  const deleted = await deleteBlock(
    container,
    'hero-actions',
    0,
    moved.revision
  );
  assert.deepEqual(deleted.overrides.find(item => item.layout)?.layout, {
    group: 'hero-actions',
    order: [1, 0],
    hidden: [0],
  });
  assert.deepEqual((await elementStatus()).overrides, deleted.overrides);
  assert.match(deleted.actions[0].label, /Удаление блока/);
  assert.match(deleted.actions[1].label, /Перестановка/);
  assert.match(deleted.actions[2].label, /Saved caption/);
  const movedAgain = await reorderGroup(
    container,
    'hero-actions',
    [0, 1],
    deleted.revision
  );
  assert.deepEqual(
    movedAgain.overrides.find(item => item.layout)?.layout.hidden,
    [0]
  );
  const undoMove = await undoElement(movedAgain.revision);
  assert.deepEqual(undoMove.overrides, deleted.overrides);
  const undoDelete = await undoElement(undoMove.revision);
  assert.deepEqual(undoDelete.overrides, moved.overrides);
  assert.equal(undoDelete.actions.length, 2);
  const undoOrder = await undoElement(undoDelete.revision);
  assert.deepEqual(undoOrder.overrides, edited.overrides);
  assert.deepEqual((await undoElement(undoOrder.revision)).overrides, []);
});
test('deletion rejects invalid indices, other roots, stale revisions and production without writes', async () => {
  const container = { ...target, tag: 'div' };
  const before = await elementStatus();
  for (const index of [-1, 2, 0.5, '0'])
    await assert.rejects(() =>
      deleteBlock(container, 'hero-actions', index, before.revision)
    );
  await assert.rejects(() =>
    deleteBlock(container, 'other', 0, before.revision)
  );
  await assert.rejects(() =>
    deleteBlock(
      { ...container, root: 'header' },
      'hero-actions',
      0,
      before.revision
    )
  );
  await assert.rejects(
    () => deleteBlock(container, 'hero-actions', 0, 'stale'),
    /stale_page/
  );
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(
      () => deleteBlock(container, 'hero-actions', 0, before.revision),
      /test_only/
    );
  } finally {
    process.env.NODE_ENV = 'development';
  }
  assert.deepEqual((await elementStatus()).overrides, []);
});

test('duplication copies saved overrides and subsequent edits stay independent', async () => {
  const container = { ...target, tag: 'div', path: [{ tag: 'div', index: 0 }] };
  const caption = {
    ...target,
    kind: 'text',
    path: [...container.path, { tag: 'a', index: 0 }],
  };
  const initial = await elementStatus();
  const edited = await editText(caption, 'Client caption', initial.revision);
  const copied = await duplicateBlock(
    container,
    'hero-actions',
    0,
    edited.revision
  );
  assert.deepEqual(copied.overrides.find(item => item.layout)?.layout.copies, [
    { id: 2, source: 0 },
  ]);
  assert.deepEqual(
    copied.overrides.find(item => item.layout)?.layout.order,
    [0, 2, 1]
  );
  const copyCaption = {
    ...caption,
    path: [...container.path, { tag: 'a', index: 2 }],
  };
  const customized = await editText(
    copyCaption,
    'Independent copy',
    copied.revision
  );
  assert.equal(
    customized.overrides.find(
      item =>
        item.target.path.at(-1)?.index === 0 && item.target.kind === 'text'
    ).changes[0].value,
    'Client caption'
  );
  assert.equal(
    customized.overrides.find(
      item =>
        item.target.path.at(-1)?.index === 2 && item.target.kind === 'text'
    ).changes[0].value,
    'Independent copy'
  );
  const moved = await reorderGroup(
    container,
    'hero-actions',
    [2, 1, 0],
    customized.revision
  );
  const deleted = await deleteBlock(
    container,
    'hero-actions',
    2,
    moved.revision
  );
  assert.deepEqual(deleted.overrides.find(item => item.layout)?.layout.hidden, [
    2,
  ]);
  const restored = await undoElement(deleted.revision);
  assert.deepEqual(restored.overrides, moved.overrides);
  const undoMove = await undoElement(restored.revision);
  const undoText = await undoElement(undoMove.revision);
  assert.deepEqual(
    (await undoElement(undoText.revision)).overrides,
    edited.overrides
  );
});
test('manual appearance settings validate and undo only requested properties', async () => {
  const before = await elementStatus();
  const edited = await editDirect(
    target,
    [
      { property: 'color', value: '#123456' },
      { property: 'borderRadius', value: '12px' },
    ],
    before.revision
  );
  assert.equal(edited.overrides[0].changes.length, 2);
  await assert.rejects(() =>
    editDirect(
      target,
      [{ property: 'color', value: 'url(javascript:x)' }],
      edited.revision
    )
  );
  await assert.rejects(() =>
    editDirect(
      target,
      [{ property: 'text', value: 'not settings' }],
      edited.revision
    )
  );
  assert.deepEqual((await undoElement(edited.revision)).overrides, []);
});
test('image replacement normalizes a local upload and undo preserves original content', async () => {
  const sharp = (await import('sharp')).default;
  const { replaceImage } = await import('../src/lib/ai-image.ts');
  const image = { ...target, tag: 'img', textEditable: false };
  const before = await elementStatus();
  const bytes = await sharp({
    create: { width: 40, height: 30, channels: 3, background: '#123456' },
  })
    .png()
    .toBuffer();
  const saved = await replaceImage(image, bytes, before.revision);
  const source = saved.overrides[0].changes[0].value;
  assert.match(source, /^\/uploads\/ai-test\/[a-f0-9-]+\.webp$/);
  const metadata = await sharp(
    await readFile(path.join('public', source))
  ).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 40);
  assert.deepEqual((await undoElement(saved.revision)).overrides, []);
  await assert.rejects(
    () =>
      replaceImage(
        image,
        new TextEncoder().encode('<svg>not a raster image</svg>'),
        before.revision
      ),
    /invalid_image/
  );
});

test('preview framing exception is scoped to the development-only preview route', async () => {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const config = require('../next.config.js');
  const previousNode = process.env.NODE_ENV,
    previousTest = process.env.AI_TEST_ENABLED;
  try {
    process.env.NODE_ENV = 'production';
    process.env.AI_TEST_ENABLED = '1';
    const production = await config.headers();
    assert.equal(production.length, 1);
    assert.equal(
      production[0].headers.find(header => header.key === 'X-Frame-Options')
        .value,
      'DENY'
    );
    process.env.NODE_ENV = 'development';
    process.env.AI_TEST_ENABLED = '0';
    assert.equal((await config.headers()).length, 1);
    process.env.AI_TEST_ENABLED = '1';
    const preview = await config.headers();
    assert.equal(preview.length, 2);
    assert.equal(preview[1].source, '/');
    assert.deepEqual(preview[1].has, [
      { type: 'query', key: 'ai-preview', value: 'phone' },
    ]);
    assert.equal(preview[1].headers[0].value, 'SAMEORIGIN');
  } finally {
    process.env.NODE_ENV = previousNode;
    process.env.AI_TEST_ENABLED = previousTest;
  }
});
