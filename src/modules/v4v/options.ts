import { Response } from "express";
import App from "../../app";
import {
  AuthAppRequest,
  KeysendTransformContext,
  LnurlpOption,
  LnurlpTransformContext,
} from "../../types";
import { error } from "../luds/helpers";

// https://github.com/Podcastindex-org/podcast-namespace/blob/5f8f83a04abe0926eedf8f8706db2c7524c769d6/value/lnaddress.md
export default function lnurlpOptions(app: App) {
  app.get(
    "/.well-known/lnurlp/:username/options",
    async (req: AuthAppRequest, res: Response) => {
      try {
        const lnurlpCtx = {
          req,
          user: req.user,
        } as LnurlpTransformContext;
        const lnurlpResult = await app.transform("lnurlp", lnurlpCtx);
        if (lnurlpResult.error) {
          res.send(lnurlpResult.error);
          return;
        }
        const keysendCtx = {
          req,
          user: req.user,
        } as KeysendTransformContext;
        const keysendResult = await app.transform("keysend", keysendCtx);
        if (keysendResult.error) {
          res.send(keysendResult.error);
          return;
        }
        const { value: lnurlp } = lnurlpResult;
        const options: LnurlpOption[] = [];
        if (lnurlp) {
          options.push({
            ...lnurlp,
            type: "lnurlp",
            callback: lnurlp.callback.replace("options/callback", "callback"),
          });
        }
        const { value: keysend } = keysendResult;
        if (keysend) {
          options.push({
            ...keysend,
            type: "keysend",
          });
        }
        res.send({
          status: "OK",
          options,
        });
      } catch (e) {
        console.error(e);
        const err = error("Internal error");
        res.send(err);
      }
    },
  );
}
