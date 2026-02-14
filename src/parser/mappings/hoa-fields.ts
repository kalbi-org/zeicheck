/**
 * Field mappings for 法人税申告書 別表一 HOA form.
 *
 * NOTE: フィールドコードは暫定値。実際のe-Tax XTXスキーマ入手後に修正が必要。
 */

export const hoaFieldMap = new Map<string, string>([
  ["ITA_HOA0010", "所得金額又は欠損金額"],
  ["ITA_HOA0020", "法人税額"],
  ["ITA_HOA0030", "控除税額"],
  ["ITA_HOA0040", "地方法人税額"],
  ["ITA_HOA0050", "差引確定法人税額"],
]);
