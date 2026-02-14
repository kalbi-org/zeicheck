import { describe, expect, it } from "vitest";
import { blueDeductionCapRule } from "../../../../src/rules/deductions/blue-deduction-cap.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("deductions/blue-deduction-cap", () => {
  it("passes when deduction is less than income", () => {
    const tr = buildTaxReturn({
      incomeStatement: { operatingIncome: yen(1000000) },
      taxFormA: { blueReturnDeduction: yen(650000) },
    });
    const result = blueDeductionCapRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("passes when deduction equals income", () => {
    const tr = buildTaxReturn({
      incomeStatement: { operatingIncome: yen(650000) },
      taxFormA: { blueReturnDeduction: yen(650000) },
    });
    const result = blueDeductionCapRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("warns when deduction exceeds income", () => {
    const tr = buildTaxReturn({
      incomeStatement: { operatingIncome: yen(500000) },
      taxFormA: { blueReturnDeduction: yen(650000) },
    });
    const result = blueDeductionCapRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("warning");
    expect(result[0]!.message).toContain("650,000");
    expect(result[0]!.message).toContain("500,000");
  });
});
