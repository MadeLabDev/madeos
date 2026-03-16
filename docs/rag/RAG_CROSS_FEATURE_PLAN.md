# RAG Cross-Feature Chat Implementation Plan

**Status**: Planning Phase  
**Date Created**: December 5, 2025  
**Complexity**: HIGH - Cross-cutting feature with RBAC integration  
**Estimated Timeline**: 10-14 working days  

---

## 📌 Executive Summary

### What We're Building
A unified **RAG Chat Bot** that:
1. Works across ALL features (not just Knowledge)
2. Respects RBAC permissions (user can only RAG search data they have access to)
3. Coexists with existing search boxes (no breaking changes)
4. Indexes searchable data from multiple modules
5. Returns contextualized answers based on feature + permissions

### Why It's Complex
- **Multi-module**: Must work with Contacts, Opportunities, Knowledge, Events, etc.
- **RBAC-aware**: Must respect module-level and potentially entity-level permissions
- **Data heterogeneous**: Different modules have different structures (KB = text, Contacts = structured data)
- **Index management**: Need to maintain cross-module vector index
- **UI placement**: Need to place chat globally or in multiple locations
- **Performance**: Searching across all modules with permission checks

---

## 🏗️ Current Architecture Analysis

### Existing Search Pattern
```
lib/features/[feature]/repositories/[feature]-repository.ts
├── getAllContacts(params?: { search?: string })
├── getAllOpportunities(params?: { search?: string })
└── getAllKnowledge(params?: { search?: string })
```

**Pattern**: Text search on specific fields (firstName, email, title, etc.)  
**Limitation**: Field-based, not semantic, feature-specific

### Current RBAC Structure
```
User → UserRole → Role → RolePermission ← Module + Permission
                              ↓
                        session.user.permissions = {
                          'customers': ['read', 'create', 'update'],
                          'knowledge': ['read'],
                          'opportunities': ['read', 'update']
                        }
```

**How it works**: `checkPermission('knowledge', 'read')` → checks session.user.permissions  
**Scope**: Module-level only (no row-level security yet)

### Existing Vector Search Setup
```
lib/features/vector-search/
├── services/
│   ├── embedding.ts (scaffolding only)
│   ├── search.ts (scaffolding only)
│   └── rag-pipeline.ts (scaffolding only)
├── repositories/
│   └── (empty)
└── types/
    └── (empty)
```

**Status**: Foundation laid, but not implemented

---

## 📊 Proposal: Cross-Feature RAG Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   GLOBAL RAG CHAT INTERFACE                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                 Chat Box (Always Visible)                 │ │
│  │                                                           │ │
│  │ Question: "What are the main QA phases?"                 │ │
│  │ [Ask RAG] button                                         │ │
│  │                                                           │ │
│  │ Response:                                                 │ │
│  │ "Based on your accessible knowledge..."                 │ │
│  │ • Source 1: Knowledge Article (QA Overview)             │ │
│  │ • Source 2: Contact (John - QA Lead)                    │ │
│  │ • Source 3: Opportunity (QA Testing Project)            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Filters: [All] [Knowledge] [Contacts] [Opportunities]        │
│  Permission-aware: Only searches data user can access         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

    ↓ (When RAG enabled)

┌─ Embedding Service ──────────────────────────────────────────┐
│                                                              │
│ Indexes content from multiple modules:                      │
│ • Knowledge articles (content field)                        │
│ • Contacts (name + notes + interactions)                   │
│ • Opportunities (title + description + notes)              │
│ • Events (title + description)                             │
│ • Interactions (notes + summaries)                         │
│                                                              │
│ When to index:                                              │
│ • On entity create (triggered by feature action)           │
│ • On entity update (triggered by feature action)           │
│ • Batch index existing data (one-time migration)           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

    ↓

┌─ Unified Vector Index ──────────────────────────────────────┐
│                                                              │
│ KnowledgeVector (refactored):                               │
│ ├── id: "vec-123"                                           │
│ ├── sourceModule: "knowledge" | "contacts" | ...           │
│ ├── sourceId: "article-456"  (FK to Knowledge.id)          │
│ ├── sourceType: "article" | "contact" | "opportunity"      │
│ ├── chunkIndex: 0                                           │
│ ├── embedding: [...]  (3072 dimensions)                    │
│ ├── metadata: {                                             │
│ │    title: "QA Process Overview"                          │
│ │    preview: "QA has 3 phases..."                         │
│ │    relevance: 0.92                                        │
│ │  }                                                         │
│ └── createdAt: ...                                          │
│                                                              │
│ VectorSearchLog (refactored):                               │
│ ├── query: "QA phases"                                      │
│ ├── filters: ["knowledge", "contacts"]                     │
│ ├── userId: "user-123"                                      │
│ ├── resultsCount: 3                                         │
│ └── duration: 245ms                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

    ↓

┌─ Unified Search Service ────────────────────────────────────┐
│                                                              │
│ Performs:                                                    │
│ 1. Permission check (which modules can user access?)        │
│ 2. Embed question                                            │
│ 3. Search vectors filtered by:                              │
│    - User permissions (module-level)                        │
│    - Module filter (if user selected)                       │
│ 4. Deduplicate results                                      │
│ 5. Score + rank by relevance                                │
│ 6. Return with metadata (title, preview, source)            │
│                                                              │
│ Example query:                                               │
│ searchCrossFeature({                                         │
│   question: "QA phases",                                    │
│   userId: "user-123",                                       │
│   moduleFilter: ["knowledge", "contacts"],  // Optional     │
│   limit: 10                                                  │
│ })                                                           │
│                                                              │
│ Returns:                                                     │
│ [{                                                           │
│   sourceModule: "knowledge",                                │
│   sourceId: "article-456",                                  │
│   title: "QA Overview",                                     │
│   preview: "QA has 3 phases...",                            │
│   similarity: 0.92,                                         │
│   url: "/knowledge/article-456"                             │
│ }]                                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

    ↓

┌─ Unified RAG Pipeline ──────────────────────────────────────┐
│                                                              │
│ Input: Question + search results + user permissions         │
│                                                              │
│ Flow:                                                        │
│ 1. Collect top results from each module                     │
│ 2. Format context:                                           │
│    "Based on these sources from Knowledge/Contacts/etc:    │
│     Source 1 (Knowledge): Article text...                  │
│     Source 2 (Contacts): Contact info..."                  │
│ 3. Send to LLM with question + context                     │
│ 4. Generate answer                                          │
│ 5. Log to RAGSession + RAGMessage                           │
│ 6. Return answer + sources                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Changes Required

### 1. Refactor KnowledgeVector Table

**Current (Knowledge-only)**:
```prisma
model KnowledgeVector {
  id           String    @id @default(cuid())
  articleId    String
  chunkIndex   Int
  embedding    String    @db.Text  // JSON array
  metadata     Json?
  createdAt    DateTime  @default(now())
}
```

**New (Cross-feature)**:
```prisma
model KnowledgeVector {
  id              String    @id @default(cuid())
  
  // Which module/entity this came from
  sourceModule    String    // "knowledge", "contacts", "opportunities", etc.
  sourceId        String    // FK to entity (article.id, contact.id, etc.)
  sourceType      String    // "article", "contact", "opportunity", "event"
  
  // Chunk info
  chunkIndex      Int
  embedding       String    @db.Text  // JSON array of embeddings
  
  // Metadata for display in search results
  metadata        Json?     // { title, preview, category, etc }
  
  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Indexes for fast lookup
  @@index([sourceModule])
  @@index([sourceId])
  @@index([sourceModule, sourceId])
  @@index([createdAt])
}
```

**Migration needed**:
```sql
-- prisma/migrations/[timestamp]_expand_knowledge_vector/migration.sql

-- Add new columns
ALTER TABLE "KnowledgeVector" 
ADD COLUMN "sourceModule" VARCHAR(50) NOT NULL DEFAULT 'knowledge',
ADD COLUMN "sourceId" VARCHAR(100) NOT NULL,
ADD COLUMN "sourceType" VARCHAR(50) NOT NULL DEFAULT 'article';

-- Populate existing data (Knowledge articles)
UPDATE "KnowledgeVector" 
SET "sourceModule" = 'knowledge', "sourceType" = 'article'
WHERE "sourceModule" = 'knowledge';

-- Migrate articleId -> sourceId for knowledge
UPDATE "KnowledgeVector"
SET "sourceId" = "articleId"
WHERE "articleId" IS NOT NULL;

-- Drop old articleId column (optional - can keep for compatibility)
-- ALTER TABLE "KnowledgeVector" DROP COLUMN "articleId";

-- Create indexes
CREATE INDEX idx_knowledge_vector_source_module ON "KnowledgeVector"("sourceModule");
CREATE INDEX idx_knowledge_vector_source_id ON "KnowledgeVector"("sourceId");
CREATE INDEX idx_knowledge_vector_source_module_id ON "KnowledgeVector"("sourceModule", "sourceId");

-- Update VectorSearchLog similarly if needed
```

### 2. Add Cross-Feature Search Table (Optional but Recommended)

```prisma
model CrossFeatureSearchLog {
  id              String    @id @default(cuid())
  
  // Query info
  query           String
  moduleFilters   String    // JSON: ["knowledge", "contacts"]
  
  // User
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  // Results
  resultsCount    Int
  sourceModules   String    // JSON: ["knowledge", "contacts"]
  
  // Performance
  durationMs      Int
  
  // Session
  sessionId       String?   // Link to RAGSession if answered
  
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

---

## 🛠️ Code Architecture

### New File Structure

```
lib/features/vector-search/
├── services/
│   ├── embedding-service.ts          (Unified embedding)
│   ├── cross-feature-search.ts       (NEW - Cross-module search)
│   ├── rag-pipeline.ts               (Updated - add cross-feature support)
│   └── indexing-manager.ts           (NEW - Manage indexing across modules)
├── repositories/
│   ├── knowledge-vector-repository.ts (Updated - support new fields)
│   └── cross-feature-log-repository.ts (NEW)
├── actions/
│   ├── embedding-actions.ts          (Trigger indexing)
│   ├── search-actions.ts             (Search action)
│   └── rag-chat-actions.ts           (Chat action)
├── types/
│   ├── search.ts                     (Cross-feature search types)
│   └── rag.ts                        (RAG types)
└── index.ts

components/
├── global/
│   └── rag-chat-box.tsx              (NEW - Floating/fixed chat)
├── knowledge/
│   └── vector-search-query.tsx       (Keep existing)
└── rag/
    ├── chat-interface.tsx            (NEW - Main chat UI)
    ├── search-results.tsx            (NEW - Display results)
    └── message-list.tsx              (NEW - Message history)

app/
└── (dashboard)/
    └── layout.tsx                    (Add RAG chat provider)
```

### Key Services

#### 1. Cross-Feature Search Service (`cross-feature-search.ts`)

```typescript
interface SearchResult {
  sourceModule: 'knowledge' | 'contacts' | 'opportunities' | 'events' | 'interactions';
  sourceId: string;
  sourceType: string;
  title: string;
  preview: string;
  similarity: number;
  url: string;
  metadata?: Record<string, any>;
}

interface CrossFeatureSearchParams {
  query: string;
  userId: string;
  moduleFilter?: string[];  // Optional: ['knowledge', 'contacts']
  limit?: number;
  threshold?: number;  // Similarity threshold (0-1)
}

export const crossFeatureSearchService = {
  async search(params: CrossFeatureSearchParams): Promise<SearchResult[]> {
    // 1. Get user permissions
    const userPermissions = await getUserPermissions(params.userId);
    
    // 2. Determine searchable modules based on permissions + filter
    const searchableModules = determineSearchableModules(
      userPermissions,
      params.moduleFilter
    );
    
    // 3. Embed question
    const questionEmbedding = await embeddingService.embed(params.query);
    
    // 4. Search vectors
    const results = await searchVectorsCrossFeature(
      questionEmbedding,
      searchableModules,
      params.limit,
      params.threshold
    );
    
    // 5. Enrich with metadata
    const enriched = await enrichResults(results);
    
    // 6. Log search
    await logSearch({
      query: params.query,
      userId: params.userId,
      moduleFilters: params.moduleFilter,
      resultsCount: enriched.length,
      sourceModules: [...new Set(enriched.map(r => r.sourceModule))]
    });
    
    return enriched;
  }
};
```

#### 2. Indexing Manager (`indexing-manager.ts`)

```typescript
export const indexingManager = {
  // Called when Knowledge article is created
  async indexKnowledgeArticle(articleId: string) {
    const article = await getArticle(articleId);
    const chunks = chunkText(article.content, 500);
    const embeddings = await embeddingService.embedBatch(chunks);
    
    await saveVectors({
      sourceModule: 'knowledge',
      sourceId: articleId,
      sourceType: 'article',
      chunks,
      embeddings,
      metadata: { title: article.title, category: article.categoryId }
    });
  },
  
  // Called when Contact is created
  async indexContact(contactId: string) {
    const contact = await getContact(contactId);
    const text = `${contact.firstName} ${contact.lastName}. ${contact.notes || ''}`;
    const embeddings = await embeddingService.embed(text);
    
    await saveVector({
      sourceModule: 'contacts',
      sourceId: contactId,
      sourceType: 'contact',
      embedding: embeddings,
      metadata: { 
        title: `${contact.firstName} ${contact.lastName}`,
        preview: contact.notes?.substring(0, 100) || contact.email,
        email: contact.email
      }
    });
  },
  
  // Similar for opportunities, events, etc.
  async indexOpportunity(opportunityId: string) { ... },
  async indexEvent(eventId: string) { ... },
  
  // Batch index all existing data (migration)
  async reindexAll() {
    console.log('Reindexing all entities...');
    
    const articles = await getAllArticles();
    for (const article of articles) {
      await this.indexKnowledgeArticle(article.id);
    }
    
    const contacts = await getAllContacts();
    for (const contact of contacts) {
      await this.indexContact(contact.id);
    }
    
    // ... etc for other modules
  }
};
```

#### 3. RAG Pipeline (Updated)

```typescript
export const ragPipelineService = {
  async answerQuestion(params: {
    question: string;
    userId: string;
    moduleFilter?: string[];
    sessionId?: string;
  }): Promise<RAGAnswer> {
    // 1. Search across features
    const results = await crossFeatureSearchService.search({
      query: params.question,
      userId: params.userId,
      moduleFilter: params.moduleFilter,
      limit: 5
    });
    
    // 2. Format context by module
    const context = formatContextByModule(results);
    
    // 3. Generate answer
    const answer = await generateAnswerWithLLM(
      params.question,
      context
    );
    
    // 4. Save to database
    const sessionId = params.sessionId || createSessionId();
    await saveRAGSession({
      id: sessionId,
      userId: params.userId,
      question: params.question,
      answer: answer.text,
      sources: results,
      tokensUsed: answer.tokens
    });
    
    return {
      answer: answer.text,
      sources: results,
      sessionId,
      tokensUsed: answer.tokens
    };
  }
};
```

---

## 🎨 UI Architecture

### Global Chat Box Placement

**Option A: Sidebar Widget (Recommended)**
```
Sidebar
├─ Dashboard
├─ Contacts
├─ Opportunities
├─ Knowledge
├─ ...
└─ ┌──────────────────┐
   │   RAG Chat Box   │  ← Always accessible
   │  "Ask about..."  │
   └──────────────────┘
```

**Option B: Floating Button (Alternative)**
```
                    ┌──────┐
                    │ Chat │  ← Floating button
                    │  ○   │
                    └──────┘
```

### Chat Component (`rag-chat-box.tsx`)

```typescript
export function RAGChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [moduleFilters, setModuleFilters] = useState<string[]>([]);
  
  async function handleSendMessage(question: string) {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    
    // RAG search + generate
    const answer = await ragChatAction({
      question,
      moduleFilters
    });
    
    // Add bot message with sources
    setMessages(prev => [...prev, {
      role: 'bot',
      content: answer.answer,
      sources: answer.sources,
      sessionId: answer.sessionId
    }]);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        💬 Ask RAG
      </Button>
      
      <DialogContent className="w-full max-w-md">
        <div>
          {/* Module filter tabs */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Message history */}
          <MessageList messages={messages} />
          
          {/* Input */}
          <ChatInput onSend={handleSendMessage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🔐 Permission Model

### Module-Level Access Control

Current system checks: `checkPermission('knowledge', 'read')`

**With RAG**: Same check applies to searching!

```typescript
async function searchCrossFeature(params: CrossFeatureSearchParams) {
  const userPermissions = await getUserPermissions(params.userId);
  
  // Filter modules user can access
  const searchableModules = ['knowledge', 'contacts', 'opportunities']
    .filter(module => {
      const hasPermission = userPermissions[module]?.includes('read');
      return hasPermission;
    });
  
  // Only search these modules
  const results = await vectorRepository.searchByModules(
    embedding,
    searchableModules
  );
  
  return results;
}
```

**Example:**
```
User Permissions: {
  'knowledge': ['read'],
  'contacts': ['read'],
  'opportunities': []  // No permission!
}

RAG Search Result:
✓ Can see knowledge results
✓ Can see contact results
✗ Cannot see opportunity results
  (even if opportunity matches query)
```

### Future: Row-Level Security

When implemented later:
```
searchCrossFeature({
  question: "QA phases",
  userId: "user-123",
  moduleFilter: ["knowledge", "contacts"]
  // Could add: entityFilters: { contacts: [customerId] }
})
```

---

## 📋 Implementation Roadmap

### Phase 1: Infrastructure (Days 1-3)
- [ ] 1.1: Create database migration (refactor KnowledgeVector)
- [ ] 1.2: Update Prisma schema + regenerate
- [ ] 1.3: Create cross-feature search types
- [ ] 1.4: Create knowledge-vector-repository with new fields
- [ ] 1.5: Write unit tests for repository

### Phase 2: Core Services (Days 4-6)
- [ ] 2.1: Build embedding-service (multi-provider support)
- [ ] 2.2: Build cross-feature-search service
- [ ] 2.3: Build indexing-manager
- [ ] 2.4: Update rag-pipeline for cross-feature
- [ ] 2.5: Create server actions (search, index, chat)
- [ ] 2.6: Write integration tests

### Phase 3: UI Components (Days 7-9)
- [ ] 3.1: Build rag-chat-box component
- [ ] 3.2: Build message-list component
- [ ] 3.3: Build search-results component
- [ ] 3.4: Integrate into dashboard layout
- [ ] 3.5: Add loading/error states
- [ ] 3.6: Write component tests

### Phase 4: Integration & Trigger Points (Days 10-12)
- [ ] 4.1: Hook indexing into Knowledge create/update
- [ ] 4.2: Hook indexing into Contacts create/update
- [ ] 4.3: Hook indexing into Opportunities create/update
- [ ] 4.4: Hook indexing into Events create/update
- [ ] 4.5: Create migration script for existing data
- [ ] 4.6: Test end-to-end workflow

### Phase 5: Optimization & Polish (Days 13-14)
- [ ] 5.1: Performance testing (latency, memory)
- [ ] 5.2: Caching strategy for embeddings
- [ ] 5.3: Cost optimization (batch processing)
- [ ] 5.4: Documentation + API reference
- [ ] 5.5: Error handling + logging
- [ ] 5.6: User testing + feedback

---

## 🚀 Implementation Steps (Detailed)

### Step 1: Database Migration

**File**: `prisma/migrations/[timestamp]_refactor_knowledge_vector/migration.sql`

```sql
-- Add new columns
ALTER TABLE "KnowledgeVector" 
ADD COLUMN "sourceModule" VARCHAR(50) NOT NULL DEFAULT 'knowledge',
ADD COLUMN "sourceId" VARCHAR(100) NOT NULL,
ADD COLUMN "sourceType" VARCHAR(50) NOT NULL DEFAULT 'article';

-- Populate existing rows
UPDATE "KnowledgeVector" 
SET "sourceId" = "articleId"
WHERE "sourceId" IS NULL AND "articleId" IS NOT NULL;

-- Create indexes
CREATE INDEX idx_knowledge_vector_source_module 
  ON "KnowledgeVector"("sourceModule");
CREATE INDEX idx_knowledge_vector_source_module_id 
  ON "KnowledgeVector"("sourceModule", "sourceId");

-- Make sourceId required after backfill
ALTER TABLE "KnowledgeVector" 
MODIFY COLUMN "sourceId" VARCHAR(100) NOT NULL;
```

### Step 2: Update Prisma Schema

```prisma
model KnowledgeVector {
  id              String    @id @default(cuid())
  
  sourceModule    String    // "knowledge", "contacts", "opportunities", ...
  sourceId        String
  sourceType      String    // "article", "contact", "opportunity", ...
  
  chunkIndex      Int
  embedding       String    @db.Text
  metadata        Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([sourceModule])
  @@index([sourceModule, sourceId])
  @@index([createdAt])
}

model CrossFeatureSearchLog {
  id              String    @id @default(cuid())
  query           String
  moduleFilters   String    // JSON: ["knowledge", "contacts"]
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  resultsCount    Int
  sourceModules   String    // JSON: ["knowledge", "contacts"]
  durationMs      Int
  sessionId       String?
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

### Step 3: Create Repository Methods

**File**: `lib/features/vector-search/repositories/knowledge-vector-repository.ts`

```typescript
export const knowledgeVectorRepository = {
  async saveVector(data: {
    sourceModule: string;
    sourceId: string;
    sourceType: string;
    chunkIndex: number;
    embedding: number[];
    metadata?: any;
  }) {
    return prisma.knowledgeVector.create({
      data: {
        sourceModule: data.sourceModule,
        sourceId: data.sourceId,
        sourceType: data.sourceType,
        chunkIndex: data.chunkIndex,
        embedding: JSON.stringify(data.embedding),
        metadata: data.metadata
      }
    });
  },
  
  async searchByModules(
    embedding: number[],
    modules: string[],
    limit: number = 5,
    threshold: number = 0.75
  ) {
    const allVectors = await prisma.knowledgeVector.findMany({
      where: {
        sourceModule: { in: modules }
      }
    });
    
    const results = allVectors
      .map(v => ({
        ...v,
        similarity: cosineSimilarity(
          embedding,
          JSON.parse(v.embedding)
        )
      }))
      .filter(v => v.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  },
  
  async deleteBySource(sourceModule: string, sourceId: string) {
    return prisma.knowledgeVector.deleteMany({
      where: {
        sourceModule,
        sourceId
      }
    });
  }
};
```

### Step 4: Build Cross-Feature Search Service

**File**: `lib/features/vector-search/services/cross-feature-search.ts`

```typescript
export const crossFeatureSearchService = {
  async search(params: {
    query: string;
    userId: string;
    moduleFilter?: string[];
    limit?: number;
  }) {
    // 1. Get user permissions
    const userPermissions = await getUserPermissions(params.userId);
    
    // 2. Determine searchable modules
    const allModules = Object.keys(userPermissions);
    const searchableModules = params.moduleFilter 
      ? params.moduleFilter.filter(m => 
          userPermissions[m]?.includes('read')
        )
      : allModules.filter(m => 
          userPermissions[m]?.includes('read')
        );
    
    // 3. Embed query
    const queryEmbedding = await embeddingService.embed(params.query);
    
    // 4. Search
    const vectors = await knowledgeVectorRepository.searchByModules(
      queryEmbedding,
      searchableModules,
      params.limit || 5
    );
    
    // 5. Enrich results
    const enriched = await enrichVectorResults(vectors);
    
    return enriched;
  }
};
```

### Step 5: Create Indexing Hooks

Update feature actions to call indexing:

**Example - Knowledge**: `lib/features/knowledge/actions/knowledge-actions.ts`

```typescript
export async function createKnowledgeAction(data: CreateKnowledgeInput) {
  await requirePermission('knowledge', 'create');
  
  const article = await knowledgeService.createArticle(data);
  
  // NEW: Index for RAG if enabled
  const ragEnabled = await isRagEnabled();
  if (ragEnabled) {
    try {
      await indexingManager.indexKnowledgeArticle(article.id);
    } catch (error) {
      console.error('Indexing failed:', error);
      // Non-blocking: don't fail article creation if indexing fails
    }
  }
  
  revalidatePath('/knowledge');
  return { success: true, data: article };
}
```

---

## ⚠️ Considerations & Trade-offs

### 1. Heterogeneous Data
**Challenge**: Different modules have different structure
```
Knowledge: Long text (articles) → Multiple chunks per entity
Contacts: Structured data (name, email) → Single vector per entity
Opportunities: Mixed (title + description) → 1-2 chunks per entity
```

**Solution**: 
- Content-aware chunking (only split long text)
- Metadata tagging by module + type
- Preview generation for results

### 2. Permission Model
**Current**: Module-level only  
**Future**: Could add row-level (e.g., only search contacts in my customer account)

**For now**: Module-level is sufficient, but design for future extensibility

### 3. Indexing Latency
**Issue**: Indexing happens synchronously → blocks article creation

**Solutions**:
- Make indexing async/fire-and-forget (non-blocking)
- Queue system for batch indexing
- Fallback to traditional search if vector not ready yet

### 4. Cross-Module Result Display
**Challenge**: Different result types need different display

**Solution**: 
- Store metadata with vector (title, preview, url)
- Determine URL based on sourceModule + sourceId
- Let component handle module-specific rendering

### 5. Cost & Performance
**Embeddings**: ~$0.0002 per article  
**Searches**: ~$0.00001 per query

**For MVP**: Acceptable. Optimize later if needed.

---

## 📊 Testing Strategy

### Unit Tests
- Repository methods (save, search, delete)
- Service methods (embed, search, rank)
- Permission checking

### Integration Tests
- Full flow: Create article → Index → Search → Get results
- Permission filtering
- Error handling

### E2E Tests
- User creates knowledge → Chat searches it
- User searches across modules
- Results display correctly

---

## 📚 Documentation Needed

1. **Architecture Guide**: How RAG works end-to-end
2. **Admin Guide**: How to index existing data
3. **Developer Guide**: How to add RAG to new modules
4. **User Guide**: How to use RAG Chat
5. **Cost Analysis**: Cost per operation

---

## 🎯 Success Criteria

✅ RAG Chat box works on all features (not just Knowledge)  
✅ Respects RBAC permissions (only search accessible modules)  
✅ Coexists with existing search (no breaking changes)  
✅ Indexed data is up-to-date (auto-index on create/update)  
✅ Performance acceptable (<2s response time)  
✅ Cost reasonable (<$50/month for typical usage)  
✅ Error handling graceful (indexing failures non-blocking)  
✅ Future-proof (can add row-level security later)

---

## 🚨 Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Indexing breaks feature creation | Make indexing async/non-blocking |
| High API costs | Batch embedding, cache, use cheaper providers |
| Slow search (cross-module) | Optimize DB indexes, implement caching |
| Confusing mixed results | Clear module labeling, group by module |
| Permission leaks | Comprehensive permission checks in service |
| Data consistency | Delete vectors when entity deleted |

---

## 📍 Decision Points

**Before starting implementation:**

1. **Chat Placement**: Sidebar widget vs. floating button?
2. **Indexing Strategy**: Sync vs. async vs. queue-based?
3. **Row-Level Security**: Include in Phase 1 or future?
4. **Module Priority**: Which modules to support first (Knowledge only? Or add Contacts)?
5. **Budget**: Accept $20-50/month cost or optimize for free tier?

---

## 📝 Next Steps

1. **Approval**: Review this plan with team
2. **Decisions**: Answer decision points above
3. **Kick-off**: Start Phase 1 (database migration)
4. **Weekly Check-ins**: Validate progress + adjust timeline
5. **Testing**: Comprehensive testing before launch

---

## 📞 Questions to Answer

1. Should RAG be global or feature-specific initially?
2. Which modules should be searchable in Phase 1?
3. Async or sync indexing for first release?
4. How to handle existing data (backfill vs. fresh start)?
5. Should we support module filtering in chat?
6. Fallback behavior if RAG disabled?
7. Performance requirements (max search latency)?

---

**Created by**: AI Assistant  
**For**: MADE OS Team  
**Version**: 1.0  
**Last Updated**: December 5, 2025
