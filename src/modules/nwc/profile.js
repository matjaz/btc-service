export default function nwcProfile(app) {
  app.get("/nwc/p/:username", async (req, res) => {
    let client;
    try {
      const { user } = req;
      client = await user.nwc();
      const info = await client.getInfo();
      const balance = await client.getBalance();
      res.send({
        info,
        balance,
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
