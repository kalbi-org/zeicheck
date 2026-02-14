import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";

/**
 * balance-sheet/non-negative-cash
 * 現金残高が負でないかチェック
 */
export const nonNegativeCashRule: Rule = {
  meta: {
    id: "balance-sheet/non-negative-cash",
    name: "現金残高の非負チェック",
    description:
      "現金残高は0以上であるべきです。マイナス残高は記帳ミスの可能性があります。",
    severity: "warning",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const diagnostics: RuleDiagnostic[] = [];
    const bs = ctx.taxReturn.balanceSheet;

    if (bs.cash.opening < 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `現金の期首残高がマイナスです: ${formatYen(bs.cash.opening)}`,
      });
    }

    if (bs.cash.closing < 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `現金の期末残高がマイナスです: ${formatYen(bs.cash.closing)}`,
      });
    }

    return diagnostics;
  },
};
