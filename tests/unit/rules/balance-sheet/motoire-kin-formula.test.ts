import { describe, expect, it } from "vitest";
import { motoireKinFormulaRule } from "../../../../src/rules/balance-sheet/motoire-kin-formula.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("balance-sheet/motoire-kin-formula", () => {
  it("skips when no prior year data", () => {
    const tr = buildTaxReturn();
    const result = motoireKinFormulaRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("passes when motoire-kin is correctly carried over", () => {
    // Prior: equity opening 1,000,000 + income 500,000 + contributions 200,000 - drawings 300,000 = 1,400,000
    const priorYear = buildTaxReturn({
      balanceSheet: {
        ownerEquity: { opening: yen(1000000), closing: yen(1000000) },
        retainedEarnings: yen(500000),
        ownerContributions: { opening: yen(0), closing: yen(200000) },
        ownerDrawings: { opening: yen(0), closing: yen(300000) },
      },
    });
    const current = buildTaxReturn({
      balanceSheet: {
        ownerEquity: { opening: yen(1400000), closing: yen(1400000) },
      },
    });

    const result = motoireKinFormulaRule.check({ taxReturn: current, priorYear, config });
    expect(result).toEqual([]);
  });

  it("errors when motoire-kin does not match calculation", () => {
    const priorYear = buildTaxReturn({
      balanceSheet: {
        ownerEquity: { opening: yen(1000000), closing: yen(1000000) },
        retainedEarnings: yen(500000),
        ownerContributions: { opening: yen(0), closing: yen(200000) },
        ownerDrawings: { opening: yen(0), closing: yen(300000) },
      },
    });
    const current = buildTaxReturn({
      balanceSheet: {
        ownerEquity: { opening: yen(1000000), closing: yen(1000000) },
      },
    });

    const result = motoireKinFormulaRule.check({ taxReturn: current, priorYear, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("元入金");
    expect(result[0]!.message).toContain("1,400,000");
  });
});
