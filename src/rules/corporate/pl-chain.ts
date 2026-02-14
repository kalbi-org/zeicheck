import { formatYen } from "../../utils/monetary.js";
import type { Yen } from "../../models/types.js";
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/**
 * corporate/pl-chain
 * 法人P/L: 営業利益→経常利益→税引前当期純利益→当期純利益
 */
export const corporatePlChainRule: Rule = {
  meta: {
    id: "corporate/pl-chain",
    name: "法人P/L計算連鎖",
    description:
      "営業利益 + 営業外収益 - 営業外費用 = 経常利益、経常利益 + 特別利益 - 特別損失 = 税引前当期純利益、税引前当期純利益 - 法人税等 = 当期純利益 を検証する",
    severity: "error",
    applicableTo: ["corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType !== "corporate") return [];
    const pl = ctx.taxReturn.incomeStatement;
    const diagnostics: RuleDiagnostic[] = [];

    // grossProfit = revenue - cogs
    const expectedGross = (pl.revenue - pl.cogs.total) as Yen;
    if (pl.grossProfit !== expectedGross) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `売上総利益(${formatYen(pl.grossProfit)}) ≠ 売上高(${formatYen(pl.revenue)}) - 売上原価(${formatYen(pl.cogs.total)})`,
        expected: `売上総利益 = ${formatYen(expectedGross)}`,
      });
    }

    // operatingIncome = grossProfit - totalExpenses
    const expectedOperating = (pl.grossProfit - pl.totalExpenses) as Yen;
    if (pl.operatingIncome !== expectedOperating) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `営業利益(${formatYen(pl.operatingIncome)}) ≠ 売上総利益(${formatYen(pl.grossProfit)}) - 販管費(${formatYen(pl.totalExpenses)})`,
        expected: `営業利益 = ${formatYen(expectedOperating)}`,
      });
    }

    // ordinaryIncome = operatingIncome + nonOperatingIncome - nonOperatingExpenses
    const expectedOrdinary = (pl.operatingIncome + pl.nonOperatingIncome - pl.nonOperatingExpenses) as Yen;
    if (pl.ordinaryIncome !== expectedOrdinary) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `経常利益(${formatYen(pl.ordinaryIncome)}) ≠ 営業利益(${formatYen(pl.operatingIncome)}) + 営業外収益(${formatYen(pl.nonOperatingIncome)}) - 営業外費用(${formatYen(pl.nonOperatingExpenses)})`,
        expected: `経常利益 = ${formatYen(expectedOrdinary)}`,
      });
    }

    // preTaxIncome = ordinaryIncome + extraordinaryGain - extraordinaryLoss
    const expectedPreTax = (pl.ordinaryIncome + pl.extraordinaryGain - pl.extraordinaryLoss) as Yen;
    if (pl.preTaxIncome !== expectedPreTax) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `税引前当期純利益(${formatYen(pl.preTaxIncome)}) ≠ 経常利益(${formatYen(pl.ordinaryIncome)}) + 特別利益(${formatYen(pl.extraordinaryGain)}) - 特別損失(${formatYen(pl.extraordinaryLoss)})`,
        expected: `税引前当期純利益 = ${formatYen(expectedPreTax)}`,
      });
    }

    // netIncome = preTaxIncome - corporateTax
    const expectedNet = (pl.preTaxIncome - pl.corporateTax) as Yen;
    if (pl.netIncome !== expectedNet) {
      diagnostics.push({
        ruleId: this.meta.id,
        severity: this.meta.severity,
        message: `当期純利益(${formatYen(pl.netIncome)}) ≠ 税引前当期純利益(${formatYen(pl.preTaxIncome)}) - 法人税等(${formatYen(pl.corporateTax)})`,
        expected: `当期純利益 = ${formatYen(expectedNet)}`,
      });
    }

    return diagnostics;
  },
};
