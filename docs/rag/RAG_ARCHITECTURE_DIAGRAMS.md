# RAG Cross-Feature Architecture Diagrams

---

## 1. System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MADE OS WITH RAG                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      USER INTERFACE                              │  │
│  │                                                                  │  │
│  │  Dashboard    Contacts    Opportunities    Knowledge    Events   │  │
│  │      │            │             │               │          │    │  │
│  │      └────────────┴─────────────┴───────────────┴──────────┘    │  │
│  │                           ▲                                      │  │
│  │                           │                                      │  │
│  │  ┌──────────────────────────────────────────┐                   │  │
│  │  │     Global RAG Chat Box (NEW)            │                   │  │
│  │  │  "Ask about anything..."                 │                   │  │
│  │  │  [Module Filter: All ▼]                  │                   │  │
│  │  │  ┌─────────────────────────────────────┐ │                   │  │
│  │  │  │ Message history                     │ │                   │  │
│  │  │  │ User: "QA phases?"                  │ │                   │  │
│  │  │  │ Bot: "Based on your knowledge..." │ │                   │  │
│  │  │  │ Sources:                            │ │                   │  │
│  │  │  │  • Knowledge: QA Overview           │ │                   │  │
│  │  │  │  • Contacts: John (QA Lead)         │ │                   │  │
│  │  │  └─────────────────────────────────────┘ │                   │  │
│  │  │  [Input field] [Ask]                    │                   │  │
│  │  └──────────────────────────────────────────┘                   │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                         │                                    │
│           └─────────────────────────┘                                    │
│                        │                                                 │
│                        ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    BACKEND SERVICES                              │  │
│  │                                                                  │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────────────┐ │  │
│  │  │ Permission Check │  │  Cross-Feature Search Service        │ │  │
│  │  │                  │  │  ├─ Embed question                   │ │  │
│  │  │ Module-level     │  │  ├─ Search vectors (multi-module)    │ │  │
│  │  │ access control   │→─│  ├─ Filter by permission             │ │  │
│  │  │                  │  │  ├─ Rank by relevance                │ │  │
│  │  │ knowledge: read  │  │  └─ Enrich with metadata             │ │  │
│  │  │ contacts: read   │  │                                      │ │  │
│  │  │ opportunities: X │  └──────────────────────────────────────┘ │  │
│  │  └──────────────────┘         │                                  │  │
│  │                               │                                  │  │
│  │                               ▼                                  │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │            Unified Vector Index                              │ │  │
│  │  │  (KnowledgeVector table - REFACTORED)                        │ │  │
│  │  │                                                              │ │  │
│  │  │  sourceModule: 'knowledge' | 'contacts' | ...               │ │  │
│  │  │  sourceId: 'article-123' | 'contact-456' | ...             │ │  │
│  │  │  embedding: [0.123, 0.456, ...] (3072 dims)                │ │  │
│  │  │  metadata: { title, preview, category, ...}                │ │  │
│  │  │                                                              │ │  │
│  │  │  Contains vectors from:                                     │ │  │
│  │  │  • Knowledge articles                                       │ │  │
│  │  │  • Contact notes + info                                     │ │  │
│  │  │  • Opportunity descriptions                                 │ │  │
│  │  │  • Event details                                            │ │  │
│  │  │  • Interaction summaries                                    │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │         │                          │                              │  │
│  │         └──────────────────────────┘                              │  │
│  │                  │                                                │  │
│  │                  ▼                                                │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │              RAG Pipeline Service                            │ │  │
│  │  │  ├─ Collect search results                                   │ │  │
│  │  │  ├─ Format context by module                                 │ │  │
│  │  │  ├─ Send to LLM (OpenAI/Gemini/Claude)                       │ │  │
│  │  │  ├─ Generate answer                                          │ │  │
│  │  │  ├─ Add citations                                            │ │  │
│  │  │  └─ Save to RAGSession                                       │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    INDEXING PIPELINE                             │  │
│  │                                                                  │  │
│  │  When entity created/updated:                                   │  │
│  │                                                                  │  │
│  │  Feature Action (e.g., createKnowledgeAction)                   │  │
│  │       │                                                          │  │
│  │       ├─ Create entity                                           │  │
│  │       │                                                          │  │
│  │       └─ [If RAG enabled] →  Indexing Manager                   │  │
│  │            ├─ Chunk text (if long)                              │  │
│  │            ├─ Embed chunks                                      │  │
│  │            ├─ Store in KnowledgeVector                          │  │
│  │            └─ Log indexing activity                             │  │
│  │                                                                  │  │
│  │  Triggered for:                                                 │  │
│  │  ✓ Knowledge articles (create + update)                         │  │
│  │  ✓ Contacts (create + update)                                   │  │
│  │  ✓ Opportunities (create + update)                              │  │
│  │  ✓ Events (create + update)                                     │  │
│  │  ✓ Interactions (create + update)                               │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow: User Asks a Question

```
User Types in Chat Box
│
│ "What are QA phases and who is responsible?"
│
▼
┌───────────────────────────────────────┐
│ RAG Chat Server Action                │
│ ragChatAction({                       │
│   question: string                    │
│   userId: string                      │
│   moduleFilter?: string[]             │
│ })                                    │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 1: Permission Check              │
│                                       │
│ User Permissions:                     │
│ • knowledge: ['read']      ✓ OK       │
│ • contacts: ['read']       ✓ OK       │
│ • opportunities: []        ✗ SKIP     │
│                                       │
│ Searchable modules:                   │
│ ['knowledge', 'contacts']             │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 2: Embed Question                │
│                                       │
│ Input: "What are QA phases..."        │
│ Provider: OpenAI text-embedding-3-lg  │
│ Output: [0.23, 0.45, 0.12, ...] (3072 dims)
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 3: Search Vectors                │
│                                       │
│ SELECT * FROM KnowledgeVector         │
│ WHERE sourceModule IN (               │
│   'knowledge', 'contacts'             │
│ )                                     │
│ ORDER BY similarity DESC              │
│ LIMIT 5                               │
│                                       │
│ Results:                              │
│ 1. Knowledge: QA Overview (0.92)      │
│ 2. Contacts: John Doe (0.87)          │
│ 3. Knowledge: QA Planning (0.84)      │
│ 4. Contacts: Jane Smith (0.79)        │
│ 5. Knowledge: QA Tools (0.76)         │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 4: Build Context for LLM         │
│                                       │
│ Context:                              │
│ "Based on company knowledge:          │
│                                       │
│  From Knowledge Base:                 │
│  - QA Overview: QA has 3 phases...    │
│  - QA Planning: Planning takes...     │
│  - QA Tools: We use TestNG...         │
│                                       │
│  From Team:                           │
│  - John Doe: QA Lead                  │
│  - Jane Smith: QA Engineer"           │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 5: Send to LLM                   │
│                                       │
│ OpenAI GPT-4 Turbo                    │
│ (or Claude / Gemini / Cohere)         │
│                                       │
│ System: "You are a helpful Q&A bot... │
│ User: "What are QA phases and who...  │
│ Context: [sources above]              │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 6: Generate Answer               │
│                                       │
│ "Based on our company knowledge:      │
│                                       │
│ QA Process has 3 phases:              │
│ 1. Planning (2 days)                  │
│ 2. Execution (TestNG + Selenium)      │
│ 3. Reporting (review test cases)      │
│                                       │
│ John Doe is our QA Lead.              │
│ Jane Smith is a QA Engineer."         │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 7: Save to Database              │
│                                       │
│ RAGSession {                          │
│   id: 'session-123'                   │
│   userId: 'user-456'                  │
│   question: 'What are QA phases...'   │
│ }                                     │
│                                       │
│ RAGMessage {                          │
│   sessionId: 'session-123'            │
│   role: 'user'                        │
│   content: 'What are QA phases...'    │
│ }                                     │
│                                       │
│ RAGMessage {                          │
│   sessionId: 'session-123'            │
│   role: 'assistant'                   │
│   content: 'Based on company knowledge...'
│   sources: [KnowledgeVector IDs]      │
│ }                                     │
│                                       │
│ VectorSearchLog {                     │
│   query: 'What are QA phases...'      │
│   userId: 'user-456'                  │
│   resultsCount: 5                     │
│   durationMs: 342                     │
│ }                                     │
└───────────────────────────────────────┘
│
▼
┌───────────────────────────────────────┐
│ Step 8: Return to Chat UI             │
│                                       │
│ {                                     │
│   answer: "Based on our company...",  │
│   sources: [                          │
│     {                                 │
│       sourceModule: 'knowledge',      │
│       title: 'QA Overview',           │
│       similarity: 0.92,               │
│       url: '/knowledge/article-123'   │
│     },                                │
│     {                                 │
│       sourceModule: 'contacts',       │
│       title: 'John Doe',              │
│       similarity: 0.87,               │
│       url: '/contacts/contact-456'    │
│     }                                 │
│   ],                                  │
│   sessionId: 'session-123'            │
│ }                                     │
└───────────────────────────────────────┘
│
▼
Chat UI displays answer + sources + feedback buttons
```

---

## 3. Database Schema Changes

### Before (Knowledge-Only)

```
KnowledgeVector
├─ id (string)              ← UUID
├─ articleId (string)       ← FK to Knowledge.id
├─ chunkIndex (int)         ← Position in article
├─ embedding (text)         ← JSON string [0.1, 0.2, ...]
├─ metadata (json)          ← { title, category, ... }
├─ createdAt (datetime)
└─ updatedAt (datetime)

Indexed for: Knowledge articles ONLY
```

### After (Cross-Feature)

```
KnowledgeVector (REFACTORED)
├─ id (string)              ← UUID
├─ sourceModule (string)    ← 'knowledge'|'contacts'|'opportunities'|...
├─ sourceId (string)        ← FK to entity (article.id, contact.id, etc)
├─ sourceType (string)      ← 'article'|'contact'|'opportunity'|...
├─ chunkIndex (int)         ← Position in content (0 if single chunk)
├─ embedding (text)         ← JSON string [0.1, 0.2, ...]
├─ metadata (json)          ← { title, preview, category, ... }
├─ createdAt (datetime)
└─ updatedAt (datetime)

Indexes:
├─ sourceModule
├─ sourceModule + sourceId
└─ createdAt

Indexed for: Knowledge + Contacts + Opportunities + Events + Interactions
```

### New Table (Optional)

```
CrossFeatureSearchLog
├─ id (string)
├─ query (string)           ← "What are QA phases?"
├─ moduleFilters (json)     ← ['knowledge', 'contacts']
├─ userId (string)          ← FK to User
├─ resultsCount (int)       ← 5
├─ sourceModules (json)     ← ['knowledge', 'contacts']
├─ durationMs (int)         ← 342
├─ sessionId (string)       ← FK to RAGSession (optional)
└─ createdAt (datetime)

Indexes:
├─ userId
└─ createdAt
```

---

## 4. Permission Flow

```
┌─────────────────────────────────────────┐
│ User Requests RAG Search                │
│                                         │
│ query: "QA phases"                      │
│ userId: "user-123"                      │
│ moduleFilter: optional                  │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ Get User Permissions                    │
│                                         │
│ FROM UserRole                           │
│   JOIN Role ON UserRole.roleId = Role.id
│   JOIN RolePermission ON ...            │
│ WHERE userId = "user-123"               │
│                                         │
│ Result:                                 │
│ {                                       │
│   'knowledge': ['read', 'create'],      │
│   'contacts': ['read'],                 │
│   'opportunities': [],                  │
│   'events': ['read']                    │
│ }                                       │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ Filter Searchable Modules               │
│                                         │
│ IF moduleFilter provided:               │
│   searchableModules = moduleFilter      │
│     INTERSECT userModules               │
│ ELSE:                                   │
│   searchableModules = userModules       │
│     WHERE permission = 'read'           │
│                                         │
│ In this example:                        │
│ searchableModules = [                   │
│   'knowledge',       ← has read         │
│   'contacts',        ← has read         │
│   'events'           ← has read         │
│ ]                                       │
│                                         │
│ EXCLUDED:                               │
│ 'opportunities'      ← NO read          │
└─────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│ Search Only Accessible Vectors          │
│                                         │
│ SELECT * FROM KnowledgeVector           │
│ WHERE sourceModule IN (                 │
│   'knowledge', 'contacts', 'events'     │
│ )                                       │
│ ORDER BY similarity DESC                │
│                                         │
│ Result:                                 │
│ ✓ Article from knowledge                │
│ ✓ Contact from contacts                 │
│ ✓ Event from events                     │
│ ✗ Opportunity NEVER appears             │
│   (user has no read permission)         │
└─────────────────────────────────────────┘
│
▼
Return results safely filtered by permissions
```

---

## 5. Implementation Phases Timeline

```
Week 1:
┌─────────────────────────────────────────┐
│ Phase 1: Infrastructure (Days 1-3)      │
│                                         │
│ Day 1:                                  │
│ ├─ Create database migration            │
│ ├─ Update Prisma schema                 │
│ └─ Regenerate Prisma client             │
│                                         │
│ Day 2:                                  │
│ ├─ Build repository methods             │
│ ├─ Add DB indexes                       │
│ └─ Test migration on dev                │
│                                         │
│ Day 3:                                  │
│ ├─ Write repository tests               │
│ └─ Documentation                        │
│                                         │
│ Output: Database ready for services     │
└─────────────────────────────────────────┘

Week 2:
┌─────────────────────────────────────────┐
│ Phase 2: Services (Days 4-6)            │
│                                         │
│ Day 4:                                  │
│ ├─ Embedding service                    │
│ ├─ Batch processing                     │
│ └─ Caching layer                        │
│                                         │
│ Day 5:                                  │
│ ├─ Cross-feature search service         │
│ ├─ Permission filtering                 │
│ └─ Result enrichment                    │
│                                         │
│ Day 6:                                  │
│ ├─ RAG pipeline service update          │
│ ├─ Indexing manager                     │
│ └─ Integration tests                    │
│                                         │
│ Output: Backend API complete            │
└─────────────────────────────────────────┘

Week 3:
┌─────────────────────────────────────────┐
│ Phase 3: UI Components (Days 7-9)       │
│                                         │
│ Day 7:                                  │
│ ├─ Chat box component                   │
│ ├─ Message display                      │
│ └─ Input handling                       │
│                                         │
│ Day 8:                                  │
│ ├─ Search results component             │
│ ├─ Source citations                     │
│ └─ Module filtering                     │
│                                         │
│ Day 9:                                  │
│ ├─ Dashboard integration                │
│ ├─ Loading states                       │
│ └─ Error handling                       │
│                                         │
│ Output: Chat UI complete                │
└─────────────────────────────────────────┘

Week 4:
┌─────────────────────────────────────────┐
│ Phase 4: Integration (Days 10-12)       │
│                                         │
│ Day 10:                                 │
│ ├─ Hook into Knowledge actions          │
│ ├─ Hook into Contacts actions           │
│ └─ Hook into Opportunities actions      │
│                                         │
│ Day 11:                                 │
│ ├─ Batch indexing script                │
│ ├─ Data migration                       │
│ └─ Backfill existing data               │
│                                         │
│ Day 12:                                 │
│ ├─ End-to-end testing                   │
│ ├─ Integration tests                    │
│ └─ Permission validation                │
│                                         │
│ Output: Auto-indexing working           │
└─────────────────────────────────────────┘

Week 5:
┌─────────────────────────────────────────┐
│ Phase 5: Polish (Days 13-14)            │
│                                         │
│ Day 13:                                 │
│ ├─ Performance optimization             │
│ ├─ Caching strategies                   │
│ └─ Cost analysis                        │
│                                         │
│ Day 14:                                 │
│ ├─ Documentation                        │
│ ├─ User testing                         │
│ └─ Bug fixes                            │
│                                         │
│ Output: Production ready                │
└─────────────────────────────────────────┘
```

---

## 6. Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   Chat UI Layer                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ RAGChatBox (Global)                                     │ │
│  │ ├─ ChatInterface                                        │ │
│  │ │  ├─ MessageList (User messages + Bot responses)       │ │
│  │ │  └─ ChatInput (Text input + module filter)            │ │
│  │ └─ SearchResults (Display sources with citations)       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│         ↓ uses ↓         ↓ calls ↓       ↓ sends ↓         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│               Server Actions Layer                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ ragChatAction│  │ searchAction  │  │ feedbackAction │   │
│  │              │  │              │  │                │   │
│  │ (orchestrate)│  │(permission +  │  │(save ratings)  │   │
│  │              │  │ search)       │  │                │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
│         ↓                  ↓                    ↓            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│              Service Layer (Business Logic)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ crossFeatureSearchService                              │ │
│  │ ├─ getUserPermissions()                                │ │
│  │ ├─ embed(query)                                        │ │
│  │ ├─ searchByModules()                                   │ │
│  │ └─ enrichResults()                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ragPipelineService                                     │ │
│  │ ├─ answerQuestion()                                    │ │
│  │ ├─ formatContext()                                     │ │
│  │ └─ generateAnswerWithLLM()                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ embeddingService                                       │ │
│  │ ├─ embed(text, provider)                               │ │
│  │ ├─ embedBatch(texts, provider)                         │ │
│  │ └─ embedWithCache()                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ indexingManager                                        │ │
│  │ ├─ indexKnowledgeArticle()                             │ │
│  │ ├─ indexContact()                                      │ │
│  │ ├─ indexOpportunity()                                  │ │
│  │ └─ reindexAll() (migration)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│            Repository Layer (Data Access)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────┐   │
│  │ knowledgeVector    │  │ crossFeatureSearchLog      │   │
│  │ Repository         │  │ Repository                 │   │
│  │                    │  │                            │   │
│  │ ├─ saveVector()    │  │ ├─ logSearch()             │   │
│  │ ├─ searchByModules │  │ ├─ getSearchHistory()      │   │
│  │ ├─ deleteBySource()│  │ └─ getMetrics()            │   │
│  │ └─ updateMetadata()│  │                            │   │
│  └────────────────────┘  └────────────────────────────┘   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                   Database Layer                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PostgreSQL                                                 │
│  ├─ KnowledgeVector (refactored)                           │
│  ├─ CrossFeatureSearchLog (new)                            │
│  ├─ RAGSession (existing)                                  │
│  ├─ RAGMessage (existing)                                  │
│  └─ RAGFeedback (existing)                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Permission Filtering Logic

```
User Query
│
▼
Get User from Session
│
├─ session.user.id = "user-123"
└─ session.user.email = "john@example.com"
  
▼
Get User Roles
│
├─ Admin Role
└─ Sales Role

▼
Get Role Permissions
│
├─ Admin:
│  ├─ knowledge: ['read', 'create', 'update', 'delete']
│  ├─ contacts: ['read', 'create', 'update', 'delete']
│  ├─ opportunities: ['read', 'create']
│  └─ events: ['read']
│
└─ Sales:
   ├─ knowledge: ['read']
   ├─ contacts: ['read', 'create']
   ├─ opportunities: ['read', 'update']
   └─ events: []

▼
Merge Permissions (UNION - take highest)
│
├─ knowledge: ['read', 'create', 'update', 'delete']
├─ contacts: ['read', 'create', 'update', 'delete']
├─ opportunities: ['read', 'create', 'update']
└─ events: ['read']

▼
Filter to 'read' only
│
├─ knowledge: ['read']       ✓
├─ contacts: ['read']        ✓
├─ opportunities: ['read']   ✓
└─ events: ['read']          ✓

▼
Modules user can RAG search:
│
['knowledge', 'contacts', 'opportunities', 'events']

▼
If user applies moduleFilter (e.g., ['knowledge', 'contacts']):
│
Intersect with available:
['knowledge', 'contacts'] ∩ ['knowledge', 'contacts', 'opportunities', 'events']
= ['knowledge', 'contacts']

▼
Search Only These Modules
│
SELECT * FROM KnowledgeVector
WHERE sourceModule IN ('knowledge', 'contacts')
```

---

**Architecture created**: December 5, 2025  
**Status**: Ready for implementation  
**Questions?**: See RAG_CROSS_FEATURE_PLAN.md for full details
