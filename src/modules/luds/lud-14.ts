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
        value.balanceCheck = getURL(req);
        value.currentBalance = balanceResponse.balance;
        value.maxWithdrawable = Math.min(
          value.maxWithdrawable as number,
          value.currentBalance as number,
        );
      } catch (e) {
        console.error(e);
      } finally {
        client.close();
      }
    }
  });
}
