import { readFile, writeFile, rename, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { LAYOUT_GROUPS } from './ai-layout-schema';
import { assertTestBranch, withAI, validTitle } from './ai-title';
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
function actionLabel(before: ElementOverride[], after: ElementOverride[]) {
  for (const item of after) {
    if (!item.layout) continue;
    const earlier = before.find(
      entry => entry.layout?.group === item.layout?.group
    )?.layout;
    if (
      (item.layout.hidden || []).some(
        index => !(earlier?.hidden || []).includes(index)
      )
    )
      return `Удаление блока · ${LAYOUT_GROUPS[item.layout.group]?.label || 'Главная'}`;
    if (
      JSON.stringify(item.layout.order) !==
      JSON.stringify(
        earlier?.order || item.layout.order.map((_, index) => index)
      )
    )
      return `Перестановка · ${LAYOUT_GROUPS[item.layout.group]?.label || 'Главная'}`;
  }
  for (const item of after) {
    const old = before.find(
      entry => targetKey(entry.target) === targetKey(item.target)
    );
    const text = item.changes.find(change => change.property === 'text');
    if (
      text &&
      old?.changes.find(change => change.property === 'text')?.value !==
        text.value
    )
      return `Текст: ${text.value.slice(0, 65)}`;
  }
  return 'Оформление элемента';
}
export async function elementStatus() {
  const overrides = await readOverrides();
  const history = await readHistory();
  return {
    overrides,
    revision: revisionOf(overrides),
    canUndo: history.length > 0,
    actions: history
      .map((before, index) => ({
        step: index + 1,
        label: actionLabel(before, history[index + 1] || overrides),
      }))
      .reverse(),
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
// Direct, local text edit: no provider call or API key is required.
export async function editHeading(
  rawTarget: unknown,
  text: unknown,
  revision: unknown
) {
  const target = targetSchema.parse(rawTarget);
  if (
    target.root !== 'main' ||
    target.tag !== 'h1' ||
    target.kind !== 'element' ||
    !target.textEditable ||
    !validTitle(text)
  )
    throw Error('invalid_heading');
  return persistDirectText(target, text.trim(), revision);
}

export async function editText(
  rawTarget: unknown,
  text: unknown,
  revision: unknown
) {
  const target = targetSchema.parse(rawTarget);
  if (
    target.kind !== 'text' ||
    typeof text !== 'string' ||
    !text.trim() ||
    text.length > 2000 ||
    /[<>\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text)
  )
    throw Error('invalid_text');
  return persistDirectText(target, text, revision);
}

async function persistDirectText(
  target: EditTarget,
  text: string,
  revision: unknown
) {
  const changes = validateChanges(target, [{ property: 'text', value: text }]);
  return locked(async () => {
    const before = await readOverrides();
    checkRevision(before, revision);
    // Replace only this caption's text; preserve its styles and sibling captions.
    const sameCaption = (other: EditTarget) =>
      other.root === target.root &&
      JSON.stringify(other.path) === JSON.stringify(target.path) &&
      (target.kind === 'element' ||
        other.kind === 'element' ||
        other.textIndex === target.textIndex);
    const next = before
      .map(item =>
        sameCaption(item.target)
          ? {
              ...item,
              changes: item.changes.filter(
                change => change.property !== 'text'
              ),
            }
          : item
      )
      .filter(item => item.changes.length || item.layout);
    const existing = next.find(
      item => targetKey(item.target) === targetKey(target)
    );
    if (existing) existing.changes.push(...changes);
    else next.push({ target, changes });
    overridesSchema.parse(next);
    const history = await readHistory();
    history.push(before);
    await atomicWrite(historyFile(), history.slice(-20));
    await atomicWrite(file(), next);
    return { ...(await elementStatus()), reply: 'Текст сохранён.' };
  });
}

export async function reorderGroup(
  rawTarget: unknown,
  group: unknown,
  order: unknown,
  revision: unknown
) {
  const target = targetSchema.parse(rawTarget);
  if (
    target.root !== 'main' ||
    target.kind !== 'element' ||
    typeof group !== 'string' ||
    !Object.hasOwn(LAYOUT_GROUPS, group)
  )
    throw Error('invalid_order');
  const definition = LAYOUT_GROUPS[group as keyof typeof LAYOUT_GROUPS];
  if (!definition) throw Error('invalid_order');
  const indices = z
    .array(
      z
        .number()
        .int()
        .min(0)
        .max(definition.count - 1)
    )
    .length(definition.count)
    .parse(order);
  if (new Set(indices).size !== definition.count) throw Error('invalid_order');
  return locked(async () => {
    const before = await readOverrides();
    checkRevision(before, revision);
    const next = structuredClone(before);
    const existing = next.find(
      item =>
        item.layout?.group === group ||
        targetKey(item.target) === targetKey(target)
    );
    const previousOrder =
      existing?.layout?.order || indices.map((_, index) => index);
    if (JSON.stringify(previousOrder) === JSON.stringify(indices))
      return { ...(await elementStatus()), reply: 'Порядок не изменён.' };
    const layout = { ...existing?.layout, group, order: indices };
    if (existing) existing.layout = layout;
    else next.push({ target, changes: [], layout });
    overridesSchema.parse(next);
    const history = await readHistory();
    history.push(before);
    await atomicWrite(historyFile(), history.slice(-20));
    await atomicWrite(file(), next);
    return {
      ...(await elementStatus()),
      reply: 'Порядок блоков сохранён. Можно отменить последнюю перестановку.',
    };
  });
}

export async function deleteBlock(
  rawTarget: unknown,
  group: unknown,
  index: unknown,
  revision: unknown
) {
  const target = targetSchema.parse(rawTarget);
  if (
    target.root !== 'main' ||
    target.kind !== 'element' ||
    typeof group !== 'string' ||
    !Object.hasOwn(LAYOUT_GROUPS, group)
  )
    throw Error('invalid_order');
  const definition = LAYOUT_GROUPS[group];
  if (
    !definition ||
    typeof index !== 'number' ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= definition.count
  )
    throw Error('invalid_order');
  return locked(async () => {
    const before = await readOverrides();
    checkRevision(before, revision);
    const next = structuredClone(before);
    const existing = next.find(
      item =>
        item.layout?.group === group ||
        targetKey(item.target) === targetKey(target)
    );
    const hidden = existing?.layout?.hidden || [];
    if (hidden.includes(index))
      return { ...(await elementStatus()), reply: 'Этот блок уже удалён.' };
    const layout = {
      group,
      order:
        existing?.layout?.order ||
        Array.from({ length: definition.count }, (_, position) => position),
      hidden: [...hidden, index].sort((left, right) => left - right),
    };
    if (existing) existing.layout = layout;
    else next.push({ target, changes: [], layout });
    overridesSchema.parse(next);
    const history = await readHistory();
    history.push(before);
    await atomicWrite(historyFile(), history.slice(-20));
    await atomicWrite(file(), next);
    return {
      ...(await elementStatus()),
      reply:
        'Блок удалён. Нажмите «Отменить», чтобы вернуть его вместе с содержимым.',
    };
  });
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
