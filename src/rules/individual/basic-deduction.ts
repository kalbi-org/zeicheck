/**
 * 基礎控除確認ルール
 * 基礎控除が標準額（48万円）であるか確認する。
 */

import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";

const BASIC_DEDUCTION_STANDARD = yen(480000);

export const basicDeductionRule: Rule = {
  meta: {
    id: "individual/basic-deduction",
    name: "基礎控除額確認",
    description:
      "基礎控除が標準額（48万円）であるか確認します。合計所得金額が2,400万円以下の場合は48万円が適用されます。",
    severity: "info",
    applicableTo: ["individual"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "individual") return [];

    const basic = ctx.taxReturn.taxFormB.basicDeduction;
    const diagnostics: RuleDiagnostic[] = [];

    if (basic !== BASIC_DEDUCTION_STANDARD && basic !== 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `基礎控除額(${formatYen(basic)})が標準額(${formatYen(BASIC_DEDUCTION_STANDARD)})と異なります。合計所得金額が2,400万円超の場合は逓減されます。`,
        expected: `基礎控除 = ${formatYen(BASIC_DEDUCTION_STANDARD)}（合計所得2,400万円以下の場合）`,
      });
    }

    return diagnostics;
  },
};
