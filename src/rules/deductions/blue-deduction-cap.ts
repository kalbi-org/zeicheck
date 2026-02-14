import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";

/**
 * deductions/blue-deduction-cap
 * 青色申告特別控除額が控除前所得を超えていないかチェック
 */
export const blueDeductionCapRule: Rule = {
  meta: {
    id: "deductions/blue-deduction-cap",
    name: "青色控除上限チェック",
    description:
      "青色申告特別控除額は、控除前の所得金額を超えることはできません。所得を超える場合は所得金額が上限となります。",
    severity: "warning",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const deduction = ctx.taxReturn.taxFormA.blueReturnDeduction;
    const income = ctx.taxReturn.incomeStatement.operatingIncome;

    if (deduction > income) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `青色申告特別控除額(${formatYen(deduction)}) > 控除前所得(${formatYen(income)})`,
          details:
            "青色申告特別控除額は控除前所得金額が上限です。所得が少ない場合は所得金額までしか控除できません。",
        },
      ];
    }

    return [];
  },
};
