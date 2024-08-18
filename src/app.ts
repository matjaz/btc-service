import express, { Express, NextFunction, Request } from "express";
import db from "./lib/db";
import { error, transform } from "./modules/luds/helpers";
import { getDomainFromReq } from "./lib/utils";
import {
  AnyTransformContext,
  AuthAppRequest,
  LnurlpCallbackTransformContext,
  LnurlpInvoiceTransformContext,
  LnurlpMetadataTransformContext,
  LnurlpTransformContext,
  LnurlwCallbackTransformContext,
  LnurlwTransformContext,
  Module,
  ModuleFunction,
  TransactionAppRequest,
  TransformFunction,
  TransformMap,
  TransformOptions,
  TransformTypes,
} from "./types";

export default class App {
  app: Express;
  modules: Module[] | undefined;
  transformers: Record<string, Array<TransformFunction<AnyTransformContext>>> =
    {};

  constructor({ modules }: { modules: Array<Module> }) {
    this.modules = modules;
    this.app = express();
  }

  protected async init() {
    this.configure();
    await this.loadModules();
  }

  protected configure() {
    this.app.set("view engine", "pug");
    this.app.set("views", "./src/views");
    this.app.set("query parser", "simple");
    this.app.disable("x-powered-by");
    this.app.param(
      "username",
      async function (req: Request, res, next: NextFunction, username: string) {
        try {
          const domain = getDomainFromReq(req);
          const user = await db.user.findByUsername(username, domain);
          if (user) {
            (req as AuthAppRequest).user = user;
          } else {
            res.status(404);
            if (req.path.includes("/lnurlp/")) {
              const err = error("Not found");
              res.send(err);
            }
            res.end();
            return;
          }
          next();
        } catch (err) {
          next(err);
        }
      },
    );
    this.app.param(
      "lnurlwId",
      async function (req: Request, res, next, lnurlwId: string) {
        try {
          const user = await db.user.findByLnurlwId(lnurlwId);
          if (user) {
            (req as AuthAppRequest).user = user;
          } else {
            res.status(404);
            if (req.path.includes("/lnurlw/")) {
              const err = error("Not found");
              res.send(err);
            }
            res.end();
            return;
          }
          next();
        } catch (err) {
          next(err);
        }
      },
    );
    this.app.param(
      "transactionId",
      async function (req: Request, res, next, transactionId: string) {
        try {
          const appReq = req as TransactionAppRequest;
          const transaction = await db.transaction.findByHash(
            transactionId,
            appReq.user,
          );
          if (transaction) {
            appReq.transaction = transaction;
          } else {
            res.status(404);
            if (req.path.includes("/lnurlp/")) {
              const err = error("Not found");
              res.send(err);
            }
            res.end();
            return;
          }
          next();
        } catch (err) {
          next(err);
        }
      },
    );
  }

  protected async loadModules() {
    const allModuleOptions: Array<TransformOptions | undefined> = [];
    const promises = this.modules!.map((mod) => {
      let options: TransformOptions | undefined;
      if (Array.isArray(mod)) {
        const [name, opts] = mod;
        mod = name;
        options = opts;
      }
      allModuleOptions.push(options);
      if (typeof mod === "string") {
        return import(`./modules/${mod}`);
      } else {
        return Promise.resolve(mod);
      }
    });
    const mods = await Promise.all(promises);
    mods.forEach((mod, idx) => {
      const modFn = mod.default as ModuleFunction;
      modFn(this, allModuleOptions[idx]);
    });
    delete this.modules;
  }

  public async listen() {
    await this.init();
    const port = (process.env.PORT && parseFloat(process.env.PORT)) || 3000;
    this.app.listen(port, () => {
      console.info(`listening on ${port}`);
    });
  }

  public addTransformer(
    name: "lnurlp",
    fn: TransformFunction<LnurlpTransformContext>,
  ): void;
  public addTransformer(
    name: "lnurlp-callback",
    fn: TransformFunction<LnurlpCallbackTransformContext>,
  ): void;
  public addTransformer(
    name: "lnurlp-metadata",
    fn: TransformFunction<LnurlpMetadataTransformContext>,
  ): void;
  public addTransformer(
    name: "lnurlp-invoice",
    fn: TransformFunction<LnurlpInvoiceTransformContext>,
  ): void;
  public addTransformer(
    name: "lnurlw",
    fn: TransformFunction<LnurlwTransformContext>,
  ): void;
  public addTransformer(
    name: "lnurlw-callback",
    fn: TransformFunction<LnurlwCallbackTransformContext>,
  ): void;
  public addTransformer(name: TransformTypes, fn: unknown) {
    const { transformers } = this;
    if (!transformers[name]) {
      transformers[name] = [];
    }
    transformers[name].push(fn as TransformFunction<AnyTransformContext>);
  }

  public transform(
    name: "lnurlp",
    ctx: LnurlpTransformContext,
  ): Promise<LnurlpTransformContext>;
  public transform(
    name: "lnurlp-callback",
    ctx: LnurlpCallbackTransformContext,
  ): Promise<LnurlpCallbackTransformContext>;
  public transform(
    name: "lnurlp-metadata",
    ctx: LnurlpMetadataTransformContext,
  ): Promise<LnurlpMetadataTransformContext>;
  public transform(
    name: "lnurlp-invoice",
    ctx: LnurlpInvoiceTransformContext,
  ): Promise<LnurlpInvoiceTransformContext>;
  public transform(
    name: "lnurlw",
    ctx: LnurlwTransformContext,
  ): Promise<LnurlwTransformContext>;
  public transform(
    name: "lnurlw-callback",
    ctx: LnurlwCallbackTransformContext,
  ): Promise<LnurlwCallbackTransformContext>;
  public transform(name: TransformTypes, ctx: TransformMap[typeof name]) {
    const transformers = this.transformers[name];
    if (!transformers) {
      throw new Error(`Unknown transform ${name}`);
    }
    return transform(ctx, transformers);
  }

  public use(...args: unknown[]) {
    this.app.use(...args);
  }

  public get(...args: unknown[]) {
    this.app.get(...args);
  }

  public post(...args: unknown[]) {
    this.app.post(...args);
  }
}
