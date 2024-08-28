import { Request } from "express";
import { nwc } from "@getalby/sdk";
import { User, Transaction } from "./lib/db";
import App from "./app";

export interface AppRequest extends Request {
  user: User | undefined;
  transaction: Transaction | undefined;
}
export interface AuthAppRequest extends AppRequest {
  user: User;
  transaction: Transaction | undefined;
}
export interface TransactionAppRequest extends AuthAppRequest {
  transaction: Transaction;
}

export type AppOptions = Record<string, unknown>;

export type LNURLError = {
  status: "ERROR";
  reason: string;
};

export type TransformMap = {
  lnurlp: LnurlpTransformContext;
  "lnurlp-callback": LnurlpCallbackTransformContext;
  "lnurlp-metadata": LnurlpMetadataTransformContext;
  "lnurlp-invoice": LnurlpInvoiceTransformContext;

  lnurlw: LnurlwTransformContext;
  "lnurlw-callback": LnurlwCallbackTransformContext;
  keysend: KeysendTransformContext;
};

export type TransformTypes = keyof TransformMap;

type BaseTransformContext = {
  req: AppRequest;
  user: User;
  error?: LNURLError | undefined;
};

export type Lnurlp = {
  tag: "payRequest";
  callback: string;
  minSendable: number;
  maxSendable: number;
  metadata?: string;
  commentAllowed?: number;
  disposable?: boolean;
  payerData?: PayerDataRequest;
};
export type LnurlpOption =
  | (Lnurlp & { type: "lnurlp" })
  | (KeysendBase & { type: "keysend" });
export type LnurlpTransformContext = BaseTransformContext & {
  value: Lnurlp;
};
export type LnurlpCallbackTransformContext = BaseTransformContext & {
  value: {
    pr: string;
    routes?: Array<string>;
    successAction: LnurlpCallbackSuccessAction;
    verify?: string;
  };
  payerData?: PayerDataResponse;
  requiresSaveInvoice?: boolean;
  rawInvoice?: nwc.Nip47Transaction;
};
export type LnurlpMetadataTransformContext = BaseTransformContext & {
  value: Array<[string, unknown]>;
};
export type LnurlpInvoiceTransformContext = BaseTransformContext & {
  value: nwc.Nip47MakeInvoiceRequest;
};

type LnurlpCallbackSuccessAction =
  | {
      tag: "message";
      message: string;
    }
  | {
      tag: "url";
      url: string;
      description: string;
    }
  | {
      tag: Exclude<string, "message" | "url">;
      [k: string]: unknown;
    };

export type LnurlwTransformContext = BaseTransformContext & {
  value: {
    tag: "withdrawRequest";
    callback: string;
    k1: string;
    defaultDescription?: string;
    minWithdrawable?: number;
    maxWithdrawable?: number;
    balanceCheck?: string;
    currentBalance?: number;
  };
};
export type LnurlwCallbackTransformContext = BaseTransformContext & {
  value: Record<string, unknown>;
};

export type KeysendBase = {
  pubkey: string;
  customData?: Array<KeysendCustomData>;
};
export type KeysendCustomData = {
  customKey: string;
  customValue: string;
};
export type KeysendTransformContext = BaseTransformContext & {
  value?: KeysendBase & {
    status: "OK";
    tag: "keysend";
  };
};

export type AnyTransformContext =
  | LnurlpTransformContext
  | LnurlpCallbackTransformContext
  | LnurlpMetadataTransformContext
  | LnurlpInvoiceTransformContext
  | LnurlwTransformContext
  | LnurlwCallbackTransformContext
  | KeysendTransformContext;

export type PayerDataStringKind = "name" | "pubkey" | "identifier" | "email";
export type PayerDataRequest = Record<
  PayerDataStringKind,
  {
    mandatory: boolean;
  }
> & {
  auth?: {
    mandatory: boolean;
    k1: string; // hex encoded 32 bytes of challenge
  };
};

export type PayerDataResponse = Record<PayerDataStringKind, string> & {
  auth?: {
    key: string;
    k1: string;
    sig: string;
  };
};

export type PayerDataKind = keyof PayerDataRequest;

export type TransformFunction<T> = (ctx: T) => Promise<T | void>;

export type TransformOptions = Record<string, unknown>;
export type ModuleWithOptions = [name: string, opts: TransformOptions];
export type ModuleFunction = (app: App, options?: TransformOptions) => void;
export type Module = string | ModuleWithOptions | ModuleFunction;
