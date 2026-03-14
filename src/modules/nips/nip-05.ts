import db from "../../lib/db";
import App from "../../app";
import { getDomainFromReq } from "../../lib/utils";
import { Request, Response } from "express";

// https://github.com/nostr-protocol/nips/blob/master/05.md
export default function nostrInternetIdentifier(app: App) {
  app.get("/.well-known/nostr.json", async (req: Request, res: Response) => {
    let relays: Record<string, Array<string>> | undefined;
    const names: Record<string, unknown> = {};
    let { name } = req.query;
    if (typeof name !== "string") {
      name = "_";
    }
    const domain = getDomainFromReq(req);
    const user = await db.user.findNostrVerifiedByUsername(
      name.toLowerCase(),
      domain,
    );
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
