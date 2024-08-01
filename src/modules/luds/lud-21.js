import { getBaseURL } from "./helpers.js";

// https://github.com/lnurl/luds/blob/luds/21.md
export default function verify(app) {
  app.addTransformer("lnurlp-callback", (ctx) => {
    const { req, value, rawInvoice } = ctx;
    if (rawInvoice) {
      const path = `/verify/${rawInvoice.payment_hash}`;
      const verifyURL = getBaseURL(req, path).replace(
        "/callback/verify/",
        "/verify/",
      );
      value.verify = verifyURL;
    }
  });

  app.get("/.well-known/lnurlp/:username/verify/:invoiceId", (req, res) => {
    const { pr, settled = false, preimage = null } = req.payment;
    res.send({
      status: "OK",
      settled,
      preimage,
      pr,
    });
  });
}
