import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import type { AccountBalance } from "../../models/types.js";
import { formatYen } from "../../utils/monetary.js";

const ACCOUNT_NAMES: Record<string, string> = {
  cash: "現金",
  deposits: "預金",
  accountsReceivable: "売掛金",
  inventory: "棚卸資産",
  buildings: "建物",
  vehicles: "車両運搬具",
  tools: "工具器具備品",
  land: "土地",
  accountsPayable: "買掛金",
  borrowings: "借入金",
  ownerEquity: "元入金",
};

/**
 * continuity/opening-closing-match
 * 当期の期首残高が前期の期末残高と一致するかチェック
 */
export const openingClosingMatchRule: Rule = {
  meta: {
    id: "continuity/opening-closing-match",
    name: "期首=前期末 一致チェック",
    description:
      "当期の期首残高が前期の期末残高と一致するか確認します。前年データが必要です。",
    severity: "error",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (!ctx.priorYear) return [];

    const diagnostics: RuleDiagnostic[] = [];
    const currentBs = ctx.taxReturn.balanceSheet;
    const priorBs = ctx.priorYear.balanceSheet;

    for (const [key, label] of Object.entries(ACCOUNT_NAMES)) {
      const current = currentBs[key as keyof typeof currentBs] as AccountBalance | undefined;
      const prior = priorBs[key as keyof typeof priorBs] as AccountBalance | undefined;

      if (
        current &&
        prior &&
        typeof current === "object" &&
        "opening" in current &&
        "closing" in prior &&
        current.opening !== prior.closing
      ) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `${label}: 当期首(${formatYen(current.opening)}) ≠ 前期末(${formatYen(prior.closing)})`,
        });
      }
    }

    return diagnostics;
  },
};
