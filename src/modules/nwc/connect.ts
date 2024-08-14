import { Request, Response } from "express";
import App from "../../app";

export default function nwcConnect(app: App) {
  app.get("/nwc/connect", async (req: Request, res: Response) => {
    const html = `<html><head><title>NWC connect</title></head><body><script type="module">
import {init, onConnected} from 'https://esm.sh/@getalby/bitcoin-connect@3.5.3';
init({
  appName: 'Bitcoin service',
  filters: ["nwc"],
  providerConfig: {
    nwc: {
      authorizationUrlOptions: {
        requestMethods: ['get_info','get_balance','make_invoice','lookup_invoice','pay_invoice'],
      },
    },
  }
});
onConnected((provider) => {
  prompt("NWC URL", provider.getNostrWalletConnectUrl());
});
</script><bc-button></bc-button></body></html>`;
    res.send(html);
  });
}
