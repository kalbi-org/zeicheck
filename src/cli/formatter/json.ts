import type { FormatInput, FormatResult, Formatter } from "./types.js";

export const jsonFormatter: Formatter = {
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

    const output = JSON.stringify(
      {
        filePath,
        diagnostics,
        summary: {
          total: diagnostics.length,
          errors: errorCount,
          warnings: warningCount,
          info: infoCount,
        },
      },
      null,
      2,
    );

    return { output, errorCount, warningCount, infoCount };
  },
};
