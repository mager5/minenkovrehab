import {
  readFile,
  writeFile,
  rename,
  mkdir,
  readdir,
  rm,
  access,
} from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { assertTestBranch, withAI } from './ai-title';
import {
  applyPageEdits,
  editPlanSchema,
  homePageSchema,
  type HomePage,
} from './home-editor-schema';

const pageFile = () => path.join(process.cwd(), 'content/ai-home-page.json');
const historyDir = () => path.join(process.cwd(), '.ai-test-history');
const state = globalThis as typeof globalThis & { aiHomeBusy?: boolean };
export const revisionOf = (page: HomePage) =>
  createHash('sha256').update(JSON.stringify(page)).digest('hex');

export async function readHomePage() {
  return homePageSchema.parse(JSON.parse(await readFile(pageFile(), 'utf8')));
}
export async function homeStatus() {
  const page = await readHomePage();
  const history = await readdir(historyDir()).catch(() => [] as string[]);
  return {
    page,
    title: page.title,
    revision: revisionOf(page),
    canUndo: history.some(file => file.endsWith('.json')),
  };
}

async function validateAssets(page: HomePage) {
  const shellLinks = [
    ...page.header.links,
    page.header.button,
    ...page.footer.links,
    ...page.footer.contacts,
  ].map(link => link.href);
  if (
    shellLinks.some(link =>
      /^\/(api|payment|dashboard|login|register)(\/|\?|#|$)/i.test(link)
    )
  )
    throw Error('invalid_edit');
  if (page.header.logoImage) {
    if (
      page.header.logoImage.includes('..') ||
      page.header.logoImage.includes('//')
    )
      throw Error('invalid_asset');
    try {
      await access(path.join(process.cwd(), 'public', page.header.logoImage));
    } catch {
      throw Error('invalid_asset');
    }
  }
  for (const section of page.sections) {
    const links = [
      ...section.buttons.map(button => button.href),
      ...section.cards.map(card => card.href),
    ];
    if (
      links.some(link =>
        /^\/(api|payment|dashboard|login|register)(\/|\?|#|$)/i.test(link)
      )
    )
      throw Error('invalid_edit');
    for (const image of [
      section.image,
      section.mobileImage,
      ...section.cards.map(card => card.image),
    ]) {
      if (!image) continue;
      if (image.includes('..') || image.includes('//'))
        throw Error('invalid_asset');
      const asset = path.join(process.cwd(), 'public', image);
      try {
        await access(asset);
      } catch {
        throw Error('invalid_asset');
      }
    }
  }
}

async function writePage(page: HomePage, previous?: HomePage) {
  await assertTestBranch();
  const parsed = applyPageEdits(page, { summary: '', operations: [] });
  await validateAssets(parsed);
  if (previous) {
    await mkdir(historyDir(), { recursive: true });
    await writeFile(
      path.join(historyDir(), `${Date.now()}-${randomUUID()}.json`),
      JSON.stringify(previous, null, 2) + '\n'
    );
    const files = (await readdir(historyDir()))
      .filter(file => file.endsWith('.json'))
      .sort();
    for (const file of files.slice(0, Math.max(0, files.length - 20)))
      await rm(path.join(historyDir(), file));
  }
  const temporary = `${pageFile()}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(parsed, null, 2) + '\n');
  await rename(temporary, pageFile());
  return parsed;
}

async function locked<T>(work: () => Promise<T>) {
  await assertTestBranch();
  if (state.aiHomeBusy) throw Error('busy');
  state.aiHomeBusy = true;
  try {
    return await work();
  } finally {
    state.aiHomeBusy = false;
  }
}

function checkRevision(page: HomePage, expected: unknown) {
  if (typeof expected !== 'string' || expected !== revisionOf(page))
    throw Error('stale_page');
}

async function imageCatalog() {
  const folders = ['hero', 'products', 'about'];
  const lists = await Promise.all(
    folders.map(async folder => {
      const files = await readdir(
        path.join(process.cwd(), 'public/images', folder)
      ).catch(() => [] as string[]);
      return files
        .filter(file => /^[A-Za-z0-9_. -]+\.(jpe?g|png|webp|avif)$/i.test(file))
        .slice(0, 30)
        .map(file => `/images/${folder}/${file}`);
    })
  );
  return lists.flat();
}

export async function proposePageEdits(
  message: string,
  currentPage: HomePage,
  apiKey: string,
  request = fetch,
  history: { role: string; text: string }[] = []
) {
  const response = await request('https://api.openai.com/v1/responses', {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(90000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      store: false,
      instructions: `Ты редактор главной страницы сайта в изолированном эксперименте. Выполняй просьбы пользователя: любые тексты главной, кнопки и их подписи/ссылки, фотографии из каталога, цвета, размеры, отступы, расположение, карточки, добавление, скрытие, удаление и порядок секций. Возвращай только точечные JSON Patch операции для нужных полей, сохраняя всё остальное. Не переписывай sections целиком, если можно изменить отдельные поля. path и from — JSON Pointer с числовыми индексами: /title — главный h1; /sections/0/... — первый блок. /sections/N/title — h2 остальных блоков. op add вставляет элемент массива (/- добавляет в конец), replace заменяет поле, remove удаляет элемент, move перемещает элемент из from в path (индекс назначения после удаления исходного). valueJson — сериализованное JSON-значение, для remove/move пустая строка; from для остальных пустая строка. Новую секцию создай по схеме и примеру существующей; id уникален. Должен остаться ровно один видимый hero. Изменение цвета темы также отрази в нужных style секций, если это просит пользователь. Светлый первый экран без фотографии: imagePosition=none; с фото можно left/right. CSS/HTML/JS и произвольные файлы недоступны. Шапка и подвал главной тоже редактируются: /header (логотип, меню, кнопка, цвета, высота, закрепление), /footer (тексты, контакты, ссылки, цвета). Не меняй другие страницы, цены товаров, платежи, аккаунты или данные. Не выдумывай достижения, медицинские обещания и факты. Если запрос касается недоступного действия или нужен выбор пользователя, верни operations=[] и объясни в summary. Если меняешь внешний вид, подбери читабельные цвета текста и кнопок. Не называй план выполненным: приложение применит его после проверки. Отвечай пользователю на русском кратко в summary.`,
      input: JSON.stringify({
        message,
        history,
        currentPage,
        pageSchema: z.toJSONSchema(homePageSchema),
        availableImages: await imageCatalog(),
      }),
      text: {
        format: {
          type: 'json_schema',
          name: 'homepage_edits',
          strict: true,
          schema: z.toJSONSchema(editPlanSchema),
        },
      },
    }),
  });
  if (!response.ok) {
    if (response.status === 401) throw Error('provider_auth');
    if (response.status === 429) throw Error('provider_quota');
    throw Error('provider_error');
  }
  const data = await response.json();
  if (data.status !== 'completed') throw Error('provider_error');
  const output = data.output
    ?.flatMap(
      (item: { content?: { type: string; text?: string }[] }) =>
        item.content || []
    )
    .filter((item: { type: string }) => item.type === 'output_text')
    .map((item: { text: string }) => item.text)
    .join('');
  const plan = editPlanSchema.parse(JSON.parse(output || 'null'));
  const page = applyPageEdits(currentPage, plan);
  await validateAssets(page);
  return { plan, page };
}

export async function editHome(
  message: unknown,
  revision: unknown,
  preview = false,
  rawHistory: unknown = []
) {
  if (typeof message !== 'string' || !message.trim() || message.length > 3000)
    throw Error('invalid_message');
  const history = z
    .array(
      z.strictObject({
        role: z.enum(['user', 'assistant']),
        text: z.string().max(1200),
      })
    )
    .max(8)
    .parse(rawHistory);
  return locked(() =>
    withAI(async key => {
      const current = await readHomePage();
      checkRevision(current, revision);
      const { plan, page } = await proposePageEdits(
        message,
        current,
        key,
        fetch,
        history
      );
      const changed = revisionOf(page) !== revisionOf(current);
      // A human or another process may have edited the file while the provider was working.
      checkRevision(await readHomePage(), revision);
      if (changed && !preview) await writePage(page, current);
      return {
        ...(preview
          ? { page, revision: revisionOf(current) }
          : await homeStatus()),
        changed,
        preview,
        reply: changed
          ? `${preview ? 'Предпросмотр' : 'Готово'}. ${plan.summary}`
          : plan.summary || 'Изменения не требуются.',
      };
    })
  );
}

export async function undoHome(revision: unknown) {
  return locked(async () => {
    const current = await readHomePage();
    checkRevision(current, revision);
    const files = (await readdir(historyDir()).catch(() => [] as string[]))
      .filter(file => /^\d+-[a-f0-9-]+\.json$/.test(file))
      .sort();
    const last = files.at(-1);
    if (!last) throw Error('no_undo');
    const previous = homePageSchema.parse(
      JSON.parse(await readFile(path.join(historyDir(), last), 'utf8'))
    );
    await writePage(previous);
    await rm(path.join(historyDir(), last));
    return { ...(await homeStatus()), reply: 'Последнее изменение отменено.' };
  });
}

export async function demoHome(revision: unknown) {
  return locked(async () => {
    const current = await readHomePage();
    checkRevision(current, revision);
    const page = structuredClone(current);
    const hero = page.sections.find(section => section.kind === 'hero')!;
    hero.style.background = '#f0faf5';
    hero.style.text = '#243d36';
    hero.style.titleColor = '#154b3b';
    hero.style.accent = '#128164';
    hero.imagePosition = 'none';
    hero.style.minHeight = 620;
    if (!hero.buttons.some(button => button.label === 'Выбрать программу'))
      hero.buttons.push({
        label: 'Выбрать программу',
        href: '/products',
        variant: 'primary',
      });
    await writePage(page, current);
    return {
      ...(await homeStatus()),
      reply:
        'Проверка без AI: светлый первый экран и новая кнопка. Текущий заголовок сохранён. Можно отменить.',
    };
  });
}
