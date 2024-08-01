export default function (app) {
  app.get("/nwc/connect", async (req, res) => {
    const html = `<html><head><title>NWC connect</title></head><body><script type="module">
import 'https://esm.sh/@getalby/bitcoin-connect@3.5.3';
let checkInt=setInterval(function() {
  const bcConfig = localStorage['bc:config'];
  if (bcConfig) {
    clearInterval(checkInt);
    prompt("NWC URL", JSON.parse(bcConfig).nwcUrl);
  }
}, 500)
</script><bc-button></bc-button></body></html>`;
    res.send(html);
  });
}
