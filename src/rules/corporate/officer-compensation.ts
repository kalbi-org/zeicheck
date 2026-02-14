import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/officer-compensation
 * 役員報酬の妥当性チェック
 */
export const officerCompensationRule: Rule = {
  meta: {
    id: "corporate/officer-compensation",
    name: "役員報酬妥当性チェック",
    description:
      "役員報酬（給料賃金）が売上に対して妥当な範囲内かチェックする。一人法人では給料賃金 = 役員報酬として検証する。",
    severity: "warning",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const diagnostics: RuleDiagnostic[] = [];
    const pl = ctx.taxReturn.incomeStatement;
    const salaries = pl.expenses.salaries;

    // 役員報酬が0の場合はスキップ
    if (salaries === 0) return [];

    // 役員報酬が売上を超えている場合
    if (salaries > pl.revenue && pl.revenue > 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `役員報酬(${formatYen(salaries)})が売上高(${formatYen(pl.revenue)})を超えています`,
        details:
          "役員報酬が売上を超える状態が継続すると債務超過のリスクがあります。",
      });
    }

    // 役員報酬が経常利益を大幅に超えて赤字になっている場合
    if (pl.ordinaryIncome < 0 && salaries > 0) {
      const incomeBeforeSalary = yen(pl.ordinaryIncome + salaries);
      if (incomeBeforeSalary > 0) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `役員報酬控除前は黒字(${formatYen(incomeBeforeSalary)})ですが、役員報酬(${formatYen(salaries)})により経常赤字(${formatYen(pl.ordinaryIncome)})となっています`,
          details:
            "役員報酬の金額が適正か見直しを検討してください。定期同額給与の要件にもご注意ください。",
        });
      }
    }

    return diagnostics;
  },
};
