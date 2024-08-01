// https://github.com/lnurl/luds/blob/luds/09.md
export default function successAction(app, options) {
  app.addTransformer("lnurlp-callback", async function successAction(ctx) {
    const { user, value } = ctx;
    if (!user) {
      throw new Error("Missing user");
    }
    if (value.pr) {
      // skip in case of an error
      const message =
        (options && options.message(ctx)) ||
        `Thank you for the payment! --${user.username}`;
      value.successAction = {
        tag: "message",
        message,
      };
    }
  });
}
