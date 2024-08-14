import { Request } from "express";
import App from "./app";
import User from "./models/User";

export type AppRequest = Request & {
  user: User | undefined;
  transaction: any | undefined;
};
export type AppOptions = Record<string, unknown>;

export type TransformOptions = Record<string, unknown>;
export type ModuleWithOptions = [name: string, opts: TransformOptions];

export type TransformContext = Record<string, unknown> & {
  req: AppRequest;
  user: User;
  value: Record<string, unknown> | Array<[string, unknown]>;
};

export interface LnurlpTransformContext extends TransformContext {
  value: any;
}
export interface LnurlpCallbackTransformContext extends TransformContext {
  value: any;
  rawInvoice: any;
}
export interface InvoiceTransformContext extends TransformContext {
  value: any;
}
export interface LnurlpMetadataTransformContext extends TransformContext {
  value: any;
}

export interface LnurlwTransformContext extends TransformContext {
  value: any;
}
export interface LnurlwCallbackTransformContext extends TransformContext {
  value: any;
}

export type TransformFunction = (ctx: TransformContext) => void;

export type Module = string | ModuleWithOptions | TransformFunction;

export type ModuleFunction = (app: App, options?: TransformOptions) => void;
