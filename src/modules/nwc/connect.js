export default function nwcConnect(app) {
  app.get("/nwc/connect", async (req, res) => {
    const html = `<html><head><title>NWC connect</title></head><body><script type="module">
import {init, onConnected} from 'https://esm.sh/@getalby/bitcoin-connect@3.5.3';
init({
  appName: 'Bitcoin service',
  filters: ["nwc"],
  providerConfig: {
    nwc: {
      authorizationUrlOptions: {
        requestMethods: ['make_invoice', 'lookup_invoice'],
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
