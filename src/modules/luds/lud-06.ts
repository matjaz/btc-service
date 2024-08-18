import App from "../../app";
import { identifier } from "../../lib/utils";
import {
  AppOptions,
  LnurlpInvoiceTransformContext,
  LnurlpMetadataTransformContext,
} from "../../types";
import { error, getURL } from "./helpers";

// https://github.com/lnurl/luds/blob/luds/06.md
export default function payRequest(app: App, options?: AppOptions) {
  const minSendable = (options?.minSendable as number) || 1000;
  const maxSendable = (options?.maxSendable as number) || 100000000;

  app.addTransformer("lnurlp", async function createPayRequest(ctx) {
    const { req, user } = ctx;
    if (!req) {
      throw new Error("Missing req");
    }
    if (!user) {
      throw new Error("Missing user");
    }
    if (user.nwc_url) {
      const callback = getURL(req, "/callback");
      const metadataCtx = {
        req,
        user,
        value: [],
      } as LnurlpMetadataTransformContext;
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
    const { user, value } = ctx;
    if (!user) {
      throw new Error("Missing user");
    }
    value.push(["text/plain", `Sats for ${user.username}`]);
    if (user.hasEmail) {
      const email = identifier(user.username, user.domain);
      value.push(["text/email", email]);
    } else {
      value.push(["text/identifier", user.username]);
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

      const invoiceCtx = {
        req,
        user,
      } as LnurlpInvoiceTransformContext;
      const invoiceResponse = await app.transform("lnurlp-invoice", invoiceCtx);
      if (invoiceResponse.error) {
        ctx.error = invoiceResponse.error;
        return;
      }
      const invoiceRequest = invoiceResponse.value;
      const invoiceResult = await user.makeInvoice(invoiceRequest);
      ctx.rawInvoice = invoiceResult.raw;
      ctx.value = invoiceResult.invoice;
    },
  );

  app.addTransformer(
    "lnurlp-invoice",
    async function createPayRequestInvocie(ctx) {
      let msat: number;
      const amount = ctx.req.query.amount as string;
      let hasError = !amount || !/^[0-9]{4,15}$/.test(amount);
      if (!hasError) {
        msat = parseInt(amount, 10);
        hasError = isNaN(msat) || msat < minSendable || msat > maxSendable;
      }
      if (hasError) {
        ctx.error = error(
          "Invalid amount. Make sure the amount is within the range.",
        );
      } else {
        ctx.value = {
          amount: msat!,
        };
      }
    },
  );
}
