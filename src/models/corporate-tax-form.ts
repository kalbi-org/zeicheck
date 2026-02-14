/**
 * Corporate tax form models (法人税申告書).
 */

import type { Yen } from "./types.js";

/** 法人税申告書 別表一（各事業年度の所得に係る申告書） */
export interface CorporateTaxFormMain {
  readonly taxableIncome: Yen;         // 所得金額
  readonly corporateTaxAmount: Yen;    // 法人税額
  readonly taxCredits: Yen;            // 控除税額
  readonly localCorporateTax: Yen;     // 地方法人税
  readonly taxDue: Yen;               // 差引確定法人税額
}

/** 法人税申告書 別表四（所得の金額の計算に関する明細書） */
export interface IncomeAdjustmentSchedule {
  readonly accountingProfit: Yen;      // 当期利益又は当期欠損の額
  readonly addBackTotal: Yen;          // 加算項目合計
  readonly deductionTotal: Yen;        // 減算項目合計
  readonly taxableIncome: Yen;         // 所得金額又は欠損金額
}

/** 法人基本情報 */
export interface CorporateInfo {
  readonly capitalAmount: Yen;         // 資本金の額
  readonly fiscalYearMonths: number;   // 事業年度の月数
  readonly isSmallCorp: boolean;       // 中小法人等判定
  readonly officerCount: number;       // 役員数
}
