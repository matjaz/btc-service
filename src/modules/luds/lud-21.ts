import { Response } from "express";
import App from "../../app";
import { TransactionAppRequest } from "../../types";
import { getURL } from "./helpers";

// https://github.com/lnurl/luds/blob/luds/21.md
export default function verify(app: App) {
  app.addTransformer("lnurlp-callback", async (ctx) => {
    const { req, value, rawInvoice } = ctx;
    if (rawInvoice) {
      const path = `/verify/${rawInvoice.payment_hash}`;
      const verifyURL = getURL(req, path).replace(
        "/callback/verify/",
        "/verify/",
      );
      ctx.requiresSaveInvoice = true;
      value.verify = verifyURL;
    }
  });

  app.get(
    "/.well-known/lnurlp/:username/verify/:transactionId",
    (req: TransactionAppRequest, res: Response) => {
      const { pr, settled = false, preimage = null } = req.transaction;
      res.send({
        status: "OK",
        settled: !!settled,
        preimage,
        pr,
      });
    },
  );
}
