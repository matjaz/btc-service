import App from "../../app";
import { AppOptions } from "../../types";

// https://github.com/lnurl/luds/blob/luds/11.md
export default function disposable(app: App, options?: AppOptions) {
  const isDisposable = options?.disposable ?? false;
  app.addTransformer("lnurlp", async function disposable({ value, error }) {
    if (!error && value && typeof value.disposable === "undefined") {
      value.disposable = isDisposable as boolean;
    }
  });
}
