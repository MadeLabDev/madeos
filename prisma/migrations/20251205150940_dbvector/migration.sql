-- CreateTable
CREATE TABLE "KnowledgeVector" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "embeddingModel" TEXT NOT NULL DEFAULT 'minimlm-l6-v2',
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "hash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeVector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VectorSearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "topK" INTEGER NOT NULL DEFAULT 3,
    "minSimilarity" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "resultKnowledgeIds" TEXT,
    "similarityScores" TEXT,
    "responseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "modelUsed" TEXT NOT NULL DEFAULT 'minimlm-l6-v2',
    "status" TEXT NOT NULL DEFAULT 'success',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VectorSearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeVector_hash_key" ON "KnowledgeVector"("hash");

-- CreateIndex
CREATE INDEX "KnowledgeVector_knowledgeId_idx" ON "KnowledgeVector"("knowledgeId");

-- CreateIndex
CREATE INDEX "KnowledgeVector_embeddingModel_idx" ON "KnowledgeVector"("embeddingModel");

-- CreateIndex
CREATE INDEX "KnowledgeVector_createdAt_idx" ON "KnowledgeVector"("createdAt");

-- CreateIndex
CREATE INDEX "VectorSearchLog_userId_idx" ON "VectorSearchLog"("userId");

-- CreateIndex
CREATE INDEX "VectorSearchLog_createdAt_idx" ON "VectorSearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "VectorSearchLog_modelUsed_idx" ON "VectorSearchLog"("modelUsed");

-- AddForeignKey
ALTER TABLE "KnowledgeVector" ADD CONSTRAINT "KnowledgeVector_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VectorSearchLog" ADD CONSTRAINT "VectorSearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
