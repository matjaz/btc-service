import express, { Express, NextFunction, Request } from "express";
import User from "./models/User";
import { error, transform } from "./modules/luds/helpers";
import { getDomainFromReq } from "./lib/utils";
import {
  AppRequest,
  Module,
  ModuleFunction,
  TransformContext,
  TransformFunction,
} from "./types";

export default class App {
  app: Express;
  modules: Module[];
  transformers: Record<string, Array<TransformFunction>> = {};

  constructor({ modules }: { modules: Array<Module> }) {
    this.modules = modules;
    this.app = express();
    this.init();
  }

  init() {
    this.configure();
    this.loadModules();
  }

  configure() {
    this.app.set("view engine", "pug");
    this.app.set("views", "./src/views");
    this.app.set("query parser", "simple");
    this.app.disable("x-powered-by");
    this.app.param(
      "username",
      async function (req: Request, res, next: NextFunction, username: string) {
        try {
          const domain = getDomainFromReq(req);
          const user = await User.findByUsername(username, domain);
          if (user) {
            (req as AppRequest).user = user;
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
          const user = await User.findByLnurlwId(lnurlwId);
          if (user) {
            (req as AppRequest).user = user;
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
          const appReq = req as AppRequest;
          const transaction = await appReq.user.findTransaction(transactionId);
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

  async loadModules() {
    this.modules.forEach(async (mod) => {
      let options;
      if (Array.isArray(mod)) {
        const [name, opts] = mod;
        mod = name;
        options = opts;
      }
      if (typeof mod === "string") {
        mod = (await import(`./modules/${mod}`)).default;
      }
      (mod as unknown as ModuleFunction)(this, options);
    });
    this.modules = [];
  }

  listen() {
    const port = (process.env.PORT && parseFloat(process.env.PORT)) || 3000;
    this.app.listen(port, () => {
      console.info(`listening on ${port}`);
    });
  }

  addTransformer(name: string, fn: TransformFunction) {
    const { transformers } = this;
    if (!transformers[name]) {
      transformers[name] = [];
    }
    transformers[name].push(fn);
  }

  transform(name: string, ctx: TransformContext) {
    const transformers = this.transformers[name];
    if (!transformers) {
      throw new Error(`Unknown transform ${name}`);
    }
    return transform(ctx, transformers);
  }

  use(...args: any[]) {
    this.app.use(...args);
  }

  get(...args: any[]) {
    this.app.get(...args);
  }

  post(...args: any[]) {
    this.app.post(...args);
  }
}
