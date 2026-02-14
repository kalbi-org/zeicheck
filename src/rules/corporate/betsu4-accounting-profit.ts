import { formatYen } from "../../utils/monetary.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/betsu4-accounting-profit
 * 別表四の当期利益 = P/L税引前当期純利益
 */
export const betsu4AccountingProfitRule: Rule = {
  meta: {
    id: "corporate/betsu4-accounting-profit",
    name: "別表四↔P/L整合性",
    description:
      "別表四の当期利益又は当期欠損の額が損益計算書の税引前当期純利益と一致するか検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const scheduleProfit = ctx.taxReturn.incomeAdjustment.accountingProfit;
    const plPreTax = ctx.taxReturn.incomeStatement.preTaxIncome;

    if (scheduleProfit !== plPreTax) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `別表四の当期利益(${formatYen(scheduleProfit)}) ≠ P/L税引前当期純利益(${formatYen(plPreTax)})`,
          expected: `別表四の当期利益 = ${formatYen(plPreTax)}`,
        },
      ];
    }

    return [];
  },
};
