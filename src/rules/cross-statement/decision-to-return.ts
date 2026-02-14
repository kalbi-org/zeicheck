import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";

/**
 * cross-statement/decision-to-return
 * 決算書の所得金額が申告書第一表に正しく転記されているかチェック
 */
export const decisionToReturnRule: Rule = {
  meta: {
    id: "cross-statement/decision-to-return",
    name: "決算書→申告書 転記一致",
    description:
      "青色申告決算書の売上金額・所得金額が申告書第一表に正しく転記されているか確認します。",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const diagnostics: RuleDiagnostic[] = [];
    const pl = ctx.taxReturn.incomeStatement;
    const form = ctx.taxReturn.taxFormA;

    // 売上（収入）金額の転記チェック
    if (pl.revenue !== form.businessIncome) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `決算書の売上金額(${formatYen(pl.revenue)}) ≠ 申告書の営業等収入(${formatYen(form.businessIncome)})`,
      });
    }

    // 所得金額の転記チェック（青色控除前）
    // 申告書の営業等所得 = 決算書の所得 - 青色申告特別控除
    const expectedProfit = yen(pl.operatingIncome - form.blueReturnDeduction);
    if (form.businessProfit !== expectedProfit) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `申告書の営業等所得(${formatYen(form.businessProfit)}) ≠ 決算書所得(${formatYen(pl.operatingIncome)}) - 青色控除(${formatYen(form.blueReturnDeduction)})`,
        details: `期待値: ${formatYen(expectedProfit)}`,
      });
    }

    return diagnostics;
  },
};
