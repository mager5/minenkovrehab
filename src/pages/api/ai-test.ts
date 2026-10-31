import type { NextApiRequest, NextApiResponse } from 'next';
import { assertTestBranch, configureKey, keyConfigured } from '@/lib/ai-title';
import { editElement, elementStatus, undoElement } from '@/lib/element-editor';
export const config = { api: { bodyParser: { sizeLimit: '16kb' } } };
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
    return res.status(403).json({
      error: 'Запрос разрешён только из локальной тестовой страницы.',
    });
  try {
    if (req.method === 'GET') {
      let configured = false;
      let configurationError: string | undefined;
      try {
        configured = await keyConfigured();
      } catch {
        configurationError =
          'Не удалось открыть Связку ключей macOS. Проверьте разрешение системы и повторите подключение.';
      }
      return res.json({
        configured,
        configurationError,
        ...(await elementStatus()),
      });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).end();
    }
    const body = req.body;
    if (body?.action === 'configure') {
      await configureKey(body.key);
      return res.json({ configured: true });
    }
    if (body?.action === 'undo')
      return res.json(await undoElement(body.revision));
    if (body?.action !== 'chat')
      return res
        .status(400)
        .json({ error: 'Сначала выберите элемент и опишите правку.' });
    return res.json(
      await editElement(body.target, body.message, body.revision)
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const errors: Record<string, string> = {
      missing_key:
        'Подключите API-ключ один раз — он сохранится в Связке ключей macOS.',
      key_store_unavailable:
        'Не удалось открыть Связку ключей macOS. Разрешите доступ, если система его запросила, и повторите подключение.',
      invalid_key: 'Проверьте формат OpenAI API-ключа.',
      provider_auth: 'OpenAI отклонил ключ.',
      provider_quota:
        'Проверьте баланс API и лимиты ключа или попробуйте позже.',
      provider_error:
        'Не удалось получить ответ OpenAI. Изменения не применены.',
      invalid_message: 'Введите команду длиной до 2000 символов.',
      busy: 'Дождитесь предыдущего запроса.',
      rate_limit: 'Не больше 10 запросов в минуту.',
      stale_page: 'Список правок изменился. Обновите страницу и повторите.',
      no_undo: 'Пока нечего отменять.',
      select_text:
        'Выделите конкретную надпись: в этом контейнере несколько текстов.',
      text_style_only:
        'Для изменения фона, отступов или размера кнопки выберите кнопку целиком кнопкой «Родитель».',
      invalid_image: 'Нужен существующий путь изображения из файлов сайта.',
      invalid_edit:
        'AI предложил неподходящее свойство. Уточните правку; страница не изменена.',
    };
    return res
      .status(
        code === 'missing_key'
          ? 503
          : code === 'stale_page' || code === 'busy'
            ? 409
            : 400
      )
      .json({
        code: code === 'missing_key' ? 'missing_key' : undefined,
        error:
          errors[code] ||
          'Не удалось применить правку. Исходная страница сохранена.',
      });
  }
}
