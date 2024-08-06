// balanceCheck
// https://github.com/lnurl/luds/blob/luds/14.md
import { getURL } from "./helpers.js";
export default function balanceCheck(app) {
  app.addTransformer("lnurlw", async (ctx) => {
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
