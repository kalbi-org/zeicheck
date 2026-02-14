import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const bsEquationRule: Rule = {
  meta: {
    id: "balance-sheet/equation",
    name: "Balance Sheet Equation",
    description: "資産合計 = 負債合計 + 資本合計 を検証する",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const bs = ctx.taxReturn.balanceSheet;
    const diagnostics: RuleDiagnostic[] = [];

    // Check closing balance equation
    const closingAssets = bs.assetsTotal.closing;
    const closingLiabilities = bs.liabilitiesTotal.closing;
    const closingEquity = bs.equityTotal.closing;

    if (closingAssets !== closingLiabilities + closingEquity) {
      diagnostics.push({
        ruleId: "balance-sheet/equation",
        severity: "error",
        message: `期末残高: 資産合計(${formatYen(closingAssets)}) ≠ 負債合計(${formatYen(closingLiabilities)}) + 資本合計(${formatYen(closingEquity)})`,
        expected: `資産合計 = ${formatYen(yen(closingLiabilities + closingEquity))}`,
      });
    }

    // Check opening balance equation
    const openingAssets = bs.assetsTotal.opening;
    const openingLiabilities = bs.liabilitiesTotal.opening;
    const openingEquity = bs.equityTotal.opening;

    if (openingAssets !== openingLiabilities + openingEquity) {
      diagnostics.push({
        ruleId: "balance-sheet/equation",
        severity: "error",
        message: `期首残高: 資産合計(${formatYen(openingAssets)}) ≠ 負債合計(${formatYen(openingLiabilities)}) + 資本合計(${formatYen(openingEquity)})`,
        expected: `資産合計 = ${formatYen(yen(openingLiabilities + openingEquity))}`,
      });
    }

    return diagnostics;
  },
};
