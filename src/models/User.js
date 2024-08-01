import "websocket-polyfill";
import { nwc } from "@getalby/sdk";
import { createModel } from "../lib/db.js";
import { lud16URL } from "../lib/utils.js";
import Payment from "./Payment.js";

const User = await createModel(
  "User",
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      minLength: 1,
      maxLength: 50,
      match: /^[a-z0-9-_]+$/,
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
      minLength: 3,
      maxLength: 100,
      match: /.\../,
    },
    description: {
      type: String,
      maxLength: 100,
    },
    hasEmail: Boolean,
    lud16_forward: String,
    last_tx_sync: Number,

    // nwc
    // required permissions
    // - make_invoice
    // - lookup_invoice
    nwc_lnurlp: {
      type: String,
    },

    nostr_verified: Boolean,
    nostr_publicKey: {
      type: String,
      match: /^[0-9a-fA-F]{64}$/,
    },
    nostr_relays: {
      type: [String],
      default: undefined,
    },
  },
  {
    methods: {
      lud16() {
        return lud16URL(this.username, this.domain);
      },
      async nwc() {
        const nostrWalletConnectUrl = this.nwc_lnurlp;
        if (!nostrWalletConnectUrl) {
          throw new Error("Missing NWC URL");
        }
        return new nwc.NWCClient({
          nostrWalletConnectUrl,
        });
      },
      async makeInvoice(request) {
        if (this.nwc_lnurlp) {
          const nwc = await this.nwc();
          const rawInvoice = await nwc.makeInvoice(request);
          nwc.close();
          const pr = rawInvoice.invoice;
          return {
            raw: rawInvoice,
            invoice: {
              // routes: [],
              pr,
            },
          };
        } else if (this.lud16_forward) {
          const data = await this.fetchLUD16Data();
          let { callback } = data;
          if (!callback) {
            throw new Error("Missing callback");
          }
          const params = new URLSearchParams({
            amount: request.amount,
            comment: request.description,
          });
          callback += callback.includes("?") ? "&" : "?";
          callback += params.toString();
          const res = await fetch(callback);
          return {
            invoice: await res.json(),
          };
        }
        throw new Error("makeInvoice unavailable.");
      },
      saveInvoice(invoiceData) {
        return Payment.createFromData(invoiceData, this);
      },
      async fetchLUD16Data() {
        const [username, domain] = this.lud16_forward.split("@");
        const lud16ProxyUrl = lud16URL(username, domain);
        const res = await fetch(lud16ProxyUrl);
        return res.json();
      },
    },
    statics: {
      findByUsername(username, domain) {
        const search = {
          username,
          domain,
        };
        return this.findOne(search);
      },
      findNostrVerifiedByUsername(username, domain) {
        const search = {
          username,
          domain,
          nostr_verified: true,
        };
        return this.findOne(search);
      },
    },
  },
);

User.schema.index({ username: 1, domain: 1 }, { unique: true });

export default User;
