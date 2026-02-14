import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { yen } from "../../models/types.js";
import { formatYen } from "../../utils/monetary.js";

/**
 * deductions/blue-deduction-eligibility
 * 65万円(55万円)控除の適用要件チェック
 */
export const blueDeductionEligibilityRule: Rule = {
  meta: {
    id: "deductions/blue-deduction-eligibility",
    name: "青色控除65万円適用要件",
    description:
      "65万円の青色申告特別控除にはe-Taxによる申告または電子帳簿保存が必要です（令和2年分以降）。要件を満たさない場合は55万円が上限です。",
    severity: "info",
    applicableTo: ["sole-proprietor"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "sole-proprietor") return [];
    const deduction = ctx.taxReturn.taxFormA.blueReturnDeduction;
    const limit55 = yen(550000);
    const limit65 = yen(650000);

    if (deduction > limit55 && deduction <= limit65) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `青色申告特別控除額が${formatYen(limit65)}です。e-Tax申告または電子帳簿保存の要件を確認してください。`,
          details:
            "令和2年分以降、65万円控除にはe-Taxによる確定申告の送信、または電子帳簿保存法に基づく電子帳簿の備付けおよび保存が必要です。要件を満たさない場合は55万円が上限となります。",
        },
      ];
    }

    return [];
  },
};
