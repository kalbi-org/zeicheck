import { describe, expect, it } from "vitest";
import { usefulLifeRatesRule } from "../../../../src/rules/depreciation/useful-life-rates.js";
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

describe("depreciation/useful-life-rates", () => {
  it("passes for correctly configured PC with 4-year life", () => {
    const asset = makeAsset({ name: "パソコン", usefulLife: 4 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = usefulLifeRatesRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });

  it("warns when PC has wrong useful life", () => {
    const asset = makeAsset({ name: "パソコン", usefulLife: 6 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = usefulLifeRatesRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("4年");
  });

  it("warns when vehicle has wrong useful life", () => {
    const asset = makeAsset({ name: "普通自動車", usefulLife: 10 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = usefulLifeRatesRule.check({ taxReturn: tr, config });
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("6年");
  });

  it("does not warn for unknown asset names", () => {
    const asset = makeAsset({ name: "特殊機械", usefulLife: 15 });
    const tr = buildTaxReturn({
      depreciationSchedule: buildDepreciationSchedule({ assets: [asset] }),
    });
    const result = usefulLifeRatesRule.check({ taxReturn: tr, config });
    expect(result).toEqual([]);
  });
});
