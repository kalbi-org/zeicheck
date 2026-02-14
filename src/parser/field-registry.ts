/**
 * Registry for looking up Japanese names of field codes.
 */

import { abaFieldMap } from "./mappings/aba-fields.js";
import { abbFieldMap } from "./mappings/abb-fields.js";
import { vcaFieldMap } from "./mappings/vca-fields.js";
import { hoaFieldMap } from "./mappings/hoa-fields.js";
import { hodFieldMap } from "./mappings/hod-fields.js";
import { hokFieldMap } from "./mappings/hok-fields.js";

const registries: ReadonlyMap<string, ReadonlyMap<string, string>> = new Map([
  ["ABA", abaFieldMap],
  ["ABB", abbFieldMap],
  ["VCA", vcaFieldMap],
  ["HOA", hoaFieldMap],
  ["HOD", hodFieldMap],
  ["HOK", hokFieldMap],
]);

/** Look up the Japanese name for a field code within a form type. */
export function getFieldName(formType: string, fieldCode: string): string {
  const fieldMap = registries.get(formType);
  return fieldMap?.get(fieldCode) ?? fieldCode;
}
