/**
 * Income Statement (損益計算書) model.
 * Follows the Japanese P/L structure for sole proprietors (blue form).
 */

import type { Yen } from "./types.js";

/** Expense breakdown */
export interface ExpenseBreakdown {
  readonly salaries: Yen;            // 給料賃金
  readonly outsourcing: Yen;         // 外注工賃
  readonly retirement: Yen;          // 退職金
  readonly rent: Yen;                // 地代家賃
  readonly interest: Yen;            // 利子割引料
  readonly taxes: Yen;               // 租税公課
  readonly insurance: Yen;           // 損害保険料
  readonly repairs: Yen;             // 修繕費
  readonly consumables: Yen;         // 消耗品費
  readonly depreciation: Yen;        // 減価償却費
  readonly welfare: Yen;             // 福利厚生費
  readonly utilities: Yen;           // 水道光熱費
  readonly travel: Yen;              // 旅費交通費
  readonly communication: Yen;       // 通信費
  readonly advertising: Yen;         // 広告宣伝費
  readonly entertainment: Yen;       // 接待交際費
  readonly miscellaneous: Yen;       // 雑費
  readonly otherExpenses: Yen;       // その他経費
}

/** Cost of Goods Sold breakdown */
export interface CostOfGoodsSold {
  readonly openingInventory: Yen;    // 期首棚卸高
  readonly purchases: Yen;           // 仕入金額
  readonly closingInventory: Yen;    // 期末棚卸高
  readonly total: Yen;               // 売上原価合計
}

/** 損益計算書 */
export interface IncomeStatement {
  readonly revenue: Yen;             // 売上（収入）金額
  readonly cogs: CostOfGoodsSold;    // 売上原価
  readonly grossProfit: Yen;         // 売上総利益（差引金額）
  readonly expenses: ExpenseBreakdown; // 経費内訳
  readonly totalExpenses: Yen;       // 経費合計
  readonly operatingIncome: Yen;     // 所得金額（青色申告特別控除前）
}
