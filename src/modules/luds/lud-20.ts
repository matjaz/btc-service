import App from "../../app";
import { LnurlpMetadataTransformContext } from "../../types";

// https://github.com/lnurl/luds/blob/luds/20.md
export default function longDesc(app: App) {
  app.addTransformer(
    "lnurlp-metadata",
    async function longDesc({ user, value }: LnurlpMetadataTransformContext) {
      const userDesc = user.description;
      if (userDesc) {
        value.push(["long-desc", userDesc]);
      }
    },
  );
}