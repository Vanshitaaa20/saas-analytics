-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "planTier" "PlanTier" NOT NULL DEFAULT 'FREE';
