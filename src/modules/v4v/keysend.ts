import { NextFunction, Response } from "express";
import App from "../../app";
import db from "../../lib/db";
import { AuthAppRequest, KeysendTransformContext } from "../../types";
import { error } from "../luds/helpers";

// https://github.com/Podcastindex-org/podcast-namespace/blob/5446154c65f873fbb259547bd6c079ab88c8f48d/value/lightning_value_spec.md
export default function keysend(app: App) {
  app.addTransformer("keysend", async (ctx) => {
    const { user } = ctx;
    if (!user) {
      throw new Error("Missing user");
    }
    if (!user.keysend_publicKey) {
      return;
    }
    const customData = await db.keysendCustomData.findMany({
      select: { customKey: true, customValue: true },
      where: {
        userId: user.id,
      },
    });
    ctx.value = {
      status: "OK",
      tag: "keysend",
      pubkey: user.keysend_publicKey,
      customData,
    };
  });
  app.get(
    "/.well-known/keysend/:username",
    async (req: AuthAppRequest, res: Response, next: NextFunction) => {
      try {
        const ctx: KeysendTransformContext = {
          req,
          user: req.user,
        };
        const result = await app.transform("keysend", ctx);
        if (result.error || result.value) {
          res.send(result.error || result.value);
        } else {
          res.status(404).send({
            status: "NOT_FOUND",
            tag: "keysend",
          });
        }
      } catch (e) {
        console.error(e);
        const err = error("Internal error");
        res.send(err);
      }
    },
  );
}
