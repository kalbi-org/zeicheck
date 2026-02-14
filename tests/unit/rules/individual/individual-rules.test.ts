import { describe, it, expect } from "vitest";
import { buildIndividualReturn } from "../../../helpers/factories.js";
import { basicDeductionRule } from "../../../../src/rules/individual/basic-deduction.js";
import { deductionTotalRule } from "../../../../src/rules/individual/deduction-total.js";
import { taxableIncomeRule } from "../../../../src/rules/individual/taxable-income.js";
import { withholdingTotalRule } from "../../../../src/rules/individual/withholding-total.js";
import type { RuleContext } from "../../../../src/rules/types.js";
import { yen } from "../../../../src/models/types.js";

function makeCtx(
  overrides?: Parameters<typeof buildIndividualReturn>[0],
): RuleContext {
  return {
    taxReturn: buildIndividualReturn(overrides),
    config: { rules: {}, format: "stylish", warningsAsErrors: false },
  };
}

// ---------------------------------------------------------------------------
// individual/basic-deduction
// ---------------------------------------------------------------------------
describe("individual/basic-deduction", () => {
  it("passes when basic deduction is 480,000", () => {
    const ctx = makeCtx({ taxFormB: { basicDeduction: yen(480000) } });
    expect(basicDeductionRule.check(ctx)).toEqual([]);
  });

  it("passes when basic deduction is 0 (no deduction case)", () => {
    const ctx = makeCtx({ taxFormB: { basicDeduction: yen(0) } });
    expect(basicDeductionRule.check(ctx)).toEqual([]);
  });

  it("reports when basic deduction differs from standard", () => {
    const ctx = makeCtx({ taxFormB: { basicDeduction: yen(320000) } });
    const diags = basicDeductionRule.check(ctx);
    expect(diags).toHaveLength(1);
    expect(diags[0]!.ruleId).toBe("individual/basic-deduction");
  });
});

// ---------------------------------------------------------------------------
// individual/deduction-total
// ---------------------------------------------------------------------------
describe("individual/deduction-total", () => {
  it("passes when totalDeductions matches sum of items", () => {
    // social(200000) + smallBiz(0) + life(40000) + earthquake(0)
    // + spouse(0) + dependent(0) + basic(480000) = 720000
    const ctx = makeCtx({
      taxFormA: { totalDeductions: yen(720000) },
    });
    expect(deductionTotalRule.check(ctx)).toEqual([]);
  });

  it("reports when totalDeductions does not match", () => {
    const ctx = makeCtx({
      taxFormA: { totalDeductions: yen(500000) },
    });
    const diags = deductionTotalRule.check(ctx);
    expect(diags).toHaveLength(1);
    expect(diags[0]!.ruleId).toBe("individual/deduction-total");
  });
});

// ---------------------------------------------------------------------------
// individual/taxable-income
// ---------------------------------------------------------------------------
describe("individual/taxable-income", () => {
  it("passes when taxableIncome = totalIncome - totalDeductions", () => {
    const ctx = makeCtx({
      taxFormA: {
        totalIncome: yen(5000000),
        totalDeductions: yen(1500000),
        taxableIncome: yen(3500000),
      },
    });
    expect(taxableIncomeRule.check(ctx)).toEqual([]);
  });

  it("floors taxableIncome to 0 when deductions exceed income", () => {
    const ctx = makeCtx({
      taxFormA: {
        totalIncome: yen(300000),
        totalDeductions: yen(480000),
        taxableIncome: yen(0),
      },
    });
    expect(taxableIncomeRule.check(ctx)).toEqual([]);
  });

  it("reports when taxableIncome does not match calculation", () => {
    const ctx = makeCtx({
      taxFormA: {
        totalIncome: yen(5000000),
        totalDeductions: yen(1500000),
        taxableIncome: yen(4000000),
      },
    });
    const diags = taxableIncomeRule.check(ctx);
    expect(diags).toHaveLength(1);
    expect(diags[0]!.ruleId).toBe("individual/taxable-income");
  });
});

// ---------------------------------------------------------------------------
// individual/withholding-total
// ---------------------------------------------------------------------------
describe("individual/withholding-total", () => {
  it("passes when income details have withholdings", () => {
    const ctx = makeCtx({
      taxFormB: {
        incomeDetails: [
          {
            type: "給与",
            payer: "株式会社テスト",
            amount: yen(5000000),
            withheld: yen(150000),
          },
        ],
      },
    });
    expect(withholdingTotalRule.check(ctx)).toEqual([]);
  });

  it("warns when income details are empty", () => {
    const ctx = makeCtx({
      taxFormB: { incomeDetails: [] },
    });
    const diags = withholdingTotalRule.check(ctx);
    expect(diags).toHaveLength(1);
    expect(diags[0]!.message).toContain("未記載");
  });

  it("warns when total withholding is zero", () => {
    const ctx = makeCtx({
      taxFormB: {
        incomeDetails: [
          {
            type: "給与",
            payer: "テスト",
            amount: yen(3000000),
            withheld: yen(0),
          },
        ],
      },
    });
    const diags = withholdingTotalRule.check(ctx);
    expect(diags).toHaveLength(1);
    expect(diags[0]!.ruleId).toBe("individual/withholding-total");
  });
});
