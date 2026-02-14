import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";

/**
 * balance-sheet/opening-owner-equity
 * 事業主貸・事業主借は期首残高が0であるべき（前期末で精算される）
 */
export const openingOwnerEquityRule: Rule = {
  meta: {
    id: "balance-sheet/opening-owner-equity",
    name: "事業主貸借 期首残高ゼロ",
    description:
      "事業主貸と事業主借は毎期首に元入金へ振替されるため、期首残高は0円であるべきです。",
    severity: "error",
    applicableTo: ["sole-proprietor"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "sole-proprietor") return [];
    const diagnostics: RuleDiagnostic[] = [];
    const bs = ctx.taxReturn.balanceSheet;

    if (bs.ownerDrawings.opening !== 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `事業主貸の期首残高が0ではありません: ${formatYen(bs.ownerDrawings.opening)}`,
        expected: "事業主貸の期首残高 = ¥0",
      });
    }

    if (bs.ownerContributions.opening !== 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `事業主借の期首残高が0ではありません: ${formatYen(bs.ownerContributions.opening)}`,
        expected: "事業主借の期首残高 = ¥0",
      });
    }

    return diagnostics;
  },
};
