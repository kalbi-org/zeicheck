/**
 * Detects which form types are present in a parsed xtx file.
 */

import { FormType } from "../models/types.js";
import type { ParsedXtxFile } from "./types.js";

const knownForms: ReadonlyMap<string, FormType> = new Map([
  ["ABA", FormType.ABA],
  ["ABB", FormType.ABB],
  ["VCA", FormType.VCA],
  ["HOA", FormType.HOA],
  ["HOD", FormType.HOD],
  ["HOK", FormType.HOK],
]);

/** Detect FormType enum values from parsed forms. */
export function detectForms(parsed: ParsedXtxFile): FormType[] {
  const detected: FormType[] = [];
  for (const form of parsed.forms) {
    const formType = knownForms.get(form.formType);
    if (formType !== undefined) {
      detected.push(formType);
    }
  }
  return detected;
}
