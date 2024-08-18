// balanceCheck
// https://github.com/lnurl/luds/blob/luds/14.md
import App from "../../app";
import { LnurlwTransformContext } from "../../types";
import { getURL } from "./helpers";
export default function balanceCheck(app: App) {
  app.addTransformer("lnurlw", async (ctx: LnurlwTransformContext) => {
    const { req, user, value } = ctx;
    const client = await user.nwc();
    const balanceResponse = await client.getBalance();
    client.close();
    value.balanceCheck = getURL(req);
    value.currentBalance = balanceResponse.balance;
    value.maxWithdrawable = Math.min(
      value.maxWithdrawable,
      value.currentBalance,
    );
  });
}