# コントリビューションガイド

zeicheck へのコントリビューションに感謝します！

## 開発環境のセットアップ

```bash
git clone https://github.com/kalbi-org/zeicheck.git
cd zeicheck
npm install
```

## 開発コマンド

```bash
npm run build        # ビルド
npm run typecheck    # 型チェック
npm test             # テスト実行
npm run test:watch   # テスト（ウォッチモード）
npm run lint         # Lint
```

## プルリクエストの手順

1. Issue で変更内容を議論（小さな修正はスキップ可）
2. `main` から新しいブランチを作成
3. 変更を実装
4. テストを追加・更新
5. `npm run typecheck && npm test` が通ることを確認
6. プルリクエストを作成

## コーディング規約

- TypeScript strict モード
- ESM (`import`/`export`)
- 関数名・変数名は英語、ユーザー向けメッセージは日本語
- `Yen` ブランド型で金額を扱う（`yen()` コンストラクタ使用）

## 新しいルールの追加

1. `src/rules/<category>/` にファイルを作成
2. `Rule` インターフェースを実装（`meta` + `check()`）
3. `src/rules/index.ts` で `registerRule()` を呼び出し
4. `tests/unit/rules/<category>/` にテストを作成
5. テストデータは `tests/helpers/factories.ts` のビルダーを使用

### ルールの構造

```typescript
import type { Rule, RuleContext, RuleDiagnostic } from "../types.js";

export const myRule: Rule = {
  meta: {
    id: "category/rule-name",
    name: "ルール名",
    description: "ルールの説明",
    severity: "error", // "error" | "warning" | "info"
  },

  check(ctx: RuleContext): RuleDiagnostic[] {
    // ctx.taxReturn から値を取得して検証
    // ctx.priorYear は前年データ（任意）
    return [];
  },
};
```

## Issue の報告

- バグ報告には再現手順を含めてください
- 可能であれば XTX ファイルのサンプル（個人情報を除去したもの）を添付してください
- 機能リクエストにはユースケースの説明をお願いします

## ライセンス

コントリビューションは MIT ライセンスのもとで提供されます。
