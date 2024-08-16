import express, { Express, NextFunction, Request } from "express";
import db from "./lib/db";
import { error, transform } from "./modules/luds/helpers";
import { getDomainFromReq } from "./lib/utils";
import {
  AuthAppRequest,
  Module,
  ModuleFunction,
  TransactionAppRequest,
  TransformContext,
  TransformFunction,
  TransformOptions,
} from "./types";

export default class App {
  app: Express;
  modules: Module[] | undefined;
  transformers: Record<string, Array<TransformFunction>> = {};

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
    this.modules!.forEach(async (mod) => {
      let options: TransformOptions | undefined;
      if (Array.isArray(mod)) {
        const [name, opts] = mod;
        mod = name;
        options = opts;
      }
      if (typeof mod === "string") {
        mod = (await import(`./modules/${mod}`)).default as ModuleFunction;
      }
      mod(this, options);
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

  public addTransformer(name: string, fn: TransformFunction) {
    const { transformers } = this;
    if (!transformers[name]) {
      transformers[name] = [];
    }
    transformers[name].push(fn);
  }

  public transform<T>(name: string, ctx: TransformContext) {
    const transformers = this.transformers[name];
    if (!transformers) {
      throw new Error(`Unknown transform ${name}`);
    }
    return transform(ctx, transformers) as T;
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
