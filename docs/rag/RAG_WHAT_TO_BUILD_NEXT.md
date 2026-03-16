# RAG - Điều Cần Build Tiếp Theo

**Status**: Foundation ✅ Complete | Pipeline ❌ Ready to Build  
**Updated**: December 5, 2025

---

## 🎯 Current Situation

### ✅ Đã Có (Foundation)
- Database models (5 tables)
- LLM configs (4 providers)
- Embedding configs (3 providers)
- RAG Settings UI (bật/tắt trên /settings)
- Feature flag (Settings.rag_enabled)

### ❌ Chưa Có (Pipeline)
- **Embedding Service**: Chuyển text → vectors
- **Vector Search**: Tìm kiếm bài viết tương tự
- **RAG Pipeline**: Orchestrate everything
- **UI Components**: Search box, Q&A button
- **Integration**: Kết nối vào Knowledge

---

## 🔧 Phase 1: Build Core Services (Priority 1)

### 1.1 Embedding Service (`lib/features/vector-search/services/embedding.ts`)

**Purpose**: Chuyển text thành numbers (embeddings)

```typescript
// Example output
const text = "Quy trình QA là gì?"
const embedding = [0.123, 0.456, 0.789, ...] // 3072 numbers
```

**What to build**:
```typescript
// Select provider
export const embeddingService = {
  // Option 1: OpenAI (Best quality, ~$0.02 per 1M tokens)
  embedOpenAI(text: string): Promise<number[]>,
  
  // Option 2: Google Gemini (Free, good quality)
  embedGemini(text: string): Promise<number[]>,
  
  // Option 3: Cohere (Cheap, 1024 dims)
  embedCohere(text: string): Promise<number[]>,
  
  // Batch processing
  embedBatch(texts: string[], provider?: 'openai' | 'gemini' | 'cohere'),
  
  // Caching (avoid re-embedding same text)
  embedWithCache(text: string, useCache?: boolean),
};
```

**Where to call from**:
1. When Knowledge Article created
2. When Knowledge Article updated
3. When search question is asked

**Database to update**:
```typescript
// When article is created/updated
await embeddingService.embedArticle(article)
  // Calls:
  // 1. Split article into chunks (500 tokens each)
  // 2. Embed each chunk
  // 3. Save to KnowledgeVector table
  // 4. Log to EmbeddingCache
```

---

### 1.2 Vector Search Service (`lib/features/vector-search/services/search.ts`)

**Purpose**: Tìm bài viết tương tự dựa trên embeddings

```typescript
// Example
const query = "Quy trình QA là gì?"
const results = [
  { 
    articleId: "123",
    title: "QA Process Overview",
    similarity: 0.92,  // 92% match
    chunk: "QA process has 3 phases..."
  },
  { ... },
]
```

**What to build**:
```typescript
export const vectorSearchService = {
  // 1. Search for similar vectors
  searchSimilar(
    queryText: string,
    threshold: number = 0.75,  // 75% match minimum
    limit: number = 5
  ): Promise<SearchResult[]>,
  
  // 2. Calculate similarity between two vectors
  cosineSimilarity(a: number[], b: number[]): number,
  
  // 3. Batch search
  batchSearch(queries: string[]): Promise<SearchResult[][]>,
  
  // 4. With reranking (Cohere Rerank API)
  searchWithReranking(queryText: string): Promise<RankedResult[]>,
};
```

**Where to call from**:
1. When user searches in Knowledge
2. When AI needs to find relevant chunks
3. When building recommendations

**Performance**:
- Current: TEXT format (O(n) scan) = 100-500ms for 1000 vectors
- Future: pgvector (indexed) = 5-50ms for 100K+ vectors

---

### 1.3 RAG Pipeline Service (`lib/features/vector-search/services/rag-pipeline.ts`)

**Purpose**: Orchestrate the entire RAG flow

```typescript
const answer = await ragPipeline.answerQuestion({
  question: "Quy trình QA là gì?",
  userId: "user-123",
  context: "knowledge"
})

// Output:
{
  answer: "Quy trình QA là... [from KB]",
  sources: [
    { title: "QA Process", url: "...", similarity: 0.92 }
  ],
  tokens: { input: 1500, output: 250 },
  cost: 0.0045,
  duration: 2300 // ms
}
```

**What to build**:
```typescript
export const ragPipeline = {
  // Main RAG flow
  async answerQuestion(params: {
    question: string,
    userId: string,
    context?: 'knowledge' | 'contacts' | 'opportunities',
    llmProvider?: 'openai' | 'gemini' | 'claude' | 'cohere'
  }): Promise<RAGAnswer>,
  
  // Step by step
  async generateAnswer(
    question: string,
    relevantChunks: string[],
    llmProvider: string
  ): Promise<string>,
  
  // Session management (multi-turn Q&A)
  async saveSession(params: RAGSessionInput),
  async getSessionHistory(sessionId: string),
  
  // Feedback collection
  async recordFeedback(params: {
    sessionId: string,
    messageId: string,
    rating: 'good' | 'bad',
    comment?: string
  }),
};
```

**Flow**:
```
User Question
    ↓
[1] Embed question
    ↓
[2] Search similar vectors
    ↓
[3] Get top 5 relevant chunks
    ↓
[4] Send to LLM with chunks
    ↓
[5] LLM generates answer
    ↓
[6] Save to RAGSession/RAGMessage
    ↓
[7] Return answer + sources
```

---

## 📱 Phase 2: Build UI Components (Priority 2)

### 2.1 Vector Search Query Component

**Location**: `components/knowledge/vector-search-query.tsx`

```typescript
// Features:
// 1. Text input for search
// 2. Search button
// 3. Results list with:
//    - Article title
//    - Matched chunk preview
//    - Similarity score
//    - View full article link
// 4. Loading state
// 5. Empty state
// 6. Error handling
```

**Usage on Knowledge page**:
```
Knowledge Page
    ↓
[Traditional] Search (by title/tags)
    ↓
[NEW] Vector Search (semantic)
    ↓
Shows relevant chunks from articles
```

---

### 2.2 RAG Q&A Component

**Location**: `components/knowledge/rag-qa-dialog.tsx`

```typescript
// Features:
// 1. Dialog/Modal
// 2. Question input
// 3. [Ask RAG] button
// 4. Loading indicator (AI thinking)
// 5. Answer display with:
//    - Full answer text
//    - Source citations
//    - "View Source" links
// 6. Feedback buttons (👍 / 👎)
// 7. Copy answer button
```

**User Flow**:
```
Knowledge Page
    ↓
[Ask RAG] button
    ↓
Dialog opens: "Ask about this knowledge..."
    ↓
User types: "Quy trình QA là gì?"
    ↓
[Ask RAG] button
    ↓
Loading... (searching KB + generating)
    ↓
Answer appears:
  "Theo KB của công ty, quy trình QA..."
  Sources:
  - Article 1 (92% match)
  - Article 2 (87% match)
    ↓
User clicks 👍 (good) → saved feedback
```

---

### 2.3 Integration Points

**Where to add buttons/components**:

1. **Knowledge Page** (`app/(dashboard)/knowledge/`)
   - Add "Ask RAG" button in page header
   - Add Vector Search box above article list
   - Add [Ask about this article] in article details

2. **Knowledge Article Details** (`app/(dashboard)/knowledge/[id]/`)
   - Add [Ask RAG about this] button
   - Show suggested related articles
   - Show AI summary of article

3. **Contacts Page** (`app/(dashboard)/contacts/`)
   - Add [Ask RAG about this contact]
   - Show relevant knowledge for this contact

4. **Opportunities Page** (`app/(dashboard)/opportunities/`)
   - Add [Ask RAG for next steps]
   - Show relevant success stories from KB

---

## 🔌 Phase 3: Integration & Automation (Priority 3)

### 3.1 Auto-Embedding When Article Created

**Update**: `lib/features/knowledge/actions/knowledge-actions.ts`

```typescript
export async function createKnowledgeAction(data: CreateKnowledgeInput) {
  // ... existing code ...
  
  // NEW: Auto-embed if RAG enabled
  const ragEnabled = await isRagEnabled();
  if (ragEnabled) {
    // Embed article chunks
    await embeddingService.embedArticle({
      id: article.id,
      title: article.title,
      content: article.content
    });
    
    // Log to analytics
    await recordRAGMetric({
      type: 'embedding',
      articleId: article.id,
      tokens: estimateTokens(article.content),
      cost: calculateCost(...)
    });
  }
  
  return { success: true, data: article };
}
```

---

### 3.2 Contact Q&A Integration

**New Component**: `components/contacts/contact-rag-qa.tsx`

```typescript
// When viewing a contact, show:
// 
// "Ask RAG about this contact"
// └─ What sales approach worked with similar customers?
// └─ What are common objections?
// └─ What's the standard process for this industry?
// 
// RAG searches KB for:
// - Previous interactions with similar contacts
// - Industry best practices
// - Common issues and solutions
```

---

### 3.3 Opportunity Advisor

**New Component**: `components/opportunities/rag-advisor.tsx`

```typescript
// When viewing an opportunity, show:
//
// "RAG Advisor - Next Steps"
// └─ Based on similar won opportunities in KB
// └─ Suggest what to do next
// └─ Show success stories
// └─ Highlight risks based on history
```

---

## 📊 Estimated Effort & Timeline

| Phase | Component | Effort | Timeline |
|-------|-----------|--------|----------|
| 1 | Embedding Service | 6-8 hrs | Day 1 |
| 1 | Vector Search Service | 4-6 hrs | Day 1 |
| 1 | RAG Pipeline | 8-10 hrs | Day 2 |
| 2 | Vector Search UI | 4-5 hrs | Day 2 |
| 2 | RAG Q&A Component | 5-6 hrs | Day 3 |
| 2 | Knowledge Integration | 3-4 hrs | Day 3 |
| 3 | Auto-Embedding | 2-3 hrs | Day 4 |
| 3 | Contact/Opportunity Integration | 4-5 hrs | Day 4 |
| **Total** | **8 Components** | **36-47 hrs** | **4 days** |

---

## 📋 Development Checklist

### Phase 1: Services
- [ ] Embedding Service (OpenAI, Gemini, Cohere)
- [ ] Vector Search Service (CosineSimilarity)
- [ ] RAG Pipeline Service
- [ ] Error handling & logging
- [ ] Unit tests (80% coverage)

### Phase 2: UI
- [ ] Vector Search Component
- [ ] RAG Q&A Component
- [ ] Integration into Knowledge page
- [ ] Integration into article details
- [ ] Component tests

### Phase 3: Automation
- [ ] Auto-embed on article create
- [ ] Auto-embed on article update
- [ ] Contact Q&A integration
- [ ] Opportunity Advisor integration
- [ ] E2E tests

### Phase 4: Optimization
- [ ] Caching strategy
- [ ] Performance monitoring
- [ ] Cost optimization
- [ ] RAGMetrics dashboard

---

## 💡 Quick Start Example

Once services are built, here's how easy it will be:

```typescript
// app/(dashboard)/knowledge/components/ask-rag-button.tsx
"use client";

import { useState } from "react";
import { ragPipeline } from "@/lib/features/vector-search";

export function AskRAGButton({ articleId }: { articleId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    setLoading(true);
    try {
      const result = await ragPipeline.answerQuestion({
        question,
        userId: session.user.id,
        context: 'knowledge'
      });
      setAnswer(result.answer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Ask RAG</Button>
      <DialogContent>
        <Input 
          placeholder="Ask about knowledge..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button onClick={handleAsk} disabled={loading}>
          {loading ? "Searching..." : "Ask RAG"}
        </Button>
        {answer && <div>{answer}</div>}
      </DialogContent>
    </Dialog>
  );
}
```

That's it! The services handle everything.

---

## 🎓 Learning Resources

- [LLMs & Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [RAG Architecture](https://docs.llamaindex.ai/en/stable/use_cases/rag/)
- [Vector Search](https://weaviate.io/blog/what-is-vector-search)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

---

## ❓ FAQ

**Q: Why build RAG services if pgvector isn't working?**  
A: TEXT format is sufficient for MVP. Services use abstract interface - pgvector is drop-in replacement later.

**Q: How much will RAG cost?**  
A: ~$0.02 per article (embedding) + ~$0.05 per question (LLM). For 1000 articles + 100 questions/day ≈ $20-30/month.

**Q: Can I use cheaper embeddings?**  
A: Yes! Gemini (free), Cohere ($0.001/1M tokens). Trade quality for cost.

**Q: When to switch to pgvector?**  
A: When vectors > 10K or query latency matters. No code changes needed.

**Q: Will it work with existing Knowledge?**  
A: Yes! One-time indexing of all articles. Then auto-index new ones.

---

## 🚀 Next Steps

1. Ready to build Phase 1 services? Let me create the scaffolding.
2. Want to understand embedding algorithms first? I'll create a guide.
3. Want to see a working prototype? I'll build minimal version.

What would you like to do?
