import { describe, it, expect } from "vitest";
import { plArithmeticChainRule } from "../../../../src/rules/income-statement/pl-arithmetic-chain.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig, RuleContext } from "../../../../src/rules/types.js";

const defaultConfig: ResolvedConfig = {
  rules: {},
  format: "stylish",
  warningsAsErrors: false,
};

describe("income-statement/pl-chain", () => {
  it("passes when the arithmetic chain is correct", () => {
    const taxReturn = buildTaxReturn();
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = plArithmeticChainRule.check(ctx);
    expect(diagnostics).toHaveLength(0);
  });

  it("reports grossProfit mismatch", () => {
    const taxReturn = buildTaxReturn({
      incomeStatement: {
        revenue: yen(2000000),
        cogs: { total: yen(500000) },
        grossProfit: yen(1600000), // should be 1,500,000
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = plArithmeticChainRule.check(ctx);
    const gross = diagnostics.find((d) => d.message.includes("売上総利益"));
    expect(gross).toBeDefined();
  });

  it("reports operatingIncome mismatch", () => {
    const taxReturn = buildTaxReturn({
      incomeStatement: {
        grossProfit: yen(1600000),
        totalExpenses: yen(600000),
        operatingIncome: yen(900000), // should be 1,000,000
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = plArithmeticChainRule.check(ctx);
    const operating = diagnostics.find((d) => d.message.includes("所得金額"));
    expect(operating).toBeDefined();
  });
});
