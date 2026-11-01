import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { useState } from 'react';
import AiSortableGroup from '@/components/AiSortableGroup';
import {
  getLayoutOrders,
  setLayoutOrders,
  getLayoutHidden,
  setLayoutHidden,
  withLayoutVisibilityRestored,
} from '@/lib/ai-layout-store';
import {
  describeElement,
  resolveTarget,
  applyOverrides,
} from '@/lib/element-editor-dom';
import { targetKey } from '@/lib/element-editor-schema';

const originalFlag = process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
beforeEach(() => {
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '1';
  act(() => {
    setLayoutOrders({});
    setLayoutHidden({});
  });
});
afterEach(() => {
  cleanup();
  act(() => {
    setLayoutOrders({});
    setLayoutHidden({});
  });
  if (originalFlag === undefined)
    delete process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
  else process.env.NEXT_PUBLIC_AI_TEST_ENABLED = originalFlag;
});
function Item({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  return (
    <button
      onClick={() => setCount(value => value + 1)}
    >{`${name}:${count}`}</button>
  );
}
function Fixture() {
  return (
    <main id='main-content'>
      <AiSortableGroup group='hero-actions' className='original'>
        <Item name='A' />
        <Item name='B' />
      </AiSortableGroup>
    </main>
  );
}

test('React reorder preserves element state and baseline editor paths without wrappers', () => {
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  const second = screen.getByRole('button', { name: 'B:0' });
  const parent = first.parentElement!;
  fireEvent.click(first);
  const target = describeElement(first)!;
  expect(parent.children).toHaveLength(2);
  act(() => setLayoutOrders({ 'hero-actions': [1, 0] }));
  expect(parent.children[0]).toBe(second);
  expect(parent.children[1]).toBe(first);
  expect(first.textContent).toBe('A:1');
  expect(first.getAttribute('data-ai-order-index')).toBe('0');
  expect(resolveTarget(target)).toBe(first);
  expect(targetKey(describeElement(first)!)).toBe(targetKey(target));
  const restore = applyOverrides([
    { target, changes: [{ property: 'color', value: '#FF0000' }] },
  ]);
  expect(first.style.color).toBe('rgb(255, 0, 0)');
  expect(second.style.color).toBe('');
  restore();
  act(() => {
    setLayoutOrders({});
    setLayoutHidden({});
  });
  expect(parent.children[0]).toBe(first);
  expect(first.textContent).toBe('A:1');
});

test('invalid orders fail closed and default markup keeps the native p/div hierarchy', () => {
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  const parent = first.parentElement!;
  act(() => setLayoutOrders({ 'hero-actions': [1, 1] }));
  expect(parent.children[0]).toBe(first);
  expect(getLayoutOrders()).toEqual({});
  expect(parent.tagName).toBe('DIV');
  expect(parent.className).toBe('original');
});

test('production ignores stored orders and adds no sorting metadata', () => {
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '0';
  act(() => {
    setLayoutOrders({ 'hero-actions': [1, 0] });
    setLayoutHidden({ 'hero-actions': [0, 1] });
  });
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  expect(first.parentElement!.children[0]).toBe(first);
  expect(first.parentElement).not.toHaveAttribute('data-ai-sortable-group');
  expect(first).not.toHaveAttribute('data-ai-order-index');
  expect(getLayoutOrders()).toEqual({});
  expect(getLayoutHidden()).toEqual({});
  expect(first).toBeVisible();
});

test('hidden children retain React state, complete ordering and original target paths through reorder and undo', () => {
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  const second = screen.getByRole('button', { name: 'B:0' });
  const parent = first.parentElement!;
  fireEvent.click(first);
  first.style.setProperty('display', 'inline-flex', 'important');
  const target = describeElement(first)!;
  act(() => setLayoutHidden({ 'hero-actions': [0] }));
  expect(first).not.toBeVisible();
  expect(first.style.getPropertyPriority('display')).toBe('important');
  expect(first).toHaveAttribute('data-ai-layout-hidden');
  expect(parent).not.toHaveAttribute('data-ai-layout-hidden');
  expect(screen.queryByRole('button', { name: 'A:1' })).not.toBeInTheDocument();
  expect(parent.children).toHaveLength(2);
  act(() => setLayoutOrders({ 'hero-actions': [1, 0] }));
  expect(parent.children[0]).toBe(second);
  expect(parent.children[1]).toBe(first);
  expect(first.getAttribute('data-ai-order-index')).toBe('0');
  expect(resolveTarget(target)).toBe(first);
  expect(targetKey(describeElement(first)!)).toBe(targetKey(target));
  const restore = withLayoutVisibilityRestored(() =>
    applyOverrides([
      { target, changes: [{ property: 'display', value: 'block' }] },
    ])
  );
  expect(first.style.display).toBe('none');
  withLayoutVisibilityRestored(restore);
  expect(first.style.display).toBe('none');
  act(() => setLayoutHidden({}));
  expect(first.style.display).toBe('inline-flex');
  expect(first.style.getPropertyPriority('display')).toBe('important');
  expect(first).not.toHaveAttribute('data-ai-layout-hidden');
  expect(first).toBeVisible();
  expect(first.textContent).toBe('A:1');
  act(() => setLayoutOrders({}));
  expect(parent.children[0]).toBe(first);
  expect(resolveTarget(target)).toBe(first);
});

test('hiding every original index hides the group root too and exact styles return on undo', () => {
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  const second = screen.getByRole('button', { name: 'B:0' });
  const parent = first.parentElement!;
  parent.style.setProperty('display', 'flex');
  first.setAttribute('style', '');
  act(() => setLayoutHidden({ 'hero-actions': [0, 1] }));
  expect(parent).toHaveAttribute('data-ai-layout-hidden');
  expect(parent.style.display).toBe('none');
  expect(parent.style.getPropertyPriority('display')).toBe('important');
  expect(parent.children).toHaveLength(2);
  expect(first).not.toBeVisible();
  expect(second).not.toBeVisible();
  act(() => setLayoutHidden({}));
  expect(parent).not.toHaveAttribute('data-ai-layout-hidden');
  expect(parent.style.display).toBe('flex');
  expect(parent.style.getPropertyPriority('display')).toBe('');
  expect(first).toHaveAttribute('style', '');
  expect(second).not.toHaveAttribute('style');
  expect(parent.children[0]).toBe(first);
  expect(parent.children[1]).toBe(second);
});

test('invalid hidden masks fail closed and a throwing style transaction still reapplies visibility', () => {
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  for (const mask of [[0, 0], [2], [-1], [0.5], Array(1)]) {
    act(() => setLayoutHidden({ 'hero-actions': mask }));
    expect(getLayoutHidden()).toEqual({});
    expect(first).toBeVisible();
  }
  act(() => setLayoutHidden({ 'hero-actions': [0] }));
  expect(() =>
    withLayoutVisibilityRestored(() => {
      throw Error('synthetic');
    })
  ).toThrow('synthetic');
  expect(first).not.toBeVisible();
  expect(first.style.display).toBe('none');
});
