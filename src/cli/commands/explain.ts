import pc from "picocolors";
import { getRule } from "../../rules/index.js";

export function explainCommand(ruleId: string): void {
  const rule = getRule(ruleId);

  if (!rule) {
    console.error(pc.red(`ルールが見つかりません: ${ruleId}`));
    console.error(`\n利用可能なルールは 'zeicheck list-rules' で確認できます。`);
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log(pc.bold(rule.meta.id));
  console.log(`  ${pc.dim("名前:")} ${rule.meta.name}`);
  console.log(
    `  ${pc.dim("重要度:")} ${rule.meta.severity}`,
  );
  if (rule.meta.applicableYears) {
    console.log(
      `  ${pc.dim("対応年度:")} ${rule.meta.applicableYears.join(", ")}`,
    );
  }
  console.log("");
  console.log(`  ${rule.meta.description}`);
  console.log("");
}
