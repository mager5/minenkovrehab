import type { NextApiRequest, NextApiResponse } from 'next';
import { assertTestBranch } from '@/lib/ai-title';
import { replaceImage } from '@/lib/ai-image';
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
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 11 * 1024 * 1024)
        return res
          .status(413)
          .json({ error: 'Изображение должно быть не больше 10 МБ.' });
      chunks.push(chunk);
    }
    const form = await new Response(new Uint8Array(Buffer.concat(chunks)), {
      headers: { 'Content-Type': req.headers['content-type'] || '' },
    }).formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) throw Error('invalid_image');
    const target = JSON.parse(String(form.get('target')));
    return res.json(
      await replaceImage(
        target,
        new Uint8Array(await file.arrayBuffer()),
        form.get('revision')
      )
    );
  } catch (error) {
    return res
      .status(400)
      .json({
        error:
          error instanceof Error && error.message === 'stale_page'
            ? 'Страница изменилась. Обновите её перед заменой изображения.'
            : 'Не удалось заменить картинку. Используйте JPG, PNG или WebP до 10 МБ.',
      });
  }
}
