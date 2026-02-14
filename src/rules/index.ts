import type { Rule } from "./types.js";

// Core rules
import { bsEquationRule } from "./balance-sheet/bs-equation.js";
import { plArithmeticChainRule } from "./income-statement/pl-arithmetic-chain.js";
import { cogsCalculationRule } from "./income-statement/cogs-calculation.js";
import { expenseTotalRule } from "./income-statement/expense-total.js";
import { bsPlBridgeRule } from "./cross-statement/bs-pl-bridge.js";

// Balance sheet rules
import { openingOwnerEquityRule } from "./balance-sheet/opening-owner-equity.js";
import { motoireKinFormulaRule } from "./balance-sheet/motoire-kin-formula.js";
import { nonNegativeCashRule } from "./balance-sheet/non-negative-cash.js";

// Deduction rules
import { blueDeductionCapRule } from "./deductions/blue-deduction-cap.js";
import { blueDeductionEligibilityRule } from "./deductions/blue-deduction-eligibility.js";

// Depreciation rules
import { usefulLifeRatesRule } from "./depreciation/useful-life-rates.js";
import { smallAssetThresholdRule } from "./depreciation/small-asset-threshold.js";

// Cross-statement rules
import { decisionToReturnRule } from "./cross-statement/decision-to-return.js";
import { depreciationSumRule } from "./cross-statement/depreciation-sum.js";

// Continuity rules
import { openingClosingMatchRule } from "./continuity/opening-closing-match.js";
import { yearOverYearChangeRule } from "./continuity/year-over-year-change.js";

// Home office rules
import { reasonableRatioRule } from "./home-office/reasonable-ratio.js";

const ruleRegistry = new Map<string, Rule>();

export function registerRule(rule: Rule): void {
  ruleRegistry.set(rule.meta.id, rule);
}

export function getAllRules(): Rule[] {
  return [...ruleRegistry.values()];
}

export function getRule(id: string): Rule | undefined {
  return ruleRegistry.get(id);
}

// Register all rules
registerRule(bsEquationRule);
registerRule(openingOwnerEquityRule);
registerRule(motoireKinFormulaRule);
registerRule(nonNegativeCashRule);
registerRule(plArithmeticChainRule);
registerRule(cogsCalculationRule);
registerRule(expenseTotalRule);
registerRule(bsPlBridgeRule);
registerRule(decisionToReturnRule);
registerRule(depreciationSumRule);
registerRule(blueDeductionCapRule);
registerRule(blueDeductionEligibilityRule);
registerRule(usefulLifeRatesRule);
registerRule(smallAssetThresholdRule);
registerRule(openingClosingMatchRule);
registerRule(yearOverYearChangeRule);
registerRule(reasonableRatioRule);

export type { Rule, RuleContext, RuleConfig, ResolvedConfig, RuleDiagnostic, RuleMeta, Severity } from "./types.js";
export { runRules } from "./rule-runner.js";
