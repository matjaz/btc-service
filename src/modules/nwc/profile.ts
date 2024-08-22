import { Response } from "express";
import App from "../../app";
import { AuthAppRequest } from "../../types";

export default function nwcProfile(app: App) {
  app.get("/nwc/p/:username", async (req: AuthAppRequest, res: Response) => {
    const client = await req.user.nwc();
    if (!client) {
      res.status(404).end();
      return;
    }
    try {
      const info = await client.getInfo();
      const balance = await client.getBalance();
      res.send({
        info,
        balance,
        // just for demonstration here, add some auth
        // withdrawURL: user.getWithdrawURL(req),
      });
    } catch (e) {
      console.error(e);
      res.status(500).end();
    } finally {
      client.close();
    }
  });
}
