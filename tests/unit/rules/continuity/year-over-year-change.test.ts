import { describe, expect, it } from "vitest";
import { yearOverYearChangeRule } from "../../../../src/rules/continuity/year-over-year-change.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("continuity/year-over-year-change", () => {
  it("skips when no prior year data", () => {
    const tr = buildTaxReturn();
    const result = yearOverYearChangeRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("passes for normal year-over-year changes", () => {
    const priorYear = buildTaxReturn({
      incomeStatement: { revenue: yen(1000000), totalExpenses: yen(500000), operatingIncome: yen(500000) },
    });
    const current = buildTaxReturn({
      incomeStatement: { revenue: yen(1200000), totalExpenses: yen(600000), operatingIncome: yen(600000) },
    });
    const result = yearOverYearChangeRule.check({ taxReturn: current, priorYear, config });
    expect(result).toEqual([]);
  });

  it("warns when revenue increases more than 300%", () => {
    const priorYear = buildTaxReturn({
      incomeStatement: { revenue: yen(1000000), totalExpenses: yen(500000), operatingIncome: yen(500000) },
    });
    const current = buildTaxReturn({
      incomeStatement: { revenue: yen(5000000), totalExpenses: yen(500000), operatingIncome: yen(500000) },
    });
    const result = yearOverYearChangeRule.check({ taxReturn: current, priorYear, config });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((d) => d.message.includes("売上"))).toBe(true);
  });

  it("warns when revenue drops below 20%", () => {
    const priorYear = buildTaxReturn({
      incomeStatement: { revenue: yen(1000000), totalExpenses: yen(500000), operatingIncome: yen(500000) },
    });
    const current = buildTaxReturn({
      incomeStatement: { revenue: yen(100000), totalExpenses: yen(500000), operatingIncome: yen(500000) },
    });
    const result = yearOverYearChangeRule.check({ taxReturn: current, priorYear, config });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((d) => d.message.includes("売上"))).toBe(true);
  });

  it("skips zero prior-year values", () => {
    const priorYear = buildTaxReturn({
      incomeStatement: { revenue: yen(0), totalExpenses: yen(0), operatingIncome: yen(0) },
    });
    const current = buildTaxReturn({
      incomeStatement: { revenue: yen(1000000), totalExpenses: yen(500000), operatingIncome: yen(500000) },
    });
    const result = yearOverYearChangeRule.check({ taxReturn: current, priorYear, config });
    expect(result).toEqual([]);
  });
});
