import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

const CAPITAL_LIMIT = yen(10_000_000);

/**
 * corporate/capital-under-10m
 * 資本金が1000万円以下であることを確認（マイクロ法人前提）
 */
export const capitalUnder10mRule: Rule = {
  meta: {
    id: "corporate/capital-under-10m",
    name: "資本金1000万以下チェック",
    description:
      "マイクロ法人として資本金が1,000万円以下であることを確認する。消費税の免税事業者要件にも関連します。",
    severity: "warning",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const capital = ctx.taxReturn.corporateInfo.capitalAmount;

    if (capital > CAPITAL_LIMIT) {
      return [
        {
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `資本金(${formatYen(capital)})が1,000万円を超えています`,
          details:
            "資本金1,000万円超の場合、設立初年度から消費税の課税事業者となります。マイクロ法人では通常1,000万円以下に設定します。",
          expected: `資本金 ≤ ${formatYen(CAPITAL_LIMIT)}`,
        },
      ];
    }

    return [];
  },
};
