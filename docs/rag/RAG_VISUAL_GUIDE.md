# RAG System Architecture - Visual Guide

## 1️⃣ CURRENT STATE (Bây Giờ)

```
┌─────────────────────────────────────────────────────────────────┐
│                  MADE OS - RAG Foundation                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Settings.rag_enabled = true  ✅                               │
│  (Feature flag bật, nhưng chưa có gì dùng nó)                  │
│                                                                 │
│  Database Models:                                               │
│    ✅ KnowledgeVector (chỗ lưu embeddings)                     │
│    ✅ VectorSearchLog (tracking searches)                      │
│    ✅ RAGSession (tracking Q&A)                                │
│    ✅ RAGMessage (storing messages)                            │
│    ✅ RAGFeedback (user feedback)                              │
│    ✅ RAGMetrics (analytics)                                   │
│                                                                 │
│  LLM Providers:                                                 │
│    ✅ OpenAI (GPT-4 Turbo)                                     │
│    ✅ Google Gemini Pro                                         │
│    ✅ Claude 3 Opus                                             │
│    ✅ Cohere                                                    │
│                                                                 │
│  Embedding Providers:                                           │
│    ✅ OpenAI text-embedding-3-large (3072 dims)                │
│    ✅ Google Gemini (1408 dims)                                │
│    ✅ Cohere (1024 dims)                                        │
│                                                                 │
│  UI:                                                            │
│    ✅ RAG Settings (bật/tắt trên /settings)                   │
│                                                                 │
│  ❌ MISSING: Mọi thứ khác!                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ WHAT USER SEES NOW

```
Knowledge Page
│
├─ Articles List
│  ├─ Article 1 "Quy trình QA"
│  ├─ Article 2 "Hướng dẫn testing"
│  └─ Article 3 "FAQ"
│
└─ Search (title/tags only)
   └─ "Search knowledge..." 
      → finds articles with matching title

🚫 NO RAG FEATURES YET!
```

---

## 3️⃣ WHAT USER WILL SEE (Sau khi build Phase 1 & 2)

```
Knowledge Page
│
├─ Traditional Search (title/tags)
│  └─ "Search by title..."
│
├─ ⭐ SEMANTIC Search (RAG - NEW!)
│  └─ "Ask a question..."
│     → "Quy trình QA là gì?"
│     → Shows relevant CHUNKS from articles
│     → Sorted by relevance (92%, 87%, 85%)
│
└─ Ask RAG Button (NEW!)
   └─ "Ask RAG about knowledge..."
      → Opens dialog
      → User types: "Quy trình QA là gì?"
      → RAG searches KB
      → AI generates answer
      → Shows sources
```

---

## 4️⃣ BEHIND-THE-SCENES FLOW

### Without RAG
```
User Question
    ↓
Search title/tags
    ↓
Get exact matches
    ↓
User reads manually
```

### With RAG (What We're Building)
```
User Question: "Quy trình QA là gì?"
    ↓
[EMBEDDING SERVICE]
  Input: "Quy trình QA là gì?" (text)
  Output: [0.23, 0.45, 0.12, ...] (3072 numbers)
    ↓
[VECTOR SEARCH SERVICE]
  Input: question embedding + all stored embeddings
  Output: Top 5 similar chunks from KB
    ├─ "QA has 3 phases: Planning, Execution, Reporting"
    ├─ "Planning phase takes 2 days"
    ├─ "Test cases must be reviewed"
    ├─ "QA team lead: John Doe"
    └─ "QA tools: TestNG, Selenium"
    ↓
[RAG PIPELINE SERVICE]
  Input: Question + Top 5 chunks
  Send to LLM: "Based on this knowledge:
               {chunks here}
               Answer: Quy trình QA là gì?"
    ↓
[LLM GENERATES ANSWER]
  Output: "Quy trình QA của công ty có 3 phases:
          1. Planning (2 days) - led by John
          2. Execution - using TestNG + Selenium
          3. Reporting - test cases reviewed
          
          Sources:
          - QA Overview (92% match)
          - QA Planning Guide (87% match)"
    ↓
[SAVE TO DATABASE]
  RAGSession: Store Q&A pair
  RAGMessage: Store question + answer
  VectorSearchLog: Log the search
  RAGMetrics: Track cost + tokens
    ↓
Display to User with sources + feedback buttons
```

---

## 5️⃣ PHASE 1: SERVICES TO BUILD (Backend)

```
┌─ Embedding Service ──────────────────────┐
│                                          │
│ Input: "Quy trình QA là gì?"            │
│ Output: [0.23, 0.45, 0.12, ...] (3072) │
│                                          │
│ Supports:                                │
│ • OpenAI text-embedding-3-large          │
│ • Google Gemini                          │
│ • Cohere                                 │
│                                          │
│ Features:                                │
│ • Batch processing                       │
│ • Caching (avoid re-embedding)           │
│ • Cost tracking                          │
│                                          │
└──────────────────────────────────────────┘
       ↓ (converts text to numbers)
┌─ Vector Search Service ──────────────────┐
│                                          │
│ Input: question embedding + KB vectors  │
│ Output: Top 5 similar chunks             │
│                                          │
│ Algorithm:                               │
│ • CosineSimilarity for TEXT format       │
│ • pgvector operators (future)            │
│                                          │
│ Features:                                │
│ • Configurable threshold                 │
│ • Result ranking                         │
│ • Deduplication                          │
│                                          │
└──────────────────────────────────────────┘
       ↓ (finds related chunks)
┌─ RAG Pipeline Service ───────────────────┐
│                                          │
│ Input: question + relevant chunks       │
│ Output: AI-generated answer              │
│                                          │
│ Steps:                                   │
│ 1. Embed question                        │
│ 2. Search similar vectors                │
│ 3. Get top chunks                        │
│ 4. Send to LLM                           │
│ 5. Generate answer                       │
│ 6. Save to DB                            │
│ 7. Return with sources                   │
│                                          │
│ Features:                                │
│ • Multi-turn conversation                │
│ • Session management                     │
│ • Feedback collection                    │
│ • Cost + token tracking                  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 6️⃣ PHASE 2: UI COMPONENTS (Frontend)

```
┌─ Vector Search Component ────────────────┐
│                                          │
│ [Semantic Search Box]                    │
│ "Find articles by meaning..."            │
│                                          │
│ Results:                                 │
│ ✓ Article 1 (92% similar)                │
│   Chunk: "QA has 3 phases..."            │
│   [View Full Article]                    │
│                                          │
│ ✓ Article 2 (87% similar)                │
│   Chunk: "Planning takes 2 days..."      │
│                                          │
└──────────────────────────────────────────┘
       ↓
┌─ RAG Q&A Component ──────────────────────┐
│                                          │
│ [Ask RAG] Button                         │
│                                          │
│ Dialog:                                  │
│ [Enter question...]                      │
│ "Quy trình QA là gì?"                   │
│ [Ask RAG] [Cancel]                       │
│                                          │
│ Loading...                               │
│ (Searching KB + generating...)           │
│                                          │
│ Answer:                                  │
│ "Quy trình QA có 3 phases:              │
│  1. Planning (2 days)                    │
│  2. Execution (TestNG + Selenium)        │
│  3. Reporting (review test cases)"       │
│                                          │
│ Sources:                                 │
│ • QA Overview (92%)                      │
│   [View Article]                         │
│                                          │
│ • QA Planning (87%)                      │
│   [View Article]                         │
│                                          │
│ [👍 Good] [👎 Bad] [📋 Copy]            │
│                                          │
└──────────────────────────────────────────┘
```

---

## 7️⃣ KNOWLEDGE PAGE (BEFORE vs AFTER)

### BEFORE (Now)
```
Knowledge Page
│
├─ [Search] [New Article] [Import]
│
├─ Search: "quy" 
│  └─ Search by title/tags
│
├─ Results:
│  ├─ Article 1 "Quy Trình QA"
│  │  Created: 5 days ago
│  │  [View] [Edit] [Delete]
│  │
│  └─ Article 2 "Quy Trình Testing"
│     Created: 3 days ago
│     [View] [Edit] [Delete]
│
└─ Total: 25 articles
```

### AFTER (After building RAG)
```
Knowledge Page
│
├─ [Ask RAG] [Search] [New Article] [Import]
│
├─ Traditional Search: "quy"
│  └─ Find by title/tags
│
├─ Semantic Search: "Quy trình QA là gì?" ← NEW!
│  └─ Find by meaning
│  └─ Shows relevant chunks
│
├─ Results:
│  ├─ Article 1 "Quy Trình QA" (92% match)
│  │  "...QA has 3 phases..."
│  │  [View] [Ask about this] [Edit] [Delete]
│  │
│  └─ Article 2 "Quy Trình Testing" (87% match)
│     "...Planning takes 2 days..."
│     [View] [Ask about this] [Edit] [Delete]
│
└─ Total: 25 articles | 2,450 indexed chunks
```

---

## 8️⃣ DATA FLOW DIAGRAM

```
┌──────────────────┐
│  USER ACTION     │
│                  │
│  Save Article    │
│  "Quy trình QA"  │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│  Knowledge Article       │ ← Stored in DB
│  • id: 123               │
│  • title: "Quy trình QA" │
│  • content: "..."        │
└────────┬─────────────────┘
         │
         ↓
    [IF RAG ENABLED]
         │
         ↓ (PHASE 1 - NEW)
┌──────────────────────────────┐
│  Embedding Service           │ ← Need to build
│  1. Split into chunks        │
│  2. Convert to embeddings    │
│  3. Save to KnowledgeVector  │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────┐
│  KnowledgeVector table   │
│                          │
│  chunk_0: [0.23, 0.45]   │ ← Stored vectors
│  chunk_1: [0.12, 0.67]   │
│  chunk_2: [0.89, 0.34]   │
│  ...                     │
└──────────────────────────┘


┌─────────────────────────┐
│  USER SEARCHES/ASKS      │
│                          │
│  "Quy trình QA là gì?"   │
└────────┬────────────────┘
         │
         ↓ (PHASE 1 - NEW)
┌──────────────────────────────┐
│  Embedding Service           │ ← Need to build
│  Convert Q&A to embedding    │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Vector Search Service       │ ← Need to build
│  1. Find similar embeddings  │
│  2. Calculate similarity     │
│  3. Sort by relevance        │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Top 5 Chunks            │
│                          │
│  • chunk_0 (92% match)   │ ← Most relevant
│  • chunk_2 (87% match)   │
│  • chunk_1 (82% match)   │
│  ...                     │
└────────┬─────────────────┘
         │
         ↓ (PHASE 1 - NEW)
┌──────────────────────────────┐
│  RAG Pipeline Service        │ ← Need to build
│  1. Take top chunks          │
│  2. Send to LLM (OpenAI)     │
│  3. Generate answer          │
│  4. Save to RAGSession       │
└────────┬─────────────────────┘
         │
         ↓ (PHASE 2 - NEW)
┌──────────────────────────────┐
│  Display to User             │ ← Need to build UI
│                              │
│  Answer: "Quy trình QA..."   │
│  Sources: [links]            │
│  Feedback: [👍] [👎]         │
└──────────────────────────────┘
```

---

## 9️⃣ TECH STACK FOR EACH PHASE

### Phase 1: Services (Backend)
```
lib/features/vector-search/
├── services/
│   ├── embedding.ts (Embedding Service)
│   │   └── Uses: OpenAI, Google, Cohere APIs
│   ├── search.ts (Vector Search Service)
│   │   └── Uses: CosineSimilarity, Vector math
│   └── rag-pipeline.ts (RAG Orchestration)
│       └── Uses: LLM APIs, Database queries
├── actions/
│   └── vector-search.ts (Server actions)
├── repositories/
│   ├── knowledge-vector.ts
│   └── rag-session.ts
└── types/
    └── rag.ts
```

### Phase 2: Components (Frontend)
```
components/
├── knowledge/
│   ├── vector-search-query.tsx (Search Box)
│   └── rag-qa-dialog.tsx (Q&A Component)
└── ui/
    └── rag-results.tsx (Display Results)

app/(dashboard)/knowledge/
└── components/
    └── knowledge-page.tsx (Updated with RAG)
```

### Phase 3: Integration (Orchestration)
```
lib/features/knowledge/actions/
└── knowledge-actions.ts (Updated)
    └── Add auto-embed on save

lib/features/contacts/actions/
└── contacts-actions.ts (Updated)
    └── Add RAG Q&A integration
```

---

## 🔟 Implementation Order

```
WEEK 1:
Day 1:
  ✓ Embedding Service
  ✓ Vector Search Service
Day 2:
  ✓ RAG Pipeline Service
  ✓ Server Actions
Day 3:
  ✓ Tests (80% coverage)

WEEK 2:
Day 1-2:
  ✓ Vector Search Component
  ✓ RAG Q&A Component
Day 3:
  ✓ Knowledge Page Integration
  ✓ Tests

WEEK 3:
Day 1-2:
  ✓ Auto-embedding on save
  ✓ Contact/Opportunity integration
Day 3:
  ✓ Monitoring & optimization
```

---

## 📍 Summary

| Aspect | Current | After Phase 1 | After Phase 2 |
|--------|---------|---|---|
| **Capabilities** | Store KB articles | Semantic search | Full RAG |
| **User Actions** | Read articles | Search by meaning | Ask questions + get AI answers |
| **UI Changes** | None | Search box | Q&A button + results |
| **Processing** | N/A | Vectors computed | LLM responses |
| **Visible Features** | 0 | 1 (search) | 2 (search + Q&A) |
| **Code Changes** | 0 | 3 services | +2 components |

---

## 🎯 Main Takeaway

```
Enable RAG = Turn on the feature flag
Build Phase 1 = Make indexing/searching work
Build Phase 2 = Make UI usable
Build Phase 3 = Make it automatic

Currently: Flag is on ✅
Missing: Everything else ❌

Next: Build Phase 1 (Backend Services)
```
