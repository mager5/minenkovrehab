'use client';

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { LAYOUT_GROUPS, validLayoutOrder } from '@/lib/ai-layout-schema';
import { useLayoutOrders } from '@/lib/ai-layout-store';

interface AiSortableGroupProps extends HTMLAttributes<HTMLElement> {
  group: string;
  as?: 'div' | 'p';
  children: ReactNode;
}

// Replaces an existing native container; does not wrap any of its children.
export default function AiSortableGroup({
  group,
  as = 'div',
  children,
  ...props
}: AiSortableGroupProps) {
  const root = useRef<HTMLDivElement & HTMLParagraphElement>(null);
  const orders = useLayoutOrders();
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  const nodes = Children.toArray(children);
  const sortable = enabled && LAYOUT_GROUPS[group]?.count === nodes.length;
  const requested = orders[group];
  const order =
    sortable && validLayoutOrder(group, requested)
      ? requested
      : nodes.map((_, index) => index);
  const keyed = nodes.map((node, index) =>
    isValidElement(node) ? (
      cloneElement(node, { key: `${group}:${index}` })
    ) : (
      <Fragment key={`${group}:${index}`}>{node}</Fragment>
    )
  );

  // Keys preserve React identity. Original indices preserve existing DOM target paths.
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const direct = Array.from(element.children).filter(
      child =>
        !child.hasAttribute('data-ai-editor') &&
        !child.hasAttribute('data-ai-generated')
    );
    if (!sortable || direct.length !== order.length) {
      for (const child of direct) child.removeAttribute('data-ai-order-index');
      return;
    }
    direct.forEach((child, position) =>
      child.setAttribute('data-ai-order-index', String(order[position]))
    );
  });

  const Tag = as;
  return (
    <Tag
      {...props}
      ref={root}
      data-ai-sortable-group={sortable ? group : undefined}
    >
      {sortable ? order.map(index => keyed[index]) : children}
    </Tag>
  );
}
