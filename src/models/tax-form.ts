/**
 * Tax form models (申告書).
 */

import type { Yen } from "./types.js";

/** 申告書第一表 (主要部分) */
export interface TaxFormA {
  // 収入金額
  readonly businessIncome: Yen;        // 営業等 (ア)
  readonly realEstateIncome: Yen;      // 不動産 (イ)
  readonly otherIncome: Yen;           // その他収入

  // 所得金額
  readonly businessProfit: Yen;        // 営業等 (①)
  readonly realEstateProfit: Yen;      // 不動産 (②)
  readonly totalIncome: Yen;           // 合計所得金額 (⑫)

  // 所得控除
  readonly totalDeductions: Yen;       // 所得控除合計 (㉙)
  readonly blueReturnDeduction: Yen;   // 青色申告特別控除額

  // 税額
  readonly taxableIncome: Yen;         // 課税される所得金額 (㉚)
  readonly incomeTax: Yen;             // 所得税額
  readonly taxDue: Yen;               // 納める税金 / 還付される税金
}

/** 申告書第二表 (主要部分) */
export interface TaxFormB {
  // 所得の内訳
  readonly incomeDetails: readonly IncomeDetail[];

  // 社会保険料控除
  readonly socialInsurance: Yen;       // 社会保険料
  readonly smallBusinessMutualAid: Yen; // 小規模企業共済等掛金
  readonly lifeInsurance: Yen;         // 生命保険料
  readonly earthquakeInsurance: Yen;    // 地震保険料
  readonly spouseDeduction: Yen;       // 配偶者控除
  readonly dependentDeduction: Yen;    // 扶養控除
  readonly basicDeduction: Yen;        // 基礎控除
}

/** 所得の内訳 */
export interface IncomeDetail {
  readonly type: string;
  readonly payer: string;
  readonly amount: Yen;
  readonly withheld: Yen;
}
