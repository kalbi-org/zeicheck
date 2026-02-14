import { describe, it, expect } from "vitest";
import { bsEquationRule } from "../../../../src/rules/balance-sheet/bs-equation.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import type { ResolvedConfig, RuleContext } from "../../../../src/rules/types.js";

const defaultConfig: ResolvedConfig = {
  rules: {},
  format: "stylish",
  warningsAsErrors: false,
};

describe("balance-sheet/equation", () => {
  it("passes when assets = liabilities + equity", () => {
    const taxReturn = buildTaxReturn();
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = bsEquationRule.check(ctx);
    expect(diagnostics).toHaveLength(0);
  });

  it("reports closing balance mismatch", () => {
    const taxReturn = buildTaxReturn({
      balanceSheet: {
        assetsTotal: { closing: 2500000 },
        liabilitiesTotal: { closing: 0 },
        equityTotal: { closing: 2300000 },
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = bsEquationRule.check(ctx);
    const closing = diagnostics.find((d) => d.message.includes("期末残高"));
    expect(closing).toBeDefined();
    expect(closing!.message).toContain("2,500,000");
    expect(closing!.message).toContain("2,300,000");
  });

  it("reports opening balance mismatch", () => {
    const taxReturn = buildTaxReturn({
      balanceSheet: {
        assetsTotal: { opening: 1500000 },
        liabilitiesTotal: { opening: 0 },
        equityTotal: { opening: 1200000 },
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = bsEquationRule.check(ctx);
    const opening = diagnostics.find((d) => d.message.includes("期首残高"));
    expect(opening).toBeDefined();
    expect(opening!.message).toContain("1,500,000");
    expect(opening!.message).toContain("1,200,000");
  });
});
