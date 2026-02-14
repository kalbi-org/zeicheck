import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import type { Yen } from "../../models/types.js";
import { formatYen } from "../../utils/monetary.js";

const FIELDS_TO_CHECK: { key: string; label: string }[] = [
  { key: "revenue", label: "売上" },
  { key: "totalExpenses", label: "経費合計" },
  { key: "operatingIncome", label: "所得金額" },
];

/**
 * continuity/year-over-year-change
 * 前年比で大幅な変動がある場合に警告
 */
export const yearOverYearChangeRule: Rule = {
  meta: {
    id: "continuity/year-over-year-change",
    name: "前年比変動チェック",
    description:
      "売上・経費・所得が前年比で200%超の増加または80%超の減少がある場合に警告します。前年データが必要です。",
    severity: "warning",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (!ctx.priorYear) return [];

    const diagnostics: RuleDiagnostic[] = [];
    const currentPl = ctx.taxReturn.incomeStatement;
    const priorPl = ctx.priorYear.incomeStatement;

    for (const { key, label } of FIELDS_TO_CHECK) {
      const current = currentPl[key as keyof typeof currentPl] as Yen;
      const prior = priorPl[key as keyof typeof priorPl] as Yen;

      if (prior === 0) continue;

      const ratio = current / prior;

      if (ratio > 3.0) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `${label}が前年比${Math.round(ratio * 100)}%です（${formatYen(prior)} → ${formatYen(current)}）`,
          details: "200%を超える大幅な増加があります。記帳内容をご確認ください。",
        });
      } else if (ratio < 0.2) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `${label}が前年比${Math.round(ratio * 100)}%です（${formatYen(prior)} → ${formatYen(current)}）`,
          details: "80%を超える大幅な減少があります。記帳内容をご確認ください。",
        });
      }
    }

    return diagnostics;
  },
};
