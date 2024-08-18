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
  "luds/lud-20", // longDesc
  "luds/lud-21", // verify

  "nips/nip-05", // Nostr internet identifier

  "users/profile",

  // 'luds/lud-04', // TODO
  // 'luds/lud-10', // NWC does not support preimage
];

const app = new App({ modules });
app.listen();
