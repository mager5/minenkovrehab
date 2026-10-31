import type { EditTarget, ElementOverride } from './element-editor-schema';

const excluded = (element: Element) =>
  element.hasAttribute('data-ai-editor') ||
  element.hasAttribute('data-ai-generated');
export const editableRootSelector =
  'header, main#main-content, footer, [data-ai-edit-root="topbar"], [data-ai-edit-root="floating"]';
const rootSelectors = {
  header: 'header',
  main: 'main#main-content',
  footer: 'footer',
  topbar: '[data-ai-edit-root="topbar"]',
  floating: '[data-ai-edit-root="floating"]',
};
const editableRoot = (element: Element) =>
  element.closest(editableRootSelector);
function children(element: Element) {
  return Array.from(element.children).filter(child => !excluded(child));
}
function textNodes(element: Element): Text[] {
  return Array.from(element.childNodes).flatMap(node =>
    node instanceof Text
      ? [node]
      : node instanceof HTMLElement && node.hasAttribute('data-ai-generated')
        ? Array.from(node.childNodes).filter(
            (child): child is Text => child instanceof Text
          )
        : []
  );
}
export function resolveTarget(target: EditTarget): Element | Text | null {
  let element = document.querySelector(rootSelectors[target.root]);
  for (const part of target.path) {
    if (!element) return null;
    element =
      children(element).filter(
        child => child.tagName.toLowerCase() === part.tag
      )[part.index] || null;
  }
  if (
    !element ||
    element.tagName.toLowerCase() !== target.tag ||
    element.closest('[data-ai-editor]')
  )
    return null;
  return target.kind === 'text'
    ? textNodes(element)[target.textIndex] || null
    : element;
}

export function describeElement(node: Element | Text): EditTarget | null {
  let element = node instanceof Text ? node.parentElement : node;
  if (
    !element ||
    element.closest('[data-ai-editor]') ||
    element.closest('script, style, input, textarea, select')
  )
    return null;
  const svg = element.closest('svg');
  if (svg) {
    element = svg;
    node = svg;
  }
  if (element.hasAttribute('data-ai-generated'))
    element = element.parentElement;
  if (!element) return null;
  const root = editableRoot(element);
  if (!root) return null;
  const path: EditTarget['path'] = [];
  let cursor = element;
  while (cursor !== root) {
    const parent = cursor.parentElement;
    if (!parent) return null;
    const tag = cursor.tagName.toLowerCase();
    const index = children(parent)
      .filter(child => child.tagName === cursor.tagName)
      .indexOf(cursor);
    if (index < 0) return null;
    path.unshift({ tag, index });
    cursor = parent;
  }
  const text = node instanceof Text;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const leaves: Text[] = [];
  let leaf = walker.nextNode();
  while (leaf) {
    if (leaf.textContent?.trim()) leaves.push(leaf as Text);
    leaf = walker.nextNode();
  }
  const computed = getComputedStyle(
    node instanceof Text &&
      node.parentElement?.hasAttribute('data-ai-generated')
      ? node.parentElement
      : element
  );
  return {
    root: (root.getAttribute('data-ai-edit-root') ||
      root.tagName.toLowerCase()) as EditTarget['root'],
    path,
    kind: text ? 'text' : 'element',
    textIndex:
      node instanceof Text ? Math.max(0, textNodes(element).indexOf(node)) : 0,
    tag: element.tagName.toLowerCase(),
    label:
      (text
        ? node.textContent
        : element.getAttribute('alt') ||
          element.getAttribute('aria-label') ||
          element.textContent ||
          element.tagName
      )
        ?.trim()
        .slice(0, 500) || element.tagName,
    textEditable: text || leaves.length === 1,
    styles: {
      ...Object.fromEntries(
        [
          'color',
          'backgroundColor',
          'backgroundImage',
          'fontSize',
          'fontWeight',
          'padding',
          'borderRadius',
          'width',
          'height',
        ].map(name => [
          name,
          computed[name as keyof CSSStyleDeclaration] as string,
        ])
      ),
      ...(element instanceof HTMLImageElement
        ? { src: element.getAttribute('src') || '' }
        : {}),
      ...(element.tagName.toLowerCase() === 'a'
        ? { href: element.getAttribute('href') || '' }
        : {}),
    },
  };
}

export function hitTarget(x: number, y: number): EditTarget | null {
  const element = document.elementFromPoint(x, y);
  if (!element || element.closest('[data-ai-editor]')) return null;
  const doc = document as Document & {
    caretRangeFromPoint?: (_x: number, _y: number) => Range | null;
    caretPositionFromPoint?: (
      _x: number,
      _y: number
    ) => { offsetNode: Node; offset: number } | null;
  };
  const range = doc.caretRangeFromPoint?.(x, y);
  const position = doc.caretPositionFromPoint?.(x, y);
  const node = range?.startContainer || position?.offsetNode;
  if (
    node instanceof Text &&
    node.textContent?.trim() &&
    node.parentElement &&
    element.contains(node)
  ) {
    const bounds = document.createRange();
    bounds.selectNodeContents(node);
    if (
      Array.from(bounds.getClientRects()).some(
        rect =>
          x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      )
    )
      return describeElement(node);
  }
  return describeElement(element);
}
export function targetBounds(target: EditTarget): DOMRect | null {
  const node = resolveTarget(target);
  if (!node) return null;
  if (node instanceof Text) {
    const range = document.createRange();
    range.selectNodeContents(node);
    return range.getBoundingClientRect();
  }
  return node.getBoundingClientRect();
}
export function parentTarget(target: EditTarget): EditTarget | null {
  const node = resolveTarget(target);
  if (!node) return null;
  if (node instanceof Text)
    return node.parentElement ? describeElement(node.parentElement) : null;
  return node.parentElement ? describeElement(node.parentElement) : null;
}

export function applyOverrides(overrides: ElementOverride[]): () => void {
  const restore: (() => void)[] = [];
  for (const override of overrides) {
    const node = resolveTarget(override.target);
    if (!node) continue;
    let element: HTMLElement | SVGElement | null;
    if (node instanceof Text) {
      const original = node.data;
      const styleChanges = override.changes.filter(
        change => change.property !== 'text'
      );
      if (styleChanges.length) {
        const wrapper = document.createElement('span');
        wrapper.setAttribute('data-ai-generated', 'text');
        wrapper.style.display = 'contents';
        node.parentNode?.insertBefore(wrapper, node);
        wrapper.appendChild(node);
        element = wrapper;
        restore.push(() => {
          wrapper.replaceWith(...Array.from(wrapper.childNodes));
        });
      } else element = node.parentElement;
      for (const change of override.changes)
        if (change.property === 'text') node.data = change.value;
      restore.push(() => {
        node.data = original;
      });
    } else
      element =
        node instanceof HTMLElement || node instanceof SVGElement ? node : null;
    if (!element) continue;
    for (const { property, value } of override.changes) {
      if (property === 'text') {
        if (node instanceof Text) continue;
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const texts: Text[] = [];
        let text = walker.nextNode();
        while (text) {
          if (text.textContent?.trim()) texts.push(text as Text);
          text = walker.nextNode();
        }
        if (texts.length === 1) {
          const textNode = texts[0]!;
          const original = textNode.data;
          textNode.data = value;
          restore.push(() => {
            textNode.data = original;
          });
        }
      } else if (property === 'src' || property === 'href') {
        const original = element.getAttribute(property);
        const originalSrcset = element.getAttribute('srcset');
        const targetElement = element;
        element.setAttribute(property, value);
        if (property === 'src') element.removeAttribute('srcset');
        restore.push(() => {
          if (original === null) targetElement.removeAttribute(property);
          else targetElement.setAttribute(property, original);
          if (property === 'src' && originalSrcset !== null)
            targetElement.setAttribute('srcset', originalSrcset);
        });
      } else {
        const name = property.replace(
          /[A-Z]/g,
          char => '-' + char.toLowerCase()
        );
        const original = element.style.getPropertyValue(name);
        const hadStyle = element.hasAttribute('style');
        const priority = element.style.getPropertyPriority(name);
        const targetElement = element;
        element.style.setProperty(
          name,
          property === 'backgroundImage' && value !== 'none'
            ? `url(${JSON.stringify(value)})`
            : value,
          'important'
        );
        restore.push(() => {
          if (original)
            targetElement.style.setProperty(name, original, priority);
          else targetElement.style.removeProperty(name);
          if (!hadStyle && !targetElement.getAttribute('style')?.trim())
            targetElement.removeAttribute('style');
        });
      }
    }
  }
  return () => {
    for (const undo of restore.reverse()) undo();
  };
}

// Resolve one visible caption, never a container with several independent texts.
export function inlineTextTarget(
  element: Element,
  x?: number,
  y?: number
): EditTarget | null {
  if (
    element.closest('[data-ai-editor],input,textarea,select,script,style,svg')
  )
    return null;
  if (
    x !== undefined &&
    y !== undefined &&
    typeof document.elementFromPoint === 'function'
  ) {
    const hit = hitTarget(x, y);
    if (hit?.kind === 'text') return hit;
  }
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (
      node.textContent?.trim() &&
      node.parentElement &&
      !node.parentElement.closest('svg,[data-ai-editor],script,style')
    )
      texts.push(node as Text);
    node = walker.nextNode();
  }
  if (texts.length === 1) return describeElement(texts[0]!);
  return null;
}
