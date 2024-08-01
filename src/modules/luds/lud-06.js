import { error, getBaseURL } from "./helpers.js";

// https://github.com/lnurl/luds/blob/luds/06.md
export default function payRequest(app, options) {
  const minSendable = (options && options.minSendable) || 1000;
  const maxSendable = (options && options.maxSendable) || 100000000;

  app.addTransformer("lnurlp", async function createPayRequest(ctx) {
    const { req, user } = ctx;
    if (!req) {
      throw new Error("Missing req");
    }
    if (!user) {
      throw new Error("Missing user");
    }
    if (user.nwc_lnurlp) {
      const callback = getBaseURL(req, "/callback");
      const metadataCtx = { req, user, value: [] };
      const metadata = JSON.stringify(
        (await app.transform("lnurlp-metadata", metadataCtx)).value,
      );
      ctx.value = {
        tag: "payRequest",
        callback,
        minSendable,
        maxSendable,
        metadata,
      };
    } else if (user.lud16_forward) {
      ctx.value = await user.fetchLUD16Data();
    } else {
      throw new Error("Cannot create payRequest");
    }
  });

  app.addTransformer("lnurlp-metadata", async function LNURLPMetadata(ctx) {
    const { user } = ctx;
    if (!user) {
      throw new Error("Missing user");
    }
    ctx.value.push(["text/plain", `Satoshis for ${user.username}`]);
    if (user.hasEmail) {
      const email = `${user.username}@${user.domain}`;
      ctx.value.push(["text/email", email]);
    } else {
      ctx.value.push(["text/identifier", user.username]);
    }
  });

  app.addTransformer(
    "lnurlp-callback",
    async function createPayRequestCallback(ctx) {
      const { req, user } = ctx;
      if (!req) {
        throw new Error("Missing req");
      }
      if (!user) {
        throw new Error("Missing user");
      }
      let msat;
      const { amount } = req.query;
      let hasError = !amount || !/^[0-9]{4,15}$/.test(amount);
      if (!hasError) {
        msat = parseInt(amount, 10);
        hasError = isNaN(msat) || msat < minSendable || msat > maxSendable;
      }
      if (hasError) {
        const err = error(
          "Invalid amount. Make sure the amount is within the range.",
        );
        ctx.value = err;
        return;
      }

      const invoiceCtx = { req, user, msat, value: {} };
      const invoiceRequest = (await app.transform("lnurlp-invoice", invoiceCtx))
        .value;
      if (invoiceRequest.status === "ERROR") {
        ctx.value = invoiceRequest;
        return;
      }
      const invoiceResult = await user.makeInvoice(invoiceRequest);
      ctx.rawInvoice = invoiceResult.raw;
      ctx.value = invoiceResult.invoice;
    },
  );

  app.addTransformer(
    "lnurlp-invoice",
    async function createPayRequestInvocie(ctx) {
      // Nip47MakeInvoiceRequest
      ctx.value.amount = ctx.msat;
    },
  );
}
