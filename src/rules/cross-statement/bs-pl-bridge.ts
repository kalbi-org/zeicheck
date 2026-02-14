import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const bsPlBridgeRule: Rule = {
  meta: {
    id: "cross-statement/bs-pl-bridge",
    name: "BS-PL Bridge",
    description: "貸借対照表の青色申告特別控除前の所得金額と損益計算書の所得金額の一致を検証する",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const bsRetained = ctx.taxReturn.balanceSheet.retainedEarnings;
    const plOperating = ctx.taxReturn.incomeStatement.operatingIncome;

    if (bsRetained !== plOperating) {
      return [
        {
          ruleId: "cross-statement/bs-pl-bridge",
          severity: "error",
          message: `損益計算書の所得金額(${formatYen(plOperating)}) ≠ 貸借対照表の青色申告特別控除前の所得金額(${formatYen(bsRetained as Yen)})`,
        },
      ];
    }

    return [];
  },
};
