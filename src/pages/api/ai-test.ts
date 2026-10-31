import type { NextApiRequest, NextApiResponse } from 'next';
import { assertTestBranch, configureKey, keyConfigured } from '@/lib/ai-title';
import { demoHome, editHome, homeStatus, undoHome } from '@/lib/home-editor';

export const config = { api: { bodyParser: { sizeLimit: '32kb' } } };

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
  if (!['GET', 'POST'].includes(req.method || '')) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  }
  try {
    if (req.method === 'GET')
      return res.json({ configured: keyConfigured(), ...(await homeStatus()) });
    const body = req.body;
    if (body?.action === 'configure') {
      configureKey(body.key);
      return res.json({ configured: true });
    }
    if (body?.action === 'undo') return res.json(await undoHome(body.revision));
    if (body?.action === 'demo') return res.json(await demoHome(body.revision));
    if (!['chat', 'preview'].includes(body?.action))
      return res.status(400).json({ error: 'Неизвестная команда.' });
    return res.json(
      await editHome(
        body.message,
        body.revision,
        body.action === 'preview',
        body.history
      )
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const errors: Record<string, string> = {
      missing_key: 'Подключите API-ключ кнопкой «Подключить AI».',
      invalid_key: 'Проверьте формат OpenAI API-ключа.',
      provider_auth: 'OpenAI отклонил ключ. Проверьте ключ и доступ к API.',
      provider_quota:
        'OpenAI ограничил запрос: проверьте баланс API и лимиты ключа или попробуйте позже.',
      provider_error:
        'OpenAI временно недоступен или запрос отклонён. Страница не изменена.',
      invalid_message: 'Введите команду длиной до 3000 символов.',
      invalid_edit:
        'AI предложил неподходящее изменение. Страница не изменена. Попробуйте уточнить команду.',
      invalid_asset:
        'AI выбрал изображение, которого нет в файлах сайта. Уточните, какое фото использовать.',
      busy: 'Дождитесь завершения предыдущего запроса.',
      rate_limit: 'Не больше 10 запросов в минуту. Попробуйте позже.',
      stale_page:
        'Главная уже изменилась. Обновите страницу и повторите команду.',
      no_undo: 'Пока нечего отменять.',
    };
    const status =
      code === 'missing_key'
        ? 503
        : code === 'stale_page' || code === 'busy'
          ? 409
          : 400;
    return res
      .status(status)
      .json({
        error:
          errors[code] ||
          'Не удалось выполнить изменение. Главная сохранена. Попробуйте уточнить команду.',
      });
  }
}
