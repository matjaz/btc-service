import { ObjectId } from "mongoose";
import { createModel } from "../lib/db.js";

const Transaction = await createModel(
  "Transaction",
  {
    type: {
      type: String,
      required: true,
      match: /^incoming|outgoing$/,
    },
    user: {
      type: ObjectId,
    },
    payment_hash: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9a-fA-F]{64}$/,
    },
    pr: {
      type: String,
      required: true,
    },
    preimage: {
      type: String,
      match: /^[0-9a-fA-F]{64}$/,
    },
    settled: Boolean,
    fees_paid: Number,
    created_at: Number,
    expires_at: Number,
    settled_at: Number,
  },
  {
    statics: {
      async findByHash(paymentHash, user) {
        const search = {
          user,
          payment_hash: paymentHash,
        };
        const transaction = await this.findOne(search);
        if (transaction && !transaction.settled && user.nwc_url) {
          const nwc = await user.nwc();
          const response = await nwc.lookupInvoice({
            payment_hash: paymentHash,
          });
          nwc.close();
          if (response.preimage) {
            transaction.settled = true;
            transaction.preimage = response.preimage;
            transaction.fees_paid = response.fees_paid;
            transaction.settled_at = response.settled_at;
            return transaction.save();
          }
        }
        return transaction;
      },
      createFromData(data, user) {
        return this.create({
          user: user._id,
          type: data.type,
          pr: data.invoice,
          payment_hash: data.payment_hash,
          created_at: data.created_at,
          expires_at: data.expires_at,
        });
      },
    },
  },
);

Transaction.schema.index({ user: 1, payment_hash: 1 });

export default Transaction;
