/**
 * Top-level aggregate model for a complete tax return.
 */

import type { BalanceSheet } from "./balance-sheet.js";
import type { DepreciationSchedule } from "./depreciation-schedule.js";
import type { IncomeStatement } from "./income-statement.js";
import type { TaxFormA, TaxFormB } from "./tax-form.js";
import type { FiscalYear, TaxReturnMetadata } from "./types.js";

/** Complete tax return data */
export interface TaxReturn {
  readonly fiscalYear: FiscalYear;
  readonly balanceSheet: BalanceSheet;
  readonly incomeStatement: IncomeStatement;
  readonly depreciationSchedule: DepreciationSchedule;
  readonly taxFormA: TaxFormA;
  readonly taxFormB: TaxFormB;
  readonly metadata: TaxReturnMetadata;
}
