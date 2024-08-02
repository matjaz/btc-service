export default function (app) {
  app.get("/nwc/connect", async (req, res) => {
    const html = `<html><head><title>NWC connect</title></head><body><script type="module">
import {onConnected} from 'https://esm.sh/@getalby/bitcoin-connect@3.5.3';
onConnected((provider) => {
  prompt("NWC URL", provider.getNostrWalletConnectUrl());
});
</script><bc-button></bc-button></body></html>`;
    res.send(html);
  });
}
