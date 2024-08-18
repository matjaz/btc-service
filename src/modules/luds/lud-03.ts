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
        // validate pr
        // lightning, mainnet
        // check expiration etc...
        if (pr!.slice(0, 4) !== "lnbc" || pr!.length < 150) {
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
        user.payInvoice(pr).catch((e: Error) => {
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
