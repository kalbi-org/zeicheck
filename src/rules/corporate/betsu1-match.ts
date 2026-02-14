import { formatYen } from "../../utils/monetary.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/betsu1-match
 * 別表一の所得金額 = 別表四の所得金額
 */
export const betsu1MatchRule: Rule = {
  meta: {
    id: "corporate/betsu1-match",
    name: "別表一↔別表四整合性",
    description:
      "別表一（法人税申告書）の所得金額が別表四の所得金額と一致するか検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const betsu1Income = ctx.taxReturn.corporateTaxForm.taxableIncome;
    const betsu4Income = ctx.taxReturn.incomeAdjustment.taxableIncome;

    if (betsu1Income !== betsu4Income) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `別表一の所得金額(${formatYen(betsu1Income)}) ≠ 別表四の所得金額(${formatYen(betsu4Income)})`,
          expected: `別表一の所得金額 = ${formatYen(betsu4Income)}`,
        },
      ];
    }

    return [];
  },
};
