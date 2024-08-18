import App from "../../app";
import { AppOptions, LnurlpTransformContext } from "../../types";
import { error as createError } from "./helpers";

// https://github.com/lnurl/luds/blob/luds/12.md
export default function comments(app: App, options?: AppOptions) {
  const MAX_LENGTH = (options?.maxLength as number) || 255;

  app.addTransformer(
    "lnurlp",
    async function addComment({ value, error }: LnurlpTransformContext) {
      if (!error) {
        value.commentAllowed = MAX_LENGTH;
      }
    },
  );

  app.addTransformer(
    "lnurlp-invoice",
    async function createPayRequestInvoice(ctx) {
      const { req, error } = ctx;
      if (!req) {
        throw new Error("Missing req");
      }
      const comment = req.query.comment as string;
      if (!error && typeof comment === "string") {
        if (comment.length > MAX_LENGTH) {
          ctx.error = createError(
            `Make sure the comment is max ${MAX_LENGTH} characters.`,
          );
          return;
        }
        ctx.value.description = comment;
      }
    },
  );
}
