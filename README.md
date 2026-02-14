# zeicheck

e-Tax (xtx) 確定申告データの整合性チェッカー。ESLintのような使い心地で、**個人事業主**・**給与所得者**・**マイクロ法人**（資本金1,000万以下・一人法人）の税務申告データをルールベースで検証します。

## インストール

```bash
npm install -g zeicheck
```

## 使い方

### 個人事業主（青色申告）

```bash
zeicheck check 申告データ.xtx
```

### 給与所得者（個人の確定申告）

```bash
zeicheck check 給与所得者申告データ.xtx
```

### 法人（マイクロ法人）

```bash
zeicheck check 法人申告データ.xtx
```

> **自動判別**: XTXファイル内のフォームから申告種別を自動検出します。HOK（法人決算書）→法人、VCA（青色申告決算書）→個人事業主、それ以外→給与所得者。

### 出力例

```
/path/to/申告データ.xtx

  balance-sheet/equation        error    期末残高: 資産合計(3,500,000) ≠ 負債合計(0) + 資本合計(3,300,000)
  income-statement/pl-chain     error    経費合計(1,850,000) ≠ 各経費の合算(1,800,000)
  deductions/blue-deduction-cap warning  青色申告特別控除額(650,000) > 控除前所得(500,000)

✖ 3 件の問題 (2 errors, 1 warning)
```

### コマンド

```bash
# xtxファイルの検証
zeicheck check <file.xtx>
  -f, --format <stylish|json>     # 出力形式（デフォルト: stylish）
  -c, --config <path>             # 設定ファイルパス
  --prior-year <file.xtx>         # 前年ファイル（継続性チェック用）
  --severity <error|warning|info> # 最低表示レベル
  --no-color                      # カラー出力を無効化

# ルール一覧の表示
zeicheck list-rules

# ルールの詳細説明
zeicheck explain <rule-id>
```

## 機能対応一覧

| チェック項目              | 個人事業主 | 給与所得者 | 法人 |
| ------------------------- | :--------: | :--------: | :--: |
| **貸借対照表**            |            |            |      |
| B/S等式（資産=負債+資本） |     ✅     |     —      |  ✅  |
| 現金残高の非負チェック    |     ✅     |     —      |  ✅  |
| 事業主貸借 期首ゼロ       |     ✅     |     —      |  —   |
| 元入金繰越計算            |     ✅     |     —      |  —   |
| **損益計算書**            |            |            |      |
| P/L計算連鎖               |     ✅     |     —      |  ✅  |
| 経費合計チェック          |     ✅     |     —      |  ✅  |
| 売上原価計算              |     ✅     |     —      |  ✅  |
| **クロスチェック**        |            |            |      |
| B/S↔P/L整合性             |     ✅     |     —      |  ✅  |
| 決算書→申告書転記         |     ✅     |     —      |  —   |
| 減価償却費合計一致        |     ✅     |     —      |  —   |
| 別表四↔P/L整合性          |     —      |     —      |  ✅  |
| 別表一↔別表四整合性       |     —      |     —      |  ✅  |
| **控除・税額**            |            |            |      |
| 青色申告特別控除          |     ✅     |     —      |  —   |
| 軽減税率適用              |     —      |     —      |  ✅  |
| 交際費損金算入限度        |     —      |     —      |  ✅  |
| **減価償却**              |            |            |      |
| 法定耐用年数              |     ✅     |     —      |  ✅  |
| 少額資産特例              |     ✅     |     —      |  ✅  |
| **継続性**                |            |            |      |
| 期首=前期末一致           |     ✅     |     —      |  ✅  |
| 前年比変動                |     ✅     |     —      |  ✅  |
| 利益剰余金繰越            |     —      |     —      |  ✅  |
| **その他**                |            |            |      |
| 家事按分妥当性            |     ✅     |     —      |  —   |
| 役員報酬妥当性            |     —      |     —      |  ✅  |
| 資本金1000万以下          |     —      |     —      |  ✅  |
| **給与所得者向け**        |            |            |      |
| 基礎控除額確認            |     —      |     ✅     |  —   |
| 所得控除合計チェック      |     —      |     ✅     |  —   |
| 課税所得計算              |     —      |     ✅     |  —   |
| 源泉徴収税額整合性        |     —      |     ✅     |  —   |

## ルール一覧

### 個人事業主ルール（`applicableTo: ["sole-proprietor"]`）

#### 貸借対照表 (Balance Sheet)

| ルールID                             | 説明                           | 重要度  | 備考  |
| ------------------------------------ | ------------------------------ | ------- | ----- |
| `balance-sheet/equation`             | 資産合計 = 負債合計 + 資本合計 | error   | ※共有 |
| `balance-sheet/opening-owner-equity` | 事業主貸/借の期首残高が0       | error   |       |
| `balance-sheet/motoire-kin-formula`  | 元入金繰越計算の検証           | error   |       |
| `balance-sheet/non-negative-cash`    | 現金残高が負でないか           | warning | ※共有 |

#### 損益計算書 (Income Statement)

| ルールID                         | 説明                | 重要度 | 備考  |
| -------------------------------- | ------------------- | ------ | ----- |
| `income-statement/pl-chain`      | P/L各段階の計算検証 | error  |       |
| `income-statement/expense-total` | 経費合計の一致      | error  |       |
| `income-statement/cogs`          | 売上原価の計算検証  | error  | ※共有 |

#### 帳票間整合性 (Cross-Statement)

| ルールID                             | 説明                    | 重要度 |
| ------------------------------------ | ----------------------- | ------ |
| `cross-statement/bs-pl-bridge`       | B/S⇔P/L所得金額一致     | error  |
| `cross-statement/decision-to-return` | 決算書→申告書の転記一致 | error  |
| `cross-statement/depreciation-sum`   | 減価償却合計の一致      | error  |

#### 控除 (Deductions)

| ルールID                                | 説明                  | 重要度  |
| --------------------------------------- | --------------------- | ------- |
| `deductions/blue-deduction-cap`         | 青色控除 ≦ 控除前所得 | warning |
| `deductions/blue-deduction-eligibility` | 65万円控除の適用要件  | info    |

#### 減価償却 (Depreciation)

| ルールID                             | 説明                     | 重要度  |
| ------------------------------------ | ------------------------ | ------- |
| `depreciation/useful-life-rates`     | 法定耐用年数テーブル照合 | warning |
| `depreciation/small-asset-threshold` | 少額資産の閾値チェック   | warning |

#### 継続性 (Continuity)

| ルールID                           | 説明                 | 重要度  |
| ---------------------------------- | -------------------- | ------- |
| `continuity/opening-closing-match` | 期首=前年期末の一致  | error   |
| `continuity/year-over-year-change` | 前年比大幅変動の警告 | warning |

#### 家事按分 (Home Office)

| ルールID                       | 説明               | 重要度  |
| ------------------------------ | ------------------ | ------- |
| `home-office/reasonable-ratio` | 家事按分率の妥当性 | warning |

### 給与所得者ルール（`applicableTo: ["individual"]`）

| ルールID                       | 説明                           | 重要度  |
| ------------------------------ | ------------------------------ | ------- |
| `individual/basic-deduction`   | 基礎控除が標準額（48万円）か   | info    |
| `individual/deduction-total`   | 所得控除合計の一致             | error   |
| `individual/taxable-income`    | 課税所得 = 合計所得 − 控除合計 | error   |
| `individual/withholding-total` | 源泉徴収税額の整合性           | warning |

### 法人ルール（`applicableTo: ["corporate"]`）

| ルールID                                 | 説明                                | 重要度  |
| ---------------------------------------- | ----------------------------------- | ------- |
| `corporate/bs-equation`                  | 資産 = 負債 + 純資産                | error   |
| `corporate/pl-chain`                     | 営業利益→経常利益→税引前→当期純利益 | error   |
| `corporate/expense-total`                | 販管費の合計検証                    | error   |
| `corporate/bs-pl-bridge`                 | B/S当期純利益 = P/L当期純利益       | error   |
| `corporate/betsu4-accounting-profit`     | 別表四の当期利益 = P/L税引前利益    | error   |
| `corporate/betsu4-taxable-income`        | 別表四の所得金額計算検証            | error   |
| `corporate/betsu1-match`                 | 別表一 = 別表四の所得金額           | error   |
| `corporate/capital-under-10m`            | 資本金1,000万以下チェック           | warning |
| `corporate/officer-compensation`         | 役員報酬の妥当性                    | warning |
| `corporate/entertainment-limit`          | 交際費の損金算入限度                | warning |
| `corporate/small-corp-tax-rate`          | 軽減税率適用チェック                | info    |
| `corporate/retained-earnings-continuity` | 利益剰余金の繰越                    | error   |

## 設定

プロジェクトルートに `.zeicheckrc.json` を配置して、ルールの有効/無効やオプションをカスタマイズできます。

```json
{
  "rules": {
    "balance-sheet/equation": "error",
    "home-office/reasonable-ratio": ["warning", { "maxRatio": 0.9 }],
    "continuity/opening-closing-match": "off"
  },
  "priorYearFile": "./prior-year.xtx",
  "format": "stylish",
  "warningsAsErrors": false
}
```

### ルール設定

各ルールの重要度を変更できます:

- `"error"` — エラーとして報告（終了コード1）
- `"warning"` — 警告として報告
- `"info"` — 情報として報告
- `"off"` — ルールを無効化

一部のルールはオプション付きで設定できます:

```json
{
  "rules": {
    "home-office/reasonable-ratio": ["warning", { "maxRatio": 0.5 }]
  }
}
```

## 出力形式

### stylish（デフォルト）

ESLint風のカラー出力。ターミナルでの確認に適しています。

### json

```bash
zeicheck check data.xtx -f json
```

CI/CDパイプラインやツール連携に適したJSON形式で出力します。

## 免責事項

本ツールは確定申告データの**形式的な整合性チェック**を目的としたものであり、税務上の正確性・適法性を保証するものではありません。

- 本ツールの検証結果をもって、申告内容が税法上正しいことの証明にはなりません
- 検証でエラーが検出されなくても、申告内容に誤りがないことを意味するものではありません
- 税制改正により、ルールが最新の法令に対応していない場合があります
- 実際の確定申告にあたっては、必ず税理士等の専門家にご相談いただくか、国税庁の公式資料をご確認ください

**本ツールの使用によって生じたいかなる損害についても、開発者は一切の責任を負いません。**

## コントリビューション

zeicheckはコミュニティからの貢献を歓迎します！

### 貢献の方法

- **バグ報告**: [Issues](https://github.com/kalbi-org/zeicheck/issues) で報告してください。再現手順やエラーメッセージを添えていただけると助かります
- **機能提案**: 新しいルールや機能の要望も Issues でお気軽にどうぞ
- **プルリクエスト**: バグ修正、新規ルール追加、ドキュメント改善など歓迎します

### 開発環境のセットアップ

```bash
git clone https://github.com/kalbi-org/zeicheck.git
cd zeicheck
npm install
npm test          # テスト実行
npm run build     # ビルド
npm run typecheck # 型チェック
```

### プルリクエストのガイドライン

1. 既存のテストがすべて通ることを確認してください（`npm test`）
2. 新しいルールを追加する場合は、対応するユニットテストも追加してください
3. ルールのメッセージは日本語で記述してください
4. コミットメッセージは変更内容が分かるように簡潔に書いてください

### 新しいルールの追加方法

1. `src/rules/<カテゴリ>/` にルールファイルを作成
2. `Rule` インターフェースを実装（`meta` + `check` メソッド）
3. `src/rules/index.ts` にルールを登録
4. `tests/unit/rules/<カテゴリ>/` にテストを作成

```typescript
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const myRule: Rule = {
  meta: {
    id: "category/my-rule",
    name: "ルール名",
    description: "ルールの詳細説明",
    severity: "error",
    applicableTo: ["sole-proprietor"], // or ["corporate"] or ["sole-proprietor", "corporate"]
  },
  check(ctx: RuleContext): RuleDiagnostic[] {
    // 検証ロジック
    return [];
  },
};
```

## ライセンス

MIT
