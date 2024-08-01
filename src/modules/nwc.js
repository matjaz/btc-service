export default function (app) {
  app.get("/nwc/:username", async (req, res) => {
    const client = await req.user.nwc();
    try {
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
