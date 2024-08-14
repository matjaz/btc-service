import App from "../../app";
import { LnurlpTransformContext } from "../../types";

// https://github.com/lnurl/luds/blob/luds/11.md
export default function disposable(app: App) {
  app.addTransformer(
    "lnurlp",
    async function disposable({ value }: LnurlpTransformContext) {
      value.disposable = false;
    },
  );
}
