// balanceCheck
// https://github.com/lnurl/luds/blob/luds/14.md
import App from "../../app";
import { LnurlwTransformContext } from "../../types";
import { getURL } from "./helpers";
export default function balanceCheck(app: App) {
  app.addTransformer("lnurlw", async function balanceCheck(ctx) {
    const { req, user, value } = ctx as LnurlwTransformContext;
    const client = await user.nwc();
    if (client) {
      try {
        const balanceResponse = await client.getBalance();
        const balance = balanceResponse.balance;
        if (typeof balance === "number") {
          value.currentBalance = balance;
          value.balanceCheck = getURL(req);
          value.maxWithdrawable = Math.max(
            value.minWithdrawable || 0,
            Math.min(value.maxWithdrawable || 0, balance),
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        client.close();
      }
    }
  });
}
