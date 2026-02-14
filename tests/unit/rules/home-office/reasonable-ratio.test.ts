import { describe, expect, it } from "vitest";
import { reasonableRatioRule } from "../../../../src/rules/home-office/reasonable-ratio.js";
import { buildTaxReturn, buildDepreciationSchedule } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { DepreciationAsset } from "../../../../src/models/depreciation-schedule.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

function makeAsset(overrides: Partial<DepreciationAsset>): DepreciationAsset {
  return {
    name: "テスト資産",
    acquisitionDate: "2023-01",
    acquisitionCost: yen(1000000),
    usefulLife: 10,
    depreciationMethod: "定額法",
    depreciationRate: 0.1,
    depreciationAmount: yen(100000),
    accumulatedDepreciation: yen(100000),
    bookValue: yen(900000),
    businessUseRatio: 0.5,
    businessDepreciation: yen(50000),
    ...overrides,
  };
}

describe("home-office/reasonable-ratio", () => {
  it("passes when business use ratio is within default limit (90%)", () => {
    const asset = makeAsset({ name: "自宅兼事務所", businessUseRatio: 0.7 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = reasonableRatioRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("warns when business use ratio exceeds 90%", () => {
    const asset = makeAsset({ name: "自宅兼事務所", businessUseRatio: 0.95 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = reasonableRatioRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("95%");
  });

  it("uses custom maxRatio from config", () => {
    const customConfig: ResolvedConfig = {
      rules: { "home-office/reasonable-ratio": ["warning", { maxRatio: 0.5 }] },
      format: "stylish",
      warningsAsErrors: false,
    };
    const asset = makeAsset({ name: "車両", businessUseRatio: 0.6 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = reasonableRatioRule.check({ taxReturn: tr, config: customConfig });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("50%");
  });

  it("passes for 100% business-only asset under default", () => {
    // 100% > 90% - should warn even for dedicated business assets
    const asset = makeAsset({ name: "業務専用PC", businessUseRatio: 1.0 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = reasonableRatioRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
  });

  it("no diagnostics when no assets", () => {
    const tr = buildTaxReturn();
    const result = reasonableRatioRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });
});
