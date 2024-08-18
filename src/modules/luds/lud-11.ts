import App from "../../app";

// https://github.com/lnurl/luds/blob/luds/11.md
export default function disposable(app: App) {
  app.addTransformer("lnurlp", async function disposable({ value }) {
    value.disposable = false;
  });
}
