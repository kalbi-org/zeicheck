import { describe, expect, it } from "vitest";
import { yen } from "../../../src/models/types.js";
import {
  add,
  equals,
  formatYen,
  isNonNegative,
  subtract,
  sum,
} from "../../../src/utils/monetary.js";

describe("monetary utilities", () => {
  describe("yen()", () => {
    it("truncates decimal values", () => {
      expect(yen(1234.56)).toBe(1234);
    });

    it("passes through integers unchanged", () => {
      expect(yen(1000)).toBe(1000);
    });

    it("handles negative decimals", () => {
      expect(yen(-99.9)).toBe(-99);
    });
  });

  describe("add()", () => {
    it("adds two yen amounts", () => {
      expect(add(yen(100), yen(200))).toBe(300);
    });

    it("handles zero", () => {
      expect(add(yen(0), yen(500))).toBe(500);
    });
  });

  describe("subtract()", () => {
    it("subtracts b from a", () => {
      expect(subtract(yen(500), yen(200))).toBe(300);
    });

    it("can produce negative results", () => {
      expect(subtract(yen(100), yen(500))).toBe(-400);
    });
  });

  describe("sum()", () => {
    it("sums an array of yen values", () => {
      expect(sum([yen(100), yen(200), yen(300)])).toBe(600);
    });

    it("returns 0 for empty array", () => {
      expect(sum([])).toBe(0);
    });
  });

  describe("isNonNegative()", () => {
    it("returns true for positive", () => {
      expect(isNonNegative(yen(100))).toBe(true);
    });

    it("returns true for zero", () => {
      expect(isNonNegative(yen(0))).toBe(true);
    });

    it("returns false for negative", () => {
      expect(isNonNegative(yen(-1))).toBe(false);
    });
  });

  describe("equals()", () => {
    it("returns true for equal amounts", () => {
      expect(equals(yen(500), yen(500))).toBe(true);
    });

    it("returns false for different amounts", () => {
      expect(equals(yen(500), yen(501))).toBe(false);
    });
  });

  describe("formatYen()", () => {
    it("formats with comma separators", () => {
      expect(formatYen(yen(1234567))).toBe("1,234,567");
    });

    it("formats zero", () => {
      expect(formatYen(yen(0))).toBe("0");
    });

    it("formats negative amounts", () => {
      const formatted = formatYen(yen(-500000));
      expect(formatted).toBe("-500,000");
    });
  });
});
