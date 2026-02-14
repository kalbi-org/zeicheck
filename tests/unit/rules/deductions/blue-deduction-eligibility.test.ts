import { describe, expect, it } from "vitest";
import { blueDeductionEligibilityRule } from "../../../../src/rules/deductions/blue-deduction-eligibility.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("deductions/blue-deduction-eligibility", () => {
  it("no diagnostic for 100,000 deduction", () => {
    const tr = buildTaxReturn({
      taxFormA: { blueReturnDeduction: yen(100000) },
    });
    const result = blueDeductionEligibilityRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("no diagnostic for 550,000 deduction", () => {
    const tr = buildTaxReturn({
      taxFormA: { blueReturnDeduction: yen(550000) },
    });
    const result = blueDeductionEligibilityRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("info for 650,000 deduction (may need e-Tax)", () => {
    const tr = buildTaxReturn({
      taxFormA: { blueReturnDeduction: yen(650000) },
    });
    const result = blueDeductionEligibilityRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("info");
    expect(result[0]!.message).toContain("e-Tax");
  });

  it("no diagnostic for exactly 550,001", () => {
    const tr = buildTaxReturn({
      taxFormA: { blueReturnDeduction: yen(550001) },
    });
    const result = blueDeductionEligibilityRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
  });
});
