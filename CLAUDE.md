# CLAUDE.md — zeicheck 開発ガイド

## プロジェクト概要

e-Tax (xtx) 確定申告データの整合性チェッカー。XTXファイル（XML形式）をパースし、貸借対照表・損益計算書・申告書の整合性を検証する CLI ツール兼ライブラリ。個人事業主・給与所得者・マイクロ法人（資本金1,000万以下・一人法人）に対応。

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
│   └── mappings/           # フォームフィールドコード定義（ABA/ABB/VCA/HOA110/HOA410）
├── rules/                  # バリデーションルール（カテゴリ別）
│   ├── balance-sheet/      # 貸借対照表ルール（個人事業主 + 法人共有）
│   ├── income-statement/   # 損益計算書ルール（個人事業主 + 法人共有）
│   ├── cross-statement/    # 決算書↔申告書クロスチェック（個人事業主）
│   ├── deductions/         # 控除ルール（個人事業主）
│   ├── depreciation/       # 減価償却ルール（個人事業主 + 法人共有）
│   ├── continuity/         # 継続性ルール（個人事業主 + 法人共有）
│   ├── home-office/        # 家事按分ルール（個人事業主）
│   ├── individual/         # 給与所得者ルール
│   └── corporate/          # 法人ルール
└── utils/                  # ユーティリティ（Yen型、エラー）
```

### 主要な処理フロー

```
XTXファイル → readXtxFile() → ParsedXtxFile ─┐
CSVファイル → readCorporateCsv() ─────────────┤ (法人のみ)
                                              └→ normalize() → TaxReturn → runRules() → RuleDiagnostic[]
```

### TaxReturn 判別共用体

`TaxReturn` は `SoleProprietorReturn | IndividualReturn | CorporateReturn` の3ウェイ判別共用体:

```typescript
interface SoleProprietorReturn {
  returnType: "sole-proprietor";
  balanceSheet: BalanceSheet;
  incomeStatement: IncomeStatement;
  depreciationSchedule: DepreciationSchedule;
  taxFormA: TaxFormA;
  taxFormB: TaxFormB;
  // ...
}

interface IndividualReturn {
  returnType: "individual";
  taxFormA: TaxFormA;
  taxFormB: TaxFormB;
  // B/S・P/Lなし（給与所得者向け）
}

interface CorporateReturn {
  returnType: "corporate";
  balanceSheet: CorporateBalanceSheet;
  incomeStatement: CorporateIncomeStatement;
  corporateTaxForm: CorporateTaxFormMain;
  incomeAdjustment: IncomeAdjustmentSchedule;
  corporateInfo: CorporateInfo;
  // ...
}

type TaxReturn = SoleProprietorReturn | IndividualReturn | CorporateReturn;
```

- `returnType` フィールドで型を判別
- ルールは `meta.applicableTo` で適用対象を宣言
- `rule-runner` がルール実行前に `returnType` でフィルタ
- 共有ルールでは `if (ctx.taxReturn.returnType === "individual") return [];` の型ガードでナロイング
- TypeScript コンパイラが型安全性を保証

### XTX 自動判別ロジック

```
HOA110フォームあり → corporate
VCAフォームあり    → sole-proprietor
それ以外           → individual
```

### ルールの仕組み

各ルールは `Rule` インターフェースを実装:

```typescript
interface Rule {
  meta: {
    id: string;
    name: string;
    description: string;
    severity: Severity;
    applicableTo?: readonly TaxReturnType[]; // ["sole-proprietor"], ["corporate"], ["sole-proprietor", "corporate"]
  };
  check(ctx: RuleContext): RuleDiagnostic[];
}
```

- ルールは `src/rules/index.ts` の `ruleRegistry` (Map) に登録
- `rule-runner.ts` がコンフィグに基づいてルールを実行・severity を適用
- `applicableTo` が未設定のルールは全種別で実行される（現在は全ルールに明示的に指定済み）

### ルールの対象指定パターン

```typescript
// 個人事業主専用ルール
applicableTo: ["sole-proprietor"];

// 法人専用ルール
applicableTo: ["corporate"];

// 個人事業主 + 法人共有ルール（B/S・P/L・減価償却が必要なルール）
applicableTo: ["sole-proprietor", "corporate"];
// 共有ルールでは returnType による型ガードで individual を除外：
// if (ctx.taxReturn.returnType === "individual") return [];

// 給与所得者専用ルール（今後追加予定）
applicableTo: ["individual"];
```

### 法人モデル

- **CorporateBalanceSheet**: 資産は個人と同構造。負債に未払費用・未払法人税等を追加。純資産は資本金・資本剰余金・利益剰余金・当期純利益。
- **CorporateIncomeStatement**: 個人P/Lに加え、営業外損益→経常利益、特別損益→税引前利益、法人税等→当期純利益。
- **CorporateTaxFormMain**: 別表一（所得金額、法人税額、控除、納付額）
- **IncomeAdjustmentSchedule**: 別表四（当期利益 + 加算 - 減算 = 所得金額）
- **CorporateInfo**: 資本金、事業年度月数、中小法人判定、役員数

### Yen ブランド型

金額は `Yen` ブランド型（`number & { __brand }`) で型安全に扱う。`yen(n)` コンストラクタで整数に切り捨て。`src/utils/monetary.ts` 参照。

### フォームタイプ

- **VCA**: 青色申告決算書（一般用）— 損益計算書 + 貸借対照表
- **ABA**: 申告書第一表
- **ABB**: 申告書第二表
- **HOA110**: 法人税申告書 別表一(一)
- **HOA410**: 法人税申告書 別表四
- **HOT010**: 法人決算書CSV（B/S・P/L、`--csv` で指定）

## 新規ルール追加手順

1. `src/rules/<category>/` にファイル作成
2. `Rule` インターフェースで `meta` と `check()` を実装
3. `meta.applicableTo` で適用対象を指定（`["sole-proprietor"]` / `["corporate"]` / `["sole-proprietor", "corporate"]`）
4. 個人事業主/法人専用ルールでは `check()` 冒頭に型ガードを追加:
   ```typescript
   if (ctx.taxReturn.returnType !== "sole-proprietor") return [];
   ```
5. 共有ルールでは `individual` を除外するガードを追加（B/S・P/Lがないため）:
   ```typescript
   if (ctx.taxReturn.returnType === "individual") return [];
   ```
6. `src/rules/index.ts` で `registerRule()` を呼び出し
7. `tests/unit/rules/<category>/` にテスト作成
8. テストは `tests/helpers/factories.ts` のビルダーを使用

## テスト規約

- **フレームワーク**: Vitest（globals 有効）
- **ファクトリパターン**: `buildSoleProprietorReturn()` (個人事業主), `buildIndividualReturn()` (給与所得者), `buildCorporateReturn()` (法人) 等でテストデータ生成（deep merge でオーバーライド可）
  - ※ `buildTaxReturn()` は `buildSoleProprietorReturn()` の別名（後方互換）
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
- 依存: commander, fast-xml-parser, iconv-lite, picocolors, zod
