/**
 * HOT010 CSV reader for corporate financial statements.
 *
 * HOT010 format: Shift_JIS encoded CSV with 5 columns:
 *   勘定科目コード(9桁), 科目名, 期首残高, 期末残高, 備考
 *
 * 勘定科目コード: 業種番号2桁 + 区分3桁 + 整数4桁
 */

import { readFile } from "node:fs/promises";
import * as iconv from "iconv-lite";
import type { CorporateBalanceSheet } from "../models/corporate-balance-sheet.js";
import type { CorporateIncomeStatement } from "../models/corporate-income-statement.js";
import { yen, type Yen } from "../models/types.js";
import { accountCodeMap } from "./mappings/hot010-accounts.js";
import type { BsTarget, PlTarget } from "./mappings/hot010-accounts.js";

/** Corporate financial data parsed from CSV */
export interface CorporateFinancials {
  readonly balanceSheet: CorporateBalanceSheet;
  readonly incomeStatement: CorporateIncomeStatement;
}

interface CsvRow {
  readonly accountCode: string;
  readonly accountName: string;
  readonly opening: number;
  readonly closing: number;
}

function parseCsvLine(line: string): CsvRow | undefined {
  const parts = line.split(",");
  if (parts.length < 4) return undefined;

  const accountCode = (parts[0] ?? "").trim();
  if (accountCode.length !== 9) return undefined;

  const accountName = (parts[1] ?? "").trim();
  const opening = Number(parts[2]) || 0;
  const closing = Number(parts[3]) || 0;

  return { accountCode, accountName, opening, closing };
}

function y(n: number): Yen {
  return yen(n);
}

/**
 * Read a HOT010 corporate financials CSV and build B/S and P/L models.
 */
export async function readCorporateCsv(
  filePath: string,
): Promise<CorporateFinancials> {
  const raw = await readFile(filePath);
  const content = iconv.decode(raw, "Shift_JIS");
  return parseCorporateCsvString(content);
}

/**
 * Parse a HOT010 CSV string (already decoded) into corporate financials.
 */
export function parseCorporateCsvString(
  content: string,
): CorporateFinancials {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Accumulators
  const bsOpening = new Map<BsTarget, number>();
  const bsClosing = new Map<BsTarget, number>();
  const plValues = new Map<PlTarget, number>();

  for (const line of lines) {
    const row = parseCsvLine(line);
    if (!row) continue;

    // Strip industry prefix (2 digits), use remaining 7 digits for lookup
    const lookupCode = row.accountCode.slice(2);
    const mapping = accountCodeMap.get(lookupCode);
    if (!mapping) continue;

    if (mapping.type === "bs") {
      bsOpening.set(
        mapping.target,
        (bsOpening.get(mapping.target) ?? 0) + row.opening,
      );
      bsClosing.set(
        mapping.target,
        (bsClosing.get(mapping.target) ?? 0) + row.closing,
      );
    } else {
      // P/L: closing column is the period amount
      plValues.set(
        mapping.target,
        (plValues.get(mapping.target) ?? 0) + row.closing,
      );
    }
  }

  function bsAb(target: BsTarget) {
    return {
      opening: y(bsOpening.get(target) ?? 0),
      closing: y(bsClosing.get(target) ?? 0),
    };
  }

  function pl(target: PlTarget): Yen {
    return y(plValues.get(target) ?? 0);
  }

  const netIncome = pl("netIncome");

  const balanceSheet: CorporateBalanceSheet = {
    cash: bsAb("cash"),
    deposits: bsAb("deposits"),
    accountsReceivable: bsAb("accountsReceivable"),
    inventory: bsAb("inventory"),
    otherCurrentAssets: bsAb("otherCurrentAssets"),
    buildings: bsAb("buildings"),
    buildingImprovements: bsAb("buildingImprovements"),
    machinery: bsAb("machinery"),
    vehicles: bsAb("vehicles"),
    tools: bsAb("tools"),
    land: bsAb("land"),
    otherFixedAssets: bsAb("otherFixedAssets"),
    accumulatedDepreciation: bsAb("accumulatedDepreciation"),
    assetsTotal: bsAb("assetsTotal"),
    accountsPayable: bsAb("accountsPayable"),
    borrowings: bsAb("borrowings"),
    accruedExpenses: bsAb("accruedExpenses"),
    corporateTaxPayable: bsAb("corporateTaxPayable"),
    otherCurrentLiabilities: bsAb("otherCurrentLiabilities"),
    liabilitiesTotal: bsAb("liabilitiesTotal"),
    capitalStock: bsAb("capitalStock"),
    capitalSurplus: bsAb("capitalSurplus"),
    retainedEarnings: bsAb("retainedEarnings"),
    netIncome,
    equityTotal: bsAb("equityTotal"),
  };

  const incomeStatement: CorporateIncomeStatement = {
    revenue: pl("revenue"),
    cogs: {
      openingInventory: pl("cogsOpeningInventory"),
      purchases: pl("cogsPurchases"),
      closingInventory: pl("cogsClosingInventory"),
      total: pl("cogsTotal"),
    },
    grossProfit: pl("grossProfit"),
    expenses: {
      taxes: pl("expTaxes"),
      insurance: pl("expInsurance"),
      repairs: pl("expRepairs"),
      depreciation: pl("expDepreciation"),
      welfare: pl("expWelfare"),
      salaries: pl("expSalaries"),
      outsourcing: pl("expOutsourcing"),
      interest: pl("expInterest"),
      rent: pl("expRent"),
      retirement: pl("expRetirement"),
      utilities: pl("expUtilities"),
      travel: pl("expTravel"),
      communication: pl("expCommunication"),
      advertising: pl("expAdvertising"),
      entertainment: pl("expEntertainment"),
      consumables: pl("expConsumables"),
      miscellaneous: pl("expMiscellaneous"),
      otherExpenses: pl("expOther"),
    },
    totalExpenses: pl("totalExpenses"),
    operatingIncome: pl("operatingIncome"),
    nonOperatingIncome: pl("nonOperatingIncome"),
    nonOperatingExpenses: pl("nonOperatingExpenses"),
    ordinaryIncome: pl("ordinaryIncome"),
    extraordinaryGain: pl("extraordinaryGain"),
    extraordinaryLoss: pl("extraordinaryLoss"),
    preTaxIncome: pl("preTaxIncome"),
    corporateTax: pl("corporateTax"),
    netIncome,
  };

  return { balanceSheet, incomeStatement };
}
