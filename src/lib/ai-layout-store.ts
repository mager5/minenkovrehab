'use client';

import { useSyncExternalStore } from 'react';
import { LAYOUT_GROUPS, validLayoutOrder } from './ai-layout-schema';

export type LayoutOrders = Readonly<Record<string, readonly number[]>>;
const EMPTY: LayoutOrders = Object.freeze({});
let orders: LayoutOrders = EMPTY;
const listeners = new Set<() => void>();

export function getLayoutOrders(): LayoutOrders {
  return orders;
}

export function setLayoutOrders(next: Record<string, number[]>): void {
  const normalized: Record<string, readonly number[]> = {};
  if (process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1') {
    for (const group of Object.keys(LAYOUT_GROUPS)) {
      const value = next[group];
      if (
        validLayoutOrder(group, value) &&
        value.some((index, position) => index !== position)
      )
        normalized[group] = Object.freeze([...value]);
    }
  }
  if (JSON.stringify(normalized) === JSON.stringify(orders)) return;
  orders = Object.freeze(normalized);
  for (const listener of listeners) listener();
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
