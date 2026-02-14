import { describe, it, expect } from "vitest";
import { expenseTotalRule } from "../../../../src/rules/income-statement/expense-total.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig, RuleContext } from "../../../../src/rules/types.js";

const defaultConfig: ResolvedConfig = {
  rules: {},
  format: "stylish",
  warningsAsErrors: false,
};

describe("income-statement/expense-total", () => {
  it("passes when totalExpenses matches sum of items", () => {
    // Default factory: rent=300000 + taxes=50000 + consumables=100000
    //   + utilities=60000 + travel=40000 + communication=50000 = 600000
    const taxReturn = buildTaxReturn();
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = expenseTotalRule.check(ctx);
    expect(diagnostics).toHaveLength(0);
  });

  it("reports when totalExpenses does not match", () => {
    const taxReturn = buildTaxReturn({
      incomeStatement: {
        totalExpenses: yen(500000), // actual sum is 600,000
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = expenseTotalRule.check(ctx);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]!.message).toContain("経費合計");
  });
});
