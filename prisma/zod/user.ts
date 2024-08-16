import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel } from "./index"

export const UserModel = z.object({
  id: z.number().int(),
  username: z.string().min(1).max(50).regex(/^[a-z0-9-_]+$/).toLowerCase(),
  domain: z.string().min(3).max(100).regex(/.\../).toLowerCase(),
  description: z.string().max(100).nullish(),
  hasEmail: z.boolean().nullish(),
  lud16_forward: z.string().nullish(),
  lnurlwId: z.string().nullish(),
  lnurlwK1: z.string().nullish(),
  lnurlwBalanceNotify: z.string().nullish(),
  nwc_url: z.string().nullish(),
  nostr_verified: z.boolean().nullish(),
  nostr_publicKey: z.string().regex(/^[0-9a-fA-F]{64}$/).nullish(),
  nostr_relays: z.string().array(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  transactions: CompleteTransaction[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  transactions: RelatedTransactionModel.array(),
}))
