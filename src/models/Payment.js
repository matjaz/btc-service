import { ObjectId } from "mongoose";
import { createModel } from "../lib/db.js";

export default await createModel(
  "Payment",
  {
    user: {
      type: ObjectId,
    },
    payment_hash: {
      type: String,
      required: true,
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
        const payment = await this.findOne(search);
        if (payment && !payment.settled && user.nwc_lnurlp) {
          const nwc = await user.nwc();
          const response = await nwc.lookupInvoice({
            payment_hash: paymentHash,
          });
          nwc.close();
          if (response.preimage) {
            payment.settled = true;
            payment.preimage = response.preimage;
            payment.fees_paid = response.fees_paid;
            payment.settled_at = response.settled_at;
            return payment.save();
          }
        }
        return payment;
      },
      createFromData(paymentData, user) {
        return this.create({
          user: user._id,
          pr: paymentData.invoice,
          payment_hash: paymentData.payment_hash,
          created_at: paymentData.created_at,
          expires_at: paymentData.expires_at,
        });
      },
    },
  },
);
