import { describe, expect, it } from "vitest";
import { openingOwnerEquityRule } from "../../../../src/rules/balance-sheet/opening-owner-equity.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("balance-sheet/opening-owner-equity", () => {
  it("passes when owner drawings and contributions are 0 at opening", () => {
    const tr = buildTaxReturn();
    const result = openingOwnerEquityRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("errors when owner drawings opening is non-zero", () => {
    const tr = buildTaxReturn({
      balanceSheet: { ownerDrawings: { opening: yen(500000), closing: yen(0) } },
    });
    const result = openingOwnerEquityRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("事業主貸");
  });

  it("errors when owner contributions opening is non-zero", () => {
    const tr = buildTaxReturn({
      balanceSheet: { ownerContributions: { opening: yen(300000), closing: yen(0) } },
    });
    const result = openingOwnerEquityRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("事業主借");
  });

  it("returns two errors when both are non-zero", () => {
    const tr = buildTaxReturn({
      balanceSheet: {
        ownerDrawings: { opening: yen(100000), closing: yen(0) },
        ownerContributions: { opening: yen(200000), closing: yen(0) },
      },
    });
    const result = openingOwnerEquityRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(2);
  });
});
