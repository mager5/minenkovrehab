import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { useState } from 'react';
import AiSortableGroup from '@/components/AiSortableGroup';
import { getLayoutOrders, setLayoutOrders } from '@/lib/ai-layout-store';
import {
  describeElement,
  resolveTarget,
  applyOverrides,
} from '@/lib/element-editor-dom';
import { targetKey } from '@/lib/element-editor-schema';

const originalFlag = process.env.NEXT_PUBLIC_AI_TEST_ENABLED;
beforeEach(() => {
  process.env.NEXT_PUBLIC_AI_TEST_ENABLED = '1';
  act(() => setLayoutOrders({}));
});
afterEach(() => {
  cleanup();
  act(() => setLayoutOrders({}));
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
  act(() => setLayoutOrders({}));
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
  act(() => setLayoutOrders({ 'hero-actions': [1, 0] }));
  render(<Fixture />);
  const first = screen.getByRole('button', { name: 'A:0' });
  expect(first.parentElement!.children[0]).toBe(first);
  expect(first.parentElement).not.toHaveAttribute('data-ai-sortable-group');
  expect(first).not.toHaveAttribute('data-ai-order-index');
  expect(getLayoutOrders()).toEqual({});
});
