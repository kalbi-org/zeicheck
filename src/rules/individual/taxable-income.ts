/**
 * 課税所得計算チェックルール
 * 課税される所得金額 = 合計所得金額 − 所得控除合計 を検証する。
 */

import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";

export const taxableIncomeRule: Rule = {
  meta: {
    id: "individual/taxable-income",
    name: "課税所得計算チェック",
    description:
      "課税される所得金額が合計所得金額から所得控除合計を差し引いた値と一致するか確認します。",
    severity: "error",
    applicableTo: ["individual"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "individual") return [];

    const form = ctx.taxReturn.taxFormA;
    const diagnostics: RuleDiagnostic[] = [];

    // 課税所得 = 合計所得 - 所得控除合計（負の場合は0）
    const expected = Math.max(
      0,
      form.totalIncome - form.totalDeductions,
    ) as Yen;

    if (form.taxableIncome !== expected) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `課税所得金額(${formatYen(form.taxableIncome)}) ≠ 合計所得(${formatYen(form.totalIncome)}) − 所得控除(${formatYen(form.totalDeductions)})`,
        expected: `課税所得金額 = ${formatYen(expected)}`,
      });
    }

    return diagnostics;
  },
};
