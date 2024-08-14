import { Response } from "express";
import App from "../../app.js";
import { AppRequest, LnurlpCallbackTransformContext } from "../../types.js";
import { getURL } from "./helpers.js";

// https://github.com/lnurl/luds/blob/luds/21.md
export default function verify(app: App) {
  app.addTransformer(
    "lnurlp-callback",
    (ctx: LnurlpCallbackTransformContext) => {
      const { req, value, rawInvoice } = ctx;
      if (rawInvoice) {
        const path = `/verify/${rawInvoice.payment_hash}`;
        const verifyURL = getURL(req, path).replace(
          "/callback/verify/",
          "/verify/",
        );
        value.verify = verifyURL;
      }
    },
  );

  app.get(
    "/.well-known/lnurlp/:username/verify/:transactionId",
    (req: AppRequest, res: Response) => {
      const { pr, settled = false, preimage = null } = req.transaction;
      res.send({
        status: "OK",
        settled,
        preimage,
        pr,
      });
    },
  );
}
