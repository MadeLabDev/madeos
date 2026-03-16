# RAG Cross-Feature Chat - Executive Summary

**Status**: ✅ **PLAN COMPLETE** - Ready for approval & implementation  
**Complexity**: HIGH (Architecture + DB changes + Multi-module integration)  
**Timeline**: 10-14 days to full implementation  
**Created**: December 5, 2025

---

## 📋 What You Asked For

> "Hãy đảm bảo giữ nguyên mọi box search hiện có của dự án, mà tạo một chat box mới khi RAG được bật. Lúc đó khi chúng ta hỏi gì với Bot thì sẽ truy cấn dữ liệu "RAG Search" => đảm bảo rằng "RAG Search" hoạt động trên tất cả tính năng chứ ko riêng gì Knowledge (nếu cần thì refactor db) nhưng phải xét theo quyền hạn (nghĩa là nếu họ có quyền trên Knowledge thì AI mới trả lời từ dữ liệu Knowledge)."

**Translation**: 
1. Keep existing search boxes as-is ✅
2. Add new RAG chat box when RAG enabled ✅
3. RAG searches across ALL features (not just Knowledge) ✅
4. Respect permissions (only search data user can access) ✅
5. Refactor DB if needed ✅

---

## 🎯 Solution Overview

### Architecture
```
Global RAG Chat Box
    ↓ (When user asks)
Permission Check (which modules can user access?)
    ↓
Unified Vector Search (across Knowledge, Contacts, Opportunities, Events, etc.)
    ↓
LLM Generates Answer (with sources from multiple modules)
    ↓
Display in Chat with Citations
```

### Key Features
✅ **One chat box, all features** - Ask about anything, RAG searches all modules  
✅ **RBAC-aware** - User can only see results from modules they have access to  
✅ **Non-breaking** - Existing search boxes untouched  
✅ **Auto-indexed** - When you create/update entity, RAG auto-indexes it  
✅ **Cross-module sources** - One answer can cite from Knowledge + Contacts + Opportunities  

---

## 🗄️ What Needs to Change

### Database (1 Migration)
**File**: `prisma/migrations/[timestamp]_refactor_knowledge_vector/migration.sql`

**Changes**:
```
KnowledgeVector table (REFACTORED):
  OLD: articleId (Knowledge-only)
  NEW: sourceModule (knowledge|contacts|opportunities|events|...)
       sourceId (FK to entity)
       sourceType (article|contact|opportunity|...)
```

**Impact**: Backward compatible - existing data migrated automatically

### Code (5 Main Components)

1. **Cross-Feature Search Service** - Search across all modules
2. **Indexing Manager** - Auto-index when entities created/updated
3. **RAG Pipeline** - Updated to handle cross-module results
4. **Chat Component** - New UI for global RAG chat
5. **Integration Hooks** - Trigger indexing in feature actions

---

## 🔐 Permission Model

**Simple**: Module-level access control

```typescript
User has permissions: {
  'knowledge': ['read', 'create'],
  'contacts': ['read'],
  'opportunities': []  // No access!
}

RAG Search:
✓ Can see Knowledge articles
✓ Can see Contact info
✗ Cannot see Opportunity data
```

**Future**: Can add row-level security (e.g., only search contacts in my account)

---

## 📊 Implementation Phases

| Phase | What | Days | Output |
|-------|------|------|--------|
| 1 | DB refactor + repositories | 1-3 | Database migration ready |
| 2 | Services (embed, search, RAG) | 4-6 | Backend APIs working |
| 3 | UI components + chat | 7-9 | Chat interface visible |
| 4 | Integration + hooks | 10-12 | Auto-indexing working |
| 5 | Polish + optimization | 13-14 | Production-ready |

**Total**: 10-14 working days

---

## ✨ User Experience (After Implementation)

### Current (Before)
```
Knowledge Page
├─ Search by title: "qua"
└─ Results: Articles with "qua" in title only

❌ Cannot search across modules
❌ Cannot ask questions to AI
```

### Future (After)
```
Any Page (Dashboard, Contacts, Opportunities, etc.)
├─ Global Chat Box: "💬 Ask RAG"
│
├─ User asks: "What are QA phases and who does QA?"
│
├─ RAG searches:
│  ├─ Knowledge (if user has read permission) → QA process article
│  ├─ Contacts (if user has read permission) → QA lead contact
│  └─ Opportunities (if NO permission) → SKIPPED
│
└─ Bot responds:
   "According to your company knowledge:
    
    QA Phases: Planning (2 days) → Execution → Reporting
    QA Lead: John Doe (john@example.com)
    
    Sources:
    • Knowledge: QA Overview (92% match)
    • Contacts: John Doe (87% match)"

✅ Can search across modules
✅ Can ask questions to AI
✅ Gets answers with sources
```

---

## 💻 Implementation Highlights

### Step 1: Database (Most Complex)
```sql
-- Add 3 new columns to KnowledgeVector
sourceModule VARCHAR(50)    -- 'knowledge', 'contacts', etc.
sourceId VARCHAR(100)       -- ID of the entity
sourceType VARCHAR(50)      -- 'article', 'contact', 'opportunity'
```

### Step 2: Services (Code-Heavy)
```typescript
// New services to build:
embeddingService.embed(text)                // Convert text → vector
crossFeatureSearchService.search(query)     // Search across modules
ragPipelineService.answerQuestion(query)    // Generate answer
indexingManager.index*(entity)              // Auto-index entity
```

### Step 3: UI (Component-Heavy)
```typescript
// New components:
<RAGChatBox />                 // Global chat interface
<ChatMessage />                // Individual message
<SearchResults />              // Display results with sources
```

### Step 4: Integration (Hook into Existing)
```typescript
// Update existing actions:
createKnowledgeAction()        // Add: await indexingManager.indexArticle()
createContactAction()          // Add: await indexingManager.indexContact()
// etc. for all modules
```

---

## 🚨 Key Decisions Needed (Before Starting)

**1. Chat Placement**
- Option A: Sidebar widget (always visible)
- Option B: Floating button (minimal visual impact)
- **Recommendation**: Sidebar widget

**2. Initial Module Coverage**
- Start with: Knowledge + Contacts (most used)
- Can add: Opportunities, Events, Interactions later
- **Recommendation**: Start with both, easy to add more

**3. Indexing Strategy**
- Option A: Sync (fast but may block article creation)
- Option B: Async (non-blocking, but slower indexing)
- **Recommendation**: Async (fire-and-forget)

**4. Existing Data**
- Option A: Backfill on-demand (first search triggers indexing)
- Option B: Migration script (index all at once)
- Option C: Skip existing data (only new data)
- **Recommendation**: Option B (clean start)

**5. Module Filtering in Chat**
- Option A: Show all modules, no filter
- Option B: Add "Search in..." dropdown
- **Recommendation**: Option B (better UX)

---

## 📈 Cost Analysis

### API Costs
- **Embedding**: ~$0.0002 per article
- **Search**: ~$0.00001 per query
- **LLM response**: ~$0.0005 per answer

### Monthly Estimate (1000 articles, 100 Q&A/day)
```
Indexing:  1000 articles × $0.0002 = $0.20/month
Searching: 100 queries × $0.00001 = $0.001/month
Answers:   100 × $0.0005 = $0.05/month
─────────────────────────────────────
Total:     ~$0.25/month (negligible!)
```

**With larger usage** (10K articles, 1000 Q&A/day):
```
Indexing:  $2/month
Searching: $0.01/month
Answers:   $0.50/month
─────────────────────────────────────
Total:     ~$2.50/month
```

### Optimization Options
- Use cheaper embeddings (Gemini free, Cohere $0.001/1M tokens)
- Batch processing for indexing
- Caching frequent queries
- **Budget: Not an issue for MVP**

---

## ⚠️ Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Indexing blocks article creation | High | Make indexing async (fire-and-forget) |
| Confusing mixed results | Medium | Clear module labels + grouping |
| Permission leaks | High | Comprehensive permission checks in service |
| Slow search (cross-module) | Medium | DB indexes + caching |
| Data consistency | Medium | Delete vectors when entity deleted |
| High costs | Low | Cost is negligible for MVP |

---

## 🎁 What Stays Untouched

✅ Existing search boxes (Knowledge search, Contacts search, etc.)  
✅ RBAC permission system (just reuse it)  
✅ Feature actions (existing create/update/delete)  
✅ UI layout (chat box is additive)  
✅ Database structure for other entities  

---

## 📚 Detailed Documentation

**Created files**:
1. **RAG_CROSS_FEATURE_PLAN.md** (25KB)
   - Complete architecture + implementation steps
   - Database schema changes
   - Service designs
   - Permission model
   - 5-phase timeline
   - Risk assessment
   - Testing strategy

2. **RAG_TLDR.md** (Already created earlier)
   - Quick reference for RAG basics

3. **RAG_VISUAL_GUIDE.md** (Already created earlier)
   - Visual diagrams + before/after

4. **This file**: Executive summary + decision points

---

## 🚀 How to Proceed

### Option 1: Approve & Start (Recommended)
```
1. Review RAG_CROSS_FEATURE_PLAN.md
2. Answer decision points above
3. Approve budget/timeline
4. Start Phase 1 immediately
```

### Option 2: Adjust Plan First
```
1. List concerns/changes
2. Modify plan accordingly
3. Then proceed with implementation
```

### Option 3: Start with Knowledge Only
```
1. Skip cross-feature for now
2. Build RAG for Knowledge first
3. Extend to other modules later
```

---

## 📞 Questions to Discuss

**Architecture**:
- Approve cross-module RAG concept?
- Module filtering needed?
- Row-level security needed now or later?

**Timeline**:
- 10-14 days acceptable?
- Can resources be allocated?
- Priority relative to other work?

**UI/UX**:
- Sidebar widget or floating button?
- Module filter dropdown?
- Message persistence (history)?

**Operations**:
- Who does the implementation?
- How to handle existing data?
- Deployment strategy (feature flag)?

---

## 💾 Implementation Checklist

- [ ] Team approves RAG_CROSS_FEATURE_PLAN.md
- [ ] Answers to 5 key decisions confirmed
- [ ] Database credentials ready
- [ ] Environment setup complete
- [ ] Feature flag "rag_enabled" enabled
- [ ] Start Phase 1: Database migration
- [ ] ...
- [ ] Launch: Enable RAG for all users

---

## 📝 Summary

**What**: Global RAG Chat that searches all accessible modules  
**Why**: Better user experience, unified knowledge access, AI assistance  
**How**: Refactor KnowledgeVector table, build services, add chat UI  
**When**: 10-14 days to implementation  
**Cost**: Negligible (~$0.25-2.50/month depending on usage)  
**Risk**: Low (non-breaking, RBAC-aware, async indexing)  

**Status**: ✅ **READY TO IMPLEMENT**

---

**For full details**: See `RAG_CROSS_FEATURE_PLAN.md`  
**Last Updated**: December 5, 2025  
**Version**: 1.0
