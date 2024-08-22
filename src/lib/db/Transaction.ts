import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TransactionModel } from "../../../prisma/zod";
import prisma, { User } from ".";

const NewTransactionModel = TransactionModel.omit({ id: true });
const TransactionCreateInput =
  NewTransactionModel satisfies z.Schema<Prisma.TransactionUncheckedCreateInput>;

export default Prisma.defineExtension({
  query: {
    transaction: {
      create({ args, query }) {
        args.data = TransactionCreateInput.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = TransactionCreateInput.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = TransactionCreateInput.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = TransactionCreateInput.parse(args.create);
        args.update = TransactionCreateInput.partial().parse(args.update);
        return query(args);
      },
    },
  },
  model: {
    transaction: {
      async findByHash(payment_hash: string, user: User) {
        const transaction = await prisma.transaction.findFirst({
          where: {
            userId: user.id,
            payment_hash,
          },
        });
        if (transaction && !transaction.settled) {
          const nwc = await user.nwc();
          if (nwc) {
            try {
              const response = await nwc.lookupInvoice({
                payment_hash,
              });
              if (response.preimage) {
                transaction.settled = true;
                transaction.preimage = response.preimage;
                transaction.fees_paid = response.fees_paid;
                transaction.settled_at = new Date(response.settled_at * 1000);
                user.balanceNotify();
                return transaction.save();
              }
            } catch (e) {
              console.error(e);
            } finally {
              nwc.close();
            }
          }
        }
        return transaction;
      },
      createFromData(data: Record<string, string | number>, userId: number) {
        return prisma.transaction.create({
          data: {
            userId,
            type: data.type as string,
            pr: data.invoice as string,
            payment_hash: data.payment_hash as string,
            payer_data: data.payer_data as string,
            created_at: new Date((data.created_at as number) * 1000),
            expires_at: new Date((data.expires_at as number) * 1000),
          },
        });
      },
    },
  },
  result: {
    transaction: {
      save: {
        needs: { id: true },
        compute(data) {
          return () =>
            prisma.transaction.update({ where: { id: data.id }, data });
        },
      },
    },
  },
});
