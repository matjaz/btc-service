-- AlterTable
ALTER TABLE "User" ADD COLUMN     "keysend_publicKey" TEXT;

-- CreateTable
CREATE TABLE "KeysendCustomData" (
    "id" SERIAL NOT NULL,
    "customKey" TEXT NOT NULL,
    "customValue" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "KeysendCustomData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KeysendCustomData" ADD CONSTRAINT "KeysendCustomData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
