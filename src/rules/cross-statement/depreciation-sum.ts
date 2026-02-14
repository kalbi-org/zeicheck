import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";

/**
 * cross-statement/depreciation-sum
 * 減価償却費の計上額が損益計算書と一致するかチェック
 */
export const depreciationSumRule: Rule = {
  meta: {
    id: "cross-statement/depreciation-sum",
    name: "減価償却費合計の一致",
    description:
      "減価償却明細の必要経費算入額合計が損益計算書の減価償却費と一致するか確認します。",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const scheduleTotal =
      ctx.taxReturn.depreciationSchedule.totalBusinessDepreciation;
    const plDepreciation = ctx.taxReturn.incomeStatement.expenses.depreciation;

    // Skip if both are zero (no depreciation)
    if (scheduleTotal === 0 && plDepreciation === 0) return [];

    if (scheduleTotal !== plDepreciation) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `減価償却明細の合計(${formatYen(scheduleTotal)}) ≠ P/L減価償却費(${formatYen(plDepreciation)})`,
        },
      ];
    }

    return [];
  },
};
