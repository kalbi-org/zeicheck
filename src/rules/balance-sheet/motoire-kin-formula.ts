import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";

/**
 * balance-sheet/motoire-kin-formula
 * 元入金繰越計算: 元入金(当期首) = 元入金(前期首) + 所得(前期) + 事業主借(前期末) - 事業主貸(前期末)
 */
export const motoireKinFormulaRule: Rule = {
  meta: {
    id: "balance-sheet/motoire-kin-formula",
    name: "元入金繰越計算",
    description:
      "元入金(当期) = 元入金(前期) + 青色申告特別控除前所得(前期) + 事業主借(前期末) - 事業主貸(前期末) であるべきです。前年データが必要です。",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (!ctx.priorYear) return [];

    const priorBs = ctx.priorYear.balanceSheet;
    const currentBs = ctx.taxReturn.balanceSheet;

    const expected = yen(
      priorBs.ownerEquity.opening +
        priorBs.retainedEarnings +
        priorBs.ownerContributions.closing -
        priorBs.ownerDrawings.closing,
    );

    const actual = currentBs.ownerEquity.opening;

    if (actual !== expected) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `元入金の期首残高(${formatYen(actual)}) ≠ 繰越計算額(${formatYen(expected)})`,
          details: `計算式: 元入金(前期首)(${formatYen(priorBs.ownerEquity.opening)}) + 所得(前期)(${formatYen(priorBs.retainedEarnings)}) + 事業主借(前期末)(${formatYen(priorBs.ownerContributions.closing)}) - 事業主貸(前期末)(${formatYen(priorBs.ownerDrawings.closing)})`,
          expected: `元入金の期首残高 = ${formatYen(expected)}`,
        },
      ];
    }

    return [];
  },
};
