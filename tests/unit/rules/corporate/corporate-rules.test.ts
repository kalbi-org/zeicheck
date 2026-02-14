import { describe, it, expect } from "vitest";
import { yen } from "../../../../src/models/types.js";
import type { ResolvedConfig } from "../../../../src/rules/types.js";
import {
  buildCorporateReturn,
} from "../../../helpers/factories.js";

import { corporateBsEquationRule } from "../../../../src/rules/corporate/bs-equation.js";
import { corporatePlChainRule } from "../../../../src/rules/corporate/pl-chain.js";
import { corporateExpenseTotalRule } from "../../../../src/rules/corporate/expense-total.js";
import { corporateBsPlBridgeRule } from "../../../../src/rules/corporate/bs-pl-bridge.js";
import { betsu4AccountingProfitRule } from "../../../../src/rules/corporate/betsu4-accounting-profit.js";
import { betsu4TaxableIncomeRule } from "../../../../src/rules/corporate/betsu4-taxable-income.js";
import { betsu1MatchRule } from "../../../../src/rules/corporate/betsu1-match.js";
import { capitalUnder10mRule } from "../../../../src/rules/corporate/capital-under-10m.js";
import { officerCompensationRule } from "../../../../src/rules/corporate/officer-compensation.js";
import { entertainmentLimitRule } from "../../../../src/rules/corporate/entertainment-limit.js";
import { smallCorpTaxRateRule } from "../../../../src/rules/corporate/small-corp-tax-rate.js";
import { retainedEarningsContinuityRule } from "../../../../src/rules/corporate/retained-earnings-continuity.js";

const defaultConfig: ResolvedConfig = {
  rules: {},
  format: "stylish",
  warningsAsErrors: false,
};

function ctx(overrides?: Parameters<typeof buildCorporateReturn>[0]) {
  return { taxReturn: buildCorporateReturn(overrides), config: defaultConfig };
}

// ── corporate/bs-equation ──

describe("corporate/bs-equation", () => {
  it("passes when B/S equation holds", () => {
    const result = corporateBsEquationRule.check(ctx());
    expect(result).toHaveLength(0);
  });

  it("detects closing balance mismatch", () => {
    const result = corporateBsEquationRule.check(
      ctx({
        balanceSheet: {
          assetsTotal: { closing: yen(9999999) },
        },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.ruleId).toBe("corporate/bs-equation");
  });

  it("detects opening balance mismatch", () => {
    const result = corporateBsEquationRule.check(
      ctx({
        balanceSheet: {
          assetsTotal: { opening: yen(1) },
        },
      }),
    );
    expect(result).toHaveLength(1);
  });
});

// ── corporate/pl-chain ──

describe("corporate/pl-chain", () => {
  it("passes when full P/L chain is correct", () => {
    const result = corporatePlChainRule.check(
      ctx({
        incomeStatement: {
          revenue: yen(10000000),
          grossProfit: yen(10000000),
          totalExpenses: yen(3000000),
          operatingIncome: yen(7000000),
          nonOperatingIncome: yen(100000),
          nonOperatingExpenses: yen(50000),
          ordinaryIncome: yen(7050000),
          extraordinaryGain: yen(0),
          extraordinaryLoss: yen(0),
          preTaxIncome: yen(7050000),
          corporateTax: yen(1500000),
          netIncome: yen(5550000),
        },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("detects ordinaryIncome mismatch", () => {
    const result = corporatePlChainRule.check(
      ctx({
        incomeStatement: {
          operatingIncome: yen(4400000),
          nonOperatingIncome: yen(100000),
          nonOperatingExpenses: yen(50000),
          ordinaryIncome: yen(9999999), // wrong
        },
      }),
    );
    expect(result.some((d) => d.message.includes("経常利益"))).toBe(true);
  });

  it("detects netIncome mismatch", () => {
    const result = corporatePlChainRule.check(
      ctx({
        incomeStatement: {
          preTaxIncome: yen(4400000),
          corporateTax: yen(900000),
          netIncome: yen(0), // wrong
        },
      }),
    );
    expect(result.some((d) => d.message.includes("当期純利益"))).toBe(true);
  });
});

// ── corporate/expense-total ──

describe("corporate/expense-total", () => {
  it("passes when expense total matches", () => {
    const result = corporateExpenseTotalRule.check(ctx());
    expect(result).toHaveLength(0);
  });

  it("detects expense total mismatch", () => {
    const result = corporateExpenseTotalRule.check(
      ctx({
        incomeStatement: {
          totalExpenses: yen(999999),
        },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.ruleId).toBe("corporate/expense-total");
  });
});

// ── corporate/bs-pl-bridge ──

describe("corporate/bs-pl-bridge", () => {
  it("passes when B/S and P/L net income match", () => {
    const result = corporateBsPlBridgeRule.check(
      ctx({
        balanceSheet: { netIncome: yen(3500000) },
        incomeStatement: { netIncome: yen(3500000) },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("detects mismatch", () => {
    const result = corporateBsPlBridgeRule.check(
      ctx({
        balanceSheet: { netIncome: yen(100) },
        incomeStatement: { netIncome: yen(200) },
      }),
    );
    expect(result).toHaveLength(1);
  });
});

// ── corporate/betsu4-accounting-profit ──

describe("corporate/betsu4-accounting-profit", () => {
  it("passes when schedule4 profit matches P/L", () => {
    const result = betsu4AccountingProfitRule.check(
      ctx({
        incomeAdjustment: { accountingProfit: yen(4400000) },
        incomeStatement: { preTaxIncome: yen(4400000) },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("detects mismatch", () => {
    const result = betsu4AccountingProfitRule.check(
      ctx({
        incomeAdjustment: { accountingProfit: yen(1000) },
        incomeStatement: { preTaxIncome: yen(4400000) },
      }),
    );
    expect(result).toHaveLength(1);
  });
});

// ── corporate/betsu4-taxable-income ──

describe("corporate/betsu4-taxable-income", () => {
  it("passes when computation is correct", () => {
    const result = betsu4TaxableIncomeRule.check(
      ctx({
        incomeAdjustment: {
          accountingProfit: yen(4000000),
          addBackTotal: yen(500000),
          deductionTotal: yen(100000),
          taxableIncome: yen(4400000),
        },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("detects computation mismatch", () => {
    const result = betsu4TaxableIncomeRule.check(
      ctx({
        incomeAdjustment: {
          accountingProfit: yen(4000000),
          addBackTotal: yen(500000),
          deductionTotal: yen(100000),
          taxableIncome: yen(9999999),
        },
      }),
    );
    expect(result).toHaveLength(1);
  });
});

// ── corporate/betsu1-match ──

describe("corporate/betsu1-match", () => {
  it("passes when betsu1 and betsu4 income match", () => {
    const result = betsu1MatchRule.check(
      ctx({
        corporateTaxForm: { taxableIncome: yen(4400000) },
        incomeAdjustment: { taxableIncome: yen(4400000) },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("detects mismatch", () => {
    const result = betsu1MatchRule.check(
      ctx({
        corporateTaxForm: { taxableIncome: yen(100) },
        incomeAdjustment: { taxableIncome: yen(200) },
      }),
    );
    expect(result).toHaveLength(1);
  });
});

// ── corporate/capital-under-10m ──

describe("corporate/capital-under-10m", () => {
  it("passes when capital is 10M or under", () => {
    const result = capitalUnder10mRule.check(
      ctx({ corporateInfo: { capitalAmount: yen(10_000_000) } }),
    );
    expect(result).toHaveLength(0);
  });

  it("warns when capital exceeds 10M", () => {
    const result = capitalUnder10mRule.check(
      ctx({ corporateInfo: { capitalAmount: yen(10_000_001) } }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("1,000万円");
  });
});

// ── corporate/officer-compensation ──

describe("corporate/officer-compensation", () => {
  it("passes with reasonable salary", () => {
    const result = officerCompensationRule.check(
      ctx({
        incomeStatement: {
          revenue: yen(5000000),
          expenses: { salaries: yen(2000000) },
          ordinaryIncome: yen(1000000),
        },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("warns when salary exceeds revenue", () => {
    const result = officerCompensationRule.check(
      ctx({
        incomeStatement: {
          revenue: yen(1000000),
          expenses: { salaries: yen(2000000) },
          ordinaryIncome: yen(-1000000),
        },
      }),
    );
    expect(result.some((d) => d.message.includes("売上高"))).toBe(true);
  });

  it("warns when salary causes operating loss", () => {
    const result = officerCompensationRule.check(
      ctx({
        incomeStatement: {
          revenue: yen(5000000),
          expenses: { salaries: yen(3000000) },
          ordinaryIncome: yen(-500000),
        },
      }),
    );
    expect(result.some((d) => d.message.includes("経常赤字"))).toBe(true);
  });

  it("skips when salary is zero", () => {
    const result = officerCompensationRule.check(
      ctx({
        incomeStatement: {
          expenses: { salaries: yen(0) },
        },
      }),
    );
    expect(result).toHaveLength(0);
  });
});

// ── corporate/entertainment-limit ──

describe("corporate/entertainment-limit", () => {
  it("passes when entertainment is within limit", () => {
    const result = entertainmentLimitRule.check(
      ctx({
        incomeStatement: { expenses: { entertainment: yen(7_000_000) } },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("warns when entertainment exceeds 8M", () => {
    const result = entertainmentLimitRule.check(
      ctx({
        incomeStatement: { expenses: { entertainment: yen(9_000_000) } },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("損金算入限度額");
  });

  it("prorates limit for short fiscal year", () => {
    const result = entertainmentLimitRule.check(
      ctx({
        incomeStatement: { expenses: { entertainment: yen(5_000_000) } },
        corporateInfo: { fiscalYearMonths: 6 },
      }),
    );
    // 6-month limit = 4M, 5M > 4M → should warn
    expect(result).toHaveLength(1);
  });

  it("skips when entertainment is zero", () => {
    const result = entertainmentLimitRule.check(ctx());
    expect(result).toHaveLength(0);
  });
});

// ── corporate/small-corp-tax-rate ──

describe("corporate/small-corp-tax-rate", () => {
  it("returns info when income exceeds 8M threshold", () => {
    const result = smallCorpTaxRateRule.check(
      ctx({
        incomeAdjustment: { taxableIncome: yen(10_000_000) },
        corporateInfo: { isSmallCorp: true },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.message).toContain("800万円");
  });

  it("no info when income is under 8M", () => {
    const result = smallCorpTaxRateRule.check(
      ctx({
        incomeAdjustment: { taxableIncome: yen(5_000_000) },
        corporateInfo: { isSmallCorp: true },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("skips non-small corp", () => {
    const result = smallCorpTaxRateRule.check(
      ctx({
        incomeAdjustment: { taxableIncome: yen(100_000_000) },
        corporateInfo: { isSmallCorp: false },
      }),
    );
    expect(result).toHaveLength(0);
  });
});

// ── corporate/retained-earnings-continuity ──

describe("corporate/retained-earnings-continuity", () => {
  it("passes when retained earnings = opening + net income", () => {
    const result = retainedEarningsContinuityRule.check(
      ctx({
        balanceSheet: {
          retainedEarnings: { opening: yen(2000000), closing: yen(2500000) },
          netIncome: yen(500000),
        },
      }),
    );
    expect(result).toHaveLength(0);
  });

  it("detects retained earnings discontinuity", () => {
    const result = retainedEarningsContinuityRule.check(
      ctx({
        balanceSheet: {
          retainedEarnings: { opening: yen(2000000), closing: yen(9999999) },
          netIncome: yen(500000),
        },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.ruleId).toBe("corporate/retained-earnings-continuity");
  });
});
