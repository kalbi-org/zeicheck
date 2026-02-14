import { describe, it, expect } from "vitest";
import { readXtxString, readXtxFile } from "../../../src/parser/xtx-reader.js";
import { resolve } from "node:path";

const FIXTURES_DIR = resolve(__dirname, "../../fixtures");

const minimalXml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
    <Field id="ITA_VCA0010">10000000</Field>
    <Field id="ITA_VCA0020">500000</Field>
  </FormData>
</DataRoot>`;

describe("readXtxString", () => {
  it("parses a minimal xtx XML string", () => {
    const result = readXtxString(minimalXml);

    expect(result.forms).toHaveLength(1);
    expect(result.forms[0]!.formType).toBe("VCA");
    expect(result.forms[0]!.fields.get("ITA_VCA0010")).toBe("10000000");
    expect(result.forms[0]!.fields.get("ITA_VCA0020")).toBe("500000");
    expect(result.rawXml).toBe(minimalXml);
  });

  it("parses multiple forms", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
    <Field id="ITA_VCA0010">10000000</Field>
  </FormData>
  <FormData id="ABA">
    <Field id="ITA_ABA0010">10000000</Field>
  </FormData>
</DataRoot>`;

    const result = readXtxString(xml);
    expect(result.forms).toHaveLength(2);
    expect(result.forms[0]!.formType).toBe("VCA");
    expect(result.forms[1]!.formType).toBe("ABA");
  });

  it("handles empty FormData with no fields", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
  </FormData>
</DataRoot>`;

    const result = readXtxString(xml);
    expect(result.forms).toHaveLength(1);
    expect(result.forms[0]!.fields.size).toBe(0);
  });

  it("handles DataRoot with no FormData", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
</DataRoot>`;

    const result = readXtxString(xml);
    expect(result.forms).toHaveLength(0);
  });

  it("throws on malformed XML", () => {
    expect(() => readXtxString("<not valid xml><<<")).toThrow();
  });

  it("throws on missing DataRoot", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Other><Foo/></Other>`;
    expect(() => readXtxString(xml)).toThrow("missing DataRoot");
  });

  it("handles fields with empty values", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
    <Field id="ITA_VCA0010"></Field>
  </FormData>
</DataRoot>`;

    const result = readXtxString(xml);
    expect(result.forms[0]!.fields.get("ITA_VCA0010")).toBe("");
  });
});

describe("readXtxFile", () => {
  it("reads the minimal fixture", async () => {
    const result = await readXtxFile(resolve(FIXTURES_DIR, "minimal.xtx"));
    expect(result.forms).toHaveLength(1);
    expect(result.forms[0]!.formType).toBe("VCA");
    expect(result.forms[0]!.fields.get("ITA_VCA0010")).toBe("10000000");
  });

  it("reads the full valid-return fixture", async () => {
    const result = await readXtxFile(resolve(FIXTURES_DIR, "valid-return.xtx"));
    expect(result.forms).toHaveLength(3);
    const formTypes = result.forms.map((f) => f.formType);
    expect(formTypes).toContain("VCA");
    expect(formTypes).toContain("ABA");
    expect(formTypes).toContain("ABB");
  });

  it("rejects missing files", async () => {
    await expect(readXtxFile("/nonexistent/file.xtx")).rejects.toThrow();
  });
});
