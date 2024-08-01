// https://github.com/lnurl/luds/blob/luds/11.md
export default function disposable(app) {
  app.addTransformer("lnurlp", async function disposable({ value }) {
    value.disposable = false;
  });
}
