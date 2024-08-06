import express from "express";
import User from "./models/User.js";
import Payment from "./models/Payment.js";
import { error, transform } from "./modules/luds/helpers.js";
import { getDomainFromReq } from "./lib/utils.js";

export default class App {
  transformers = {};

  constructor({ modules }) {
    this.modules = modules;
    this.init();
  }

  init() {
    this.app = express();
    this.configure();
    this.loadModules();
  }

  configure() {
    this.app.set('view engine', 'pug');
    this.app.set('views', './src/views')
    this.app.disable("x-powered-by");
    this.app.param("username", async function (req, res, next, username) {
      try {
        const domain = getDomainFromReq(req);
        const user = await User.findByUsername(username, domain);
        if (user) {
          req.user = user;
        } else {
          res.status(404);
          if (req.path.includes('/lnurlp/')) {
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
    });
    this.app.param("invoiceId", async function (req, res, next, invoiceId) {
      try {
        const payment = await Payment.findByHash(invoiceId, req.user);
        if (payment) {
          req.payment = payment;
        } else {
          res.status(404);
          if (req.path.includes('/lnurlp/')) {
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
    });
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
        mod = (await import(`./modules/${mod}.js`)).default;
      }
      mod(this, options);
    });
    this.modules = null;
  }

  listen() {
    const port = parseFloat(process.env.PORT) || 3000;
    this.app.listen(port, () => {
      console.info(`listening on ${port}`);
    });
  }

  addTransformer(name, fn) {
    let { transformers } = this;
    if (!transformers[name]) {
      transformers[name] = [];
    }
    transformers[name].push(fn);
  }

  transform(name, ctx) {
    const transformers = this.transformers[name];
    if (!transformers) {
      throw new Error(`Unknown transform ${name}`);
    }
    return transform(ctx, transformers);
  }

  use() {
    this.app.use(...arguments);
  }

  get() {
    this.app.get(...arguments);
  }

  post() {
    this.app.post(...arguments);
  }
}
