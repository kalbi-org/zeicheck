/**
 * Normalizes a ParsedXtxFile into a typed TaxReturn model.
 */

import type { BalanceSheet } from "../models/balance-sheet.js";
import type { DepreciationSchedule } from "../models/depreciation-schedule.js";
import type { IncomeStatement } from "../models/income-statement.js";
import type { TaxFormA, TaxFormB } from "../models/tax-form.js";
import { FormType, yen, type AccountBalance, type FiscalYear, type Yen } from "../models/types.js";
import type { TaxReturn } from "../models/tax-return.js";
import { detectForms } from "./form-detector.js";
import type { ParsedXtxFile } from "./types.js";

/** Read a yen value from a field map, defaulting to 0. */
function yenField(fields: Map<string, string>, code: string): Yen {
  const raw = fields.get(code);
  return yen(raw ? Number(raw) : 0);
}

/** Build an AccountBalance from opening/closing field codes. */
function accountBalance(
  fields: Map<string, string>,
  openingCode: string,
  closingCode: string,
): AccountBalance {
  return {
    opening: yenField(fields, openingCode),
    closing: yenField(fields, closingCode),
  };
}

function getFormFields(parsed: ParsedXtxFile, formType: string): Map<string, string> {
  const form = parsed.forms.find((f) => f.formType === formType);
  return form?.fields ?? new Map();
}

function buildIncomeStatement(vca: Map<string, string>): IncomeStatement {
  return {
    revenue: yenField(vca, "ITA_VCA0010"),
    cogs: {
      openingInventory: yenField(vca, "ITA_VCA0020"),
      purchases: yenField(vca, "ITA_VCA0030"),
      closingInventory: yenField(vca, "ITA_VCA0040"),
      total: yenField(vca, "ITA_VCA0050"),
    },
    grossProfit: yenField(vca, "ITA_VCA0060"),
    expenses: {
      taxes: yenField(vca, "ITA_VCA0100"),
      insurance: yenField(vca, "ITA_VCA0110"),
      repairs: yenField(vca, "ITA_VCA0120"),
      depreciation: yenField(vca, "ITA_VCA0130"),
      welfare: yenField(vca, "ITA_VCA0140"),
      salaries: yenField(vca, "ITA_VCA0150"),
      outsourcing: yenField(vca, "ITA_VCA0160"),
      interest: yenField(vca, "ITA_VCA0170"),
      rent: yenField(vca, "ITA_VCA0180"),
      retirement: yenField(vca, "ITA_VCA0190"),
      utilities: yenField(vca, "ITA_VCA0200"),
      travel: yenField(vca, "ITA_VCA0210"),
      communication: yenField(vca, "ITA_VCA0220"),
      advertising: yenField(vca, "ITA_VCA0230"),
      entertainment: yenField(vca, "ITA_VCA0240"),
      consumables: yenField(vca, "ITA_VCA0250"),
      miscellaneous: yenField(vca, "ITA_VCA0260"),
      otherExpenses: yenField(vca, "ITA_VCA0270"),
    },
    totalExpenses: yenField(vca, "ITA_VCA0280"),
    operatingIncome: yenField(vca, "ITA_VCA0290"),
  };
}

function buildBalanceSheet(vca: Map<string, string>): BalanceSheet {
  return {
    // Assets
    cash: accountBalance(vca, "ITA_VCA1010", "ITA_VCA1210"),
    deposits: accountBalance(vca, "ITA_VCA1020", "ITA_VCA1220"),
    accountsReceivable: accountBalance(vca, "ITA_VCA1030", "ITA_VCA1230"),
    inventory: accountBalance(vca, "ITA_VCA1040", "ITA_VCA1240"),
    otherCurrentAssets: accountBalance(vca, "ITA_VCA1050", "ITA_VCA1250"),
    buildings: accountBalance(vca, "ITA_VCA1060", "ITA_VCA1260"),
    buildingImprovements: accountBalance(vca, "ITA_VCA1070", "ITA_VCA1270"),
    machinery: accountBalance(vca, "ITA_VCA1080", "ITA_VCA1280"),
    vehicles: accountBalance(vca, "ITA_VCA1090", "ITA_VCA1290"),
    tools: accountBalance(vca, "ITA_VCA1100", "ITA_VCA1300"),
    land: accountBalance(vca, "ITA_VCA1110", "ITA_VCA1310"),
    otherFixedAssets: accountBalance(vca, "ITA_VCA1120", "ITA_VCA1320"),
    accumulatedDepreciation: accountBalance(vca, "ITA_VCA1130", "ITA_VCA1330"),
    assetsTotal: accountBalance(vca, "ITA_VCA1140", "ITA_VCA1340"),

    // Liabilities
    accountsPayable: accountBalance(vca, "ITA_VCA1410", "ITA_VCA1510"),
    borrowings: accountBalance(vca, "ITA_VCA1420", "ITA_VCA1520"),
    otherCurrentLiabilities: accountBalance(vca, "ITA_VCA1430", "ITA_VCA1530"),
    liabilitiesTotal: accountBalance(vca, "ITA_VCA1440", "ITA_VCA1540"),

    // Equity
    ownerEquity: accountBalance(vca, "ITA_VCA1610", "ITA_VCA1710"),
    ownerDrawings: accountBalance(vca, "ITA_VCA1620", "ITA_VCA1720"),
    ownerContributions: accountBalance(vca, "ITA_VCA1630", "ITA_VCA1730"),
    retainedEarnings: yenField(vca, "ITA_VCA1640"),
    equityTotal: accountBalance(vca, "ITA_VCA1650", "ITA_VCA1750"),
  };
}

function buildTaxFormA(aba: Map<string, string>): TaxFormA {
  return {
    businessIncome: yenField(aba, "ITA_ABA0010"),
    realEstateIncome: yenField(aba, "ITA_ABA0020"),
    otherIncome: yenField(aba, "ITA_ABA0030"),
    businessProfit: yenField(aba, "ITA_ABA0110"),
    realEstateProfit: yenField(aba, "ITA_ABA0120"),
    totalIncome: yenField(aba, "ITA_ABA0130"),
    totalDeductions: yenField(aba, "ITA_ABA0280"),
    blueReturnDeduction: yenField(aba, "ITA_ABA0290"),
    taxableIncome: yenField(aba, "ITA_ABA0310"),
    incomeTax: yenField(aba, "ITA_ABA0320"),
    taxDue: yenField(aba, "ITA_ABA0360"),
  };
}

function buildTaxFormB(abb: Map<string, string>): TaxFormB {
  return {
    incomeDetails: [
      {
        type: abb.get("ITA_ABB0010") ?? "",
        payer: abb.get("ITA_ABB0020") ?? "",
        amount: yenField(abb, "ITA_ABB0030"),
        withheld: yenField(abb, "ITA_ABB0040"),
      },
    ],
    socialInsurance: yenField(abb, "ITA_ABB0110"),
    smallBusinessMutualAid: yenField(abb, "ITA_ABB0120"),
    lifeInsurance: yenField(abb, "ITA_ABB0130"),
    earthquakeInsurance: yenField(abb, "ITA_ABB0140"),
    spouseDeduction: yenField(abb, "ITA_ABB0210"),
    dependentDeduction: yenField(abb, "ITA_ABB0220"),
    basicDeduction: yenField(abb, "ITA_ABB0230"),
  };
}

function buildDefaultFiscalYear(): FiscalYear {
  return {
    nengo: 5,
    year: 2023,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  };
}

function buildEmptyDepreciationSchedule(): DepreciationSchedule {
  return {
    assets: [],
    totalDepreciation: yen(0),
    totalBusinessDepreciation: yen(0),
  };
}

/** Convert a ParsedXtxFile into a typed TaxReturn. */
export function normalize(parsed: ParsedXtxFile): TaxReturn {
  const vca = getFormFields(parsed, "VCA");
  const aba = getFormFields(parsed, "ABA");
  const abb = getFormFields(parsed, "ABB");
  const formTypes = detectForms(parsed);

  return {
    fiscalYear: buildDefaultFiscalYear(),
    incomeStatement: buildIncomeStatement(vca),
    balanceSheet: buildBalanceSheet(vca),
    taxFormA: buildTaxFormA(aba),
    taxFormB: buildTaxFormB(abb),
    depreciationSchedule: buildEmptyDepreciationSchedule(),
    metadata: {
      filePath: "",
      formTypes,
    },
  };
}
