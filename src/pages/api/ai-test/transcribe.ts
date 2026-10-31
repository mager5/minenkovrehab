import type { NextApiRequest, NextApiResponse } from 'next';
import { assertTestBranch, withAI } from '@/lib/ai-title';
import { transcribeVoice } from '@/lib/element-editor';
export const config = { api: { bodyParser: false } };
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
    req.headers.origin !== origin
  )
    return res.status(403).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 5 * 1024 * 1024)
        return res
          .status(413)
          .json({ error: 'Запись слишком длинная. Максимум — 5 МБ.' });
      chunks.push(Buffer.from(chunk));
    }
    const text = await withAI(key =>
      transcribeVoice(
        Buffer.concat(chunks),
        req.headers['content-type'] || '',
        key
      )
    );
    return res.json({ text });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    return res
      .status(code === 'missing_key' ? 503 : 400)
      .json({
        error:
          code === 'missing_key'
            ? 'Сначала подключите API-ключ.'
            : code === 'provider_auth'
              ? 'OpenAI отклонил ключ.'
              : code === 'empty_audio'
                ? 'Не удалось разобрать речь. Попробуйте ещё раз.'
                : 'Не удалось распознать запись. Проверьте доступ к OpenAI и повторите.',
      });
  }
}
