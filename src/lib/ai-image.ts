import sharp from 'sharp';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { assertTestBranch } from './ai-title';
import { targetSchema } from './element-editor-schema';
import { editDirect } from './element-editor';
export async function replaceImage(
  rawTarget: unknown,
  bytes: Uint8Array,
  revision: unknown
) {
  await assertTestBranch();
  const target = targetSchema.parse(rawTarget);
  if (
    target.kind !== 'element' ||
    bytes.length < 20 ||
    bytes.length > 10 * 1024 * 1024
  )
    throw Error('invalid_image');
  let data: Buffer;
  try {
    const image = sharp(bytes, {
      limitInputPixels: 40_000_000,
      animated: false,
    });
    const metadata = await image.metadata();
    if (
      !['jpeg', 'png', 'webp'].includes(metadata.format || '') ||
      !metadata.width ||
      !metadata.height
    )
      throw Error('invalid_image');
    data = await image
      .rotate()
      .resize({
        width: 2560,
        height: 2560,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();
  } catch {
    throw Error('invalid_image');
  }
  const name = `${randomUUID()}.webp`,
    url = `/uploads/ai-test/${name}`;
  const directory = path.join(process.cwd(), 'public/uploads/ai-test');
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, name);
  await writeFile(file, data, { flag: 'wx' });
  try {
    return await editDirect(
      target,
      [
        {
          property: target.tag === 'img' ? 'src' : 'backgroundImage',
          value: url,
        },
      ],
      revision
    );
  } catch (error) {
    await unlink(file);
    throw error;
  }
}
