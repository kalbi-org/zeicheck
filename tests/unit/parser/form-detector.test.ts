import { describe, it, expect } from "vitest";
import { detectForms } from "../../../src/parser/form-detector.js";
import { FormType } from "../../../src/models/types.js";
import type { ParsedXtxFile } from "../../../src/parser/types.js";

function makeParsed(formTypes: string[]): ParsedXtxFile {
  return {
    forms: formTypes.map((ft) => ({ formType: ft, fields: new Map() })),
    rawXml: "",
  };
}

describe("detectForms", () => {
  it("detects a single VCA form", () => {
    const result = detectForms(makeParsed(["VCA"]));
    expect(result).toEqual([FormType.VCA]);
  });

  it("detects all three form types", () => {
    const result = detectForms(makeParsed(["ABA", "ABB", "VCA"]));
    expect(result).toEqual([FormType.ABA, FormType.ABB, FormType.VCA]);
  });

  it("ignores unknown form types", () => {
    const result = detectForms(makeParsed(["VCA", "UNKNOWN", "XYZ"]));
    expect(result).toEqual([FormType.VCA]);
  });

  it("returns empty array for no known forms", () => {
    const result = detectForms(makeParsed(["FOO", "BAR"]));
    expect(result).toEqual([]);
  });

  it("returns empty array for no forms at all", () => {
    const result = detectForms(makeParsed([]));
    expect(result).toEqual([]);
  });
});
