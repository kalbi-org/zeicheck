import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/bs-equation
 * 法人B/S: 資産合計 = 負債合計 + 純資産合計
 */
export const corporateBsEquationRule: Rule = {
  meta: {
    id: "corporate/bs-equation",
    name: "法人B/S等式",
    description: "資産合計 = 負債合計 + 純資産合計 を検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const bs = ctx.taxReturn.balanceSheet;
    const diagnostics: RuleDiagnostic[] = [];

    const closingAssets = bs.assetsTotal.closing;
    const closingLiabilities = bs.liabilitiesTotal.closing;
    const closingEquity = bs.equityTotal.closing;

    if (closingAssets !== closingLiabilities + closingEquity) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `期末残高: 資産合計(${formatYen(closingAssets)}) ≠ 負債合計(${formatYen(closingLiabilities)}) + 純資産合計(${formatYen(closingEquity)})`,
        expected: `資産合計 = ${formatYen(yen(closingLiabilities + closingEquity))}`,
      });
    }

    const openingAssets = bs.assetsTotal.opening;
    const openingLiabilities = bs.liabilitiesTotal.opening;
    const openingEquity = bs.equityTotal.opening;

    if (openingAssets !== openingLiabilities + openingEquity) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `期首残高: 資産合計(${formatYen(openingAssets)}) ≠ 負債合計(${formatYen(openingLiabilities)}) + 純資産合計(${formatYen(openingEquity)})`,
        expected: `資産合計 = ${formatYen(yen(openingLiabilities + openingEquity))}`,
      });
    }

    return diagnostics;
  },
};
