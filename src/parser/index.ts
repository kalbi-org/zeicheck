/**
 * Public API for the parser module.
 */

export type { ParsedField, ParsedForm, ParsedXtxFile } from "./types.js";
export { readXtxFile, readXtxString } from "./xtx-reader.js";
export { detectForms } from "./form-detector.js";
export { getFieldName } from "./field-registry.js";
export { normalize } from "./normalizer.js";

import type { TaxReturn } from "../models/tax-return.js";
import { normalize } from "./normalizer.js";
import { readXtxFile as readFile, readXtxString as readString } from "./xtx-reader.js";

/** Parse an xtx file from disk and return a typed TaxReturn. */
export async function parseXtxFile(filePath: string): Promise<TaxReturn> {
  const parsed = await readFile(filePath);
  const taxReturn = normalize(parsed);
  return {
    ...taxReturn,
    metadata: { ...taxReturn.metadata, filePath },
  };
}

/** Parse an xtx XML string and return a typed TaxReturn. */
export function parseXtxString(xml: string): TaxReturn {
  const parsed = readString(xml);
  return normalize(parsed);
}
