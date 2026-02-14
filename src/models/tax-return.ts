/**
 * Top-level aggregate model for a complete tax return.
 * Discriminated union: SoleProprietorReturn | IndividualReturn | CorporateReturn
 */

import type { BalanceSheet } from "./balance-sheet.js";
import type { CorporateBalanceSheet } from "./corporate-balance-sheet.js";
import type { CorporateIncomeStatement } from "./corporate-income-statement.js";
import type {
  CorporateInfo,
  CorporateTaxFormMain,
  IncomeAdjustmentSchedule,
} from "./corporate-tax-form.js";
import type { DepreciationSchedule } from "./depreciation-schedule.js";
import type { IncomeStatement } from "./income-statement.js";
import type { TaxFormA, TaxFormB } from "./tax-form.js";
import type { FiscalYear, TaxReturnMetadata } from "./types.js";

/** 個人事業主（青色申告）の確定申告データ */
export interface SoleProprietorReturn {
  readonly returnType: "sole-proprietor";
  readonly fiscalYear: FiscalYear;
  readonly balanceSheet: BalanceSheet;
  readonly incomeStatement: IncomeStatement;
  readonly depreciationSchedule: DepreciationSchedule;
  readonly taxFormA: TaxFormA;
  readonly taxFormB: TaxFormB;
  readonly metadata: TaxReturnMetadata;
}

/** 個人（給与所得者等）の確定申告データ */
export interface IndividualReturn {
  readonly returnType: "individual";
  readonly fiscalYear: FiscalYear;
  readonly taxFormA: TaxFormA;
  readonly taxFormB: TaxFormB;
  readonly metadata: TaxReturnMetadata;
}

/** 法人（マイクロ法人）の申告データ */
export interface CorporateReturn {
  readonly returnType: "corporate";
  readonly fiscalYear: FiscalYear;
  readonly balanceSheet: CorporateBalanceSheet;
  readonly incomeStatement: CorporateIncomeStatement;
  readonly depreciationSchedule: DepreciationSchedule;
  readonly corporateTaxForm: CorporateTaxFormMain;
  readonly incomeAdjustment: IncomeAdjustmentSchedule;
  readonly corporateInfo: CorporateInfo;
  readonly metadata: TaxReturnMetadata;
}

/** 確定申告データ（個人事業主/個人/法人 判別共用体） */
export type TaxReturn =
  | SoleProprietorReturn
  | IndividualReturn
  | CorporateReturn;
