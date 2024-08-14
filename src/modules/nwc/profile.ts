import { Response } from "express";
import App from "../../app";
import { AppRequest } from "../../types";

export default function nwcProfile(app: App) {
  app.get("/nwc/p/:username", async (req: AppRequest, res: Response) => {
    let client;
    try {
      const { user } = req;
      client = await user.nwc();
      const info = await client.getInfo();
      const balance = await client.getBalance();
      res.send({
        info,
        balance,
        // just for demonstration here, add some auth
        withdrawURL: user.getWithdrawURL(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).end();
    } finally {
      if (client) {
        client.close();
      }
    }
  });
}
