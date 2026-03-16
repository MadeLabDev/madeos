/*
  Warnings:

  - Added the required column `sourceId` to the `KnowledgeVector` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceModule` to the `KnowledgeVector` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "KnowledgeVector_hash_key";

-- AlterTable
ALTER TABLE "KnowledgeVector" ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "sourceModule" TEXT NOT NULL,
ADD COLUMN     "sourceType" TEXT NOT NULL DEFAULT 'text',
ALTER COLUMN "knowledgeId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "KnowledgeVector_sourceModule_idx" ON "KnowledgeVector"("sourceModule");

-- CreateIndex
CREATE INDEX "KnowledgeVector_sourceId_idx" ON "KnowledgeVector"("sourceId");

-- CreateIndex
CREATE INDEX "KnowledgeVector_sourceModule_sourceId_idx" ON "KnowledgeVector"("sourceModule", "sourceId");

-- CreateIndex
CREATE INDEX "KnowledgeVector_hash_idx" ON "KnowledgeVector"("hash");
