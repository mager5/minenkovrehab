// Server-side only. The model may propose plain text; it never receives file or Git access.
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
export const originalTitle =
  'Физическая реабилитация и тренировки для здоровья';
export const demoTitle = 'Движение к здоровью начинается здесь';
const file = () => path.join(process.cwd(), 'content', 'ai-home-title.json');
const state = globalThis as typeof globalThis & {
  aiTitleKey?: string;
  aiTitleBusy?: boolean;
  aiTitleCalls?: number[];
};

export async function assertTestBranch() {
  if (
    process.env.AI_TEST_ENABLED !== '1' ||
    process.env.NODE_ENV !== 'development'
  )
    throw Error('test_only');
  const { stdout } = await run('git', ['branch', '--show-current'], {
    cwd: process.cwd(),
  });
  if (stdout.trim() !== 'ai-test') throw Error('test_only');
}

export function keyConfigured() {
  return Boolean(state.aiTitleKey || process.env.OPENAI_API_KEY);
}
export function configureKey(key: unknown) {
  if (typeof key !== 'string' || !/^sk-[A-Za-z0-9_-]{16,300}$/.test(key))
    throw Error('invalid_key');
  state.aiTitleKey = key;
}

export function validTitle(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= 160 &&
    !/[<>\x00-\x1f\x7f]/.test(value)
  );
}

export async function readTitle() {
  return JSON.parse(await readFile(file(), 'utf8')).title as string;
}
export async function writeTitle(title: string) {
  await assertTestBranch();
  if (!validTitle(title)) throw Error('invalid_title');
  const temporary = `${file()}.${process.pid}.tmp`;
  await writeFile(
    temporary,
    JSON.stringify({ title: title.trim() }, null, 2) + '\n',
    { mode: 0o644 }
  );
  await rename(temporary, file());
  return title.trim();
}

export async function suggestTitle(
  message: string,
  currentTitle: string,
  apiKey: string,
  request = fetch
) {
  const response = await request('https://api.openai.com/v1/responses', {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(45000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      store: false,
      instructions:
        'Ты редактор тестовой главной страницы. Единственное разрешённое действие — заменить её заголовок h1 простым текстом длиной до 160 символов. Если пользователь просит изменить заголовок, верни action=set_title и новый заголовок. Если задача другая или непонятна, верни action=reply, title=null и кратко поясни на русском. Не утверждай, что изменял сайт: изменения выполняет приложение после проверки. Никогда не предлагай HTML, код, команды, файлы или платежные операции.',
      input: JSON.stringify({ currentTitle, message }),
      text: {
        format: {
          type: 'json_schema',
          name: 'title_edit',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['set_title', 'reply'] },
              title: { type: ['string', 'null'] },
              reply: { type: 'string' },
            },
            required: ['action', 'title', 'reply'],
            additionalProperties: false,
          },
        },
      },
    }),
  });
  if (!response.ok)
    throw Error(response.status === 401 ? 'provider_auth' : 'provider_error');
  const data = await response.json();
  if (data.status !== 'completed') throw Error('provider_error');
  const text = data.output
    ?.flatMap(
      (item: { content?: { type: string; text?: string }[] }) =>
        item.content || []
    )
    .filter((item: { type: string }) => item.type === 'output_text')
    .map((item: { text: string }) => item.text)
    .join('');
  const result = JSON.parse(text || 'null');
  if (
    !result ||
    !['set_title', 'reply'].includes(result.action) ||
    typeof result.reply !== 'string' ||
    result.reply.length > 1000 ||
    (result.action === 'set_title' && !validTitle(result.title)) ||
    (result.action === 'reply' && result.title !== null)
  )
    throw Error('invalid_response');
  return result as {
    action: 'set_title' | 'reply';
    title: string | null;
    reply: string;
  };
}

export async function withAI<T>(work: (_key: string) => Promise<T>) {
  await assertTestBranch();
  const key = state.aiTitleKey || process.env.OPENAI_API_KEY;
  if (!key) throw Error('missing_key');
  if (state.aiTitleBusy) throw Error('busy');
  const now = Date.now();
  state.aiTitleCalls = (state.aiTitleCalls || []).filter(
    time => now - time < 60000
  );
  if (state.aiTitleCalls.length >= 10) throw Error('rate_limit');
  state.aiTitleCalls.push(now);
  state.aiTitleBusy = true;
  try {
    return await work(key);
  } finally {
    state.aiTitleBusy = false;
  }
}

export async function chat(message: unknown) {
  if (typeof message !== 'string' || !message.trim() || message.length > 1000)
    throw Error('invalid_message');
  return withAI(async key => {
    const result = await suggestTitle(message, await readTitle(), key);
    if (result.action === 'set_title') {
      const title = await writeTitle(result.title!);
      return {
        title,
        reply: `Готово. Заголовок тестовой страницы: «${title}».`,
      };
    }
    return { reply: result.reply };
  });
}
