import db from "../src/lib/db";

const feed = await db.rSSFeed.create({
  data: {
    slug: "alby",
    url: "https://blog.getalby.com/rss/",
  },
});

await db.rSSFeedRecipient.create({
  data: {
    name: "Alby",
    type: "lnaddress",
    address: "hello@getalby.com",
    split: "100",
    rssFeedId: feed.id,
  },
});

console.info("RSS feed added");
