import { describe, it, expect } from "vitest";
import { normalize } from "../../../src/parser/normalizer.js";
import { readXtxString } from "../../../src/parser/xtx-reader.js";
import { readXtxFile } from "../../../src/parser/xtx-reader.js";
import { FormType } from "../../../src/models/types.js";
import { resolve } from "node:path";

const FIXTURES_DIR = resolve(__dirname, "../../fixtures");

describe("normalize", () => {
  it("normalizes a minimal VCA-only file", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
    <Field id="ITA_VCA0010">10000000</Field>
    <Field id="ITA_VCA0050">2900000</Field>
    <Field id="ITA_VCA0060">7100000</Field>
  </FormData>
</DataRoot>`;

    const parsed = readXtxString(xml);
    const result = normalize(parsed);

    expect(result.incomeStatement.revenue).toBe(10000000);
    expect(result.incomeStatement.cogs.total).toBe(2900000);
    expect(result.incomeStatement.grossProfit).toBe(7100000);
    expect(result.metadata.formTypes).toEqual([FormType.VCA]);
  });

  it("normalizes a complete valid return", async () => {
    const parsed = await readXtxFile(resolve(FIXTURES_DIR, "valid-return.xtx"));
    const result = normalize(parsed);

    // P/L
    expect(result.incomeStatement.revenue).toBe(10000000);
    expect(result.incomeStatement.cogs.openingInventory).toBe(500000);
    expect(result.incomeStatement.cogs.purchases).toBe(3000000);
    expect(result.incomeStatement.cogs.closingInventory).toBe(600000);
    expect(result.incomeStatement.cogs.total).toBe(2900000);
    expect(result.incomeStatement.grossProfit).toBe(7100000);
    expect(result.incomeStatement.totalExpenses).toBe(3700000);
    expect(result.incomeStatement.operatingIncome).toBe(3400000);

    // B/S
    expect(result.balanceSheet.cash.closing).toBe(600000);
    expect(result.balanceSheet.deposits.closing).toBe(3500000);
    expect(result.balanceSheet.assetsTotal.closing).toBe(10400000);
    expect(result.balanceSheet.liabilitiesTotal.closing).toBe(2400000);
    expect(result.balanceSheet.equityTotal.closing).toBe(8000000);

    // Tax form A
    expect(result.taxFormA.businessIncome).toBe(10000000);
    expect(result.taxFormA.totalIncome).toBe(2750000);
    expect(result.taxFormA.taxableIncome).toBe(1770000);
    expect(result.taxFormA.incomeTax).toBe(89500);

    // Tax form B
    expect(result.taxFormB.socialInsurance).toBe(500000);
    expect(result.taxFormB.basicDeduction).toBe(480000);
    expect(result.taxFormB.incomeDetails).toHaveLength(1);
    expect(result.taxFormB.incomeDetails[0]!.type).toBe("営業等");

    // Metadata
    expect(result.metadata.formTypes).toContain(FormType.ABA);
    expect(result.metadata.formTypes).toContain(FormType.ABB);
    expect(result.metadata.formTypes).toContain(FormType.VCA);
  });

  it("defaults missing fields to zero yen", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
    <Field id="ITA_VCA0010">5000000</Field>
  </FormData>
</DataRoot>`;

    const parsed = readXtxString(xml);
    const result = normalize(parsed);

    expect(result.incomeStatement.revenue).toBe(5000000);
    expect(result.incomeStatement.cogs.openingInventory).toBe(0);
    expect(result.incomeStatement.expenses.salaries).toBe(0);
    expect(result.balanceSheet.cash.opening).toBe(0);
    expect(result.balanceSheet.cash.closing).toBe(0);
  });

  it("builds empty tax forms when ABA/ABB forms are absent", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DataRoot xmlns="urn:tax:etax">
  <FormData id="VCA">
    <Field id="ITA_VCA0010">10000000</Field>
  </FormData>
</DataRoot>`;

    const parsed = readXtxString(xml);
    const result = normalize(parsed);

    expect(result.taxFormA.businessIncome).toBe(0);
    expect(result.taxFormA.incomeTax).toBe(0);
    expect(result.taxFormB.socialInsurance).toBe(0);
    expect(result.taxFormB.incomeDetails[0]!.amount).toBe(0);
  });

  it("normalizes a B/S mismatch file without crashing", async () => {
    const parsed = await readXtxFile(resolve(FIXTURES_DIR, "bs-mismatch.xtx"));
    const result = normalize(parsed);

    // Assets total is deliberately wrong (11000000 vs correct 10400000)
    expect(result.balanceSheet.assetsTotal.closing).toBe(11000000);
    expect(result.balanceSheet.liabilitiesTotal.closing).toBe(2400000);
    expect(result.balanceSheet.equityTotal.closing).toBe(8000000);
  });

  it("normalizes a P/L arithmetic error file without crashing", async () => {
    const parsed = await readXtxFile(resolve(FIXTURES_DIR, "pl-arithmetic-error.xtx"));
    const result = normalize(parsed);

    // Total says 3500000 but real sum of expenses is 4000000
    expect(result.incomeStatement.totalExpenses).toBe(3500000);
    expect(result.incomeStatement.expenses.salaries).toBe(1200000);
  });
});
