import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
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
const { applyPageEdits } = await import('../src/lib/home-editor-schema.ts');
const {
  demoHome,
  editHome,
  homeStatus,
  proposePageEdits,
  revisionOf,
  undoHome,
} = await import('../src/lib/home-editor.ts');
const { configureKey } = await import('../src/lib/ai-title.ts');
const baseline = JSON.parse(
  await readFile(
    new URL('../content/ai-home-page.json', import.meta.url),
    'utf8'
  )
);
baseline.title = 'Синтетический тест';
baseline.header.logoText = 'Test Site';
baseline.footer.title = 'Test Site';
baseline.footer.contacts = [];
baseline.footer.links = [];
baseline.footer.copyright = 'Test';
const originalCwd = process.cwd();
const originalFetch = globalThis.fetch;
const root = await mkdtemp(path.join(tmpdir(), 'minenkov-home-editor-'));
execFileSync('git', ['init', '-b', 'ai-test', root], { stdio: 'ignore' });
await mkdir(path.join(root, 'content'));
await writeFile(
  path.join(root, 'content/ai-home-page.json'),
  JSON.stringify(baseline)
);
for (const section of baseline.sections)
  for (const image of [
    section.image,
    section.mobileImage,
    ...section.cards.map(card => card.image),
  ]) {
    if (!image) continue;
    const target = path.join(root, 'public', image);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, 'synthetic image');
  }
process.chdir(root);
process.env.NODE_ENV = 'development';
process.env.AI_TEST_ENABLED = '1';
configureKey('sk-' + 'synthetic'.repeat(4));
after(async () => {
  globalThis.fetch = originalFetch;
  process.chdir(originalCwd);
  await rm(root, { recursive: true, force: true });
});
const replace = (path, value) => ({
  op: 'replace',
  path,
  from: '',
  valueJson: JSON.stringify(value),
});
const plan = operations => ({ summary: 'Синтетическая правка', operations });
const response = value =>
  Response.json({
    status: 'completed',
    output: [
      { content: [{ type: 'output_text', text: JSON.stringify(value) }] },
    ],
  });

test('one request can edit title, hero color, navigation, buttons and footer without changing other blocks', () => {
  const next = applyPageEdits(
    baseline,
    plan([
      replace('/title', 'Новое название'),
      replace('/sections/0/style/background', '#f0faf5'),
      replace('/header/links/2/label', 'Программы'),
      replace('/footer/description', 'Новый текст подвала'),
      {
        op: 'add',
        path: '/sections/0/buttons/-',
        from: '',
        valueJson: JSON.stringify({
          label: 'Выбрать программу',
          href: '/products',
          variant: 'primary',
        }),
      },
    ])
  );
  assert.equal(next.title, 'Новое название');
  assert.equal(next.sections[0].style.background, '#f0faf5');
  assert.equal(next.header.links[2].label, 'Программы');
  assert.equal(next.sections[0].buttons.at(-1).label, 'Выбрать программу');
  assert.equal(next.footer.description, 'Новый текст подвала');
  assert.deepEqual(next.sections.slice(1), baseline.sections.slice(1));
  assert.equal(baseline.title, 'Синтетический тест');
});
test('sections can be added, moved, hidden and removed; FAQ supports editable questions', () => {
  const faq = structuredClone(baseline.sections[1]);
  faq.id = 'new-faq';
  faq.kind = 'faq';
  faq.imagePosition = 'none';
  faq.image = '';
  faq.title = 'Частые вопросы';
  faq.cards = [
    {
      title: 'Как записаться?',
      text: 'Через контакты.',
      image: '',
      href: '',
      linkLabel: '',
    },
  ];
  let next = applyPageEdits(
    baseline,
    plan([
      {
        op: 'add',
        path: '/sections/2',
        from: '',
        valueJson: JSON.stringify(faq),
      },
    ])
  );
  assert.equal(next.sections[2].kind, 'faq');
  next = applyPageEdits(
    next,
    plan([
      { op: 'move', from: '/sections/2', path: '/sections/1', valueJson: '' },
      replace('/sections/2/visible', false),
    ])
  );
  assert.equal(next.sections[1].id, 'new-faq');
  assert.equal(next.sections[2].visible, false);
  next = applyPageEdits(
    next,
    plan([{ op: 'remove', path: '/sections/1', from: '', valueJson: '' }])
  );
  assert.equal(next.sections.length, baseline.sections.length);
});
test('prototype paths, arbitrary files, executable links, invalid CSS and removal of the hero are rejected', () => {
  for (const operation of [
    replace('/__proto__/polluted', true),
    replace('/sections/0/style/__proto__', {}),
    replace('/header/constructor/prototype', {}),
    replace('/api/key', 'secret'),
    replace('/header/links/0/href', 'javascript:alert(1)'),
    replace('/sections/0/style/background', 'url(https://attacker.invalid)'),
    { op: 'remove', path: '/sections/0', from: '', valueJson: '' },
  ])
    assert.throws(() => applyPageEdits(baseline, plan([operation])));
  assert.equal({}.polluted, undefined);
});
test('demo persists several changes, preserves the title, and undo restores the entire previous state', async () => {
  const before = await homeStatus();
  const changed = await demoHome(before.revision);
  assert.equal(changed.page.sections[0].style.background, '#f0faf5');
  assert.equal(changed.page.title, before.page.title);
  assert.equal(changed.canUndo, true);
  const undone = await undoHome(changed.revision);
  assert.deepEqual(undone.page, before.page);
  assert.equal(undone.canUndo, false);
});
test('stale revisions and production mode prevent writes', async () => {
  const before = await homeStatus();
  await assert.rejects(() => demoHome('stale'), /stale_page/);
  process.env.NODE_ENV = 'production';
  await assert.rejects(() => demoHome(before.revision), /test_only/);
  process.env.NODE_ENV = 'development';
  assert.equal((await homeStatus()).revision, before.revision);
});
test('provider contract uses the server key in a header and validated structured patch output', async () => {
  const result = await proposePageEdits(
    'Измени меню',
    baseline,
    'synthetic-secret',
    async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/responses');
      assert.equal(options.headers.Authorization, 'Bearer synthetic-secret');
      assert.equal(options.body.includes('synthetic-secret'), false);
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.text.format.strict, true);
      return response(plan([replace('/header/links/2/label', 'Программы')]));
    }
  );
  assert.equal(result.page.header.links[2].label, 'Программы');
  assert.deepEqual(result.page.sections, baseline.sections);
});
test('missing images and privileged links are rejected before any persistence', async () => {
  for (const operation of [
    replace('/sections/0/image', '/images/not-found.jpg'),
    replace('/header/links/0/href', '/api/auth'),
  ]) {
    await assert.rejects(
      () =>
        proposePageEdits('test', baseline, 'synthetic-secret', async () =>
          response(plan([operation]))
        ),
      /invalid_asset|invalid_edit/
    );
  }
});
test('preview returns validated changes without writing files or undo history', async () => {
  globalThis.fetch = async () =>
    response(plan([replace('/header/links/2/label', 'Программы')]));
  const before = await homeStatus();
  const preview = await editHome('Измени меню', before.revision, true);
  assert.equal(preview.page.header.links[2].label, 'Программы');
  assert.equal(preview.changed, true);
  assert.deepEqual(await homeStatus(), before);
});
test('live handler with a fake transport persists a patch, creates undo and prevents concurrent mutation', async () => {
  let release;
  const gate = new Promise(resolve => {
    release = resolve;
  });
  let entered;
  const enteredProvider = new Promise(resolve => {
    entered = resolve;
  });
  globalThis.fetch = async () => {
    entered();
    await gate;
    return response(plan([replace('/footer/description', 'Проверено')]));
  };
  const before = await homeStatus();
  const pending = editHome('Измени подвал', before.revision);
  await enteredProvider;
  await assert.rejects(() => demoHome(before.revision), /busy/);
  release();
  const result = await pending;
  assert.equal(result.page.footer.description, 'Проверено');
  assert.equal(result.canUndo, true);
  assert.deepEqual((await undoHome(result.revision)).page, before.page);
});
test('invalid model edits and provider failures leave the page untouched', async () => {
  const before = await homeStatus();
  globalThis.fetch = async () =>
    response(
      plan([
        replace('/title', 'Не должно сохраниться'),
        replace('/sections/0/style/titleSize', 10000),
      ])
    );
  await assert.rejects(() => editHome('test', before.revision));
  globalThis.fetch = async () => new Response('', { status: 401 });
  await assert.rejects(
    () => editHome('test', before.revision),
    /provider_auth/
  );
  assert.deepEqual(await homeStatus(), before);
});
