import pc from "picocolors";
import type { RuleDiagnostic, Severity } from "../../rules/types.js";
import type { FormatInput, FormatResult, Formatter } from "./types.js";

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

function padRight(str: string, len: number): string {
  return str + " ".repeat(Math.max(0, len - str.length));
}

export const stylishFormatter: Formatter = {
  format(input: FormatInput): FormatResult {
    const { filePath, diagnostics } = input;

    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    for (const d of diagnostics) {
      if (d.severity === "error") errorCount++;
      else if (d.severity === "warning") warningCount++;
      else if (d.severity === "info") infoCount++;
    }

    if (diagnostics.length === 0) {
      return { output: "", errorCount: 0, warningCount: 0, infoCount: 0 };
    }

    const lines: string[] = [];
    lines.push("");
    lines.push(pc.underline(filePath));
    lines.push("");

    // Compute column widths
    const maxRuleIdLen = Math.max(
      ...diagnostics.map((d) => d.ruleId.length),
    );
    const maxSeverityLen = 7; // "warning" is the longest

    for (const diag of diagnostics) {
      const ruleId = padRight(diag.ruleId, maxRuleIdLen);
      const severity = padRight(diag.severity, maxSeverityLen);
      lines.push(
        `  ${ruleId}  ${colorSeverity(diag.severity as Severity)}${" ".repeat(maxSeverityLen - diag.severity.length)}  ${diag.message}`,
      );
    }

    lines.push("");

    const total = diagnostics.length;
    const summary = `${pc.bold(errorCount > 0 ? pc.red(`✖ ${total} 件の問題`) : `✖ ${total} 件の問題`)} (${errorCount} errors, ${warningCount} warnings)`;
    lines.push(summary);

    return {
      output: lines.join("\n"),
      errorCount,
      warningCount,
      infoCount,
    };
  },
};
