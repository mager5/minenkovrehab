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
import {
  LAYOUT_GROUPS,
  validLayoutOrder,
  validLayoutCopies,
  layoutItemIds,
} from '@/lib/ai-layout-schema';
import {
  useLayoutOrders,
  useLayoutCopies,
  getLayoutCopies,
  useLayoutHidden,
  getLayoutHidden,
  registerLayoutVisibility,
  type LayoutVisibilityLayer,
} from '@/lib/ai-layout-store';

type DisplaySnapshot = {
  value: string;
  priority: string;
  hadStyle: boolean;
  marker: string | null;
};

function visibilityLayer(
  root: HTMLElement,
  group: string
): LayoutVisibilityLayer {
  const snapshots = new Map<HTMLElement, DisplaySnapshot>();
  const capture = (node: HTMLElement): DisplaySnapshot => ({
    value: node.style.getPropertyValue('display'),
    priority: node.style.getPropertyPriority('display'),
    hadStyle: node.hasAttribute('style'),
    marker: node.getAttribute('data-ai-layout-hidden'),
  });
  const restore = () => {
    for (const [node, previous] of snapshots) {
      // React may have updated this child's own display since the last commit.
      const current =
        node.style.getPropertyValue('display') !== 'none' ||
        node.style.getPropertyPriority('display') !== 'important'
          ? { ...capture(node), marker: previous.marker }
          : previous;
      if (current.value)
        node.style.setProperty('display', current.value, current.priority);
      else node.style.removeProperty('display');
      if (!current.hadStyle && !node.getAttribute('style')?.trim())
        node.removeAttribute('style');
      if (current.marker === null)
        node.removeAttribute('data-ai-layout-hidden');
      else node.setAttribute('data-ai-layout-hidden', current.marker);
    }
    snapshots.clear();
  };
  const hide = (node: HTMLElement) => {
    snapshots.set(node, capture(node));
    node.style.setProperty('display', 'none', 'important');
    node.setAttribute('data-ai-layout-hidden', '');
  };
  return {
    restore,
    apply: () => {
      restore();
      if (
        process.env.NEXT_PUBLIC_AI_TEST_ENABLED !== '1' ||
        root.dataset.aiSortableGroup !== group
      )
        return;
      const mask = getLayoutHidden()[group] || [];
      if (!mask.length) return;
      const direct = Array.from(root.children).filter(
        (node): node is HTMLElement =>
          node instanceof HTMLElement &&
          node.hasAttribute('data-ai-order-index')
      );
      const expected = layoutItemIds(group, getLayoutCopies()[group] || []);
      if (!expected || direct.length !== expected.length) return;
      for (const node of direct)
        if (mask.includes(Number(node.dataset.aiOrderIndex))) hide(node);
      if (mask.length === direct.length) hide(root);
    },
  };
}

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
  const copies = useLayoutCopies();
  useLayoutHidden();
  const visibility = useRef<LayoutVisibilityLayer | null>(null);
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  const nodes = Children.toArray(children);
  const sortable = enabled && LAYOUT_GROUPS[group]?.count === nodes.length;
  const requestedCopies = copies[group] || [];
  const groupCopies =
    sortable && validLayoutCopies(group, requestedCopies)
      ? requestedCopies
      : [];
  const members =
    layoutItemIds(group, groupCopies) || nodes.map((_, index) => index);
  const requested = orders[group];
  const order =
    sortable && validLayoutOrder(group, requested, groupCopies)
      ? requested
      : members;
  const sources = new Map(groupCopies.map(copy => [copy.id, copy.source]));
  const keyed = new Map(
    members.map(id => {
      const source = id < nodes.length ? id : sources.get(id);
      const node = source === undefined ? null : nodes[source];
      const child = isValidElement(node) ? (
        cloneElement(node, { key: `${group}:${id}` })
      ) : (
        <Fragment key={`${group}:${id}`}>{node}</Fragment>
      );
      return [id, child];
    })
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
      visibility.current?.apply();
      return;
    }
    direct.forEach((child, position) =>
      child.setAttribute('data-ai-order-index', String(order[position]))
    );
    visibility.current?.apply();
  });

  useLayoutEffect(() => {
    if (!root.current) return;
    const layer = visibilityLayer(root.current, group);
    visibility.current = layer;
    const unregister = registerLayoutVisibility(layer);
    layer.apply();
    return () => {
      unregister();
      layer.restore();
      if (visibility.current === layer) visibility.current = null;
    };
  }, [group]);

  const Tag = as;
  return (
    <Tag
      {...props}
      ref={root}
      data-ai-sortable-group={sortable ? group : undefined}
    >
      {sortable ? order.map(index => keyed.get(index)) : children}
    </Tag>
  );
}
