import User from "../../models/User.js";
import { getDomainFromReq } from "../../lib/utils.js";

// https://github.com/nostr-protocol/nips/blob/master/05.md
export default function (app) {
  app.get("/.well-known/nostr.json", async (req, res) => {
    let relays;
    const names = {};
    const { name } = req.query;
    const domain = getDomainFromReq(req);
    const user = await User.findNostrVerifiedByUsername(name, domain);
    if (user) {
      const { username, nostr_publicKey, nostr_relays } = user;
      names[username] = nostr_publicKey;
      if (nostr_relays) {
        relays = {
          [nostr_publicKey]: nostr_relays,
        };
      }
    }
    res.send({
      names,
      relays,
    });
  });
}
