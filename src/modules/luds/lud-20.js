// https://github.com/lnurl/luds/blob/luds/20.md
export default function longDesc(app) {
  app.addTransformer(
    "lnurlp-metadata",
    async function longDesc({ user, value }) {
      const userDesc = user.description;
      if (userDesc) {
        value.push(["long-desc", userDesc]);
      }
    },
  );
}