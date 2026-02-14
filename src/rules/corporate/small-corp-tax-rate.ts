import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

const REDUCED_RATE_LIMIT = yen(8_000_000);

/**
 * corporate/small-corp-tax-rate
 * 中小法人の軽減税率適用チェック
 */
export const smallCorpTaxRateRule: Rule = {
  meta: {
    id: "corporate/small-corp-tax-rate",
    name: "軽減税率適用チェック",
    description:
      "中小法人の所得800万円以下の部分に軽減税率(15%)が適用可能か確認する。資本金1億円以下の法人が対象。",
    severity: "info",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const info = ctx.taxReturn.corporateInfo;
    const taxableIncome = ctx.taxReturn.incomeAdjustment.taxableIncome;

    if (!info.isSmallCorp) return [];
    if (taxableIncome <= 0) return [];

    if (taxableIncome > REDUCED_RATE_LIMIT) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `所得金額(${formatYen(taxableIncome)})が800万円を超えています。800万円以下の部分に軽減税率15%、超過分に23.2%が適用されます。`,
          details: `軽減税率適用分: ${formatYen(REDUCED_RATE_LIMIT)}、通常税率適用分: ${formatYen(yen(taxableIncome - REDUCED_RATE_LIMIT))}`,
        },
      ];
    }

    return [];
  },
};
