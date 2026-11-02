-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DonationStatus" ADD VALUE 'PENDING_PAYMENT';
ALTER TYPE "DonationStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'DEMO',
ADD COLUMN     "providerRef" TEXT;

-- CreateIndex
CREATE INDEX "Donation_provider_providerRef_idx" ON "Donation"("provider", "providerRef");
