-- CreateTable
CREATE TABLE "rollups" (
    "id" TEXT NOT NULL,
    "bucketType" TEXT NOT NULL,
    "bucketAt" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rollups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rollups_orgId_bucketType_bucketAt_idx" ON "rollups"("orgId", "bucketType", "bucketAt");

-- CreateIndex
CREATE UNIQUE INDEX "rollups_orgId_bucketType_bucketAt_eventName_key" ON "rollups"("orgId", "bucketType", "bucketAt", "eventName");

-- AddForeignKey
ALTER TABLE "rollups" ADD CONSTRAINT "rollups_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
