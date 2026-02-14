import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/retained-earnings-continuity
 * 利益剰余金の繰越: 期末利益剰余金 = 期首利益剰余金 + 当期純利益
 */
export const retainedEarningsContinuityRule: Rule = {
  meta: {
    id: "corporate/retained-earnings-continuity",
    name: "利益剰余金繰越チェック",
    description:
      "利益剰余金の期末残高 = 期首残高 + 当期純利益 であることを検証する（配当なしを前提）",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const bs = ctx.taxReturn.balanceSheet;

    const expected = yen(bs.retainedEarnings.opening + bs.netIncome);
    const actual = bs.retainedEarnings.closing;

    if (actual !== expected) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `利益剰余金の期末残高(${formatYen(actual)}) ≠ 期首残高(${formatYen(bs.retainedEarnings.opening)}) + 当期純利益(${formatYen(bs.netIncome)})`,
          details:
            "配当や自己株式取得がある場合はその分を考慮してください。",
          expected: `利益剰余金の期末残高 = ${formatYen(expected)}`,
        },
      ];
    }

    return [];
  },
};
