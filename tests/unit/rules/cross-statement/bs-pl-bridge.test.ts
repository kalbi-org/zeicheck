import { describe, it, expect } from "vitest";
import { bsPlBridgeRule } from "../../../../src/rules/cross-statement/bs-pl-bridge.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig, RuleContext } from "../../../../src/rules/types.js";

const defaultConfig: ResolvedConfig = {
  rules: {},
  format: "stylish",
  warningsAsErrors: false,
};

describe("cross-statement/bs-pl-bridge", () => {
  it("passes when retainedEarnings matches operatingIncome", () => {
    // Defaults: both are 1,000,000
    const taxReturn = buildTaxReturn();
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = bsPlBridgeRule.check(ctx);
    expect(diagnostics).toHaveLength(0);
  });

  it("reports when retainedEarnings does not match operatingIncome", () => {
    const taxReturn = buildTaxReturn({
      balanceSheet: {
        retainedEarnings: yen(800000),
      },
      incomeStatement: {
        operatingIncome: yen(1000000),
      },
    });
    const ctx: RuleContext = { taxReturn, config: defaultConfig };
    const diagnostics = bsPlBridgeRule.check(ctx);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]!.message).toContain("所得金額");
  });
});
