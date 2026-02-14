import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

/** Common useful life expectations (simplified lookup) */
const COMMON_USEFUL_LIVES: Record<string, number[]> = {
  パソコン: [4],
  サーバー: [5],
  普通自動車: [6],
  軽自動車: [4],
  木造建物: [22],
  鉄筋コンクリート建物: [47],
  金属製家具: [15],
};

/**
 * depreciation/useful-life-rates
 * 耐用年数が法定テーブルと一致するかチェック
 */
export const usefulLifeRatesRule: Rule = {
  meta: {
    id: "depreciation/useful-life-rates",
    name: "法定耐用年数チェック",
    description:
      "減価償却資産の耐用年数が法定耐用年数テーブルと一致するか確認します。",
    severity: "warning",
    applicableTo: ["sole-proprietor", "corporate"],
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    if (ctx.taxReturn.returnType === "individual") return [];
    const diagnostics: RuleDiagnostic[] = [];
    const assets = ctx.taxReturn.depreciationSchedule.assets;

    for (const asset of assets) {
      for (const [keyword, validLives] of Object.entries(COMMON_USEFUL_LIVES)) {
        if (
          asset.name.includes(keyword) &&
          !validLives.includes(asset.usefulLife)
        ) {
          diagnostics.push({
            ruleId: this.meta.id,
            severity: this.meta.severity,
            message: `「${asset.name}」の耐用年数(${asset.usefulLife}年)が法定耐用年数(${validLives.join("/")}年)と異なります`,
          });
        }
      }
    }

    return diagnostics;
  },
};
