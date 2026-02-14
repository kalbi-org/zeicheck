/**
 * Corporate Balance Sheet (法人貸借対照表) model.
 */

import type { AccountBalance, Yen } from "./types.js";

/** 法人貸借対照表 */
export interface CorporateBalanceSheet {
  // ── 資産の部 (Assets) ── 個人と同構造
  readonly cash: AccountBalance;                     // 現金
  readonly deposits: AccountBalance;                 // 預金
  readonly accountsReceivable: AccountBalance;       // 売掛金
  readonly inventory: AccountBalance;                // 棚卸資産
  readonly otherCurrentAssets: AccountBalance;       // その他流動資産
  readonly buildings: AccountBalance;                // 建物
  readonly buildingImprovements: AccountBalance;     // 建物附属設備
  readonly machinery: AccountBalance;                // 機械装置
  readonly vehicles: AccountBalance;                 // 車両運搬具
  readonly tools: AccountBalance;                    // 工具器具備品
  readonly land: AccountBalance;                     // 土地
  readonly otherFixedAssets: AccountBalance;          // その他固定資産
  readonly accumulatedDepreciation: AccountBalance;  // 減価償却累計額
  readonly assetsTotal: AccountBalance;              // 資産合計

  // ── 負債の部 (Liabilities) ──
  readonly accountsPayable: AccountBalance;          // 買掛金
  readonly borrowings: AccountBalance;               // 借入金
  readonly accruedExpenses: AccountBalance;           // 未払費用
  readonly corporateTaxPayable: AccountBalance;      // 未払法人税等
  readonly otherCurrentLiabilities: AccountBalance;  // その他流動負債
  readonly liabilitiesTotal: AccountBalance;         // 負債合計

  // ── 純資産の部 (Net Assets) ──
  readonly capitalStock: AccountBalance;             // 資本金
  readonly capitalSurplus: AccountBalance;           // 資本剰余金
  readonly retainedEarnings: AccountBalance;         // 利益剰余金
  readonly netIncome: Yen;                           // 当期純利益
  readonly equityTotal: AccountBalance;              // 純資産合計
}
