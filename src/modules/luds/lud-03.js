import { randomBytes, randomUUID } from "node:crypto";
import { error, getURL } from "./helpers.js";

// https://github.com/lnurl/luds/blob/luds/03.md
export default function withdrawRequest(app, options) {
  const minWithdrawable = (options && options.minWithdrawable) || 1000; // milisats
  const maxWithdrawable = (options && options.maxWithdrawable) || 100000000; // milisats

  app.require("nwc", "pay_invoice");

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
    const defaultDescription = `Withdraw from ${user.lud16()}`;
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
      const { k1, pr } = req.query;
      if (!k1 || typeof pr !== "string" || k1 !== user.lnurlwK1) {
        hasError = true;
      }
      if (!hasError) {
        // validate pr
        // lightning, mainnet
        // check expiration etc...
        if (pr.slice(0, 4) !== "lnbc" || pr.length < 150) {
          hasError = true;
        }
      }

      // always invalidate lnurlwId
      user.lnurlwId = randomUUID();
      await user.save();

      if (hasError) {
        const err = error("Invalid request");
        ctx.value = err;
      } else {
        ctx.value = {
          status: "OK",
        };
        // async pay invoice
        // no await
        user.payInvoice(pr).catch((e) => {
          console.error(e);
        });
      }
    },
  );

  app.get("/lnurlw/:lnurlwId", async (req, res) => {
    try {
      const ctx = {
        req,
        user: req.user,
        value: {},
      };
      const result = await app.transform("lnurlw", ctx);
      res.send(result.value);
    } catch (e) {
      console.error(e);
      const err = error("Internal error");
      res.send(err);
    }
  });

  app.get("/lnurlw/:lnurlwId/callback", async (req, res) => {
    try {
      const ctx = {
        req,
        user: req.user,
        value: {},
      };
      const result = await app.transform("lnurlw-callback", ctx);
      res.send(result.value);
    } catch (e) {
      console.error(e);
      const err = error("Internal error");
      res.send(err);
    }
  });
}
