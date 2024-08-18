import { Response } from "express";
import App from "../../app";
import {
  AuthAppRequest,
  LnurlpCallbackTransformContext,
  LnurlpTransformContext,
} from "../../types";
import { error } from "./helpers";

// https://github.com/lnurl/luds/blob/luds/16.md
export default function internetIdentifier(app: App) {
  app.get(
    "/.well-known/lnurlp/:username",
    async (req: AuthAppRequest, res: Response) => {
      try {
        const ctx = {
          req,
          user: req.user,
        } as LnurlpTransformContext;
        const result = await app.transform("lnurlp", ctx);
        res.send(result.error || result.value);
      } catch (e) {
        console.error(e);
        const err = error("Internal error");
        res.send(err);
      }
    },
  );
  app.get(
    "/.well-known/lnurlp/:username/callback",
    async (req: AuthAppRequest, res: Response) => {
      try {
        const { user } = req;
        const ctx = {
          req,
          user,
        } as LnurlpCallbackTransformContext;
        const result = await app.transform("lnurlp-callback", ctx);
        if (result.rawInvoice && result.value?.verify) {
          try {
            await user.saveInvoice(result.rawInvoice);
          } catch (e) {
            console.error(e);
            const err = error("Failed creating invoice");
            res.send(err);
            return;
          }
        }
        res.send(result.error || result.value);
      } catch (e) {
        console.error(e);
        const err = error("Internal error");
        res.send(err);
      }
    },
  );
}
