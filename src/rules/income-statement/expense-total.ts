import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const expenseTotalRule: Rule = {
  meta: {
    id: "income-statement/expense-total",
    name: "Expense Total",
    description: "経費合計が各経費項目の合計と一致するか検証する",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
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
          ruleId: "income-statement/expense-total",
          severity: "error",
          message: `経費合計(${formatYen(totalExpenses)}) ≠ 各経費項目の合計(${formatYen(computed)})`,
        },
      ];
    }

    return [];
  },
};
