-- CreateTable
CREATE TABLE "RSSFeed" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "RSSFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSSFeedRecipient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "split" TEXT NOT NULL,
    "customKey" TEXT,
    "customValue" TEXT,
    "rssFeedId" INTEGER NOT NULL,

    CONSTRAINT "RSSFeedRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RSSFeed_slug_key" ON "RSSFeed"("slug");

-- AddForeignKey
ALTER TABLE "RSSFeedRecipient" ADD CONSTRAINT "RSSFeedRecipient_rssFeedId_fkey" FOREIGN KEY ("rssFeedId") REFERENCES "RSSFeed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
