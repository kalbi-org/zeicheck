import { describe, expect, it } from "vitest";
import { depreciationSumRule } from "../../../../src/rules/cross-statement/depreciation-sum.js";
import { buildTaxReturn, buildDepreciationSchedule, buildIncomeStatement } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("cross-statement/depreciation-sum", () => {
  it("passes when both are zero (no depreciation)", () => {
    const tr = buildTaxReturn();
    const result = depreciationSumRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("passes when depreciation schedule matches P/L", () => {
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({
        totalBusinessDepreciation: yen(120000),
      }),
      incomeStatement: buildIncomeStatement({
        expenses: { depreciation: yen(120000) },
      }),
    });
    const result = depreciationSumRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("errors when depreciation schedule does not match P/L", () => {
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({
        totalBusinessDepreciation: yen(120000),
      }),
      incomeStatement: buildIncomeStatement({
        expenses: { depreciation: yen(100000) },
      }),
    });
    const result = depreciationSumRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("120,000");
    expect(result[0]!.message).toContain("100,000");
  });
});
