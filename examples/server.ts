import App from "../src/app";
import { LnurlpTransformContext, Module } from "../src/types";

const modules: Module[] = [
  // order is important
  "cors",
  // "nwc/profile",
  // "nwc/connect",

  // lnurlw
  // "luds/lud-03", // withdrawRequest
  // "luds/lud-14", // balanceCheck
  // "luds/lud-15", // balanceNotify

  // lnurlp
  "luds/lud-06", // payRequest

  // module with customizable options
  [
    "luds/lud-09", // successAction
    {
      message({ user }: LnurlpTransformContext) {
        return `thanks\n-- ${user.username}`;
      },
    },
  ],

  "luds/lud-11",
  [
    "luds/lud-12", // comments
    {
      // maxLength: 10,
    },
  ],
  "luds/lud-16", // internet identifier
  "luds/lud-18", // payerData
  "luds/lud-20", // longDesc
  "luds/lud-21", // verify

  "nips/nip-05", // Nostr internet identifier
  // "nips/nip-57", // Lightning Zaps

  "users/profile",

  "v4v/rss",
  "v4v/keysend",
  // "v4v/options",

  // not supported by NWC
  // 'luds/lud-04',
  // 'luds/lud-10',
];

const app = new App({ modules });
app.listen();
