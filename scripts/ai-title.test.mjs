import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
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
const {
  assertTestBranch,
  configureKey,
  keyConfigured,
  chat,
  originalTitle,
  readTitle,
  suggestTitle,
  validTitle,
  writeTitle,
} = await import('../src/lib/ai-title.ts');

const previous = process.cwd();
const root = await mkdtemp(path.join(tmpdir(), 'minenkov-ai-test-'));
execFileSync('git', ['init', '-b', 'ai-test', root], { stdio: 'ignore' });
await mkdir(path.join(root, 'content'));
await writeFile(
  path.join(root, 'content/ai-home-title.json'),
  JSON.stringify({ title: originalTitle })
);
process.chdir(root);
process.env.NODE_ENV = 'development';
process.env.AI_TEST_ENABLED = '1';
process.env.AI_TEST_KEYCHAIN = '0';
delete process.env.OPENAI_API_KEY;
after(async () => {
  process.chdir(previous);
  await rm(root, { recursive: true, force: true });
});

test('title changes persist only to the fixed content file', async () => {
  await writeTitle('Проверка тестовой ветки');
  assert.equal(await readTitle(), 'Проверка тестовой ветки');
  assert.deepEqual(
    JSON.parse(await readFile('content/ai-home-title.json', 'utf8')),
    { title: 'Проверка тестовой ветки' }
  );
});
test('HTML, controls, empty and oversized titles are rejected without writes', async () => {
  const before = await readTitle();
  for (const title of [
    '<script>alert(1)</script>',
    '',
    'a'.repeat(161),
    'line\nbreak',
  ]) {
    assert.equal(validTitle(title), false);
    await assert.rejects(() => writeTitle(title));
  }
  assert.equal(await readTitle(), before);
});
test('production and other branches cannot change the title', async () => {
  process.env.NODE_ENV = 'production';
  await assert.rejects(() => writeTitle('Forbidden'), /test_only/);
  process.env.NODE_ENV = 'development';
  execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/master']);
  await assert.rejects(assertTestBranch, /test_only/);
  execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/ai-test']);
});
test('missing key fails closed and leaves the title intact', async () => {
  const before = await readTitle();
  await assert.rejects(() => chat('Поменяй заголовок'), /missing_key/);
  assert.equal(await readTitle(), before);
});
test('provider request uses server Authorization, structured output, and no storage', async () => {
  const result = await suggestTitle(
    'Измени заголовок',
    originalTitle,
    'test-secret',
    async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/responses');
      assert.equal(options.headers.Authorization, 'Bearer test-secret');
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.text.format.strict, true);
      assert.equal(options.body.includes('test-secret'), false);
      return Response.json({
        status: 'completed',
        output: [
          {
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  action: 'set_title',
                  title: 'Новый заголовок',
                  reply: 'Предложение',
                }),
              },
            ],
          },
        ],
      });
    }
  );
  assert.equal(result.title, 'Новый заголовок');
});
test('provider errors, refusals and malformed edits are rejected', async () => {
  const request = result => async () => Response.json(result);
  await assert.rejects(
    () =>
      suggestTitle(
        'test',
        originalTitle,
        'test',
        async () => new Response('', { status: 401 })
      ),
    /provider_auth/
  );
  await assert.rejects(
    () =>
      suggestTitle(
        'test',
        originalTitle,
        'test',
        request({ status: 'incomplete' })
      ),
    /provider_error/
  );
  for (const result of [
    { action: 'set_title', title: '<h1>unsafe</h1>', reply: '' },
    { action: 'delete_file', title: null, reply: '' },
  ]) {
    await assert.rejects(
      () =>
        suggestTitle(
          'test',
          originalTitle,
          'test',
          request({
            status: 'completed',
            output: [
              {
                content: [
                  { type: 'output_text', text: JSON.stringify(result) },
                ],
              },
            ],
          })
        ),
      /invalid_response/
    );
  }
});

test('production cannot access or configure the local credential store', async () => {
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(
      () => configureKey('sk-' + 'synthetic'.repeat(4)),
      /test_only/
    );
    await assert.rejects(keyConfigured, /test_only/);
  } finally {
    process.env.NODE_ENV = 'development';
  }
});
