/**
 * Depreciation Schedule (減価償却) model.
 */

import type { Yen } from "./types.js";

/** Single depreciable asset */
export interface DepreciationAsset {
  readonly name: string;                // 資産名
  readonly acquisitionDate: string;     // 取得年月
  readonly acquisitionCost: Yen;        // 取得価額
  readonly usefulLife: number;          // 耐用年数
  readonly depreciationMethod: "定額法" | "定率法" | "一括償却";
  readonly depreciationRate: number;    // 償却率
  readonly depreciationAmount: Yen;     // 本年分の償却費
  readonly accumulatedDepreciation: Yen; // 償却累計額
  readonly bookValue: Yen;             // 未償却残高（期末残高）
  readonly businessUseRatio: number;    // 事業専用割合 (0-1)
  readonly businessDepreciation: Yen;   // 本年分の必要経費算入額
}

/** 減価償却費の計算 */
export interface DepreciationSchedule {
  readonly assets: readonly DepreciationAsset[];
  readonly totalDepreciation: Yen;      // 償却費合計
  readonly totalBusinessDepreciation: Yen; // 必要経費算入額合計
}
