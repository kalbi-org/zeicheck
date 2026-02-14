import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/betsu4-taxable-income
 * 別表四: 当期利益 + 加算 - 減算 = 所得金額
 */
export const betsu4TaxableIncomeRule: Rule = {
  meta: {
    id: "corporate/betsu4-taxable-income",
    name: "別表四所得金額計算",
    description:
      "別表四の所得金額 = 当期利益 + 加算項目合計 - 減算項目合計 を検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const adj = ctx.taxReturn.incomeAdjustment;

    const expected = (adj.accountingProfit + adj.addBackTotal - adj.deductionTotal) as Yen;

    if (adj.taxableIncome !== expected) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `別表四の所得金額(${formatYen(adj.taxableIncome)}) ≠ 当期利益(${formatYen(adj.accountingProfit)}) + 加算(${formatYen(adj.addBackTotal)}) - 減算(${formatYen(adj.deductionTotal)})`,
          expected: `所得金額 = ${formatYen(expected)}`,
        },
      ];
    }

    return [];
  },
};
