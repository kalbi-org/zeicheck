import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const CLI_PATH = resolve("dist/cli.js");
const FIXTURES = resolve("tests/fixtures");

async function runCli(
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const { stdout, stderr } = await execFileAsync("node", [CLI_PATH, ...args]);
    return { stdout, stderr, exitCode: 0 };
  } catch (error: unknown) {
    const e = error as { stdout: string; stderr: string; code: number };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      exitCode: e.code ?? 1,
    };
  }
}

describe("CLI integration", () => {
  it("shows help with --help", async () => {
    const { stdout } = await runCli(["--help"]);
    expect(stdout).toContain("zeicheck");
    expect(stdout).toContain("check");
  });

  it("shows version with --version", async () => {
    const { stdout } = await runCli(["--version"]);
    expect(stdout).toContain("0.1.0");
  });

  it("list-rules shows available rules", async () => {
    const { stdout } = await runCli(["list-rules"]);
    expect(stdout).toContain("balance-sheet/equation");
    expect(stdout).toContain("income-statement/pl-chain");
  });

  it("explain shows rule details", async () => {
    const { stdout } = await runCli(["explain", "balance-sheet/equation"]);
    expect(stdout).toContain("balance-sheet/equation");
  });

  it("explain shows error for unknown rule", async () => {
    const { stderr, exitCode } = await runCli(["explain", "unknown/rule"]);
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("ルールが見つかりません");
  });

  it("check validates a valid return with exit code 0", async () => {
    const { exitCode } = await runCli([
      "check",
      resolve(FIXTURES, "valid-return.xtx"),
    ]);
    expect(exitCode).toBe(0);
  });

  it("check validates a valid corporate return with exit code 0", async () => {
    const { exitCode } = await runCli([
      "check",
      resolve(FIXTURES, "valid-corporate-return.xtx"),
    ]);
    expect(exitCode).toBe(0);
  });

  it("check validates a valid individual (wage earner) return with exit code 0", async () => {
    const { exitCode } = await runCli([
      "check",
      resolve(FIXTURES, "valid-individual-return.xtx"),
    ]);
    expect(exitCode).toBe(0);
  });

  it("check detects bs-mismatch with exit code 1", async () => {
    const { stdout, exitCode } = await runCli([
      "check",
      resolve(FIXTURES, "bs-mismatch.xtx"),
    ]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain("balance-sheet/equation");
  });

  it("check supports JSON format", async () => {
    const { stdout } = await runCli([
      "check",
      resolve(FIXTURES, "bs-mismatch.xtx"),
      "-f",
      "json",
    ]);
    const parsed = JSON.parse(stdout);
    expect(parsed.diagnostics).toBeDefined();
    expect(parsed.summary).toBeDefined();
  });
});
