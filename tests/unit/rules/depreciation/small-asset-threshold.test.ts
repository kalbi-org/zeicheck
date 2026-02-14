import { describe, expect, it } from "vitest";
import { smallAssetThresholdRule } from "../../../../src/rules/depreciation/small-asset-threshold.js";
import { buildTaxReturn, buildDepreciationSchedule } from "../../../helpers/factories.js";
import { yen } from "../../../../src/models/types.js";
import type { DepreciationAsset } from "../../../../src/models/depreciation-schedule.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";

const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

function makeAsset(overrides: Partial<DepreciationAsset>): DepreciationAsset {
  return {
    name: "テスト資産",
    acquisitionDate: "2023-01",
    acquisitionCost: yen(200000),
    usefulLife: 4,
    depreciationMethod: "定額法",
    depreciationRate: 0.25,
    depreciationAmount: yen(50000),
    accumulatedDepreciation: yen(50000),
    bookValue: yen(150000),
    businessUseRatio: 1.0,
    businessDepreciation: yen(50000),
    ...overrides,
  };
}

describe("depreciation/small-asset-threshold", () => {
  it("warns when asset ≤ 100,000 has multi-year depreciation", () => {
    const asset = makeAsset({ acquisitionCost: yen(80000), usefulLife: 4 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = smallAssetThresholdRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("10万円以下");
  });

  it("does not warn when ≤ 100,000 and usefulLife = 1", () => {
    const asset = makeAsset({ acquisitionCost: yen(80000), usefulLife: 1 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = smallAssetThresholdRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("warns for 100,001-300,000 asset not using 一括償却", () => {
    const asset = makeAsset({
      acquisitionCost: yen(250000),
      depreciationMethod: "定額法",
    });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = smallAssetThresholdRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("30万円以下");
  });

  it("does not warn for 100,001-300,000 using 一括償却", () => {
    const asset = makeAsset({
      acquisitionCost: yen(250000),
      depreciationMethod: "一括償却",
    });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = smallAssetThresholdRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("does not warn for assets > 300,000", () => {
    const asset = makeAsset({ acquisitionCost: yen(500000) });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = smallAssetThresholdRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });
});
