import { describe, expect, it } from "vitest";
import { nonNegativeCashRule } from "../../../../src/rules/balance-sheet/non-negative-cash.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("balance-sheet/non-negative-cash", () => {
  it("passes when cash is non-negative", () => {
    const tr = buildTaxReturn({
      balanceSheet: { cash: { opening: yen(100000), closing: yen(200000) } },
    });
    const result = nonNegativeCashRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("warns on negative opening cash", () => {
    const tr = buildTaxReturn({
      balanceSheet: { cash: { opening: yen(-50000), closing: yen(200000) } },
    });
    const result = nonNegativeCashRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("期首");
  });

  it("warns on negative closing cash", () => {
    const tr = buildTaxReturn({
      balanceSheet: { cash: { opening: yen(100000), closing: yen(-10000) } },
    });
    const result = nonNegativeCashRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("期末");
  });

  it("warns on both negative", () => {
    const tr = buildTaxReturn({
      balanceSheet: { cash: { opening: yen(-1), closing: yen(-1) } },
    });
    const result = nonNegativeCashRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(2);
  });

  it("passes when cash is zero", () => {
    const tr = buildTaxReturn({
      balanceSheet: { cash: { opening: yen(0), closing: yen(0) } },
    });
    const result = nonNegativeCashRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });
});
