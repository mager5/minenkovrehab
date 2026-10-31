// Server-only adapter. Never return credentials to an API response or logs.
import { execFile } from 'node:child_process';
import path from 'node:path';

export const persistentKeyEnabled = () =>
  process.platform === 'darwin' && process.env.AI_TEST_KEYCHAIN !== '0';

export function keychainRequest(
  action: 'save' | 'load',
  key?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      path.join(process.cwd(), '.ai-runtime/ai-keychain'),
      [action],
      { timeout: 30000, maxBuffer: 4096 },
      (error, stdout) => {
        // Child errors may contain captured output. Do not propagate them.
        if (error) return reject(Error('key_store_unavailable'));
        resolve(stdout);
      }
    );
    child.stdin?.on('error', () => {});
    child.stdin?.end(key || '');
  });
}

export async function loadSavedKey() {
  if (!persistentKeyEnabled()) return undefined;
  const key = await keychainRequest('load');
  if (!key) return undefined;
  if (!/^sk-[A-Za-z0-9_-]{16,300}$/.test(key))
    throw Error('key_store_unavailable');
  return key;
}
export async function saveKey(key: string) {
  if (persistentKeyEnabled()) await keychainRequest('save', key);
}
