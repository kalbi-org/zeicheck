/**
 * HOT010 勘定科目コード → モデルプロパティのマッピング定義
 *
 * 勘定科目コード: 業種番号2桁 + 区分3桁 + 整数4桁
 * 区分コード:
 *   100系 = B/S 資産
 *   200系 = B/S 負債
 *   300系 = B/S 純資産
 *   400系 = P/L 売上・原価
 *   500系 = P/L 販管費
 *   600系 = P/L 営業外・特別
 *
 * CSV仕様: Shift_JIS, 5列（勘定科目コード9桁, 科目名, 期首残高, 期末残高, 備考）
 */

/** B/S項目の配置先 */
export type BsTarget =
  // Assets
  | "cash"
  | "deposits"
  | "accountsReceivable"
  | "inventory"
  | "otherCurrentAssets"
  | "buildings"
  | "buildingImprovements"
  | "machinery"
  | "vehicles"
  | "tools"
  | "land"
  | "otherFixedAssets"
  | "accumulatedDepreciation"
  | "assetsTotal"
  // Liabilities
  | "accountsPayable"
  | "borrowings"
  | "accruedExpenses"
  | "corporateTaxPayable"
  | "otherCurrentLiabilities"
  | "liabilitiesTotal"
  // Net Assets
  | "capitalStock"
  | "capitalSurplus"
  | "retainedEarnings"
  | "equityTotal";

/** P/L項目の配置先 */
export type PlTarget =
  | "revenue"
  | "cogsOpeningInventory"
  | "cogsPurchases"
  | "cogsClosingInventory"
  | "cogsTotal"
  | "grossProfit"
  | "expTaxes"
  | "expInsurance"
  | "expRepairs"
  | "expDepreciation"
  | "expWelfare"
  | "expSalaries"
  | "expOutsourcing"
  | "expInterest"
  | "expRent"
  | "expRetirement"
  | "expUtilities"
  | "expTravel"
  | "expCommunication"
  | "expAdvertising"
  | "expEntertainment"
  | "expConsumables"
  | "expMiscellaneous"
  | "expOther"
  | "totalExpenses"
  | "operatingIncome"
  | "nonOperatingIncome"
  | "nonOperatingExpenses"
  | "ordinaryIncome"
  | "extraordinaryGain"
  | "extraordinaryLoss"
  | "preTaxIncome"
  | "corporateTax"
  | "netIncome";

export interface BsMapping {
  type: "bs";
  target: BsTarget;
}

export interface PlMapping {
  type: "pl";
  target: PlTarget;
}

export type AccountMapping = BsMapping | PlMapping;

/**
 * 区分コード(3桁) → マッピング定義
 *
 * 業種番号は無視し、区分+整数(下7桁)で引き当て。
 * 実務上、主要な科目コードのみ定義。
 * 未知の科目コードは無視される。
 */
export const accountCodeMap = new Map<string, AccountMapping>([
  // ── B/S 資産 (100系) ──
  ["1000001", { type: "bs", target: "cash" }],
  ["1000002", { type: "bs", target: "deposits" }],
  ["1000003", { type: "bs", target: "accountsReceivable" }],
  ["1000004", { type: "bs", target: "inventory" }],
  ["1000005", { type: "bs", target: "otherCurrentAssets" }],
  ["1000006", { type: "bs", target: "buildings" }],
  ["1000007", { type: "bs", target: "buildingImprovements" }],
  ["1000008", { type: "bs", target: "machinery" }],
  ["1000009", { type: "bs", target: "vehicles" }],
  ["1000010", { type: "bs", target: "tools" }],
  ["1000011", { type: "bs", target: "land" }],
  ["1000012", { type: "bs", target: "otherFixedAssets" }],
  ["1000013", { type: "bs", target: "accumulatedDepreciation" }],
  ["1000099", { type: "bs", target: "assetsTotal" }],

  // ── B/S 負債 (200系) ──
  ["2000001", { type: "bs", target: "accountsPayable" }],
  ["2000002", { type: "bs", target: "borrowings" }],
  ["2000003", { type: "bs", target: "accruedExpenses" }],
  ["2000004", { type: "bs", target: "corporateTaxPayable" }],
  ["2000005", { type: "bs", target: "otherCurrentLiabilities" }],
  ["2000099", { type: "bs", target: "liabilitiesTotal" }],

  // ── B/S 純資産 (300系) ──
  ["3000001", { type: "bs", target: "capitalStock" }],
  ["3000002", { type: "bs", target: "capitalSurplus" }],
  ["3000003", { type: "bs", target: "retainedEarnings" }],
  ["3000099", { type: "bs", target: "equityTotal" }],

  // ── P/L 売上・原価 (400系) ──
  ["4000001", { type: "pl", target: "revenue" }],
  ["4000002", { type: "pl", target: "cogsOpeningInventory" }],
  ["4000003", { type: "pl", target: "cogsPurchases" }],
  ["4000004", { type: "pl", target: "cogsClosingInventory" }],
  ["4000005", { type: "pl", target: "cogsTotal" }],
  ["4000006", { type: "pl", target: "grossProfit" }],

  // ── P/L 販管費 (500系) ──
  ["5000001", { type: "pl", target: "expTaxes" }],
  ["5000002", { type: "pl", target: "expInsurance" }],
  ["5000003", { type: "pl", target: "expRepairs" }],
  ["5000004", { type: "pl", target: "expDepreciation" }],
  ["5000005", { type: "pl", target: "expWelfare" }],
  ["5000006", { type: "pl", target: "expSalaries" }],
  ["5000007", { type: "pl", target: "expOutsourcing" }],
  ["5000008", { type: "pl", target: "expInterest" }],
  ["5000009", { type: "pl", target: "expRent" }],
  ["5000010", { type: "pl", target: "expRetirement" }],
  ["5000011", { type: "pl", target: "expUtilities" }],
  ["5000012", { type: "pl", target: "expTravel" }],
  ["5000013", { type: "pl", target: "expCommunication" }],
  ["5000014", { type: "pl", target: "expAdvertising" }],
  ["5000015", { type: "pl", target: "expEntertainment" }],
  ["5000016", { type: "pl", target: "expConsumables" }],
  ["5000017", { type: "pl", target: "expMiscellaneous" }],
  ["5000018", { type: "pl", target: "expOther" }],
  ["5000099", { type: "pl", target: "totalExpenses" }],
  ["5000100", { type: "pl", target: "operatingIncome" }],

  // ── P/L 営業外・特別 (600系) ──
  ["6000001", { type: "pl", target: "nonOperatingIncome" }],
  ["6000002", { type: "pl", target: "nonOperatingExpenses" }],
  ["6000003", { type: "pl", target: "ordinaryIncome" }],
  ["6000004", { type: "pl", target: "extraordinaryGain" }],
  ["6000005", { type: "pl", target: "extraordinaryLoss" }],
  ["6000006", { type: "pl", target: "preTaxIncome" }],
  ["6000007", { type: "pl", target: "corporateTax" }],
  ["6000008", { type: "pl", target: "netIncome" }],
]);
