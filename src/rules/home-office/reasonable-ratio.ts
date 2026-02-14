import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

const DEFAULT_MAX_RATIO = 0.9;

/**
 * home-office/reasonable-ratio
 * 家事按分率の妥当性チェック
 */
export const reasonableRatioRule: Rule = {
  meta: {
    id: "home-office/reasonable-ratio",
    name: "家事按分率の妥当性",
    description:
      "減価償却資産の事業専用割合（家事按分率）が妥当な範囲内かチェックします。デフォルトの上限は90%です。",
    severity: "warning",
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    const diagnostics: RuleDiagnostic[] = [];
    const assets = ctx.taxReturn.depreciationSchedule.assets;

    const ruleConfig = ctx.config.rules[this.meta.id];
    let maxRatio = DEFAULT_MAX_RATIO;
    if (Array.isArray(ruleConfig) && typeof ruleConfig[1]?.maxRatio === "number") {
      maxRatio = ruleConfig[1].maxRatio;
    }

    for (const asset of assets) {
      if (asset.businessUseRatio > maxRatio) {
        diagnostics.push({
          ruleId: this.meta.id,
          severity: this.meta.severity,
          message: `「${asset.name}」の事業専用割合(${Math.round(asset.businessUseRatio * 100)}%)が上限(${Math.round(maxRatio * 100)}%)を超えています`,
          details:
            "家事按分率が高すぎる場合、税務調査で否認される可能性があります。実態に即した割合を設定してください。",
        });
      }
    }

    return diagnostics;
  },
};
