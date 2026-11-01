'use client';

import { useSyncExternalStore } from 'react';
import {
  LAYOUT_GROUPS,
  validLayoutOrder,
  validLayoutHidden,
  validLayoutCopies,
  layoutItemIds,
  type LayoutCopy,
} from './ai-layout-schema';

export type LayoutOrders = Readonly<Record<string, readonly number[]>>;
export type LayoutCopies = Readonly<
  Record<string, readonly Readonly<LayoutCopy>[]>
>;
const EMPTY: LayoutOrders = Object.freeze({});
const EMPTY_COPIES: LayoutCopies = Object.freeze({});
let orders: LayoutOrders = EMPTY;
let hidden: LayoutOrders = EMPTY;
let copies: LayoutCopies = EMPTY_COPIES;
const listeners = new Set<() => void>();
const emit = () => {
  for (const listener of listeners) listener();
};

function normalizeOrders(
  next: LayoutOrders,
  membership: LayoutCopies
): LayoutOrders {
  const normalized: Record<string, readonly number[]> = {};
  if (process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1') {
    for (const group of Object.keys(LAYOUT_GROUPS)) {
      const value = next[group];
      const groupCopies = membership[group] || [];
      const baseline = layoutItemIds(group, groupCopies)!;
      if (
        validLayoutOrder(group, value, groupCopies) &&
        value.some((index, position) => index !== baseline[position])
      )
        normalized[group] = Object.freeze([...value]);
    }
  }
  return Object.freeze(normalized);
}
function normalizeHidden(
  next: LayoutOrders,
  membership: LayoutCopies
): LayoutOrders {
  const normalized: Record<string, readonly number[]> = {};
  if (process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1') {
    for (const group of Object.keys(LAYOUT_GROUPS)) {
      const value = next[group];
      if (
        validLayoutHidden(group, value, membership[group] || []) &&
        value.length
      )
        normalized[group] = Object.freeze(
          [...value].sort((left, right) => left - right)
        );
    }
  }
  return Object.freeze(normalized);
}

export function getLayoutOrders(): LayoutOrders {
  return orders;
}
export function setLayoutOrders(next: Record<string, number[]>): void {
  const normalized = normalizeOrders(next, copies);
  if (JSON.stringify(normalized) === JSON.stringify(orders)) return;
  orders = normalized;
  emit();
}
export function getLayoutHidden(): LayoutOrders {
  return hidden;
}
export function setLayoutHidden(next: Record<string, number[]>): void {
  const normalized = normalizeHidden(next, copies);
  if (JSON.stringify(normalized) === JSON.stringify(hidden)) return;
  hidden = normalized;
  emit();
}
export function getLayoutCopies(): LayoutCopies {
  return copies;
}
export function setLayoutCopies(next: Record<string, LayoutCopy[]>): void {
  const normalized: Record<string, readonly Readonly<LayoutCopy>[]> = {};
  if (process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1') {
    for (const group of Object.keys(LAYOUT_GROUPS)) {
      const value = next[group];
      if (validLayoutCopies(group, value) && value.length)
        normalized[group] = Object.freeze(
          [...value]
            .sort((left, right) => left.id - right.id)
            .map(copy => Object.freeze({ ...copy }))
        );
    }
  }
  const nextCopies = Object.freeze(normalized);
  // Retain valid relative order and hidden originals when copies are added/undone.
  const reconciledOrders: Record<string, number[]> = {};
  const reconciledHidden: Record<string, number[]> = {};
  for (const group of Object.keys(LAYOUT_GROUPS)) {
    const allowed = layoutItemIds(group, nextCopies[group] || [])!;
    const before = orders[group] || layoutItemIds(group, copies[group] || [])!;
    const kept = before.filter(index => allowed.includes(index));
    reconciledOrders[group] = [
      ...kept,
      ...allowed.filter(index => !kept.includes(index)),
    ];
    reconciledHidden[group] = (hidden[group] || []).filter(index =>
      allowed.includes(index)
    );
  }
  const nextOrders = normalizeOrders(reconciledOrders, nextCopies);
  const nextHidden = normalizeHidden(reconciledHidden, nextCopies);
  if (
    JSON.stringify([nextCopies, nextOrders, nextHidden]) ===
    JSON.stringify([copies, orders, hidden])
  )
    return;
  copies = nextCopies;
  orders = nextOrders;
  hidden = nextHidden;
  emit();
}

export function subscribeLayoutOrders(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useLayoutOrders(): LayoutOrders {
  return useSyncExternalStore(
    subscribeLayoutOrders,
    getLayoutOrders,
    () => EMPTY
  );
}
export function useLayoutHidden(): LayoutOrders {
  return useSyncExternalStore(
    subscribeLayoutOrders,
    getLayoutHidden,
    () => EMPTY
  );
}
export function useLayoutCopies(): LayoutCopies {
  return useSyncExternalStore(
    subscribeLayoutOrders,
    getLayoutCopies,
    () => EMPTY_COPIES
  );
}

export interface LayoutVisibilityLayer {
  restore: () => void;
  apply: () => void;
}
const visibilityLayers = new Set<LayoutVisibilityLayer>();
export function registerLayoutVisibility(
  layer: LayoutVisibilityLayer
): () => void {
  visibilityLayers.add(layer);
  return () => {
    visibilityLayers.delete(layer);
  };
}
// Visibility is a temporary layer. Never let text/style undo snapshot our display:none.
export function withLayoutVisibilityRestored<T>(work: () => T): T {
  const layers = [...visibilityLayers];
  for (const layer of layers) layer.restore();
  try {
    return work();
  } finally {
    for (const layer of layers) layer.apply();
  }
}
