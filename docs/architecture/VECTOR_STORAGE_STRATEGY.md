# Vector Storage Strategy - Current & Future

**Status**: ✅ TEXT Format (Production-Ready for MVP)  
**Last Updated**: December 5, 2024  
**Version**: 1.0

---

## Current Architecture

### Vector Storage Format: TEXT (JSON String)

```typescript
// In Prisma schema
model KnowledgeVector {
  id           String    @id @default(cuid())
  articleId    String
  chunkIndex   Int
  embedding    String    @db.Text  // ← JSON string format
  metadata     Json?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

**Why TEXT for now?**
- ✅ No database setup complexity
- ✅ PostgreSQL support out of box (no extension needed)
- ✅ JSON serialization built-in
- ✅ Sufficient for MVP (< 10K vectors)
- ✅ Easy to migrate to pgvector later

---

## Similarity Calculation (Node.js)

With TEXT format, calculate similarity in application code:

```typescript
// lib/features/vector-search/services/similarity.ts
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vector length mismatch");
  
  const dotProduct = a.reduce((sum, av, i) => sum + av * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, av) => sum + av * av, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bv) => sum + bv * bv, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// lib/features/vector-search/services/vector-search.ts
export async function searchSimilarVectors(
  query: number[],
  threshold: number = 0.75
) {
  const allVectors = await vectorRepository.getAllVectors();
  
  const results = allVectors
    .map(v => ({
      ...v,
      similarity: cosineSimilarity(query, JSON.parse(v.embedding))
    }))
    .filter(v => v.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);  // Top 10 results
  
  return results;
}
```

**Performance Note:**
- O(n) scan through all vectors
- Suitable for < 10K vectors
- Acceptable latency (< 500ms)
- Cache results for repeated queries

---

## Future: pgvector Migration

When you need to scale beyond 10K vectors, upgrade to pgvector:

### Prerequisites
```bash
# Option A: PostgreSQL via Homebrew (Recommended)
brew uninstall postgresql@17
brew install postgresql@17
# pgvector automatically included

# Option B: Manual pgvector setup
brew install pgvector
# Copy files to PostgreSQL 17 extension dir
cp -r /usr/local/opt/pgvector/share/postgresql/extension/* \
  /Library/PostgreSQL/17/share/postgresql/extension/
```

### Migration Steps

1. **Create Migration**
```sql
-- prisma/migrations/[timestamp]_migrate_to_pgvector/migration.sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "KnowledgeVector" 
ALTER COLUMN embedding TYPE vector(3072) USING embedding::vector;
```

2. **Update Prisma Schema**
```prisma
model KnowledgeVector {
  id           String      @id @default(cuid())
  articleId    String
  chunkIndex   Int
  embedding    Unsupported("vector(3072)")  // 3072 = text-embedding-3-large dimension
  metadata     Json?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@index([embedding(ops: "vector_cosine_ops")])
}
```

3. **Update Search Service**
```typescript
// With pgvector
export async function searchSimilarVectors(query: number[], threshold: number = 0.75) {
  return prisma.$queryRaw`
    SELECT *, embedding <=> $1::vector as distance
    FROM "KnowledgeVector"
    WHERE 1 - (embedding <=> $1::vector) >= $2
    ORDER BY embedding <=> $1::vector
    LIMIT 10
  `;
}
```

4. **Deploy Migration**
```bash
npx prisma migrate deploy
```

---

## Performance Comparison

| Metric | TEXT (Current) | pgvector (Future) |
|--------|---|---|
| Vector Count | < 10K | 100K+ |
| Query Latency | 100-500ms | 5-50ms |
| Index Support | None | IVFFlat, HNSW |
| Space Per Vector | 3-4 KB | 1-2 KB |
| Setup Complexity | Simple | Moderate |
| Cost | Included | Included |

---

## Current State Checklist

- ✅ KnowledgeVector table created (TEXT format)
- ✅ VectorSearchLog table created
- ✅ RAG Settings UI ready
- ✅ Feature flag (Settings.rag_enabled) working
- ✅ LLM providers configured (OpenAI, Gemini, Claude, Cohere)
- ✅ Embedding configs ready
- ⏳ Embedding service (next to build)
- ⏳ Vector search service (using TEXT format)
- ⏳ RAG pipeline orchestration
- 🔄 pgvector migration (ready when needed)

---

## Next Steps

1. **Build Embedding Service**
   - OpenAI, Gemini, Claude, Cohere support
   - Chunk management
   - Token counting

2. **Build Vector Search (TEXT format)**
   - CosineSimilarity calculation
   - Caching layer
   - Result ranking

3. **Build RAG Pipeline**
   - Query → Embedding → Search → LLM
   - Response streaming
   - Citation tracking

4. **Scale to pgvector**
   - When vector count > 10K
   - No code changes needed (same interface)
   - Better performance + indexing

---

## References

- pgvector Docs: https://github.com/pgvector/pgvector
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- Similarity Metrics: https://en.wikipedia.org/wiki/Cosine_similarity
- LanceDB vs Pinecone: https://blog.lancedb.com/lancedbs-approach-to-open-source-rag
