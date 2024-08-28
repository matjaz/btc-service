import "websocket-polyfill";
import {
  PrismaClient,
  User as PrismaUser,
  Transaction as PrismaTransaction,
} from "@prisma/client";
import User from "./User";
import Transaction from "./Transaction";
import { nwc } from "@getalby/sdk";
import {
  LnurlpCallbackTransformContext,
  LnurlpTransformContext,
  PayerDataResponse,
} from "../../types";

export type User = PrismaUser & {
  lud16: string;
  lud16URL: string;
  nwc(): Promise<nwc.NWCClient | undefined>;
  save(): Promise<void>;
  makeInvoice(request: nwc.Nip47MakeInvoiceRequest): Promise<{
    raw?: nwc.Nip47Transaction;
    invoice: LnurlpCallbackTransformContext["value"];
  }>;
  payInvoice(pr: string): Promise<nwc.Nip47PayResponse>;
  saveInvoice(
    invoice: nwc.Nip47Transaction,
    payerData?: PayerDataResponse,
  ): Promise<void>;
  fetchLUD16Data(): Promise<LnurlpTransformContext["value"]>;
  balanceNotify(): Promise<void>;
};
export type Transaction = PrismaTransaction;

const prisma = new PrismaClient().$extends(User).$extends(Transaction);

export default prisma;
