import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import balanceCheck from "./lud-14.js";
import type { LnurlwTransformContext } from "../../types.js";
import type { AppRequest } from "../../types.js";

// Minimal App stub that captures the registered transformer
function makeApp() {
  let transformer: ((ctx: LnurlwTransformContext) => Promise<void>) | null =
    null;
  return {
    addTransformer(_name: string, fn: typeof transformer) {
      transformer = fn;
    },
    async runTransformer(ctx: LnurlwTransformContext) {
      await transformer!(ctx);
    },
  };
}

function makeReq(): AppRequest {
  return {
    protocol: "https",
    path: "/lnurlw/abc",
    baseUrl: "",
    get: (_h: string) => "example.com",
  } as unknown as AppRequest;
}

function makeUser(balance: number | undefined, throws = false) {
  return {
    async nwc() {
      return {
        async getBalance() {
          if (throws) throw new Error("NWC error");
          return { balance };
        },
        close() {},
      };
    },
  };
}

describe("lud-14 balanceCheck transformer", () => {
  let app: ReturnType<typeof makeApp>;

  before(() => {
    app = makeApp();
    balanceCheck(app as never);
  });

  it("clamps maxWithdrawable to balance when balance is between min and max", async () => {
    const ctx = {
      req: makeReq(),
      user: makeUser(5000),
      value: {
        tag: "withdrawRequest" as const,
        callback: "https://example.com/cb",
        k1: "k1",
        minWithdrawable: 1000,
        maxWithdrawable: 10000,
      },
    } satisfies LnurlwTransformContext;

    await app.runTransformer(ctx);

    assert.equal(ctx.value.currentBalance, 5000);
    assert.equal(ctx.value.maxWithdrawable, 5000);
    assert.ok(ctx.value.balanceCheck?.includes("/lnurlw/abc"));
  });

  it("enforces maxWithdrawable >= minWithdrawable when balance < minWithdrawable", async () => {
    const ctx = {
      req: makeReq(),
      user: makeUser(500),
      value: {
        tag: "withdrawRequest" as const,
        callback: "https://example.com/cb",
        k1: "k1",
        minWithdrawable: 1000,
        maxWithdrawable: 10000,
      },
    } satisfies LnurlwTransformContext;

    await app.runTransformer(ctx);

    assert.equal(ctx.value.currentBalance, 500);
    // must not go below minWithdrawable
    assert.equal(ctx.value.maxWithdrawable, 1000);
  });

  it("does not reduce maxWithdrawable when balance exceeds it", async () => {
    const ctx = {
      req: makeReq(),
      user: makeUser(99999),
      value: {
        tag: "withdrawRequest" as const,
        callback: "https://example.com/cb",
        k1: "k1",
        minWithdrawable: 1000,
        maxWithdrawable: 10000,
      },
    } satisfies LnurlwTransformContext;

    await app.runTransformer(ctx);

    assert.equal(ctx.value.maxWithdrawable, 10000);
  });

  it("leaves value unchanged when balance is undefined", async () => {
    const ctx = {
      req: makeReq(),
      user: makeUser(undefined),
      value: {
        tag: "withdrawRequest" as const,
        callback: "https://example.com/cb",
        k1: "k1",
        minWithdrawable: 1000,
        maxWithdrawable: 10000,
      },
    } satisfies LnurlwTransformContext;

    await app.runTransformer(ctx);

    assert.equal(ctx.value.currentBalance, undefined);
    assert.equal(ctx.value.balanceCheck, undefined);
    assert.equal(ctx.value.maxWithdrawable, 10000);
  });

  it("leaves value unchanged when NWC client throws", async () => {
    const ctx = {
      req: makeReq(),
      user: makeUser(5000, true),
      value: {
        tag: "withdrawRequest" as const,
        callback: "https://example.com/cb",
        k1: "k1",
        minWithdrawable: 1000,
        maxWithdrawable: 10000,
      },
    } satisfies LnurlwTransformContext;

    await app.runTransformer(ctx);

    assert.equal(ctx.value.currentBalance, undefined);
    assert.equal(ctx.value.maxWithdrawable, 10000);
  });

  it("leaves value unchanged when no NWC client is available", async () => {
    const ctx = {
      req: makeReq(),
      user: {
        async nwc() {
          return null;
        },
      },
      value: {
        tag: "withdrawRequest" as const,
        callback: "https://example.com/cb",
        k1: "k1",
        minWithdrawable: 1000,
        maxWithdrawable: 10000,
      },
    } as unknown as LnurlwTransformContext;

    await app.runTransformer(ctx);

    assert.equal(ctx.value.maxWithdrawable, 10000);
  });
});
