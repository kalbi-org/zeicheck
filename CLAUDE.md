# CLAUDE.md — zeicheck 開発ガイド

## プロジェクト概要

e-Tax (xtx) 確定申告データの整合性チェッカー。XTXファイル（XML形式）をパースし、貸借対照表・損益計算書・申告書の整合性を検証する CLI ツール兼ライブラリ。

- **パッケージ名**: `@kalbi/zeicheck`
- **リポジトリ**: https://github.com/kalbi-org/zeicheck

## よく使うコマンド

```bash
npm run build        # tsup でビルド（dist/ に出力）
npm run typecheck    # tsc --noEmit で型チェック
npm test             # vitest run（全テスト実行）
npm run test:watch   # vitest（ウォッチモード）
npm run test:ci      # vitest run --coverage（カバレッジ付き）
npm run lint         # eslint src/
```

**注意**: CLI統合テスト (`tests/integration/cli.test.ts`) は `dist/cli.js` を実行するため、テスト前にビルドが必要。

## アーキテクチャ

### ディレクトリ構成

```
src/
├── cli.ts                  # CLI エントリポイント（commander）
├── index.ts                # ライブラリ公開API
├── cli/commands/           # check, list-rules, explain コマンド
├── cli/formatter/          # 出力フォーマッタ（stylish, json）
├── config/                 # .zeicheckrc.json の読み込み・バリデーション（Zod）
├── models/                 # ドメインモデル（TaxReturn, BalanceSheet 等）
├── parser/                 # XTX パーサー（fast-xml-parser → 正規化）
│   └── mappings/           # フォームフィールドコード定義（ABA/ABB/VCA）
├── rules/                  # バリデーションルール（カテゴリ別）
│   ├── balance-sheet/      # 貸借対照表ルール
│   ├── income-statement/   # 損益計算書ルール
│   ├── cross-statement/    # 決算書↔申告書クロスチェック
│   ├── deductions/         # 控除ルール
│   ├── depreciation/       # 減価償却ルール
│   ├── continuity/         # 継続性ルール
│   └── home-office/        # 家事按分ルール
└── utils/                  # ユーティリティ（Yen型、エラー）
```

### 主要な処理フロー

```
XTXファイル → readXtxFile() → ParsedXtxFile → normalize() → TaxReturn → runRules() → RuleDiagnostic[]
```

### ルールの仕組み

各ルールは `Rule` インターフェースを実装:

```typescript
interface Rule {
  meta: { id: string; name: string; description: string; severity: Severity };
  check(ctx: RuleContext): RuleDiagnostic[];
}
```

- ルールは `src/rules/index.ts` の `ruleRegistry` (Map) に登録
- `rule-runner.ts` がコンフィグに基づいてルールを実行・severity を適用

### Yen ブランド型

金額は `Yen` ブランド型（`number & { __brand }`) で型安全に扱う。`yen(n)` コンストラクタで整数に切り捨て。`src/utils/monetary.ts` 参照。

### フォームタイプ

- **VCA**: 青色申告決算書（一般用）— 損益計算書 + 貸借対照表
- **ABA**: 申告書第一表
- **ABB**: 申告書第二表

## 新規ルール追加手順

1. `src/rules/<category>/` にファイル作成
2. `Rule` インターフェースで `meta` と `check()` を実装
3. `src/rules/index.ts` で `registerRule()` を呼び出し
4. `tests/unit/rules/<category>/` にテスト作成
5. テストは `tests/helpers/factories.ts` のビルダーを使用

## テスト規約

- **フレームワーク**: Vitest（globals 有効）
- **ファクトリパターン**: `buildTaxReturn()`, `buildBalanceSheet()` 等でテストデータ生成（deep merge でオーバーライド可）
- **テストファイル命名**: `<対象>.test.ts`
- **構造**: `tests/unit/` に単体テスト、`tests/integration/` に統合テスト
- **フィクスチャ**: `tests/fixtures/` に `.xtx` テストファイル

## CI/CD

- **CI** (`ci.yml`): main push + PR で typecheck → build → test
- **Release** (`release.yml`): GitHub Release 作成で typecheck → build → test → npm publish
- リリース手順: GitHub Release を `vX.Y.Z` タグで作成 → 自動公開

## コーディング規約

- ESM (`"type": "module"`)、ターゲット ES2022 / Node 20+
- TypeScript strict モード（`noUncheckedIndexedAccess` 含む）
- 依存: commander, fast-xml-parser, picocolors, zod
