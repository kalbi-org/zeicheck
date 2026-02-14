import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/expense-total
 * 法人販管費の合計検証
 */
export const corporateExpenseTotalRule: Rule = {
  meta: {
    id: "corporate/expense-total",
    name: "法人販管費合計チェック",
    description: "販売費及び一般管理費の合計が各費目の合計と一致するか検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const exp = ctx.taxReturn.incomeStatement.expenses;

    const computed = (
      exp.salaries +
      exp.outsourcing +
      exp.retirement +
      exp.rent +
      exp.interest +
      exp.taxes +
      exp.insurance +
      exp.repairs +
      exp.consumables +
      exp.depreciation +
      exp.welfare +
      exp.utilities +
      exp.travel +
      exp.communication +
      exp.advertising +
      exp.entertainment +
      exp.miscellaneous +
      exp.otherExpenses
    ) as Yen;

    const totalExpenses = ctx.taxReturn.incomeStatement.totalExpenses;

    if (totalExpenses !== computed) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `販管費合計(${formatYen(totalExpenses)}) ≠ 各費目の合計(${formatYen(computed)})`,
          expected: `販管費合計 = ${formatYen(computed)}`,
        },
      ];
    }

    return [];
  },
};
