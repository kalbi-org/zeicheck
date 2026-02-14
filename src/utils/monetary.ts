/**
 * Safe integer-yen arithmetic utilities.
 * Japanese tax returns use only whole yen amounts.
 */

import { type Yen, yen } from "../models/types.js";

/** Add two Yen amounts */
export function add(a: Yen, b: Yen): Yen {
  return yen(a + b);
}

/** Subtract b from a */
export function subtract(a: Yen, b: Yen): Yen {
  return yen(a - b);
}

/** Sum an array of Yen amounts */
export function sum(items: readonly Yen[]): Yen {
  return yen(items.reduce((acc, v) => acc + v, 0));
}

/** Check if a Yen amount is non-negative */
export function isNonNegative(a: Yen): boolean {
  return a >= 0;
}

/** Check if two Yen amounts are equal */
export function equals(a: Yen, b: Yen): boolean {
  return a === b;
}

/** Format a Yen amount with comma separators (e.g., "1,234,567") */
export function formatYen(a: Yen): string {
  return a.toLocaleString("ja-JP");
}
