import { z } from "zod";
import { Prisma } from "@prisma/client";
import { nwc } from "@getalby/sdk";
import { UserModel } from "../../../prisma/zod";
import { AppRequest } from "../../types";
import { identifier, lud16URL } from "../utils";
import { getBaseURL } from "../../modules/luds/helpers";
import prisma from ".";

const NewUserModel = UserModel.omit({ id: true });
const UserCreateInput =
  NewUserModel satisfies z.Schema<Prisma.UserUncheckedCreateInput>;

export default Prisma.defineExtension({
  query: {
    user: {
      create({ args, query }) {
        args.data = UserCreateInput.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = UserCreateInput.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = UserCreateInput.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = UserCreateInput.parse(args.create);
        args.update = UserCreateInput.partial().parse(args.update);
        return query(args);
      },
    },
  },
  model: {
    user: {
      findByUsername(username: string, domain: string) {
        return prisma.user.findFirst({
          where: {
            username,
            domain,
          },
        });
      },
      findByLnurlwId(lnurlwId: string) {
        return prisma.user.findFirst({
          where: {
            lnurlwId,
          },
        });
      },
      findNostrVerifiedByUsername(username: string, domain: string) {
        if (!/^[a-z0-9-_.]+$/i.test(username)) {
          return null;
        }
        return prisma.user.findFirst({
          where: {
            username,
            domain,
            nostr_verified: true,
          },
        });
      },
    },
  },
  result: {
    user: {
      lud16: {
        needs: { username: true, domain: true },
        compute({ username, domain }): string {
          return identifier(username, domain);
        },
      },
      lud16URL: {
        needs: { username: true, domain: true },
        compute({ username, domain }) {
          return lud16URL(username, domain);
        },
      },

      getWithdrawURL: {
        needs: { lnurlwId: true },
        compute({ lnurlwId }) {
          return (req: AppRequest) =>
            lnurlwId ? `${getBaseURL(req)}/lnurlw/${lnurlwId}` : undefined;
        },
      },
      nwc: {
        needs: { nwc_url: true },
        compute({ nwc_url }): () => Promise<nwc.NWCClient | undefined> {
          return async function () {
            if (nwc_url) {
              return new nwc.NWCClient({
                nostrWalletConnectUrl: nwc_url,
              });
            }
          };
        },
      },
      makeInvoice: {
        needs: { nwc: true, fetchLUD16Data: true },
        compute(user) {
          return async function (request: nwc.Nip47MakeInvoiceRequest) {
            const nwc = await (
              user.nwc as () => Promise<nwc.NWCClient | undefined>
            )();
            if (nwc) {
              const rawInvoice = await nwc.makeInvoice(request);
              nwc.close();
              const pr = rawInvoice.invoice;
              return {
                raw: rawInvoice,
                invoice: {
                  // routes: [],
                  pr,
                },
              };
            }
            const LUD16Data = await user.fetchLUD16Data();
            if (LUD16Data) {
              let { callback } = LUD16Data;
              if (!callback) {
                throw new Error("Missing callback");
              }
              const params = new URLSearchParams({
                amount: request.amount as unknown as string,
                comment: request.description!,
              });
              callback += callback.includes("?") ? "&" : "?";
              callback += params.toString();
              const res = await fetch(callback);
              return {
                invoice: await res.json(),
              };
            }
            throw new Error("makeInvoice unavailable.");
          };
        },
      },
      saveInvoice: {
        needs: { id: true },
        compute(user) {
          return (invoiceData: object) => {
            return prisma.transaction.createFromData(
              {
                ...invoiceData,
                type: "incoming",
              },
              user.id,
            );
          };
        },
      },
      payInvoice: {
        needs: { nwc: true },
        compute(user) {
          return async function (pr: string) {
            const nwc = await (
              user.nwc as () => Promise<nwc.NWCClient | undefined>
            )();
            if (nwc) {
              const invoice = nwc.payInvoice({
                invoice: pr,
              });
              nwc.close();
              return invoice;
            }
            throw new Error("payInvoice unavailable.");
          };
        },
      },
      fetchLUD16Data: {
        needs: { lud16_forward: true },
        compute({ lud16_forward }) {
          return async function () {
            if (lud16_forward) {
              const [username, domain] = lud16_forward.split("@");
              const lud16ProxyUrl = lud16URL(username, domain);
              const res = await fetch(lud16ProxyUrl);
              return res.json();
            }
          };
        },
      },
      save: {
        needs: { id: true },
        compute(data) {
          return () => prisma.user.update({ where: { id: data.id }, data });
        },
      },
    },
  },
});
