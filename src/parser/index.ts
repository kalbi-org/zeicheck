/**
 * Public API for the parser module.
 */

export type { ParsedField, ParsedForm, ParsedXtxFile } from "./types.js";
export { readXtxFile, readXtxString } from "./xtx-reader.js";
export { detectForms } from "./form-detector.js";
export { getFieldName } from "./field-registry.js";
export { normalize } from "./normalizer.js";
export { readCorporateCsv, parseCorporateCsvString } from "./csv-reader.js";
export type { CorporateFinancials } from "./csv-reader.js";

import type { TaxReturn } from "../models/tax-return.js";
import type { CorporateFinancials } from "./csv-reader.js";
import { readCorporateCsv } from "./csv-reader.js";
import { normalize } from "./normalizer.js";
import { readXtxFile as readFile, readXtxString as readString } from "./xtx-reader.js";

/** Parse an xtx file from disk and return a typed TaxReturn. */
export async function parseXtxFile(
  filePath: string,
  csvPath?: string,
): Promise<TaxReturn> {
  const parsed = await readFile(filePath);
  let csvData: CorporateFinancials | undefined;
  if (csvPath) {
    csvData = await readCorporateCsv(csvPath);
  }
  const taxReturn = normalize(parsed, csvData);
  return {
    ...taxReturn,
    metadata: { ...taxReturn.metadata, filePath },
  };
}

/** Parse an xtx XML string and return a typed TaxReturn. */
export function parseXtxString(
  xml: string,
  csvData?: CorporateFinancials,
): TaxReturn {
  const parsed = readString(xml);
  return normalize(parsed, csvData);
}
