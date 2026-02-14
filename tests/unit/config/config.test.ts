import { describe, expect, it } from "vitest";
import { configSchema } from "../../../src/config/schema.js";

describe("config schema", () => {
  it("accepts an empty object", () => {
    const result = configSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rules).toEqual({});
      expect(result.data.format).toBe("stylish");
      expect(result.data.warningsAsErrors).toBe(false);
    }
  });

  it("accepts valid config with rules", () => {
    const result = configSchema.safeParse({
      rules: {
        "balance-sheet/equation": "error",
        "home-office/reasonable-ratio": ["warning", { maxRatio: 0.5 }],
        "continuity/opening-closing-match": "off",
      },
      format: "json",
      warningsAsErrors: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts priorYearFile", () => {
    const result = configSchema.safeParse({
      priorYearFile: "./prior.xtx",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priorYearFile).toBe("./prior.xtx");
    }
  });

  it("rejects invalid severity", () => {
    const result = configSchema.safeParse({
      rules: { "some-rule": "critical" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid format", () => {
    const result = configSchema.safeParse({
      format: "xml",
    });
    expect(result.success).toBe(false);
  });
});
