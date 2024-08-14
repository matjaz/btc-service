import App from "../../app";
import { AppOptions, LnurlpCallbackTransformContext } from "../../types";

// https://github.com/lnurl/luds/blob/luds/09.md
export default function successAction(app: App, options?: AppOptions) {
  app.addTransformer(
    "lnurlp-callback",
    async function successAction(ctx: LnurlpCallbackTransformContext) {
      const { user, value } = ctx;
      if (!user) {
        throw new Error("Missing user");
      }
      if (value.pr) {
        // skip in case of an error
        const message =
          (
            options?.message as (
              ctx: LnurlpCallbackTransformContext,
            ) => string | undefined
          )(ctx) || `Thank you for the payment! --${user.username}`;
        value.successAction = {
          tag: "message",
          message,
        };
      }
    },
  );
}
