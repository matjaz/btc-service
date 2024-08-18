import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const TransactionModel = z.object({
  id: z.number().int(),
  type: z.string().regex(/^incoming|outgoing$/),
  userId: z.number().int(),
  payment_hash: z.string().regex(/^[0-9a-fA-F]{64}$/),
  pr: z.string(),
  preimage: z.string().regex(/^[0-9a-fA-F]{64}$/).nullish(),
  settled: z.boolean().nullish(),
  fees_paid: z.number().int().nullish(),
  payer_data: z.string().min(5).max(1000).nullish(),
  created_at: z.date().nullish(),
  expires_at: z.date().nullish(),
  settled_at: z.date().nullish(),
})

export interface CompleteTransaction extends z.infer<typeof TransactionModel> {
  user: CompleteUser
}

/**
 * RelatedTransactionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTransactionModel: z.ZodSchema<CompleteTransaction> = z.lazy(() => TransactionModel.extend({
  user: RelatedUserModel,
}))
