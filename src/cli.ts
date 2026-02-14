#!/usr/bin/env node

import { Command } from "commander";
import { checkCommand } from "./cli/commands/check.js";
import { listRulesCommand } from "./cli/commands/list-rules.js";
import { explainCommand } from "./cli/commands/explain.js";

const program = new Command();

program
  .name("zeicheck")
  .description("e-Tax (xtx) 確定申告データの整合性チェッカー")
  .version("0.4.0");

program
  .command("check")
  .description("xtxファイルの検証を実行する")
  .argument("<file>", "検証対象のxtxファイル")
  .option("-f, --format <format>", "出力形式 (stylish|json)", "stylish")
  .option("-c, --config <path>", "設定ファイルパス")
  .option("--csv <file>", "法人決算書CSVファイル（HOT010形式）")
  .option("--prior-year <file>", "前年ファイル（継続性チェック用）")
  .option("--severity <level>", "最低表示レベル (error|warning|info)")
  .option("--no-color", "カラー出力を無効化")
  .action(async (file: string, options) => {
    try {
      const exitCode = await checkCommand(file, options);
      process.exitCode = exitCode;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`エラー: ${error.message}`);
      } else {
        console.error("予期せぬエラーが発生しました");
      }
      process.exitCode = 2;
    }
  });

program
  .command("list-rules")
  .description("利用可能なルール一覧を表示する")
  .action(() => {
    listRulesCommand();
  });

program
  .command("explain")
  .description("ルールの詳細説明を表示する")
  .argument("<rule-id>", "ルールID")
  .action((ruleId: string) => {
    explainCommand(ruleId);
  });

program.parse();
