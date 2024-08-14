import User from "../../models/User.js";
import { getDomainFromReq } from "../../lib/utils.js";
import App from "../../app.js";
import { AppRequest } from "../../types.js";
import { Response } from "express";

// https://github.com/nostr-protocol/nips/blob/master/05.md
export default function (app: App) {
  app.get("/.well-known/nostr.json", async (req: AppRequest, res: Response) => {
    let relays: Record<string, Array<string>> | undefined;
    const names: Record<string, unknown> = {};
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
