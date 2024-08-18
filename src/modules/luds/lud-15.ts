import App from "../../app";
import { LnurlwCallbackTransformContext } from "../../types";

// https://github.com/lnurl/luds/blob/luds/15.md
export default function balanceNotify(app: App) {
  // requires LUD-14
  app.addTransformer("lnurlw-callback", async function balanceNotify(ctx) {
    const { req, user } = ctx as LnurlwCallbackTransformContext;
    const { pr, balanceNotify } = req.query;
    if (pr && balanceNotify && !ctx.error) {
      user.lnurlwBalanceNotify = balanceNotify as string;
      await user.save();
    }
  });
}
