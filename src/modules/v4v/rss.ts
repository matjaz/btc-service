import express, { Request, Response, NextFunction } from "express";
import App from "../../app";
import db from "../../lib/db";

// https://github.com/Podcastindex-org/podcast-namespace/blob/main/value/value.md#lightning
export default function userProfile(app: App) {
  app.use("/v4v/rss", express.static(import.meta.dirname + "/static"));

  app.get(
    "/v4v/rss/:rssId",
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        params: { rssId },
      } = req;

      const feed = await db.rSSFeed.findFirst({
        where: {
          slug: rssId,
        },
        include: {
          recipients: true,
        },
      });

      if (!feed) {
        next();
        return;
      }

      try {
        console.info(rssId, feed.url);
        const result = await fetch(feed.url);
        if (!result.ok) {
          res.status(500).send("Failed fetching RSS feed.");
          return;
        }
        let valueTag = '<podcast:value type="lightning" method="keysend">';
        feed.recipients.forEach((valueRecipent) => {
          let custom = "";
          if (valueRecipent.customKey && valueRecipent.customValue) {
            custom = `customKey="${valueRecipent.customKey}"  customValue="${valueRecipent.customValue}" `;
          }
          valueTag += `<podcast:valueRecipient name="${valueRecipent.name}" type="${valueRecipent.type}" address="${valueRecipent.address}" ${custom}split="${valueRecipent.split}"/>`;
        });
        valueTag += "</podcast:value>";

        let content = await result.text();
        content = content.replace(
          "<rss",
          '<?xml-stylesheet type="text/xsl" href="rss.xsl"?><rss xmlns:podcast="https://podcastindex.org/namespace/1.0"',
        );
        content = content.replace("<channel>", `<channel>${valueTag}`);
        res.set("content-type", "application/xml");
        res.send(content);
      } catch (e) {
        console.error(e);
        res.sendStatus(500);
      }
    },
  );
}
