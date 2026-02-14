import { describe, expect, it } from "vitest";
import { decisionToReturnRule } from "../../../../src/rules/cross-statement/decision-to-return.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("cross-statement/decision-to-return", () => {
  it("passes when revenue and profit match correctly", () => {
    const tr = buildTaxReturn({
      incomeStatement: { revenue: yen(5000000), operatingIncome: yen(2000000) },
      taxFormA: {
        businessIncome: yen(5000000),
        businessProfit: yen(1350000), // 2,000,000 - 650,000 blue deduction
        blueReturnDeduction: yen(650000),
      },
    });
    const result = decisionToReturnRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("errors when revenue does not match", () => {
    const tr = buildTaxReturn({
      incomeStatement: { revenue: yen(5000000), operatingIncome: yen(2000000) },
      taxFormA: {
        businessIncome: yen(4000000),
        businessProfit: yen(1350000),
        blueReturnDeduction: yen(650000),
      },
    });
    const result = decisionToReturnRule.check({ taxReturn: tr, config });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((d) => d.message.includes("売上金額"))).toBe(true);
  });

  it("errors when profit calculation does not match", () => {
    const tr = buildTaxReturn({
      incomeStatement: { revenue: yen(5000000), operatingIncome: yen(2000000) },
      taxFormA: {
        businessIncome: yen(5000000),
        businessProfit: yen(2000000), // Wrong: should be 2,000,000 - 650,000
        blueReturnDeduction: yen(650000),
      },
    });
    const result = decisionToReturnRule.check({ taxReturn: tr, config });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((d) => d.message.includes("営業等所得"))).toBe(true);
  });
});
