import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';

const binary = path.resolve('.ai-runtime/ai-keychain');
const synthetic = 'sk-' + 'synthetic-test-only-'.repeat(3);
function run(action, key = '') {
  return new Promise((resolve, reject) => {
    const child = execFile(
      binary,
      [action, '--test'],
      { timeout: 30000 },
      (error, stdout) => {
        if (error)
          return reject(
            new Error(
              'Native keychain integration failed (no secret output captured).'
            )
          );
        resolve(stdout);
      }
    );
    child.stdin.on('error', () => {});
    child.stdin.end(key);
  });
}
test(
  'macOS keychain persists a synthetic credential across independent processes and supports replacement',
  {
    skip:
      process.platform !== 'darwin' || process.env.RUN_KEYCHAIN_TEST !== '1',
  },
  async () => {
    try {
      await run('delete-test');
      assert.equal(await run('load'), '');
      assert.equal(await run('save', synthetic), '');
      // Each call starts a fresh process; no in-memory state can satisfy this.
      assert.equal(await run('load'), synthetic);
      const replacement = synthetic + 'replacement';
      await run('save', replacement);
      assert.equal(await run('load'), replacement);
    } finally {
      await run('delete-test');
    }
    assert.equal(await run('load'), '');
  }
);
