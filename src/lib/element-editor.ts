import { readFile, writeFile, rename, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { assertTestBranch, withAI } from './ai-title';
import {
  editResultSchema,
  overridesSchema,
  targetKey,
  targetSchema,
  validateChanges,
  type EditTarget,
  type ElementOverride,
} from './element-editor-schema';

const file = () =>
  path.join(process.cwd(), 'content/ai-element-overrides.json');
const historyFile = () => path.join(process.cwd(), '.ai-element-history.json');
const state = globalThis as typeof globalThis & { aiElementBusy?: boolean };
const revisionOf = (overrides: ElementOverride[]) =>
  createHash('sha256').update(JSON.stringify(overrides)).digest('hex');
async function readOverrides() {
  return overridesSchema.parse(JSON.parse(await readFile(file(), 'utf8')));
}
async function readHistory(): Promise<ElementOverride[][]> {
  try {
    return z
      .array(overridesSchema)
      .max(20)
      .parse(JSON.parse(await readFile(historyFile(), 'utf8')));
  } catch {
    return [];
  }
}
async function atomicWrite(name: string, data: unknown) {
  const temporary = `${name}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2) + '\n');
  await rename(temporary, name);
}
export async function elementStatus() {
  const overrides = await readOverrides();
  return {
    overrides,
    revision: revisionOf(overrides),
    canUndo: (await readHistory()).length > 0,
  };
}
async function locked<T>(work: () => Promise<T>) {
  await assertTestBranch();
  if (state.aiElementBusy) throw Error('busy');
  state.aiElementBusy = true;
  try {
    return await work();
  } finally {
    state.aiElementBusy = false;
  }
}
function checkRevision(overrides: ElementOverride[], revision: unknown) {
  if (typeof revision !== 'string' || revision !== revisionOf(overrides))
    throw Error('stale_page');
}

export async function proposeElementEdit(
  message: string,
  target: EditTarget,
  key: string,
  request = fetch
) {
  const response = await request('https://api.openai.com/v1/responses', {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(60000),
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      store: false,
      instructions:
        'Ты точечный редактор выбранного элемента тестового сайта. Меняй только выбранный элемент и только явно запрошенные свойства. Внешний вид остальных элементов и структура страницы должны сохраняться. Если выбран текст, доступны только его текст, цвет и типографика; фон, отступы и размеры кнопки меняются при выборе кнопки целиком. Если textEditable=false, не заменяй text: предложи выделить конкретную надпись. Возвращай changes с property/value, все значения строки. Цвета в HEX, размеры с px/rem/em/%; fontWeight normal/bold/100..900; display none/block/inline/inline-block/flex/grid. В src и backgroundImage можно только существующий локальный путь из images/uploads, не выдумывай новые изображения. Если точный путь не известен, уточни у пользователя. backgroundImage=none убирает фоновую картинку, если пользователь просит сплошной фон. Не возвращай HTML, CSS-код, JS, обработчики событий, файлы или действия платежей/входа. Не делай редизайн и не меняй другие элементы. Если действие недоступно, верни changes=[] и объясни в summary. Отвечай кратко на русском. План ещё не применён: не утверждай, что изменение уже выполнено.',
      input: JSON.stringify({
        message,
        selectedElement: {
          kind: target.kind,
          tag: target.tag,
          text: target.label,
          textEditable: target.textEditable,
          styles: target.styles,
        },
      }),
      text: {
        format: {
          type: 'json_schema',
          name: 'element_edit',
          strict: true,
          schema: z.toJSONSchema(editResultSchema),
        },
      },
    }),
  });
  if (!response.ok)
    throw Error(
      response.status === 401
        ? 'provider_auth'
        : response.status === 429
          ? 'provider_quota'
          : 'provider_error'
    );
  const data = await response.json();
  if (data.status !== 'completed') throw Error('provider_error');
  const text = data.output
    ?.flatMap(
      (item: { content?: { type: string; text?: string }[] }) =>
        item.content || []
    )
    .filter((part: { type: string }) => part.type === 'output_text')
    .map((part: { text: string }) => part.text)
    .join('');
  const result = editResultSchema.parse(JSON.parse(text || 'null'));
  const changes = validateChanges(target, result.changes);
  for (const change of changes)
    if (
      ['src', 'backgroundImage'].includes(change.property) &&
      change.value !== 'none'
    ) {
      try {
        await access(path.join(process.cwd(), 'public', change.value));
      } catch {
        throw Error('invalid_image');
      }
    }
  return { ...result, changes };
}

export async function editElement(
  rawTarget: unknown,
  message: unknown,
  revision: unknown
) {
  if (typeof message !== 'string' || !message.trim() || message.length > 2000)
    throw Error('invalid_message');
  const target = targetSchema.parse(rawTarget);
  return locked(() =>
    withAI(async key => {
      const before = await readOverrides();
      checkRevision(before, revision);
      const result = await proposeElementEdit(message, target, key);
      checkRevision(await readOverrides(), revision);
      if (result.changes.length) {
        const next = structuredClone(before);
        const existing = next.find(
          item => targetKey(item.target) === targetKey(target)
        );
        if (existing) {
          const merged = new Map(
            existing.changes.map(change => [change.property, change])
          );
          for (const change of result.changes)
            merged.set(change.property, change);
          existing.changes = [...merged.values()];
          existing.target = target;
        } else next.push({ target, changes: result.changes });
        overridesSchema.parse(next);
        const history = await readHistory();
        history.push(before);
        await atomicWrite(historyFile(), history.slice(-20));
        await atomicWrite(file(), next);
      }
      return {
        ...(await elementStatus()),
        reply: result.changes.length
          ? `Готово. ${result.summary}`
          : result.summary || 'Уточните нужное изменение.',
      };
    })
  );
}
export async function undoElement(revision: unknown) {
  return locked(async () => {
    const before = await readOverrides();
    checkRevision(before, revision);
    const history = await readHistory();
    const previous = history.pop();
    if (!previous) throw Error('no_undo');
    await atomicWrite(file(), previous);
    await atomicWrite(historyFile(), history);
    return { ...(await elementStatus()), reply: 'Последняя правка отменена.' };
  });
}

export async function transcribeVoice(
  bytes: Uint8Array,
  mime: string,
  key: string,
  request = fetch
) {
  const allowed: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/mpeg': 'mp3',
  };
  const type = mime.split(';')[0] || '';
  const extension = allowed[type];
  if (!extension || bytes.length < 100 || bytes.length > 5 * 1024 * 1024)
    throw Error('invalid_audio');
  const form = new FormData();
  form.append(
    'file',
    new Blob([new Uint8Array(bytes)], { type }),
    `voice.${extension}`
  );
  form.append('model', 'gpt-transcribe');
  form.append('languages[]', 'ru');
  const response = await request(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      redirect: 'error',
      signal: AbortSignal.timeout(60000),
    }
  );
  if (!response.ok)
    throw Error(
      response.status === 401
        ? 'provider_auth'
        : response.status === 429
          ? 'provider_quota'
          : 'provider_error'
    );
  const data = await response.json();
  if (
    typeof data.text !== 'string' ||
    !data.text.trim() ||
    data.text.length > 4000
  )
    throw Error('empty_audio');
  return data.text.trim();
}
