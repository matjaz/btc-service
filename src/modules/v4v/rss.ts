import express, { Request, Response, NextFunction } from "express";
import App from "../../app";
import db from "../../lib/db";

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// https://value4value.info/
// https://github.com/Podcastindex-org/podcast-namespace/blob/main/value/value.md#lightning
export default function v4vRSS(app: App) {
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
        const result = await fetch(feed.url);
        if (!result.ok) {
          res.status(500).send("Failed fetching RSS feed.");
          return;
        }
        let valueTag = '<podcast:value type="lightning" method="keysend">';
        feed.recipients.forEach((valueRecipent) => {
          let custom = "";
          if (valueRecipent.customKey && valueRecipent.customValue) {
            custom = `customKey="${escapeXmlAttr(valueRecipent.customKey)}"  customValue="${escapeXmlAttr(valueRecipent.customValue)}" `;
          }
          valueTag += `<podcast:valueRecipient name="${escapeXmlAttr(valueRecipent.name)}" type="${escapeXmlAttr(valueRecipent.type)}" address="${escapeXmlAttr(valueRecipent.address)}" ${custom}split="${escapeXmlAttr(valueRecipent.split)}"/>`;
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
