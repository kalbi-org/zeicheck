/**
 * Registry for looking up Japanese names of field codes.
 */

import { abaFieldMap } from "./mappings/aba-fields.js";
import { abbFieldMap } from "./mappings/abb-fields.js";
import { vcaFieldMap } from "./mappings/vca-fields.js";

const registries: ReadonlyMap<string, ReadonlyMap<string, string>> = new Map([
  ["ABA", abaFieldMap],
  ["ABB", abbFieldMap],
  ["VCA", vcaFieldMap],
]);

/** Look up the Japanese name for a field code within a form type. */
export function getFieldName(formType: string, fieldCode: string): string {
  const fieldMap = registries.get(formType);
  return fieldMap?.get(fieldCode) ?? fieldCode;
}
