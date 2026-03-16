# RAG Foundation Setup Guide

## Overview

MADE OS now has a **complete RAG (Retrieval-Augmented Generation) foundation** ready for activation. All infrastructure is in place but **disabled by default** to ensure zero impact on current operations.

**Status**: ✅ **Foundation Complete** - Ready for production activation

---

## What's Already Implemented

### 1. **Database Models** ✅
- `KnowledgeVector` - Stores embeddings of Knowledge Base articles
- `VectorSearchLog` - Audit trail for search queries
- Migration applied: `20251205150940_dbvector`

### 2. **AI Configuration** ✅
```
lib/ai/
├── embedding-config.ts   # Local (Xenova) + OpenAI embeddings
├── llm-config.ts         # Groq, OpenAI, Ollama, or search-only
├── rag-feature-flag.ts   # Enable/disable via Settings.rag_enabled
└── index.ts              # Main exports
```

### 3. **Vector Search Module** ✅
```
lib/features/vector-search/
├── types/          # SearchResult, RAGAnswer, VectorQuery types
├── services/       # Placeholder for future implementations
├── repositories/   # Placeholder for DB queries
├── actions/        # Placeholder for server actions
└── index.ts
```

### 4. **Environment Configuration** ✅
- `.env.example` updated with optional RAG variables
- All keys optional - system works without AI services
- Example:
  ```env
  EMBEDDING_PROVIDER="local"    # Free, no API key
  LLM_PROVIDER="none"           # Disabled by default
  GROQ_API_KEY=""               # Optional - for future use
  ```

### 5. **Feature Flag** ✅
- Settings table includes `rag_enabled` (default: false)
- Can toggle via Ops Admin without code changes
- All AI features check flag before executing

### 6. **Tests** ✅
- `tests/unit/ai/rag-foundation.test.ts` - 11 passing tests
- Tests verify configuration loads correctly
- Tests pass without external AI services

---

## How to Activate RAG (When Ready)

### Step 1: Enable Feature Flag
```typescript
import { enableRAG } from "@/lib/ai";

// In your Ops Admin settings
await enableRAG(); // Sets Settings.rag_enabled = true
```

### Step 2: Install AI Dependencies (Choose One)

**Option A: Free Local Setup (Recommended)**
```bash
# Local embeddings (no API key needed)
yarn add @xenova/transformers

# Free cloud LLM (recommended)
yarn add groq-sdk
```

**Option B: OpenAI Setup**
```bash
yarn add openai
```

**Option C: Ollama Setup (Local LLM)**
```bash
# Install Ollama: https://ollama.ai
# Pull model: ollama pull mistral
# No packages needed
```

### Step 3: Configure Environment Variables
```bash
# .env.local
EMBEDDING_PROVIDER="local"              # or "openai"
EMBEDDING_MODEL="minimlm-l6-v2"         # Local, 384-dim, free
LLM_PROVIDER="groq"                     # or "none", "openai", "ollama"
GROQ_API_KEY="gsk_..."                  # Get from https://console.groq.com
```

### Step 4: Implement Services

Create the following in `lib/features/vector-search/services/`:

```typescript
// embeddingService.ts - Vectorize text
export async function embedText(text: string): Promise<number[]> {
  if (!isRagEnabled()) throw new Error("RAG not enabled");
  // Implementation: call Xenova/OpenAI API
}

// vectorSearchService.ts - Find similar vectors
export async function searchVectors(
  query: number[],
  topK: number
): Promise<SearchResult[]> {
  if (!isRagEnabled()) throw new Error("RAG not enabled");
  // Implementation: cosine similarity search in DB
}

// ragService.ts - Orchestrate everything
export async function ragSearch(query: string) {
  if (!isRagEnabled()) throw new Error("RAG not enabled");
  const embedding = await embedText(query);
  const results = await searchVectors(embedding, 5);
  return results;
}
```

### Step 5: Create Server Actions

Add in `lib/features/vector-search/actions/`:

```typescript
"use server";

export async function searchKnowledgeAction(query: string) {
  await requirePermission("knowledge", "read");
  
  if (!await isRagEnabled()) {
    return { success: false, message: "RAG not enabled" };
  }

  const results = await ragService.ragSearch(query);
  
  // Log search
  await vectorRepository.createSearchLog({
    query,
    userId: session.user.id,
    results: results.map(r => r.id)
  });

  return { success: true, data: results };
}
```

### Step 6: Add UI Component

```typescript
// For Knowledge page or dashboard
export function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (q: string) => {
    const result = await searchKnowledgeAction(q);
    if (result.success) {
      setResults(result.data);
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about knowledge..."
      />
      <button onClick={() => handleSearch(query)}>Search</button>
      
      {results.map(r => (
        <div key={r.id}>
          <h3>{r.title}</h3>
          <p>{r.content.substring(0, 200)}...</p>
          <a href={r.url}>View</a>
        </div>
      ))}
    </div>
  );
}
```

---

## Cost Estimation

| Approach | Cost/Month | Setup | Quality |
|----------|-----------|-------|---------|
| **Local (Recommended)** | $0 | Simple | ⭐⭐⭐ |
| + Groq LLM | $0 | Simple | ⭐⭐⭐⭐ |
| OpenAI Only | $3-5 | Medium | ⭐⭐⭐⭐⭐ |
| Ollama Local | $0 | Complex | ⭐⭐⭐ |

---

## Safety & Breaking Changes

✅ **Zero Breaking Changes**
- Existing code runs unchanged
- New tables are dormant until activated
- All permissions checked before RAG access
- Graceful degradation if services unavailable

✅ **Security**
- User authentication required for searches
- Search logs audit trail
- Permission checks on knowledge access
- No data sent externally (local embeddings option)

---

## Testing RAG Foundation

All tests pass without external services:
```bash
yarn test:unit tests/unit/ai/rag-foundation.test.ts
# ✓ 11 tests pass
```

Tests verify:
- Configuration loads correctly
- Default settings safe (RAG disabled)
- Database models defined
- Feature flag working
- Types defined

---

## Files Changed

### Database
- `prisma/schema.prisma` - Added KnowledgeVector, VectorSearchLog
- `prisma/migrations/20251205150940_dbvector/` - Applied migration

### Code
- `lib/ai/` - New folder with config files
- `lib/features/vector-search/` - New module (scaffolded)
- `lib/features/vector-search/types/` - Type definitions

### Configuration
- `.env.example` - Added optional RAG variables
- `prisma/seeds/system/` - Added rag_enabled setting

### Tests
- `tests/unit/ai/rag-foundation.test.ts` - 11 tests for foundation

### Documentation
- `.github/copilot-instructions.md` - Added RAG section

---

## Next Steps (When Ready)

1. **Decision**: Choose embedding/LLM approach
2. **Install**: Add dependencies
3. **Implement**: Services in vector-search module
4. **Test**: Add integration tests
5. **Deploy**: Enable feature flag
6. **Monitor**: Check VectorSearchLog for performance

---

## Questions?

- **Should I enable RAG now?** No - foundation is ready but not activated
- **Will it slow down current code?** No - completely optional
- **Can I change providers later?** Yes - configurable via env vars
- **What if I disable RAG?** Everything still works, just search only
- **How do I monitor usage?** Check VectorSearchLog table for queries

---

## Reference

- **AI Config**: `lib/ai/index.ts`
- **Feature Flag**: `lib/ai/rag-feature-flag.ts`
- **Types**: `lib/features/vector-search/types/index.ts`
- **Database**: `prisma/schema.prisma` (search for KnowledgeVector)
- **Tests**: `tests/unit/ai/rag-foundation.test.ts`
- **Docs**: `.github/copilot-instructions.md` (RAG section)
