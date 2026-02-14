/**
 * Corporate Income Statement (法人損益計算書) model.
 */

import type { CostOfGoodsSold, ExpenseBreakdown } from "./income-statement.js";
import type { Yen } from "./types.js";

/** 法人損益計算書 */
export interface CorporateIncomeStatement {
  // ── 上部：個人と同様 ──
  readonly revenue: Yen;                // 売上高
  readonly cogs: CostOfGoodsSold;       // 売上原価
  readonly grossProfit: Yen;            // 売上総利益
  readonly expenses: ExpenseBreakdown;  // 販売費及び一般管理費
  readonly totalExpenses: Yen;          // 販管費合計
  readonly operatingIncome: Yen;        // 営業利益

  // ── 営業外損益 ──
  readonly nonOperatingIncome: Yen;     // 営業外収益
  readonly nonOperatingExpenses: Yen;   // 営業外費用
  readonly ordinaryIncome: Yen;         // 経常利益

  // ── 特別損益 ──
  readonly extraordinaryGain: Yen;      // 特別利益
  readonly extraordinaryLoss: Yen;      // 特別損失
  readonly preTaxIncome: Yen;           // 税引前当期純利益

  // ── 法人税等 ──
  readonly corporateTax: Yen;           // 法人税・住民税・事業税
  readonly netIncome: Yen;              // 当期純利益
}
