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
          value: {},
        };
        const result = await app.transform<LnurlpTransformContext>(
          "lnurlp",
          ctx,
        );
        res.send(result.value);
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
          value: {},
        };
        const result = await app.transform<LnurlpCallbackTransformContext>(
          "lnurlp-callback",
          ctx,
        );
        if (result.value.verify && result.rawInvoice) {
          try {
            await user.saveInvoice(result.rawInvoice);
          } catch (e) {
            console.error(e);
            const err = error("Failed creating invoice");
            res.send(err);
            return;
          }
        }
        res.send(result.value);
      } catch (e) {
        console.error(e);
        const err = error("Internal error");
        res.send(err);
      }
    },
  );
}
