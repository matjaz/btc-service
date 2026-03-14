import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Re-implement the parser here to test it in isolation (it's not exported).
// This mirrors the implementation in lud-03.ts exactly.
function parseBolt11AmountMsat(pr: string): number | null {
  const match = pr.match(/^lnbc(\d+)([munp])?1/i);
  if (!match) return null;
  const amount = parseInt(match[1], 10);
  switch (match[2]) {
    case "m":
      return amount * 1e8;
    case "u":
      return amount * 1e5;
    case "n":
      return amount * 1e2;
    case "p":
      return amount / 10;
    default:
      return amount * 1e11;
  }
}

describe("parseBolt11AmountMsat", () => {
  it("parses nano-BTC (n) suffix correctly", () => {
    // lnbc1000n = 1000 * 100 msat = 100,000 msat
    assert.equal(parseBolt11AmountMsat("lnbc1000n1pjlj5pp..."), 100_000);
  });

  it("parses micro-BTC (u) suffix correctly", () => {
    // lnbc100u = 100 * 100,000 msat = 10,000,000 msat
    assert.equal(parseBolt11AmountMsat("lnbc100u1pjlj5pp..."), 10_000_000);
  });

  it("parses milli-BTC (m) suffix correctly", () => {
    // lnbc1m = 1 * 1e8 msat = 100,000,000 msat = 100,000 sats
    assert.equal(parseBolt11AmountMsat("lnbc1m1pjlj5pp..."), 100_000_000);
  });

  it("parses pico-BTC (p) suffix correctly", () => {
    // lnbc10p = 10 / 10 = 1 msat
    assert.equal(parseBolt11AmountMsat("lnbc10p1pjlj5pp..."), 1);
  });

  it("parses no-suffix (BTC) correctly", () => {
    // lnbc1 (no suffix) = 1 * 1e11 msat = 100,000,000,000 msat = 1 BTC
    assert.equal(parseBolt11AmountMsat("lnbc11pjlj5pp..."), 1e11);
  });

  it("returns null for invoice with no amount (lnbc followed directly by 1)", () => {
    // Amount-less invoice: no digits before the separator
    assert.equal(parseBolt11AmountMsat("lnbc1pjlj5pp..."), null);
  });

  it("returns null for non-mainnet prefix", () => {
    assert.equal(parseBolt11AmountMsat("lntb1000n1pjlj5pp..."), null);
  });

  it("is case-insensitive for the prefix", () => {
    assert.equal(parseBolt11AmountMsat("LNBC1000n1pjlj5pp..."), 100_000);
  });
});

describe("LUD-03 invoice amount validation logic", () => {
  const minWithdrawable = 1_000; // msat
  const maxWithdrawable = 100_000_000; // msat

  function isAmountValid(pr: string): boolean {
    const msat = parseBolt11AmountMsat(pr);
    return msat !== null && msat >= minWithdrawable && msat <= maxWithdrawable;
  }

  it("accepts invoice within range", () => {
    // 10,000 msat (100u = 100 * 1e5 = 10,000,000... use 100n = 10,000 msat)
    assert.ok(isAmountValid("lnbc100n1pjlj5pp..."));
  });

  it("rejects invoice below minWithdrawable", () => {
    // 100 msat (1n = 100 msat)
    assert.equal(isAmountValid("lnbc1n1pjlj5pp..."), false);
  });

  it("rejects invoice above maxWithdrawable", () => {
    // 100,000,000,000 msat (1 BTC)
    assert.equal(isAmountValid("lnbc11pjlj5pp..."), false);
  });

  it("accepts invoice exactly at minWithdrawable", () => {
    // 1000 msat = 10n
    assert.ok(isAmountValid("lnbc10n1pjlj5pp..."));
  });

  it("accepts invoice exactly at maxWithdrawable", () => {
    // 100,000,000 msat = 1m BTC
    assert.ok(isAmountValid("lnbc1m1pjlj5pp..."));
  });

  it("rejects amount-less invoice", () => {
    assert.equal(isAmountValid("lnbc1pjlj5pp..."), false);
  });
});
