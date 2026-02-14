/**
 * Test factories for building TaxReturn and sub-models with sensible defaults.
 */

import type { BalanceSheet } from "../../src/models/balance-sheet.js";
import type { CorporateBalanceSheet } from "../../src/models/corporate-balance-sheet.js";
import type { CorporateIncomeStatement } from "../../src/models/corporate-income-statement.js";
import type {
  CorporateInfo,
  CorporateTaxFormMain,
  IncomeAdjustmentSchedule,
} from "../../src/models/corporate-tax-form.js";
import type { DepreciationSchedule } from "../../src/models/depreciation-schedule.js";
import type {
  CostOfGoodsSold,
  ExpenseBreakdown,
  IncomeStatement,
} from "../../src/models/income-statement.js";
import type { TaxFormA, TaxFormB } from "../../src/models/tax-form.js";
import type {
  IndividualReturn,
  SoleProprietorReturn,
  CorporateReturn,
} from "../../src/models/tax-return.js";
import type { AccountBalance, FiscalYear } from "../../src/models/types.js";
import { FormType, yen } from "../../src/models/types.js";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function ab(opening: number, closing: number): AccountBalance {
  return { opening: yen(opening), closing: yen(closing) };
}

function zero(): AccountBalance {
  return ab(0, 0);
}

export function buildFiscalYear(overrides?: Partial<FiscalYear>): FiscalYear {
  return {
    nengo: 5,
    year: 2023,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    ...overrides,
  };
}

export function buildBalanceSheet(
  overrides?: DeepPartial<BalanceSheet>,
): BalanceSheet {
  // Default: small service business
  // Assets: cash 500,000 + deposits 2,000,000 = 2,500,000
  // Liabilities: 0
  // Equity: owner equity 1,500,000 + retained earnings 1,000,000 = 2,500,000
  const defaults: BalanceSheet = {
    cash: ab(300000, 500000),
    deposits: ab(1200000, 2000000),
    accountsReceivable: zero(),
    inventory: zero(),
    otherCurrentAssets: zero(),
    buildings: zero(),
    buildingImprovements: zero(),
    machinery: zero(),
    vehicles: zero(),
    tools: zero(),
    land: zero(),
    otherFixedAssets: zero(),
    accumulatedDepreciation: zero(),
    assetsTotal: ab(1500000, 2500000),
    accountsPayable: zero(),
    borrowings: zero(),
    otherCurrentLiabilities: zero(),
    liabilitiesTotal: zero(),
    ownerEquity: ab(1500000, 1500000),
    ownerDrawings: ab(0, 0),
    ownerContributions: ab(0, 0),
    retainedEarnings: yen(1000000),
    equityTotal: ab(1500000, 2500000),
  };

  if (!overrides) return defaults;
  return deepMerge(defaults, overrides) as BalanceSheet;
}

export function buildExpenses(
  overrides?: Partial<ExpenseBreakdown>,
): ExpenseBreakdown {
  return {
    salaries: yen(0),
    outsourcing: yen(0),
    retirement: yen(0),
    rent: yen(300000),
    interest: yen(0),
    taxes: yen(50000),
    insurance: yen(0),
    repairs: yen(0),
    consumables: yen(100000),
    depreciation: yen(0),
    welfare: yen(0),
    utilities: yen(60000),
    travel: yen(40000),
    communication: yen(50000),
    advertising: yen(0),
    entertainment: yen(0),
    miscellaneous: yen(0),
    otherExpenses: yen(0),
    ...overrides,
  };
}

export function buildCogs(
  overrides?: Partial<CostOfGoodsSold>,
): CostOfGoodsSold {
  return {
    openingInventory: yen(0),
    purchases: yen(0),
    closingInventory: yen(0),
    total: yen(0),
    ...overrides,
  };
}

export function buildIncomeStatement(
  overrides?: DeepPartial<IncomeStatement>,
): IncomeStatement {
  const expenses = buildExpenses(
    overrides?.expenses as Partial<ExpenseBreakdown> | undefined,
  );
  const cogs = buildCogs(
    overrides?.cogs as Partial<CostOfGoodsSold> | undefined,
  );

  const defaults: IncomeStatement = {
    revenue: yen(1600000),
    cogs,
    grossProfit: yen(1600000),
    expenses,
    totalExpenses: yen(600000),
    operatingIncome: yen(1000000),
  };

  if (!overrides) return defaults;

  return {
    ...defaults,
    ...overrides,
    expenses,
    cogs,
  } as IncomeStatement;
}

export function buildDepreciationSchedule(
  overrides?: DeepPartial<DepreciationSchedule>,
): DepreciationSchedule {
  return {
    assets: [],
    totalDepreciation: yen(0),
    totalBusinessDepreciation: yen(0),
    ...(overrides as Partial<DepreciationSchedule>),
  };
}

export function buildTaxFormA(overrides?: Partial<TaxFormA>): TaxFormA {
  return {
    businessIncome: yen(1600000),
    realEstateIncome: yen(0),
    otherIncome: yen(0),
    businessProfit: yen(1000000),
    realEstateProfit: yen(0),
    totalIncome: yen(1000000),
    totalDeductions: yen(480000),
    blueReturnDeduction: yen(650000),
    taxableIncome: yen(350000),
    incomeTax: yen(17500),
    taxDue: yen(17500),
    ...overrides,
  };
}

export function buildTaxFormB(overrides?: DeepPartial<TaxFormB>): TaxFormB {
  return {
    incomeDetails: [],
    socialInsurance: yen(200000),
    smallBusinessMutualAid: yen(0),
    lifeInsurance: yen(40000),
    earthquakeInsurance: yen(0),
    spouseDeduction: yen(0),
    dependentDeduction: yen(0),
    basicDeduction: yen(480000),
    ...(overrides as Partial<TaxFormB>),
  };
}

export function buildSoleProprietorReturn(
  overrides?: DeepPartial<SoleProprietorReturn>,
): SoleProprietorReturn {
  return {
    returnType: "sole-proprietor",
    fiscalYear: buildFiscalYear(overrides?.fiscalYear as Partial<FiscalYear>),
    balanceSheet: buildBalanceSheet(overrides?.balanceSheet),
    incomeStatement: buildIncomeStatement(overrides?.incomeStatement),
    depreciationSchedule: buildDepreciationSchedule(
      overrides?.depreciationSchedule,
    ),
    taxFormA: buildTaxFormA(overrides?.taxFormA as Partial<TaxFormA>),
    taxFormB: buildTaxFormB(overrides?.taxFormB),
    metadata: {
      filePath: "test.xtx",
      formTypes: [FormType.ABA, FormType.ABB, FormType.VCA],
      ...(overrides?.metadata as Partial<SoleProprietorReturn["metadata"]>),
    },
  };
}

/** @deprecated Use buildSoleProprietorReturn instead */
export const buildTaxReturn = buildSoleProprietorReturn;

export function buildIndividualReturn(
  overrides?: DeepPartial<IndividualReturn>,
): IndividualReturn {
  return {
    returnType: "individual",
    fiscalYear: buildFiscalYear(overrides?.fiscalYear as Partial<FiscalYear>),
    taxFormA: buildTaxFormA(overrides?.taxFormA as Partial<TaxFormA>),
    taxFormB: buildTaxFormB(overrides?.taxFormB),
    metadata: {
      filePath: "test-individual.xtx",
      formTypes: [FormType.ABA, FormType.ABB],
      ...(overrides?.metadata as Partial<IndividualReturn["metadata"]>),
    },
  };
}

// ── Corporate Factories ──

export function buildCorporateBalanceSheet(
  overrides?: DeepPartial<CorporateBalanceSheet>,
): CorporateBalanceSheet {
  // Default: micro-corp with 1M capital, 500K net income
  // Assets: cash 500K + deposits 3M = 3.5M
  // Liabilities: 0
  // Equity: capital 1M + retained 2M + net 500K = 3.5M
  const defaults: CorporateBalanceSheet = {
    cash: ab(300000, 500000),
    deposits: ab(2700000, 3000000),
    accountsReceivable: zero(),
    inventory: zero(),
    otherCurrentAssets: zero(),
    buildings: zero(),
    buildingImprovements: zero(),
    machinery: zero(),
    vehicles: zero(),
    tools: zero(),
    land: zero(),
    otherFixedAssets: zero(),
    accumulatedDepreciation: zero(),
    assetsTotal: ab(3000000, 3500000),
    accountsPayable: zero(),
    borrowings: zero(),
    accruedExpenses: zero(),
    corporateTaxPayable: zero(),
    otherCurrentLiabilities: zero(),
    liabilitiesTotal: zero(),
    capitalStock: ab(1000000, 1000000),
    capitalSurplus: zero(),
    retainedEarnings: ab(2000000, 2500000),
    netIncome: yen(500000),
    equityTotal: ab(3000000, 3500000),
  };

  if (!overrides) return defaults;
  return deepMerge(defaults, overrides) as CorporateBalanceSheet;
}

export function buildCorporateIncomeStatement(
  overrides?: DeepPartial<CorporateIncomeStatement>,
): CorporateIncomeStatement {
  const expenses = buildExpenses(
    overrides?.expenses as Partial<ExpenseBreakdown> | undefined,
  );
  const cogs = buildCogs(
    overrides?.cogs as Partial<CostOfGoodsSold> | undefined,
  );

  const defaults: CorporateIncomeStatement = {
    revenue: yen(5000000),
    cogs,
    grossProfit: yen(5000000),
    expenses,
    totalExpenses: yen(600000),
    operatingIncome: yen(4400000),
    nonOperatingIncome: yen(0),
    nonOperatingExpenses: yen(0),
    ordinaryIncome: yen(4400000),
    extraordinaryGain: yen(0),
    extraordinaryLoss: yen(0),
    preTaxIncome: yen(4400000),
    corporateTax: yen(900000),
    netIncome: yen(3500000),
  };

  if (!overrides) return defaults;

  return {
    ...defaults,
    ...overrides,
    expenses,
    cogs,
  } as CorporateIncomeStatement;
}

export function buildCorporateTaxForm(
  overrides?: Partial<CorporateTaxFormMain>,
): CorporateTaxFormMain {
  return {
    taxableIncome: yen(4400000),
    corporateTaxAmount: yen(660000),
    taxCredits: yen(0),
    taxDue: yen(660000),
    ...overrides,
  };
}

export function buildIncomeAdjustment(
  overrides?: Partial<IncomeAdjustmentSchedule>,
): IncomeAdjustmentSchedule {
  return {
    accountingProfit: yen(4400000),
    addBackTotal: yen(0),
    deductionTotal: yen(0),
    taxableIncome: yen(4400000),
    ...overrides,
  };
}

export function buildCorporateInfo(
  overrides?: Partial<CorporateInfo>,
): CorporateInfo {
  return {
    capitalAmount: yen(1000000),
    fiscalYearMonths: 12,
    isSmallCorp: true,
    officerCount: 1,
    ...overrides,
  };
}

export function buildCorporateReturn(
  overrides?: DeepPartial<CorporateReturn>,
): CorporateReturn {
  return {
    returnType: "corporate",
    fiscalYear: buildFiscalYear(overrides?.fiscalYear as Partial<FiscalYear>),
    balanceSheet: buildCorporateBalanceSheet(
      overrides?.balanceSheet as DeepPartial<CorporateBalanceSheet>,
    ),
    incomeStatement: buildCorporateIncomeStatement(
      overrides?.incomeStatement as DeepPartial<CorporateIncomeStatement>,
    ),
    depreciationSchedule: buildDepreciationSchedule(
      overrides?.depreciationSchedule,
    ),
    corporateTaxForm: buildCorporateTaxForm(
      overrides?.corporateTaxForm as Partial<CorporateTaxFormMain>,
    ),
    incomeAdjustment: buildIncomeAdjustment(
      overrides?.incomeAdjustment as Partial<IncomeAdjustmentSchedule>,
    ),
    corporateInfo: buildCorporateInfo(
      overrides?.corporateInfo as Partial<CorporateInfo>,
    ),
    metadata: {
      filePath: "test-corp.xtx",
      formTypes: [FormType.HOA110, FormType.HOA410],
      ...(overrides?.metadata as Partial<CorporateReturn["metadata"]>),
    },
  };
}

// ── Helpers ──

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== null &&
      sv !== undefined &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv !== null &&
      tv !== undefined &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else if (sv !== undefined) {
      result[key] = sv;
    }
  }
  return result;
}
