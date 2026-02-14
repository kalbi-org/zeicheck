/**
 * 源泉徴収税額整合性チェックルール
 * 所得の内訳（第二表）に記載された源泉徴収税額の合計が0でないことを確認する。
 * 給与所得者は通常、源泉徴収税額が存在するはず。
 */

import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";

export const withholdingTotalRule: Rule = {
  meta: {
    id: "individual/withholding-total",
    name: "源泉徴収税額チェック",
    description:
      "所得の内訳に記載された源泉徴収税額の整合性を確認します。給与所得者は通常、源泉徴収税額が記載されます。",
    severity: "warning",
    applicableTo: ["individual"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "individual") return [];

    const details = ctx.taxReturn.taxFormB.incomeDetails;
    const diagnostics: RuleDiagnostic[] = [];

    if (details.length === 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message:
          "所得の内訳が未記載です。給与所得者の場合は源泉徴収票の情報を記載してください。",
      });
      return diagnostics;
    }

    const totalWithheld = details.reduce(
      (sum, d) => (sum + d.withheld) as Yen,
      0 as Yen,
    );

    if (totalWithheld === 0) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message:
          "源泉徴収税額の合計が0円です。給与所得者の場合は源泉徴収税額が通常存在します。",
        expected: `源泉徴収税額合計 > ${formatYen(0 as Yen)}`,
      });
    }

    return diagnostics;
  },
};
