import User from "../src/models/User.js";

await User.create({
  username: "hello",
  domain: "example.com",
  // nwc_lnurlp: "nostr+walletconnect://key?relay=wss://relay.example.com/v1&secret=123",
  // description: "",
  // lud16_forward: "", // servers as LUD16 forward proxy
});
console.info("New user added");
