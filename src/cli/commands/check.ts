import { parseXtxFile } from "../../parser/index.js";
import { getAllRules, runRules } from "../../rules/index.js";
import type { ResolvedConfig, Severity } from "../../rules/types.js";
import { loadConfig } from "../../config/index.js";
import { getFormatter } from "../formatter/index.js";

export interface CheckOptions {
  format?: string;
  config?: string;
  csv?: string;
  priorYear?: string;
  severity?: string;
  color?: boolean;
}

export async function checkCommand(
  filePath: string,
  options: CheckOptions,
): Promise<number> {
  // Load config
  const config = await loadConfig(options.config);

  // Override format from CLI
  const resolvedConfig: ResolvedConfig = {
    ...config,
    format: (options.format as "stylish" | "json") ?? config.format,
  };

  // Parse the file (with optional CSV for corporate financials)
  const taxReturn = await parseXtxFile(filePath, options.csv);

  // Parse prior year if provided
  const priorYearPath = options.priorYear ?? config.priorYearFile;
  let priorYear;
  if (priorYearPath) {
    priorYear = await parseXtxFile(priorYearPath);
  }

  // Run rules
  const rules = getAllRules();
  const diagnostics = runRules(rules, {
    taxReturn,
    priorYear,
    config: resolvedConfig,
  });

  // Filter by severity
  const minSeverity = options.severity as Severity | undefined;
  const severityOrder: Record<string, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };
  const filtered = minSeverity
    ? diagnostics.filter(
        (d) =>
          (severityOrder[d.severity] ?? 2) <=
          (severityOrder[minSeverity] ?? 2),
      )
    : diagnostics;

  // Format output
  const formatter = getFormatter(resolvedConfig.format);
  const result = formatter.format({ filePath, diagnostics: filtered });

  if (result.output) {
    console.log(result.output);
  }

  // Exit code
  if (result.errorCount > 0) return 1;
  if (resolvedConfig.warningsAsErrors && result.warningCount > 0) return 1;
  return 0;
}
