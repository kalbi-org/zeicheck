import { describe, expect, it } from "vitest";
import { parseXtxString } from "../../src/parser/index.js";
import { getAllRules, runRules } from "../../src/rules/index.js";
import type { ResolvedConfig } from "../../src/rules/types.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FIXTURES = resolve("tests/fixtures");
const config: ResolvedConfig = { rules: {}, format: "stylish", warningsAsErrors: false };

function readFixture(name: string): string {
  return readFileSync(resolve(FIXTURES, name), "utf-8");
}

describe("full validation pipeline", () => {
  it("valid-return.xtx produces no errors", () => {
    const xml = readFixture("valid-return.xtx");
    const taxReturn = parseXtxString(xml);
    const diagnostics = runRules(getAllRules(), { taxReturn, config });
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors).toEqual([]);
  });

  it("bs-mismatch.xtx produces balance-sheet/equation error", () => {
    const xml = readFixture("bs-mismatch.xtx");
    const taxReturn = parseXtxString(xml);
    const diagnostics = runRules(getAllRules(), { taxReturn, config });
    const bsErrors = diagnostics.filter(
      (d) => d.ruleId === "balance-sheet/equation" && d.severity === "error",
    );
    expect(bsErrors.length).toBeGreaterThan(0);
  });

  it("pl-arithmetic-error.xtx produces P/L errors", () => {
    const xml = readFixture("pl-arithmetic-error.xtx");
    const taxReturn = parseXtxString(xml);
    const diagnostics = runRules(getAllRules(), { taxReturn, config });
    const plErrors = diagnostics.filter(
      (d) =>
        (d.ruleId === "income-statement/pl-chain" ||
          d.ruleId === "income-statement/expense-total") &&
        d.severity === "error",
    );
    expect(plErrors.length).toBeGreaterThan(0);
  });

  it("respects rule off configuration", () => {
    const xml = readFixture("bs-mismatch.xtx");
    const taxReturn = parseXtxString(xml);
    const offConfig: ResolvedConfig = {
      rules: { "balance-sheet/equation": "off" },
      format: "stylish",
      warningsAsErrors: false,
    };
    const diagnostics = runRules(getAllRules(), { taxReturn, config: offConfig });
    const bsErrors = diagnostics.filter(
      (d) => d.ruleId === "balance-sheet/equation",
    );
    expect(bsErrors).toEqual([]);
  });
});
