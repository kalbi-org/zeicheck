import { formatYen } from "../../utils/monetary.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/bs-pl-bridge
 * B/S当期純利益 = P/L当期純利益
 */
export const corporateBsPlBridgeRule: Rule = {
  meta: {
    id: "corporate/bs-pl-bridge",
    name: "法人B/S↔P/L整合性",
    description:
      "貸借対照表の当期純利益と損益計算書の当期純利益が一致するか検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const bsNetIncome = ctx.taxReturn.balanceSheet.netIncome;
    const plNetIncome = ctx.taxReturn.incomeStatement.netIncome;

    if (bsNetIncome !== plNetIncome) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `B/S当期純利益(${formatYen(bsNetIncome)}) ≠ P/L当期純利益(${formatYen(plNetIncome)})`,
          expected: `両方とも同一の値であるべき: ${formatYen(plNetIncome)}`,
        },
      ];
    }

    return [];
  },
};
