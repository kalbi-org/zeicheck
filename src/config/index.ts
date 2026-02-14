import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ConfigError } from "../utils/errors.js";
import type { ResolvedConfig } from "../rules/types.js";
import { defaultConfig } from "./defaults.js";
import { configSchema } from "./schema.js";

export type { ZeicheckConfig } from "./types.js";

/**
 * Load configuration from a file path, or use defaults.
 * Merges with defaults so partial configs are fine.
 */
export async function loadConfig(configPath?: string): Promise<ResolvedConfig> {
  if (!configPath) {
    // Try to find .zeicheckrc.json in cwd
    const defaultPath = resolve(process.cwd(), ".zeicheckrc.json");
    try {
      return await readConfigFile(defaultPath);
    } catch {
      return defaultConfig;
    }
  }

  return readConfigFile(configPath);
}

async function readConfigFile(filePath: string): Promise<ResolvedConfig> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch {
    throw new ConfigError(`設定ファイルが見つかりません: ${filePath}`, filePath);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ConfigError(
      `設定ファイルのJSON解析に失敗しました: ${filePath}`,
      filePath,
    );
  }

  const result = configSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new ConfigError(
      `設定ファイルのバリデーションに失敗しました:\n${issues}`,
      filePath,
    );
  }

  return result.data;
}
