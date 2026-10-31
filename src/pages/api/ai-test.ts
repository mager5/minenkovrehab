import type { NextApiRequest, NextApiResponse } from 'next';
import {
  assertTestBranch,
  chat,
  configureKey,
  demoTitle,
  keyConfigured,
  originalTitle,
  readTitle,
  writeTitle,
} from '@/lib/ai-title';

export const config = { api: { bodyParser: { sizeLimit: '4kb' } } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await assertTestBranch();
  } catch {
    return res.status(404).end();
  }
  const origin = process.env.AI_TEST_ORIGIN || 'http://127.0.0.1:4310';
  if (
    req.headers.host !== new URL(origin).host ||
    (req.method !== 'GET' && req.headers.origin !== origin)
  )
    return res
      .status(403)
      .json({
        error: 'Запрос разрешён только из локальной тестовой страницы.',
      });
  if (req.method === 'GET')
    return res.json({ configured: keyConfigured(), title: await readTitle() });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  }
  try {
    const body = req.body;
    if (body?.action === 'configure') {
      configureKey(body.key);
      return res.json({ configured: true });
    }
    if (body?.action === 'demo' || body?.action === 'reset') {
      const title = await writeTitle(
        body.action === 'demo' ? demoTitle : originalTitle
      );
      return res.json({
        title,
        reply:
          body.action === 'demo'
            ? 'Проверка без AI: заголовок изменён в тестовом файле. Для свободных команд подключите ключ.'
            : 'Исходный заголовок восстановлен.',
      });
    }
    if (body?.action !== 'chat')
      return res.status(400).json({ error: 'Неизвестная команда.' });
    return res.json(await chat(body.message));
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const errors: Record<string, string> = {
      missing_key: 'Подключите API-ключ кнопкой «Подключить AI».',
      invalid_key: 'Проверьте формат OpenAI API-ключа.',
      provider_auth: 'OpenAI отклонил ключ. Проверьте ключ и доступ к API.',
      provider_error:
        'OpenAI временно недоступен или запрос отклонён. Заголовок не изменён.',
      invalid_message: 'Введите команду длиной до 1000 символов.',
      invalid_response: 'AI вернул неподходящий ответ. Заголовок не изменён.',
      busy: 'Дождитесь завершения предыдущего запроса.',
      rate_limit: 'Не больше 10 запросов в минуту. Попробуйте позже.',
    };
    return res
      .status(code === 'missing_key' ? 503 : 400)
      .json({
        error:
          errors[code] || 'Не удалось выполнить команду. Попробуйте ещё раз.',
      });
  }
}
