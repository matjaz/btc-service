import { Request } from "express";
import App from "./app";
import { User, Transaction } from "./lib/db";

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

export type TransformOptions = Record<string, unknown>;
export type TransformContext = Record<string, unknown> & {
  req: AppRequest;
  user: User;
};
export type TransformFunction = (
  ctx: TransformContext,
) => Promise<TransformContext | void>;

export interface LnurlpTransformContext extends TransformContext {
  value: Record<string, unknown>;
}
export interface LnurlpCallbackTransformContext extends TransformContext {
  value: Record<string, unknown>;
  rawInvoice: Record<string, unknown>;
}
export interface InvoiceTransformContext extends TransformContext {
  value: Record<string, unknown>;
}
export interface LnurlpMetadataTransformContext extends TransformContext {
  value: Array<[string, unknown]>;
}

export interface LnurlwTransformContext extends TransformContext {
  value: Record<string, unknown>;
}
export interface LnurlwCallbackTransformContext extends TransformContext {
  value: Record<string, unknown>;
}

export type ModuleWithOptions = [name: string, opts: TransformOptions];
export type ModuleFunction = (app: App, options?: TransformOptions) => void;
export type Module = string | ModuleWithOptions | ModuleFunction;
