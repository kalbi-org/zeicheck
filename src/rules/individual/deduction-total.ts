/**
 * 所得控除合計チェックルール
 * 申告書第二表の各控除項目の合計が第一表の所得控除合計と一致するか確認する。
 */

import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";

export const deductionTotalRule: Rule = {
  meta: {
    id: "individual/deduction-total",
    name: "所得控除合計チェック",
    description:
      "申告書第二表の各控除項目の合計が第一表の所得控除合計と一致するか確認します。",
    severity: "error",
    applicableTo: ["individual"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "individual") return [];

    const formA = ctx.taxReturn.taxFormA;
    const formB = ctx.taxReturn.taxFormB;
    const diagnostics: RuleDiagnostic[] = [];

    // Sum deduction items from 第二表
    const computed = (formB.socialInsurance +
      formB.smallBusinessMutualAid +
      formB.lifeInsurance +
      formB.earthquakeInsurance +
      formB.spouseDeduction +
      formB.dependentDeduction +
      formB.basicDeduction) as Yen;

    if (computed !== formA.totalDeductions) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `所得控除合計(${formatYen(formA.totalDeductions)}) ≠ 各控除項目の合算(${formatYen(computed)})`,
        expected: `所得控除合計 = ${formatYen(computed)}`,
      });
    }

    return diagnostics;
  },
};
