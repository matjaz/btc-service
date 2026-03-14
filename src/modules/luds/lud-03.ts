import { Response } from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { error, getURL } from "./helpers";
import App from "../../app";
import {
  AppOptions,
  AppRequest,
  LnurlwCallbackTransformContext,
  LnurlwTransformContext,
} from "../../types";

// Parse the amount from a BOLT11 invoice's human-readable part (HRP).
// Returns millisatoshis, or null if the invoice has no amount.
// HRP format: lnbc{amount}{multiplier}1... where multiplier is m/u/n/p (or absent = BTC).
function parseBolt11AmountMsat(pr: string): number | null {
  const match = pr.match(/^lnbc(\d+)([munp])?1/i);
  if (!match) return null;
  const amount = parseInt(match[1], 10);
  switch (match[2]) {
    case "m":
      return amount * 1e8; // milli-BTC → msat
    case "u":
      return amount * 1e5; // micro-BTC → msat
    case "n":
      return amount * 1e2; // nano-BTC  → msat
    case "p":
      return amount / 10; // pico-BTC  → msat
    default:
      return amount * 1e11; // BTC       → msat
  }
}

// https://github.com/lnurl/luds/blob/luds/03.md
export default function withdrawRequest(app: App, options?: AppOptions) {
  const minWithdrawable = (options?.minWithdrawable as number) || 1000; // milisats
  const maxWithdrawable = (options?.maxWithdrawable as number) || 100000000; // milisats

  app.addTransformer("lnurlw", async function createWithdrawRequest(ctx) {
    const { req, user } = ctx;
    if (!req) {
      throw new Error("Missing req");
    }
    if (!user) {
      throw new Error("Missing user");
    }

    const k1 = randomBytes(16).toString("hex");
    user.lnurlwK1 = k1;
    await user.save();

    const callback = getURL(req, "/callback");
    const defaultDescription = `Withdraw from ${user.lud16}`;
    ctx.value = {
      tag: "withdrawRequest",
      callback,
      k1,
      defaultDescription,
      minWithdrawable, // msats
      maxWithdrawable, // msats
    };
  });

  app.addTransformer(
    "lnurlw-callback",
    async function createWithdrawRequestCallback(ctx) {
      const { req, user } = ctx;
      if (!req) {
        throw new Error("Missing req");
      }
      if (!user) {
        throw new Error("Missing user");
      }
      let hasError;
      const { k1 } = req.query;
      const pr = req.query.pr as string | undefined;
      if (!k1 || typeof pr !== "string" || k1 !== user.lnurlwK1) {
        hasError = true;
      }
      if (!hasError) {
        // validate pr: mainnet prefix and minimum length
        if (pr!.slice(0, 4) !== "lnbc" || pr!.length < 150) {
          hasError = true;
        }
      }
      if (!hasError) {
        // validate invoice amount is within allowed withdrawal range (LUD-03)
        const invoiceAmountMsat = parseBolt11AmountMsat(pr!);
        if (
          invoiceAmountMsat === null ||
          invoiceAmountMsat < minWithdrawable ||
          invoiceAmountMsat > maxWithdrawable
        ) {
          hasError = true;
        }
      }

      // always invalidate lnurlwId
      user.lnurlwId = randomUUID();
      await user.save();

      if (hasError) {
        ctx.error = error("Invalid request");
      } else {
        ctx.value = {
          status: "OK",
        };
        // async pay invoice
        // no await
        user.payInvoice(pr!).catch((e: Error) => {
          console.error(e);
        });
      }
    },
  );

  app.get("/lnurlw/:lnurlwId", async (req: AppRequest, res: Response) => {
    try {
      const ctx = {
        req,
        user: req.user,
      } as LnurlwTransformContext;
      const result = await app.transform("lnurlw", ctx);
      res.send(result.error || result.value);
    } catch (e) {
      console.error(e);
      const err = error("Internal error");
      res.send(err);
    }
  });

  app.get(
    "/lnurlw/:lnurlwId/callback",
    async (req: AppRequest, res: Response) => {
      try {
        const ctx = {
          req,
          user: req.user,
        } as LnurlwCallbackTransformContext;
        const result = await app.transform("lnurlw-callback", ctx);
        res.send(result.error || result.value);
      } catch (e) {
        console.error(e);
        const err = error("Internal error");
        res.send(err);
      }
    },
  );
}
