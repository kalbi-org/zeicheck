import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";
import { formatYen } from "../../utils/monetary.js";
import { yen } from "../../models/types.js";

/**
 * depreciation/small-asset-threshold
 * 少額減価償却資産の閾値チェック
 */
export const smallAssetThresholdRule: Rule = {
  meta: {
    id: "depreciation/small-asset-threshold",
    name: "少額資産の償却方法チェック",
    description:
      "取得価額10万円以下は全額経費、10万円超30万円以下は少額減価償却資産の特例（青色申告者）が適用可能です。",
    severity: "warning",
    applicableTo: ["sole-proprietor", "corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType === "individual") return [];
    const diagnostics: RuleDiagnostic[] = [];
    const assets = ctx.taxReturn.depreciationSchedule.assets;
    const threshold10 = yen(100000);
    const threshold30 = yen(300000);

    for (const asset of assets) {
      if (asset.acquisitionCost <= threshold10 && asset.usefulLife > 1) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `「${asset.name}」(取得価額${formatYen(asset.acquisitionCost)})は10万円以下のため、全額経費計上が可能です`,
        });
      }

      if (
        asset.acquisitionCost > threshold10 &&
        asset.acquisitionCost <= threshold30 &&
        asset.depreciationMethod !== "一括償却"
      ) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `「${asset.name}」(取得価額${formatYen(asset.acquisitionCost)})は30万円以下のため、少額減価償却資産の特例（一括経費計上）が適用可能です`,
          details:
            "青色申告者は取得価額30万円未満の減価償却資産について、年間合計300万円まで全額経費に計上できます。",
        });
      }
    }

    return diagnostics;
  },
};
