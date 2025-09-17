-- CreateEnum
CREATE TYPE "City" AS ENUM ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Apartment', 'Villa', 'Plot', 'Office', 'Retail');

-- CreateEnum
CREATE TYPE "Bhk" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'Studio');

-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('Buy', 'Rent');

-- CreateEnum
CREATE TYPE "Timeline" AS ENUM ('IMMEDIATE', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'Exploring');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('Website', 'Referral', 'Walk_in', 'Call', 'Other');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');

-- CreateTable
CREATE TABLE "Buyer" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "city" "City",
    "propertyType" "PropertyType",
    "bhk" "Bhk",
    "purpose" "Purpose",
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" "Timeline",
    "source" "Source",
    "status" "Status" NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "tags" TEXT[],
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerHistory" (
    "id" UUID NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB NOT NULL,
    "buyerId" UUID NOT NULL,

    CONSTRAINT "BuyerHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BuyerHistory" ADD CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
