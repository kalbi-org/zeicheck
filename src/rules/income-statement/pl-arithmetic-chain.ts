import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const plArithmeticChainRule: Rule = {
  meta: {
    id: "income-statement/pl-chain",
    name: "P/L Arithmetic Chain",
    description: "損益計算書の計算連鎖を検証する",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const pl = ctx.taxReturn.incomeStatement;
    const diagnostics: RuleDiagnostic[] = [];

    // Check: grossProfit = revenue - cogs.total
    const expectedGross = (pl.revenue - pl.cogs.total) as Yen;
    if (pl.grossProfit !== expectedGross) {
      diagnostics.push({
        ruleId: "income-statement/pl-chain",
        severity: "error",
        message: `売上総利益(${formatYen(pl.grossProfit)}) ≠ 売上(${formatYen(pl.revenue)}) - 売上原価(${formatYen(pl.cogs.total)})`,
        expected: `売上総利益 = ${formatYen(expectedGross)}`,
      });
    }

    // Check: operatingIncome = grossProfit - totalExpenses
    const expectedOperating = (pl.grossProfit - pl.totalExpenses) as Yen;
    if (pl.operatingIncome !== expectedOperating) {
      diagnostics.push({
        ruleId: "income-statement/pl-chain",
        severity: "error",
        message: `所得金額(${formatYen(pl.operatingIncome)}) ≠ 売上総利益(${formatYen(pl.grossProfit)}) - 経費合計(${formatYen(pl.totalExpenses)})`,
        expected: `所得金額 = ${formatYen(expectedOperating)}`,
      });
    }

    return diagnostics;
  },
};
