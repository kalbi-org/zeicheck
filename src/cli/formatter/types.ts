import type { RuleDiagnostic } from "../../rules/types.js";

export interface FormatInput {
  readonly filePath: string;
  readonly diagnostics: readonly RuleDiagnostic[];
}

export interface FormatResult {
  readonly output: string;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
}

export interface Formatter {
  format(input: FormatInput): FormatResult;
}
