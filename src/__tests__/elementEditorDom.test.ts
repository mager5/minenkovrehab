import {
  applyOverrides,
  describeElement,
  parentTarget,
  resolveTarget,
} from '@/lib/element-editor-dom';
import { targetKey, validateChanges } from '@/lib/element-editor-schema';

beforeEach(() => {
  document.body.innerHTML =
    '<header><a href="/">Logo</a><span data-ai-editor>Editor tool</span><button>Войти</button></header><main id="main-content"><div><a id="cta" href="/about"><svg><path d="M0 0"/></svg>Узнать больше</a><p>Другой текст</p></div></main><footer><p>Контакты</p></footer>';
});

test('a caption and its whole button have separate stable targets', () => {
  const button = document.querySelector('#cta')!;
  const caption = Array.from(button.childNodes).find(
    node => node instanceof Text
  ) as Text;
  const text = describeElement(caption)!;
  const element = describeElement(button)!;
  expect(text.kind).toBe('text');
  expect(element.kind).toBe('element');
  expect(targetKey(text)).not.toBe(targetKey(element));
  expect(resolveTarget(text)).toBe(caption);
  expect(resolveTarget(element)).toBe(button);
  expect(parentTarget(text)?.kind).toBe('element');
});
test('text-only change preserves button, icon and all other page markup', () => {
  const button = document.querySelector('#cta')!;
  const icon = button.querySelector('svg');
  const caption = Array.from(button.childNodes).find(
    node => node instanceof Text
  ) as Text;
  const original = document.body.innerHTML;
  const undo = applyOverrides([
    {
      target: describeElement(caption)!,
      changes: [{ property: 'text', value: 'О специалисте' }],
    },
  ]);
  expect(button.textContent).toBe('О специалисте');
  expect(button.querySelector('svg')).toBe(icon);
  expect(document.querySelector('p')?.textContent).toBe('Другой текст');
  undo();
  expect(document.body.innerHTML).toBe(original);
});
test('caption styling is scoped to a transparent text wrapper and is reversible', () => {
  const button = document.querySelector('#cta')!;
  const caption = Array.from(button.childNodes).find(
    node => node instanceof Text
  ) as Text;
  const target = describeElement(caption)!;
  const original = document.body.innerHTML;
  const undo = applyOverrides([
    {
      target,
      changes: [
        { property: 'color', value: '#ff0000' },
        { property: 'fontSize', value: '22px' },
      ],
    },
  ]);
  const wrapper = button.querySelector('[data-ai-generated]') as HTMLElement;
  expect(wrapper.style.display).toBe('contents');
  expect(wrapper.style.color).toBe('rgb(255, 0, 0)');
  expect((button as HTMLElement).style.color).toBe('');
  expect(resolveTarget(target)).toBe(caption);
  expect(targetKey(describeElement(caption)!)).toBe(targetKey(target));
  undo();
  expect(document.body.innerHTML).toBe(original);
});
test('whole-button styles do not affect neighbouring elements and undo restores exact styles', () => {
  const button = document.querySelector('#cta') as HTMLElement;
  const original = document.body.innerHTML;
  const undo = applyOverrides([
    {
      target: describeElement(button)!,
      changes: [
        { property: 'backgroundColor', value: '#0000ff' },
        { property: 'borderRadius', value: '20px' },
      ],
    },
  ]);
  expect(button.style.backgroundColor).toBe('rgb(0, 0, 255)');
  expect(
    (document.querySelector('p') as HTMLElement).style.backgroundColor
  ).toBe('');
  undo();
  expect(document.body.innerHTML).toBe(original);
});
test('editor tools cannot be selected and no override is applied by default', () => {
  expect(
    describeElement(document.querySelector('[data-ai-editor]')!)
  ).toBeNull();
  const original = document.body.innerHTML;
  applyOverrides([])();
  expect(document.body.innerHTML).toBe(original);
});
test('container text replacement requires a single text leaf', () => {
  const target = describeElement(document.querySelector('main>div')!)!;
  expect(target.textEditable).toBe(false);
  expect(() =>
    validateChanges(target, [{ property: 'text', value: 'Delete all content' }])
  ).toThrow();
});
test('text targets cannot change button geometry; unsafe styles, links and image paths are rejected', () => {
  const button = document.querySelector('#cta')!;
  const caption = Array.from(button.childNodes).find(
    node => node instanceof Text
  ) as Text;
  const text = describeElement(caption)!;
  const target = describeElement(button)!;
  expect(() =>
    validateChanges(text, [{ property: 'backgroundColor', value: '#000000' }])
  ).toThrow('text_style_only');
  for (const change of [
    { property: 'color', value: 'url(https://bad.invalid)' },
    { property: 'href', value: 'javascript:alert(1)' },
    { property: 'text', value: '<script>bad</script>' },
    { property: 'backgroundImage', value: '/images/../../secret.png' },
  ])
    expect(() => validateChanges(target, [change])).toThrow();
});

test('contact strip and floating controls outside semantic roots are selectable', () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div data-ai-edit-root="topbar"><a>Telegram</a></div><div data-ai-edit-root="floating"><button>Наверх</button></div>'
  );
  for (const root of ['topbar', 'floating']) {
    const element = document.querySelector(
      `[data-ai-edit-root="${root}"]`
    )!.firstElementChild!;
    const target = describeElement(element)!;
    expect(target.root).toBe(root);
    expect(resolveTarget(target)).toBe(element);
  }
});
