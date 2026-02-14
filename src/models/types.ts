/**
 * Core types for zeicheck tax return models.
 */

/** Branded type for integer yen amounts. Prevents accidental float usage. */
export type Yen = number & { readonly __brand: unique symbol };

/** Create a Yen value from a number. Truncates to integer. */
export function yen(n: number): Yen {
  return Math.trunc(n) as Yen;
}

/** Fiscal year representation */
export interface FiscalYear {
  /** 和暦年 (e.g., 5 for 令和5年) */
  readonly nengo: number;
  /** 西暦年 (e.g., 2023) */
  readonly year: number;
  /** 期首日 */
  readonly startDate: string;
  /** 期末日 */
  readonly endDate: string;
}

/** Account balance with opening and closing amounts */
export interface AccountBalance {
  readonly opening: Yen;
  readonly closing: Yen;
}

/** Form types in e-Tax xtx files */
export enum FormType {
  /** 申告書第一表 */
  ABA = "ABA",
  /** 申告書第二表 */
  ABB = "ABB",
  /** 青色申告決算書（一般用） */
  VCA = "VCA",
}

/** Metadata about the tax return */
export interface TaxReturnMetadata {
  readonly filePath: string;
  readonly formTypes: FormType[];
  readonly filingMethod?: string;
}
