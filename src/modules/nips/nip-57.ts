// https://github.com/nostr-protocol/nips/blob/master/57.md
export default function lightningZaps(app) {
  app.addTransformer("lnurlp", async function (ctx) {
    const { user } = ctx;
    if (!user) {
      throw new Error("Missing user");
    }
    if (user.nostr_publicKey) {
      ctx.value.nostrPubkey = user.nostr_publicKey;
      ctx.value.allowsNostr = true;
    }
  });
}
