import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const cogsCalculationRule: Rule = {
  meta: {
    id: "income-statement/cogs",
    name: "COGS Calculation",
    description: "売上原価の計算を検証する",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const cogs = ctx.taxReturn.incomeStatement.cogs;

    // Skip if all COGS values are zero
    if (
      cogs.openingInventory === 0 &&
      cogs.purchases === 0 &&
      cogs.closingInventory === 0 &&
      cogs.total === 0
    ) {
      return [];
    }

    const expected = (cogs.openingInventory + cogs.purchases - cogs.closingInventory) as Yen;
    if (cogs.total !== expected) {
      return [
        {
          ruleId: "income-statement/cogs",
          severity: "error",
          message: `売上原価合計(${formatYen(cogs.total)}) ≠ 期首棚卸高(${formatYen(cogs.openingInventory)}) + 仕入金額(${formatYen(cogs.purchases)}) - 期末棚卸高(${formatYen(cogs.closingInventory)})`,
        },
      ];
    }

    return [];
  },
};
