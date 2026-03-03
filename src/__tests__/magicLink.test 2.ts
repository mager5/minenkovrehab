import { signMagicToken, verifyMagicToken } from '@/lib/auth/magic-link';

describe('magic link token', () => {
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      AUTH_LINK_SECRET: 'test-secret',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('создает и успешно проверяет токен', () => {
    const token = signMagicToken({
      email: 'user@example.com',
      password: 'Password1!',
    });

    const payload = verifyMagicToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('user@example.com');
    expect(payload?.password).toBe('Password1!');
  });

  it('возвращает null для поврежденного токена', () => {
    const token = signMagicToken({
      email: 'user@example.com',
      password: 'Password1!',
    });

    const broken =
      token.split('.').length === 2 ? `${token}wrong` : 'invalid.token.value';

    const payload = verifyMagicToken(broken);

    expect(payload).toBeNull();
  });
});
