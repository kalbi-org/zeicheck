/**
 * Field mappings for 法人税申告書 別表四 HOD form.
 * 所得の金額の計算に関する明細書
 *
 * NOTE: フィールドコードは暫定値。実際のe-Tax XTXスキーマ入手後に修正が必要。
 */

export const hodFieldMap = new Map<string, string>([
  ["ITA_HOD0010", "当期利益又は当期欠損の額"],
  ["ITA_HOD0020", "加算項目合計"],
  ["ITA_HOD0030", "減算項目合計"],
  ["ITA_HOD0040", "所得金額又は欠損金額"],
]);
