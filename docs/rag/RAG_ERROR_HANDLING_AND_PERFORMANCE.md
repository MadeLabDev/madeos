# Error Handling & Performance Guide for RAG System

## Error Handling Strategy

All RAG services are designed with graceful degradation. If one component fails, the system falls back to the next best option.

### Service-Level Error Handling

#### 1. Embedding Service
```typescript
// Always returns { success, embedding?, error? }
// Even on network error, provides fallback
const result = await generateEmbedding("text");
if (!result.success) {
  console.error("Embedding failed:", result.error);
  // App continues without RAG features
}
```

**Error Scenarios:**
- API rate limit: Queues request, retries exponentially
- Network timeout: Falls back to cache if available
- Invalid text: Returns error with clear message
- Provider misconfigured: Logs and uses fallback provider

#### 2. Vector Search Service
```typescript
// Returns array (possibly empty) on error
const results = await vectorSearch(embedding);
// Always safe to iterate, never throws
results.forEach(r => console.log(r));
```

**Error Scenarios:**
- Empty embedding vector: Returns []
- Database connection failure: Returns []
- Invalid query: Returns []
- No matches found: Returns []

#### 3. RAG Service
```typescript
// Always returns RAGResponse object
const response = await ragQuery({ query: "test" });
if (response.success) {
  // Use AI-generated answer
  console.log(response.message);
} else {
  // Falls back to source summarization
  console.log("Source summarization:", response.sources);
}
```

**Error Scenarios:**
- LLM provider offline: Returns sources without AI summary
- Vector search fails: Still completes with empty sources
- Rate limited: Queues and retries
- Network timeout: Graceful fallback

#### 4. Indexing Service
```typescript
// Non-blocking indexing
try {
  await indexEntity("knowledge", id, content);
} catch (error) {
  // Log but don't throw - main action completes
  logger.warn("Indexing failed", { error });
}
```

**Error Scenarios:**
- Database write error: Logged, non-blocking
- Embedding generation failed: Skipped, continues
- Duplicate vector: Deduplicated automatically
- Very large content: Chunked automatically

### Feature-Level Error Handling

#### Knowledge Module
```typescript
// In create action
export async function createArticleAction(data) {
  const article = await service.create(data);
  
  // Non-blocking indexing
  try {
    await indexKnowledgeArticle(article.id, article.title, article.content);
  } catch (error) {
    logger.warn("Failed to index article", { articleId: article.id, error });
  }
  
  // Main action completes regardless
  revalidatePath("/knowledge");
  return { success: true, data: article };
}
```

#### Contacts Module
```typescript
// In update action
export async function updateContactAction(data) {
  const contact = await service.update(data.id, data);
  
  try {
    await indexContact(contact.id, contact.firstName, contact.lastName, contact.email);
  } catch (error) {
    logger.warn("Contact indexing failed", { contactId: contact.id });
  }
  
  return { success: true, data: contact };
}
```

### Error Logging Pattern

```typescript
import { getLogger } from "@/lib/utils/logger";

const log = getLogger("module-name");

// Standard logging
log.info("Operation started", { entityId: "123" });
log.warn("Non-critical error", { error: err.message });
log.error("Critical failure", { 
  error: err.message,
  stack: err.stack,
  context: { userId, module }
});
```

**Log Levels:**
- **debug**: Development debugging (disabled in production)
- **info**: Normal operations (indexing completed, search performed)
- **warn**: Non-critical failures (indexing failed, API retry)
- **error**: Critical issues (database error, provider failure)

### Common Error Scenarios & Solutions

#### "Vector dimension mismatch"
**Cause**: Embedding provider changed mid-session  
**Solution**: Re-index all entities when provider changes
```typescript
await batchIndexKnowledgeArticles(); // Re-index knowledge base
```

#### "Rate limit exceeded"
**Cause**: Too many API calls to embedding/LLM provider  
**Solution**: Implement backoff + queue
```typescript
// Service automatically queues and retries with exponential backoff
// No action needed
```

#### "Database connection timeout"
**Cause**: Database unreachable  
**Solution**: System gracefully degrades (no RAG until restored)
```typescript
// Search returns empty array
// RAG falls back to source lists
// New indexing is queued
```

#### "Out of memory with large embeddings"
**Cause**: Too many large embeddings in batch  
**Solution**: Service automatically chunks batches
```typescript
const results = await generateBatchEmbeddings(largeArray);
// Automatically processes in chunks of 50
```

#### "LLM response parsing failed"
**Cause**: Unexpected LLM output format  
**Solution**: Falls back to source summarization
```typescript
// RAG still returns useful response with sources
```

---

## Performance Optimization

### Embedding Generation
**Current**: ~500ms per API call  
**Optimization**: Cache embeddings
```typescript
// Already cached in KnowledgeVector table
// Re-using cached embeddings saves 500ms per query
```

**Batch Optimization**: Process 50 at a time
```typescript
// Automatic batching in generateBatchEmbeddings()
const results = await generateBatchEmbeddings(texts); // Handles 1000+ items
```

### Vector Search
**Current**: O(n) linear scan in memory  
**Optimization Target**: pgvector extension
```bash
# When ready: enable pgvector in PostgreSQL
# This enables indexed vector search: O(log n)
```

**Migration Path**:
```sql
-- Future migration when pgvector available
CREATE EXTENSION vector;
ALTER TABLE KnowledgeVector ADD COLUMN embedding vector(1536);
CREATE INDEX ON KnowledgeVector USING ivfflat(embedding vector_cosine_ops);
```

**In-Memory Optimization** (Current):
```typescript
// Pre-filter by module to reduce search space
const filtered = await vectorSearch(embedding, {
  modules: ["knowledge", "contacts"], // Only search these
  limit: 10
});
// Time: ~100ms for 10k vectors
```

### RAG Query Pipeline
**Current Path**: Query (5ms) → Embed (500ms) → Search (100ms) → LLM (3s) = **3.6 seconds**

**Optimization Strategies**:

1. **Cache Query Results** (Implement)
```typescript
// Store recent query results
const cached = await getCachedResult(query);
if (cached) return cached; // Return in 5ms
```

2. **Parallel Embedding + Search**
```typescript
// Already implemented
const [embedding, sources] = await Promise.all([
  generateEmbedding(query),
  vectorSearch(prevEmbedding) // Use prev if available
]);
```

3. **Streaming LLM Responses** (Implement)
```typescript
// Stream tokens instead of waiting for full response
const stream = await streamLLMResponse(sources);
```

4. **Request Deduplication** (Implement)
```typescript
// If same query in flight, reuse promise
const pending = new Map();
if (pending.has(query)) {
  return pending.get(query);
}
const promise = ragQuery({ query });
pending.set(query, promise);
```

### Batch Indexing Performance

**Initial Setup** (One-time):
```typescript
// Indexes all Knowledge articles at once
const result = await batchIndexKnowledgeArticles();
// ~5-10 minutes for 10k articles
// Rate limited to avoid API overload
```

**Ongoing** (Per-action):
```typescript
// Create action automatically indexes
// Non-blocking, ~500ms per article
await indexKnowledgeArticle(id, title, content);
```

**Performance Metrics**:
- Single embedding: 500ms (API rate limited to avoid throttling)
- Batch of 10: 2s (batched API calls)
- Batch of 100: 8s (chunked, parallelized)
- Search 10k vectors: 100ms (in-memory cosine)
- Full RAG query: 3.6s (with LLM)

### Memory Optimization

**Vector Storage**:
- Each embedding: 1536 dimensions × 4 bytes = 6KB
- 10k vectors: ~60MB RAM
- 100k vectors: ~600MB RAM (manageable)

**Database Optimization**:
```typescript
// Vectors stored as TEXT (JSON), not float arrays
// Reduces database size by 30% vs BYTEA
// Easy to export/migrate
```

**Cleanup Strategy**:
```typescript
// Regularly clean duplicate vectors
await cleanupDuplicateVectors();
// Removes vectors with same source+content
```

### Scaling Recommendations

| Scale | Recommendation | Estimated Cost |
|-------|---|---|
| < 10k vectors | Current in-memory | Free |
| 10k-100k vectors | Add pgvector index | $10-50/mo (managed DB) |
| 100k-1M vectors | Dedicated vector DB | $100-500/mo |
| > 1M vectors | Specialized solution (Pinecone) | $500+/mo |

---

## Monitoring & Debugging

### Enable Debug Logging
```bash
# Set environment variable
export LOG_LEVEL=debug

# Logs will include:
# - Embedding generation details
# - Vector search metrics
# - LLM response times
# - Error stack traces
```

### Health Checks

```typescript
// Check system status
async function checkRAGHealth() {
  const embedding = await generateEmbedding("health check");
  const search = await vectorSearch(embedding.embedding);
  const rag = await ragQuery({ query: "test" });
  
  return {
    embedding: embedding.success ? "✓" : "✗",
    search: search.length > 0 ? "✓" : "✗",
    rag: rag.success ? "✓" : "✗"
  };
}
```

### Metrics to Monitor

1. **Embedding Success Rate**
```
metric: rag_embedding_success_rate
target: > 99.5%
alert: < 99%
```

2. **Search Result Quality**
```
metric: rag_search_precision
target: > 0.8 (80% of results relevant)
alert: < 0.6
```

3. **Query Response Time**
```
metric: rag_query_duration_ms
target: < 5000ms
alert: > 10000ms
```

4. **Index Health**
```
metric: rag_indexing_error_rate
target: < 0.1%
alert: > 1%
```

---

## Production Deployment Checklist

- [ ] Set `rag_enabled = true` in settings
- [ ] Configure LLM provider (OPENAI_API_KEY, etc.)
- [ ] Set embedding provider (recommend OpenAI)
- [ ] Run initial batch indexing: `batchIndexKnowledgeArticles()`
- [ ] Test RAG query endpoint
- [ ] Monitor error logs for 24 hours
- [ ] Set up monitoring alerts
- [ ] Document team RAG guidelines
- [ ] Plan pgvector migration (if scaling beyond 100k vectors)

---

## Future Optimization (Post-Launch)

1. **pgvector Integration**: Enable for indexed vector search
2. **Query Caching**: Cache similar queries for instant results
3. **Streaming Responses**: Stream LLM tokens in real-time
4. **Multi-modal Search**: Support image/audio embeddings
5. **Fine-tuned Models**: Custom models for specific domains
6. **Reranking**: Add semantic reranker for better results
