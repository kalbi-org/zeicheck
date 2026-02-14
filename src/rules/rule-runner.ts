import type { Rule, RuleContext, RuleDiagnostic, Severity } from "./types.js";

const severityOrder: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  off: 3,
};

export function runRules(rules: Rule[], ctx: RuleContext): RuleDiagnostic[] {
  const diagnostics: RuleDiagnostic[] = [];

  for (const rule of rules) {
    const configEntry = ctx.config.rules[rule.meta.id];
    const severity: Severity = Array.isArray(configEntry)
      ? configEntry[0]
      : configEntry ?? rule.meta.severity;

    if (severity === "off") continue;

    const { applicableTo } = rule.meta;
    if (applicableTo && !applicableTo.includes(ctx.taxReturn.returnType)) continue;

    const results = rule.check(ctx);
    for (const diag of results) {
      diagnostics.push({ ...diag, severity });
    }
  }

  diagnostics.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return diagnostics;
}
