-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT,
    "hasEmail" BOOLEAN,
    "lud16_forward" TEXT,
    "lnurlwId" TEXT,
    "lnurlwK1" TEXT,
    "lnurlwBalanceNotify" TEXT,
    "nwc_url" TEXT,
    "nostr_verified" BOOLEAN,
    "nostr_publicKey" TEXT,
    "nostr_relays" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "payment_hash" TEXT NOT NULL,
    "pr" TEXT NOT NULL,
    "preimage" TEXT,
    "settled" BOOLEAN,
    "fees_paid" INTEGER,
    "created_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_lnurlwId_key" ON "User"("lnurlwId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_domain_key" ON "User"("username", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_payment_hash_key" ON "Transaction"("payment_hash");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
