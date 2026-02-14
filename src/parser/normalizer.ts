/**
 * Normalizes a ParsedXtxFile into a typed TaxReturn model.
 */

import type { BalanceSheet } from "../models/balance-sheet.js";
import type { CorporateBalanceSheet } from "../models/corporate-balance-sheet.js";
import type { CorporateIncomeStatement } from "../models/corporate-income-statement.js";
import type {
  CorporateInfo,
  CorporateTaxFormMain,
  IncomeAdjustmentSchedule,
} from "../models/corporate-tax-form.js";
import type { DepreciationSchedule } from "../models/depreciation-schedule.js";
import type { IncomeStatement } from "../models/income-statement.js";
import type { TaxFormA, TaxFormB } from "../models/tax-form.js";
import {
  FormType,
  yen,
  type AccountBalance,
  type FiscalYear,
  type Yen,
} from "../models/types.js";
import type {
  SoleProprietorReturn,
  IndividualReturn,
  CorporateReturn,
  TaxReturn,
} from "../models/tax-return.js";
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

function getFormFields(
  parsed: ParsedXtxFile,
  formType: string,
): Map<string, string> {
  const form = parsed.forms.find((f) => f.formType === formType);
  return form?.fields ?? new Map();
}

// ── Sole Proprietor builders ──

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

// ── Corporate builders ──

function buildCorporateIncomeStatement(
  hok: Map<string, string>,
): CorporateIncomeStatement {
  return {
    revenue: yenField(hok, "ITA_HOK0010"),
    cogs: {
      openingInventory: yenField(hok, "ITA_HOK0020"),
      purchases: yenField(hok, "ITA_HOK0030"),
      closingInventory: yenField(hok, "ITA_HOK0040"),
      total: yenField(hok, "ITA_HOK0050"),
    },
    grossProfit: yenField(hok, "ITA_HOK0060"),
    expenses: {
      taxes: yenField(hok, "ITA_HOK0100"),
      insurance: yenField(hok, "ITA_HOK0110"),
      repairs: yenField(hok, "ITA_HOK0120"),
      depreciation: yenField(hok, "ITA_HOK0130"),
      welfare: yenField(hok, "ITA_HOK0140"),
      salaries: yenField(hok, "ITA_HOK0150"),
      outsourcing: yenField(hok, "ITA_HOK0160"),
      interest: yenField(hok, "ITA_HOK0170"),
      rent: yenField(hok, "ITA_HOK0180"),
      retirement: yenField(hok, "ITA_HOK0190"),
      utilities: yenField(hok, "ITA_HOK0200"),
      travel: yenField(hok, "ITA_HOK0210"),
      communication: yenField(hok, "ITA_HOK0220"),
      advertising: yenField(hok, "ITA_HOK0230"),
      entertainment: yenField(hok, "ITA_HOK0240"),
      consumables: yenField(hok, "ITA_HOK0250"),
      miscellaneous: yenField(hok, "ITA_HOK0260"),
      otherExpenses: yenField(hok, "ITA_HOK0270"),
    },
    totalExpenses: yenField(hok, "ITA_HOK0280"),
    operatingIncome: yenField(hok, "ITA_HOK0290"),
    nonOperatingIncome: yenField(hok, "ITA_HOK0300"),
    nonOperatingExpenses: yenField(hok, "ITA_HOK0310"),
    ordinaryIncome: yenField(hok, "ITA_HOK0320"),
    extraordinaryGain: yenField(hok, "ITA_HOK0330"),
    extraordinaryLoss: yenField(hok, "ITA_HOK0340"),
    preTaxIncome: yenField(hok, "ITA_HOK0350"),
    corporateTax: yenField(hok, "ITA_HOK0360"),
    netIncome: yenField(hok, "ITA_HOK0370"),
  };
}

function buildCorporateBalanceSheet(
  hok: Map<string, string>,
): CorporateBalanceSheet {
  return {
    // Assets
    cash: accountBalance(hok, "ITA_HOK1010", "ITA_HOK1210"),
    deposits: accountBalance(hok, "ITA_HOK1020", "ITA_HOK1220"),
    accountsReceivable: accountBalance(hok, "ITA_HOK1030", "ITA_HOK1230"),
    inventory: accountBalance(hok, "ITA_HOK1040", "ITA_HOK1240"),
    otherCurrentAssets: accountBalance(hok, "ITA_HOK1050", "ITA_HOK1250"),
    buildings: accountBalance(hok, "ITA_HOK1060", "ITA_HOK1260"),
    buildingImprovements: accountBalance(hok, "ITA_HOK1070", "ITA_HOK1270"),
    machinery: accountBalance(hok, "ITA_HOK1080", "ITA_HOK1280"),
    vehicles: accountBalance(hok, "ITA_HOK1090", "ITA_HOK1290"),
    tools: accountBalance(hok, "ITA_HOK1100", "ITA_HOK1300"),
    land: accountBalance(hok, "ITA_HOK1110", "ITA_HOK1310"),
    otherFixedAssets: accountBalance(hok, "ITA_HOK1120", "ITA_HOK1320"),
    accumulatedDepreciation: accountBalance(hok, "ITA_HOK1130", "ITA_HOK1330"),
    assetsTotal: accountBalance(hok, "ITA_HOK1140", "ITA_HOK1340"),

    // Liabilities
    accountsPayable: accountBalance(hok, "ITA_HOK1410", "ITA_HOK1510"),
    borrowings: accountBalance(hok, "ITA_HOK1420", "ITA_HOK1520"),
    accruedExpenses: accountBalance(hok, "ITA_HOK1430", "ITA_HOK1530"),
    corporateTaxPayable: accountBalance(hok, "ITA_HOK1440", "ITA_HOK1540"),
    otherCurrentLiabilities: accountBalance(hok, "ITA_HOK1450", "ITA_HOK1550"),
    liabilitiesTotal: accountBalance(hok, "ITA_HOK1460", "ITA_HOK1560"),

    // Net Assets
    capitalStock: accountBalance(hok, "ITA_HOK1610", "ITA_HOK1710"),
    capitalSurplus: accountBalance(hok, "ITA_HOK1620", "ITA_HOK1720"),
    retainedEarnings: accountBalance(hok, "ITA_HOK1630", "ITA_HOK1730"),
    netIncome: yenField(hok, "ITA_HOK0370"),
    equityTotal: accountBalance(hok, "ITA_HOK1650", "ITA_HOK1750"),
  };
}

function buildCorporateTaxForm(hoa: Map<string, string>): CorporateTaxFormMain {
  return {
    taxableIncome: yenField(hoa, "ITA_HOA0010"),
    corporateTaxAmount: yenField(hoa, "ITA_HOA0020"),
    taxCredits: yenField(hoa, "ITA_HOA0030"),
    localCorporateTax: yenField(hoa, "ITA_HOA0040"),
    taxDue: yenField(hoa, "ITA_HOA0050"),
  };
}

function buildIncomeAdjustment(
  hod: Map<string, string>,
): IncomeAdjustmentSchedule {
  return {
    accountingProfit: yenField(hod, "ITA_HOD0010"),
    addBackTotal: yenField(hod, "ITA_HOD0020"),
    deductionTotal: yenField(hod, "ITA_HOD0030"),
    taxableIncome: yenField(hod, "ITA_HOD0040"),
  };
}

function buildCorporateInfo(hok: Map<string, string>): CorporateInfo {
  const capitalRaw = hok.get("ITA_HOK1710");
  const capitalAmount = yen(capitalRaw ? Number(capitalRaw) : 0);
  const monthsRaw = hok.get("ITA_HOK9010");
  const fiscalYearMonths = monthsRaw ? Number(monthsRaw) : 12;
  const officerRaw = hok.get("ITA_HOK9020");
  const officerCount = officerRaw ? Number(officerRaw) : 1;

  return {
    capitalAmount,
    fiscalYearMonths,
    isSmallCorp: capitalAmount <= 10_000_000,
    officerCount,
  };
}

// ── Shared helpers ──

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

/** Check if the parsed file contains corporate form types (HOK). */
function isCorporateReturn(parsed: ParsedXtxFile): boolean {
  return parsed.forms.some((f) => f.formType === "HOK");
}

/** Check if the parsed file contains sole-proprietor form types (VCA). */
function isSoleProprietorReturn(parsed: ParsedXtxFile): boolean {
  return parsed.forms.some((f) => f.formType === "VCA");
}

/** Normalize as sole-proprietor return (個人事業主・青色申告). */
function normalizeSoleProprietor(
  parsed: ParsedXtxFile,
  formTypes: FormType[],
): SoleProprietorReturn {
  const vca = getFormFields(parsed, "VCA");
  const aba = getFormFields(parsed, "ABA");
  const abb = getFormFields(parsed, "ABB");

  return {
    returnType: "sole-proprietor",
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

/** Normalize as individual return (給与所得者等の確定申告). */
function normalizeIndividual(
  parsed: ParsedXtxFile,
  formTypes: FormType[],
): IndividualReturn {
  const aba = getFormFields(parsed, "ABA");
  const abb = getFormFields(parsed, "ABB");

  return {
    returnType: "individual",
    fiscalYear: buildDefaultFiscalYear(),
    taxFormA: buildTaxFormA(aba),
    taxFormB: buildTaxFormB(abb),
    metadata: {
      filePath: "",
      formTypes,
    },
  };
}

/** Normalize as corporate return. */
function normalizeCorporate(
  parsed: ParsedXtxFile,
  formTypes: FormType[],
): CorporateReturn {
  const hok = getFormFields(parsed, "HOK");
  const hoa = getFormFields(parsed, "HOA");
  const hod = getFormFields(parsed, "HOD");

  return {
    returnType: "corporate",
    fiscalYear: buildDefaultFiscalYear(),
    incomeStatement: buildCorporateIncomeStatement(hok),
    balanceSheet: buildCorporateBalanceSheet(hok),
    corporateTaxForm: buildCorporateTaxForm(hoa),
    incomeAdjustment: buildIncomeAdjustment(hod),
    corporateInfo: buildCorporateInfo(hok),
    depreciationSchedule: buildEmptyDepreciationSchedule(),
    metadata: {
      filePath: "",
      formTypes,
    },
  };
}

/**
 * Convert a ParsedXtxFile into a typed TaxReturn.
 *
 * Detection order:
 *   1. HOK form present → corporate
 *   2. VCA form present → sole-proprietor (個人事業主)
 *   3. Otherwise        → individual (給与所得者等)
 */
export function normalize(parsed: ParsedXtxFile): TaxReturn {
  const formTypes = detectForms(parsed);

  if (isCorporateReturn(parsed)) {
    return normalizeCorporate(parsed, formTypes);
  }

  if (isSoleProprietorReturn(parsed)) {
    return normalizeSoleProprietor(parsed, formTypes);
  }

  return normalizeIndividual(parsed, formTypes);
}
