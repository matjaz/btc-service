import App from "../../app.js";
import {
  AppOptions,
  InvoiceTransformContext,
  LnurlpTransformContext,
} from "../../types.js";
import { error } from "./helpers.js";

// https://github.com/lnurl/luds/blob/luds/12.md
export default function comments(app: App, options?: AppOptions) {
  const MAX_LENGTH = (options?.maxLength as number) || 255;

  app.addTransformer(
    "lnurlp",
    async function addComment({ value }: LnurlpTransformContext) {
      if (value.callback) {
        value.commentAllowed = MAX_LENGTH;
      }
    },
  );

  app.addTransformer(
    "lnurlp-invoice",
    async function createPayRequestInvoice(ctx: InvoiceTransformContext) {
      const { req } = ctx;
      if (!req) {
        throw new Error("Missing req");
      }
      const comment = req.query.comment as string;
      if (ctx.value.status !== "ERROR" && typeof comment === "string") {
        if (comment.length > MAX_LENGTH) {
          const err = error(
            `Make sure the comment is max ${MAX_LENGTH} characters.`,
          );
          ctx.value = err;
          return;
        }
        ctx.value.description = comment;
      }
    },
  );
}
