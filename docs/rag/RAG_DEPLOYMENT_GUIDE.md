# RAG System Deployment Guide

## Pre-Deployment Checklist

### Environment Variables Setup

#### 1. **Required Environment Variables**

Add to `.env.local` (development) or `.env.production` (production):

```bash
# ===== Embedding Provider =====
# Choose ONE provider (or use "local" for free option)

# OpenAI (Recommended - most reliable)
OPENAI_API_KEY=sk-...
EMBEDDING_PROVIDER=openai

# OR Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
EMBEDDING_PROVIDER=gemini

# OR Cohere
COHERE_API_KEY=...
EMBEDDING_PROVIDER=cohere

# OR Local (Free - Xenova, slower but works offline)
EMBEDDING_PROVIDER=local

# ===== LLM Provider (Optional) =====
# If not set, RAG falls back to source summarization (still useful)

# OpenAI GPT-4
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai

# OR Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
LLM_PROVIDER=gemini

# OR Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=claude

# OR Groq (Free option - very fast)
GROQ_API_KEY=gsk_...
LLM_PROVIDER=groq

# None (Use source summarization only - free but less intelligent)
LLM_PROVIDER=none

# ===== Feature Flag =====
# Enable RAG features (can be toggled in Settings page)
RAG_ENABLED=true

# ===== Optional Configuration =====
# Performance tuning
RAG_CACHE_TTL=3600  # Cache query results for 1 hour
RAG_BATCH_SIZE=50   # Process embeddings in batches of 50
RAG_LOG_LEVEL=info  # debug, info, warn, error
```

### Database Setup

1. **Run Migrations**
```bash
# Apply database migrations
yarn db:migrate

# Verify schema includes KnowledgeVector updates
yarn db:studio  # Check KnowledgeVector table has sourceModule, sourceId, sourceType columns
```

2. **Verify Prisma Client**
```bash
# Regenerate Prisma Client after migrations
yarn db:generate

# Verify @/generated/prisma exists
ls -la generated/prisma
```

### Install Dependencies (if needed)

```bash
# Already included in package.json, but if adding local embeddings:
yarn add @xenova/transformers

# For Groq LLM support:
yarn add groq-sdk
```

---

## Deployment Steps

### Step 1: Enable RAG Feature

**Option A: Via Settings UI**
1. Log in as admin
2. Go to Settings → Features
3. Toggle "RAG Enabled" to ON

**Option B: Via Database**
```bash
# Manually enable in database
yarn db:studio
# Find Settings table, set rag_enabled = true
```

### Step 2: Initial Data Indexing

**For Knowledge Base**:
```typescript
// In admin dashboard or migration script
import { batchIndexKnowledgeArticles } from "@/lib/features/vector-search/actions";

const result = await batchIndexKnowledgeArticles();
console.log(`Indexed ${result.successCount}/${result.totalCount} articles`);
```

**For Other Modules**:
```typescript
// Contacts: Indexed automatically on next create/update
// Opportunities: Indexed automatically on next create/update
// Events: Indexed automatically on next create/update
// Interactions: Indexed automatically on next create/update
```

### Step 3: Add Chat UI to Dashboard

Add RAG Chat component to main layout:

```tsx
// app/(dashboard)/layout.tsx
import { RAGChatBox } from "@/components/vector-search";

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}
      
      {/* RAG Chat Box */}
      <RAGChatBox 
        defaultModules={["knowledge", "contacts", "opportunities"]}
        onClose={() => {}} 
      />
    </div>
  );
}
```

### Step 4: Verify Installation

**Health Check Script**:
```typescript
// pages/api/health/rag.ts
import { ragQuery } from "@/lib/features/vector-search";

export async function GET() {
  const testQueries = [
    { query: "test", modules: ["knowledge"] },
    { query: "company", modules: ["contacts"] },
    { query: "opportunity", modules: ["opportunities"] }
  ];

  const results = await Promise.all(
    testQueries.map(q => ragQuery(q))
  );

  const allSuccessful = results.every(r => r.success || r.sources);

  return {
    status: allSuccessful ? "healthy" : "degraded",
    results: results.map(r => ({
      success: r.success,
      hasSources: !!r.sources?.length,
      processingTime: r.processingTime
    }))
  };
}
```

**Run Health Check**:
```bash
curl http://localhost:3000/api/health/rag
```

Expected response:
```json
{
  "status": "healthy",
  "results": [
    { "success": true, "hasSources": true, "processingTime": 1234 },
    { "success": true, "hasSources": false, "processingTime": 567 },
    { "success": true, "hasSources": false, "processingTime": 890 }
  ]
}
```

---

## Monitoring & Observability

### Log Monitoring

```bash
# Watch RAG logs in development
yarn dev 2>&1 | grep "vector-search"

# In production (with ELK/Datadog/CloudWatch):
# Search for: module="vector-search" OR module="rag-*"
```

### Performance Metrics

```typescript
// Add to monitoring dashboard
const metrics = {
  "rag.queries.total": counter,
  "rag.queries.success": counter,
  "rag.query.duration_ms": histogram,
  "rag.sources.count": gauge,
  "rag.embedding.duration_ms": histogram,
  "rag.llm.duration_ms": histogram
};
```

### Error Tracking

```typescript
// Errors automatically logged via logger
// Track in error monitoring service:
// - Sentry
// - Datadog
// - CloudWatch
// - LogRocket

import * as Sentry from "@sentry/nextjs";

try {
  await ragQuery({ query });
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: "rag",
      component: "rag-service"
    }
  });
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "RAG_ENABLED not set" or RAG disabled
**Solution**:
```bash
# Check environment variable
echo $RAG_ENABLED

# Or enable via database
yarn db:studio  # Set rag_enabled = true in Settings table
```

#### Issue: "No API key for embedding provider"
**Solution**:
```bash
# Verify .env.local has API key
cat .env.local | grep OPENAI_API_KEY

# Test API key works
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Issue: "Vector search returns no results"
**Solution**:
```bash
# Check if any vectors indexed
yarn db:studio  # Query: SELECT COUNT(*) FROM KnowledgeVector;

# If count = 0, run indexing
import { batchIndexKnowledgeArticles } from "@/lib/features/vector-search/actions";
await batchIndexKnowledgeArticles();
```

#### Issue: "LLM response is slow or stuck"
**Solution**:
```bash
# Check LLM provider health
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# If provider is down, RAG still works (uses source summarization)
# No action needed
```

#### Issue: "Out of memory with large batch indexing"
**Solution**:
```typescript
// Index in smaller batches
const articles = await getKnowledgeArticles();
for (let i = 0; i < articles.length; i += 100) {
  const batch = articles.slice(i, i + 100);
  await Promise.all(
    batch.map(a => indexEntity("knowledge", a.id, a.content))
  );
  // Wait between batches to avoid rate limits
  await new Promise(r => setTimeout(r, 1000));
}
```

---

## Scaling & Optimization

### Small Deployment (< 10k vectors)
- **Setup**: Current in-memory system
- **Cost**: Free (if using local embeddings)
- **Performance**: 100-500ms per query
- **Maintenance**: None

### Medium Deployment (10k - 100k vectors)
**When to Upgrade**: If queries feel slow (> 1 second)

**Steps**:
1. Add pgvector extension to PostgreSQL
2. Create migration to add indexed vectors
3. Update vector-search-service to use pgvector
4. Results: 10-100ms per query

```sql
-- Future migration
CREATE EXTENSION vector;
ALTER TABLE KnowledgeVector ADD COLUMN embedding vector(1536);
CREATE INDEX ON KnowledgeVector USING ivfflat(embedding vector_cosine_ops);
```

### Large Deployment (> 100k vectors)
**When to Use**: For enterprise scale

**Options**:
1. **Pinecone** (Managed, $100+/mo)
   - Handles millions of vectors
   - Global distribution
   - Hybrid search support

2. **Weaviate** (Self-hosted)
   - Deploy in Kubernetes
   - Multi-tenancy support
   - Real-time sync

3. **Milvus** (Open-source)
   - Self-hosted
   - Cost-effective at scale
   - Python/Go clients

---

## Post-Deployment

### Monitor First 24 Hours

```bash
# Watch for errors
tail -f logs/production.log | grep "error"

# Monitor performance
tail -f logs/production.log | grep "processingTime"
```

**Expected Metrics**:
- Query response time: 1-5 seconds
- Success rate: > 99%
- Error rate: < 0.1%

### Iterate Based on Usage

1. **If queries are too slow**:
   - Switch to faster embedding provider (OpenAI > Gemini > Local)
   - Add pgvector indexing
   - Implement query caching

2. **If results are irrelevant**:
   - Check that articles are indexed
   - Verify embedding quality
   - Consider fine-tuned embeddings

3. **If LLM responses are poor**:
   - Switch to better LLM (Claude > GPT-4 > Gemini)
   - Improve system prompt
   - Add few-shot examples

---

## Rollback Plan

If RAG system has issues:

**Option 1: Disable RAG (Quick Fix)**
```bash
# Update .env
RAG_ENABLED=false

# Or in database
UPDATE Settings SET rag_enabled = false;

# System continues to work without AI features
```

**Option 2: Revert to Previous Deployment**
```bash
# If using git
git revert [commit]
yarn build && yarn deploy

# Existing vectors remain (not removed)
```

**Option 3: Full Cleanup**
```bash
# If needed to completely remove RAG
DELETE FROM KnowledgeVector;
DELETE FROM VectorSearchLog;

# Services become no-ops
# Chat component shows "RAG disabled"
```

---

## Production Handoff Checklist

- [ ] Environment variables configured for production
- [ ] Database migrations applied and verified
- [ ] Initial data indexing completed (Knowledge base)
- [ ] RAG feature enabled in Settings
- [ ] Health check endpoint responds successfully
- [ ] Monitoring alerts configured
- [ ] Error tracking (Sentry, etc.) enabled
- [ ] Team trained on RAG features
- [ ] Documentation updated with internal guidelines
- [ ] Backup plan documented
- [ ] Support runbook created
- [ ] Performance baselines established

---

## Support & Documentation

- **Error Handling**: See `RAG_ERROR_HANDLING_AND_PERFORMANCE.md`
- **Integration Guide**: See `INTEGRATION_GUIDE.md`
- **API Reference**: See `lib/features/vector-search/types/index.ts`
- **Test Files**: See `tests/unit/vector-search/`
- **Component Examples**: See `components/vector-search/`

**Questions?**
- Check docs in `lib/features/vector-search/`
- Run test suite: `yarn test:unit`
- Review error logs: `RAG_LOG_LEVEL=debug yarn dev`
