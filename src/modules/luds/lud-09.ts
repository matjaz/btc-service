import App from "../../app";
import { AppOptions } from "../../types";

// https://github.com/lnurl/luds/blob/luds/09.md
export default function successAction(app: App, options?: AppOptions) {
  app.addTransformer("lnurlp-callback", async function successAction(ctx) {
    const { user, value, error } = ctx;
    if (!user) {
      throw new Error("Missing user");
    }
    if (error) {
      return;
    }
    const message: string =
      (options?.message != null &&
        (options.message as (mCtx: typeof ctx) => string)(ctx)) ||
      `Thank you for the payment! --${user.username}`;
    value.successAction = {
      tag: "message",
      message,
    };
  });
}
