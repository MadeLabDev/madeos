-- CreateTable
CREATE TABLE "EmbeddingCache" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "costUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddingCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAGSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "totalCostUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RAGSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAGMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "answer" TEXT,
    "sourceIds" TEXT,
    "similarityScores" TEXT,
    "embeddingModel" TEXT,
    "llmModel" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RAGMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAGFeedback" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "isHelpful" BOOLEAN,
    "isAccurate" BOOLEAN,
    "comments" TEXT,
    "suggestedAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RAGFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAGMetrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalQueries" INTEGER NOT NULL DEFAULT 0,
    "totalAnswers" INTEGER NOT NULL DEFAULT 0,
    "averageLatencyMs" INTEGER NOT NULL DEFAULT 0,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "totalCostUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAccuracy" DOUBLE PRECISION,
    "avgHelpfulness" DOUBLE PRECISION,
    "feedbackCount" INTEGER NOT NULL DEFAULT 0,
    "embeddingModel" TEXT,
    "llmModel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RAGMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddingCache_contentHash_key" ON "EmbeddingCache"("contentHash");

-- CreateIndex
CREATE INDEX "EmbeddingCache_embeddingModel_idx" ON "EmbeddingCache"("embeddingModel");

-- CreateIndex
CREATE INDEX "EmbeddingCache_createdAt_idx" ON "EmbeddingCache"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddingCache_contentHash_embeddingModel_key" ON "EmbeddingCache"("contentHash", "embeddingModel");

-- CreateIndex
CREATE INDEX "RAGSession_userId_idx" ON "RAGSession"("userId");

-- CreateIndex
CREATE INDEX "RAGSession_status_idx" ON "RAGSession"("status");

-- CreateIndex
CREATE INDEX "RAGSession_createdAt_idx" ON "RAGSession"("createdAt");

-- CreateIndex
CREATE INDEX "RAGMessage_sessionId_idx" ON "RAGMessage"("sessionId");

-- CreateIndex
CREATE INDEX "RAGMessage_role_idx" ON "RAGMessage"("role");

-- CreateIndex
CREATE INDEX "RAGMessage_createdAt_idx" ON "RAGMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RAGFeedback_messageId_key" ON "RAGFeedback"("messageId");

-- CreateIndex
CREATE INDEX "RAGFeedback_userId_idx" ON "RAGFeedback"("userId");

-- CreateIndex
CREATE INDEX "RAGFeedback_createdAt_idx" ON "RAGFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "RAGFeedback_isHelpful_idx" ON "RAGFeedback"("isHelpful");

-- CreateIndex
CREATE UNIQUE INDEX "RAGMetrics_date_key" ON "RAGMetrics"("date");

-- CreateIndex
CREATE INDEX "RAGMetrics_date_idx" ON "RAGMetrics"("date");

-- AddForeignKey
ALTER TABLE "RAGSession" ADD CONSTRAINT "RAGSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAGMessage" ADD CONSTRAINT "RAGMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RAGSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAGFeedback" ADD CONSTRAINT "RAGFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
