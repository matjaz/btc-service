import App from "../../app";
import {
  AppOptions,
  PayerDataRequest,
  PayerDataResponse,
  PayerDataStringKind,
} from "../../types";
import { error } from "./helpers";

// https://github.com/lnurl/luds/blob/luds/18.md
export default function payerData(app: App, options?: AppOptions) {
  const DEFAULT_PAYERDATA: PayerDataRequest = {
    identifier: {
      mandatory: false,
    },
    name: {
      mandatory: false,
    },
    email: {
      mandatory: false,
    },
    pubkey: {
      mandatory: false,
    },
  };
  const payerData =
    (options?.payerData as PayerDataRequest) || DEFAULT_PAYERDATA;
  const payerDataKind = Object.keys(payerData);

  const validate = (data: PayerDataResponse) => {
    for (const [k, v] of Object.entries(payerData)) {
      const type = typeof data[k as PayerDataStringKind];
      if (type === "undefined") {
        if (v.mandatory) {
          return false;
        }
      } else if (
        type !== "string" ||
        data[k as PayerDataStringKind].length === 0
      ) {
        return false;
      }
    }
    for (const k of Object.keys(data)) {
      if (!payerDataKind.includes(k)) {
        return false;
      }
    }
    return true;
  };

  app.addTransformer("lnurlp", async ({ value }) => {
    value.payerData = payerData;
  });

  app.addTransformer("lnurlp-callback", async (ctx) => {
    const payerdata = ctx.req.query.payerdata;
    if (typeof payerdata === "string") {
      try {
        const data = JSON.parse(payerdata);
        if (validate(data)) {
          ctx.requiresSaveInvoice = true;
          ctx.payerData = data;
        } else {
          ctx.error = error("Invalid requst");
        }
      } catch (e) {
        ctx.error = error("Invalid requst");
        console.error(e);
      }
    }
  });
}
