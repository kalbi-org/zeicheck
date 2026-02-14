import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/entertainment-limit
 * 交際費の損金算入限度額チェック（中小法人：年800万円）
 */
export const entertainmentLimitRule: Rule = {
  meta: {
    id: "corporate/entertainment-limit",
    name: "交際費損金算入限度",
    description:
      "中小法人の交際費の損金算入限度額（年800万円）を超えていないかチェックする。事業年度が12ヶ月未満の場合は月割計算する。",
    severity: "warning",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const entertainment = ctx.taxReturn.incomeStatement.expenses.entertainment;

    if (entertainment === 0) return [];

    const months = ctx.taxReturn.corporateInfo.fiscalYearMonths;
    const annualLimit = yen(8_000_000);
    const limit = yen(Math.trunc((annualLimit * months) / 12)) as Yen;

    if (entertainment > limit) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `交際費(${formatYen(entertainment)})が損金算入限度額(${formatYen(limit)})を超えています`,
          details:
            months < 12
              ? `事業年度${months}ヶ月のため、限度額は800万円×${months}/12で計算しています。超過分は損金不算入となります。`
              : "中小法人の交際費の損金算入限度額は年800万円です。超過分は損金不算入となります。",
          expected: `交際費 ≤ ${formatYen(limit)}`,
        },
      ];
    }

    return [];
  },
};
