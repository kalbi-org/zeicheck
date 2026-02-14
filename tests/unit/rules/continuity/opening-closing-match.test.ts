import { describe, expect, it } from "vitest";
import { openingClosingMatchRule } from "../../../../src/rules/continuity/opening-closing-match.js";
import { buildTaxReturn } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

describe("continuity/opening-closing-match", () => {
  it("skips when no prior year data", () => {
    const tr = buildTaxReturn();
    const result = openingClosingMatchRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("passes when opening matches prior closing", () => {
    const priorYear = buildTaxReturn({
      balanceSheet: {
        cash: { opening: yen(100000), closing: yen(300000) },
        deposits: { opening: yen(500000), closing: yen(1200000) },
      },
    });
    const current = buildTaxReturn({
      balanceSheet: {
        cash: { opening: yen(300000), closing: yen(500000) },
        deposits: { opening: yen(1200000), closing: yen(2000000) },
      },
    });

    const result = openingClosingMatchRule.check({ taxReturn: current, priorYear, config });
    expect(result).toEqual([]);
  });

  it("errors when opening does not match prior closing", () => {
    const priorYear = buildTaxReturn({
      balanceSheet: {
        cash: { opening: yen(100000), closing: yen(300000) },
      },
    });
    const current = buildTaxReturn({
      balanceSheet: {
        cash: { opening: yen(250000), closing: yen(500000) },
      },
    });

    const result = openingClosingMatchRule.check({ taxReturn: current, priorYear, config });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((d) => d.message.includes("現金"))).toBe(true);
  });
});
