import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import type { AccountBalance } from "../../models/types.js";
import { formatYen } from "../../utils/monetary.js";

const COMMON_ACCOUNT_NAMES: Record<string, string> = {
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
    applicableTo: ["sole-proprietor", "corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (!ctx.priorYear) return [];
    if (ctx.taxReturn.returnType === "individual") return [];
    if (ctx.priorYear.returnType === "individual") return [];

    const diagnostics: RuleDiagnostic[] = [];
    const currentBs = ctx.taxReturn.balanceSheet;
    const priorBs = ctx.priorYear.balanceSheet;

    // Common accounts (both sole-proprietor and corporate)
    for (const [key, label] of Object.entries(COMMON_ACCOUNT_NAMES)) {
      const current = currentBs[key as keyof typeof currentBs] as
        | AccountBalance
        | undefined;
      const prior = priorBs[key as keyof typeof priorBs] as
        | AccountBalance
        | undefined;

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
          expected: `${label}の期首残高 = ${formatYen(prior.closing)}`,
        });
      }
    }

    // Sole-proprietor-specific: 元入金
    if (
      ctx.taxReturn.returnType === "sole-proprietor" &&
      ctx.priorYear.returnType === "sole-proprietor"
    ) {
      const curBs = ctx.taxReturn.balanceSheet;
      const priBs = ctx.priorYear.balanceSheet;
      if (curBs.ownerEquity.opening !== priBs.ownerEquity.closing) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `元入金: 当期首(${formatYen(curBs.ownerEquity.opening)}) ≠ 前期末(${formatYen(priBs.ownerEquity.closing)})`,
          expected: `元入金の期首残高 = ${formatYen(priBs.ownerEquity.closing)}`,
        });
      }
    }

    // Corporate-specific: 資本金, 資本剰余金, 利益剰余金
    if (
      ctx.taxReturn.returnType === "corporate" &&
      ctx.priorYear.returnType === "corporate"
    ) {
      const curBs = ctx.taxReturn.balanceSheet;
      const priBs = ctx.priorYear.balanceSheet;
      const corpAccounts: [AccountBalance, AccountBalance, string][] = [
        [curBs.capitalStock, priBs.capitalStock, "資本金"],
        [curBs.capitalSurplus, priBs.capitalSurplus, "資本剰余金"],
        [curBs.retainedEarnings, priBs.retainedEarnings, "利益剰余金"],
      ];
      for (const [current, prior, label] of corpAccounts) {
        if (current.opening !== prior.closing) {
          diagnostics.push({
            ruleId: this.meta.id,
            severity: this.meta.severity,
            message: `${label}: 当期首(${formatYen(current.opening)}) ≠ 前期末(${formatYen(prior.closing)})`,
            expected: `${label}の期首残高 = ${formatYen(prior.closing)}`,
          });
        }
      }
    }

    return diagnostics;
  },
};
