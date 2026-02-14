import pc from "picocolors";
import { getAllRules } from "../../rules/index.js";
import type { Severity } from "../../rules/types.js";

function colorSeverity(severity: Severity): string {
  switch (severity) {
    case "error":
      return pc.red(severity);
    case "warning":
      return pc.yellow(severity);
    case "info":
      return pc.blue(severity);
    default:
      return severity;
  }
}

export function listRulesCommand(): void {
  const rules = getAllRules();

  console.log("");
  console.log(pc.bold(`zeicheck ルール一覧 (${rules.length} 件)`));
  console.log("");

  const maxIdLen = Math.max(...rules.map((r) => r.meta.id.length));

  for (const rule of rules) {
    const id = rule.meta.id.padEnd(maxIdLen);
    const severity = colorSeverity(rule.meta.severity);
    console.log(`  ${id}  ${severity.padEnd(15)}  ${rule.meta.name}`);
  }

  console.log("");
}
