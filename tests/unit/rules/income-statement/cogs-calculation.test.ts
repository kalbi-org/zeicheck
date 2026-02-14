import { describe, it, expect } from "vitest";
import { cogsCalculationRule } from "../../../../src/rules/income-statement/cogs-calculation.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig, RuleContext } from "../../../../src/rules/types.js";

const defaultConfig: ResolvedConfig = {
  rules: {},
  format: "stylish",
  warningsAsErrors: false,
};

describe("income-statement/cogs", () => {
  it("passes when COGS calculation is correct", () => {
    const taxReturn = buildTaxReturn({
      incomeStatement: {
        cogs: {
          openingInventory: yen(100000),
          purchases: yen(500000),
          closingInventory: yen(150000),
          total: yen(450000),
        },
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = cogsCalculationRule.check(ctx);
    expect(diagnostics).toHaveLength(0);
  });

  it("reports when COGS total is wrong", () => {
    const taxReturn = buildTaxReturn({
      incomeStatement: {
        cogs: {
          openingInventory: yen(100000),
          purchases: yen(500000),
          closingInventory: yen(150000),
          total: yen(400000), // should be 450,000
        },
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = cogsCalculationRule.check(ctx);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]!.message).toContain("売上原価合計");
  });

  it("skips when all COGS values are zero", () => {
    const taxReturn = buildTaxReturn(); // defaults have all-zero COGS
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = cogsCalculationRule.check(ctx);
    expect(diagnostics).toHaveLength(0);
  });
});
