-- A child has an independent account for Studio Code + PIN sign-in.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CHILD';

ALTER TABLE "Child" ADD COLUMN "accountId" TEXT;
ALTER TABLE "Child" ADD COLUMN "studioCode" TEXT;

CREATE UNIQUE INDEX "Child_accountId_key" ON "Child"("accountId");
CREATE UNIQUE INDEX "Child_studioCode_key" ON "Child"("studioCode");

ALTER TABLE "Child"
  ADD CONSTRAINT "Child_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
