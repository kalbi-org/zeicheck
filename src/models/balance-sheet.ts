/**
 * Balance Sheet (貸借対照表) model.
 */

import type { AccountBalance, Yen } from "./types.js";

/** 貸借対照表 */
export interface BalanceSheet {
  // ── 資産の部 (Assets) ──
  readonly cash: AccountBalance;               // 現金
  readonly deposits: AccountBalance;            // 預金
  readonly accountsReceivable: AccountBalance;  // 売掛金
  readonly inventory: AccountBalance;           // 棚卸資産
  readonly otherCurrentAssets: AccountBalance;   // その他流動資産
  readonly buildings: AccountBalance;            // 建物
  readonly buildingImprovements: AccountBalance; // 建物附属設備
  readonly machinery: AccountBalance;            // 機械装置
  readonly vehicles: AccountBalance;             // 車両運搬具
  readonly tools: AccountBalance;                // 工具器具備品
  readonly land: AccountBalance;                 // 土地
  readonly otherFixedAssets: AccountBalance;      // その他固定資産
  readonly accumulatedDepreciation: AccountBalance; // 減価償却累計額
  readonly assetsTotal: AccountBalance;          // 資産合計

  // ── 負債の部 (Liabilities) ──
  readonly accountsPayable: AccountBalance;      // 買掛金
  readonly borrowings: AccountBalance;           // 借入金
  readonly otherCurrentLiabilities: AccountBalance; // その他流動負債
  readonly liabilitiesTotal: AccountBalance;     // 負債合計

  // ── 資本の部 (Equity / Capital) ──
  readonly ownerEquity: AccountBalance;          // 元入金
  readonly ownerDrawings: AccountBalance;        // 事業主貸
  readonly ownerContributions: AccountBalance;   // 事業主借
  readonly retainedEarnings: Yen;                // 青色申告特別控除前の所得金額
  readonly equityTotal: AccountBalance;          // 資本合計（負債・資本合計に使用）
}
