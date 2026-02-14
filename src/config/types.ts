import type { Severity } from "../rules/types.js";

export interface ZeicheckConfig {
  readonly rules: Record<string, Severity | [Severity, Record<string, unknown>]>;
  readonly priorYearFile?: string;
  readonly format: "stylish" | "json";
  readonly warningsAsErrors: boolean;
}
