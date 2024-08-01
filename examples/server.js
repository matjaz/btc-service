import App from "../src/app.js";

const modules = [
  // order is important
  "cors",
  // "nwc/profile",
  // "nwc/connect",

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
  "luds/lud-16", // internetIdentifier
  "luds/lud-20", // longDesc
  "luds/lud-21", // verify

  // 'luds/lud-04', // TODO
  // 'luds/lud-10', // NWC does not support preimage

  // 'nips/nip-05', // TODO
];

const app = new App({ modules });
app.listen();
