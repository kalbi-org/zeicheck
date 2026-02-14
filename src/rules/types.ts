import type { TaxReturn } from "../models/tax-return.js";

export type Severity = "error" | "warning" | "info" | "off";

export interface RuleMeta {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly severity: Severity;
  readonly applicableYears?: readonly number[];
}

export interface RuleDiagnostic {
  readonly ruleId: string;
  readonly severity: Severity;
  readonly message: string;
  readonly details?: string;
}

export interface RuleConfig {
  readonly rules: Record<string, Severity | [Severity, Record<string, unknown>]>;
}

export interface ResolvedConfig {
  readonly rules: Record<string, Severity | [Severity, Record<string, unknown>]>;
  readonly priorYearFile?: string;
  readonly format: "stylish" | "json";
  readonly warningsAsErrors: boolean;
}

export interface RuleContext {
  readonly taxReturn: TaxReturn;
  readonly priorYear?: TaxReturn;
  readonly config: ResolvedConfig;
}

export interface Rule {
  readonly meta: RuleMeta;
  check(ctx: RuleContext): RuleDiagnostic[];
}
