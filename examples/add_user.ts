import db from "../src/lib/db";

await db.user.create({
  data: {
    username: "hello",
    domain: "example.com",
    // nwc_url: "nostr+walletconnect://key?relay=wss://relay.example.com/v1&secret=123",
    // description: "",
    // lud16_forward: "", // servers as LUD16 forward proxy
  },
});

console.info("New user added");
