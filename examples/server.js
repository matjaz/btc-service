import App from "../src/app.js";

const modules = [
  // order is important
  "cors",
  // "nwc/profile",
  // "nwc/connect",

  // lnurlw
  // "luds/lud-03", // withdrawRequest

  // lnurlp
  "luds/lud-06", // payRequest

  // module with customizable options
  [
    "luds/lud-09", // successAction
    {
      message({ user }) {
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
