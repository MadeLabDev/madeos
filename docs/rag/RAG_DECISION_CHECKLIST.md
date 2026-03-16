# RAG Cross-Feature Implementation - Decision Checklist

**Status**: Awaiting Approval & Decisions  
**Date**: December 5, 2025  
**Created by**: Planning Phase  

---

## 🚀 Ready to Implement?

Before we start Phase 1 (Database Migration), please confirm answers to these questions:

---

## 📋 Critical Decisions (MUST ANSWER)

### 1️⃣ Chat Box Placement

**Question**: Where should the RAG chat box appear?

**Option A: Sidebar Widget** ⭐ RECOMMENDED
```
Sidebar
├─ Dashboard
├─ Contacts
├─ Opportunities
├─ Knowledge
├─ ...
└─ ┌─────────────────┐
   │  💬 RAG Chat    │  ← Always visible
   │ "Ask anything"  │
   └─────────────────┘
```
**Pros**: Always accessible, professional look  
**Cons**: Takes sidebar space

**Option B: Floating Button**
```
                    ┌──────┐
                    │ 💬   │  ← Click to expand
                    └──────┘
```
**Pros**: Minimal footprint  
**Cons**: Can be intrusive

**Option C: Tab in Dashboard**
```
Dashboard Tabs:
├─ Overview
├─ Activities
└─ 💬 RAG Chat (NEW)
```
**Pros**: Clean, not always visible  
**Cons**: Less accessible

**👉 Your choice**: [ A ] [ B ] [ C ] [ Other: _______ ]

---

### 2️⃣ Initial Module Coverage

**Question**: Which modules should RAG search in Phase 1?

**Option A: Knowledge + Contacts** ⭐ RECOMMENDED
```
When user asks: "QA processes and who handles them?"
RAG searches:
✓ Knowledge articles (QA processes)
✓ Contact notes + info (who handles them)
✓ Opportunities (if permission allows)
✓ Events (if permission allows)
```
**Effort**: Medium (2 modules)  
**Value**: High (covers 80% of use cases)  
**Future**: Easy to add Opportunities, Events, Interactions

**Option B: Knowledge Only**
```
When user asks: "QA processes?"
RAG searches:
✓ Knowledge articles ONLY
✗ Cannot find who handles them (in Contacts)
```
**Effort**: Low (1 module)  
**Value**: Medium (limited scope)  
**Future**: Need separate refactor to add more modules

**Option C: All Modules (Knowledge + Contacts + Opportunities + Events + Interactions)**
```
More comprehensive search
```
**Effort**: High (5 modules)  
**Value**: Very high (complete RAG)  
**Future**: Unified from day 1

**👉 Your choice**: [ A ] [ B ] [ C ]

---

### 3️⃣ Indexing Strategy

**Question**: How should we trigger indexing when entities are created/updated?

**Option A: Async (Fire-and-Forget)** ⭐ RECOMMENDED
```typescript
export async function createArticleAction(data) {
  const article = await articleService.create(data);
  
  // Non-blocking: don't wait for indexing
  if (ragEnabled) {
    // Queue indexing in background
    queueIndexing({
      type: 'knowledge',
      id: article.id
    });
  }
  
  return { success: true };  // Return immediately
}

// Indexing happens later:
// ✓ Fast response to user
// ✓ Even if indexing fails, article is created
// ✗ Small delay before indexed (2-5 seconds)
```

**Option B: Sync (Block Until Indexed)**
```typescript
export async function createArticleAction(data) {
  const article = await articleService.create(data);
  
  // Blocking: wait for indexing
  if (ragEnabled) {
    await indexingManager.index(article);
  }
  
  return { success: true };  // Return only after indexing done
}

// ✓ Indexed immediately
// ✓ Can return error if indexing fails
// ✗ Slow response to user (5-10 seconds)
```

**Option C: Queue-based**
```
User creates article
    ↓
Article saved to DB
    ↓
Job queued in background (Redis, etc.)
    ↓
Worker indexes article asynchronously
    ↓
Can retry if fails
```

**Effort**: A (easy), B (easy), C (medium - need queue system)  
**UX**: A (fast), B (slow), C (fast + resilient)  

**👉 Your choice**: [ A ] [ B ] [ C ]

---

### 4️⃣ Existing Data Strategy

**Question**: How should we handle existing Knowledge articles and entities?

**Option A: Migration Script (Clean Start)** ⭐ RECOMMENDED
```
1. Deploy code changes
2. Run script: npx rag-migrate-existing
   - Indexes all existing articles
   - Indexes all existing contacts
   - Takes ~5-10 minutes for 1000 articles
3. RAG immediately available on existing data
```
**Time**: ~10 minutes  
**Complexity**: Medium (need to write migration script)  
**Result**: All existing data searchable immediately

**Option B: Backfill on-Demand**
```
User asks: "QA phases?"
System checks: "Article exists but not indexed"
System auto-indexes: "Indexing QA article..."
System searches: Returns result
```
**Time**: Transparent (indexes during first search)  
**Complexity**: Low (add check in search service)  
**Result**: Slower first search, but automatic

**Option C: Skip Existing Data**
```
Only new entities created after RAG launch are indexed
Existing data requires manual action to index
```
**Time**: None  
**Complexity**: Very low  
**Result**: Old data not searchable via RAG (use traditional search)

**👉 Your choice**: [ A ] [ B ] [ C ]

---

### 5️⃣ Module Filtering in Chat

**Question**: Should users be able to filter which modules RAG searches?

**Option A: With Filter UI** ⭐ RECOMMENDED
```
┌─ RAG Chat ────────────────────────┐
│ Filter: [All ▼]                   │
│ ├─ All (knowledge+contacts+...)   │
│ ├─ Knowledge only                 │
│ ├─ Contacts only                  │
│ ├─ Opportunities only             │
│ └─ Multiple selection...           │
│                                   │
│ Question: [Input field]           │
│ [Ask]                             │
└───────────────────────────────────┘
```
**Pros**: Power users can refine searches  
**Cons**: More complex UI  

**Option B: Without Filter (Search All)**
```
┌─ RAG Chat ────────────────────────┐
│ Question: [Input field]           │
│ [Ask]                             │
│                                   │
│ Always searches all accessible    │
│ modules (respecting permissions)  │
└───────────────────────────────────┘
```
**Pros**: Simple, intuitive  
**Cons**: Less control  

**👉 Your choice**: [ A ] [ B ]

---

## 📊 Secondary Decisions (SHOULD ANSWER)

### 6️⃣ Row-Level Security

**Question**: Do you need row-level permission checks now, or can we start with module-level?

**Example of row-level**: "User can only search Contacts in their Customer account"

**Option A: Module-level only (now)** ⭐ RECOMMENDED
```
User has 'contacts': ['read']
= Can search ALL contacts

Simple, fast to implement
Easy to upgrade later
```

**Option B: Row-level from day 1**
```
User has 'contacts': ['read'] only for customerA
= Can search contacts in customerA only

Complex, slower implementation
Need to refactor RBAC system
```

**👉 Your choice**: [ A ] [ B ]

---

### 7️⃣ Message History Persistence

**Question**: Should we save chat history?

**Option A: Save to Database** ⭐ RECOMMENDED
```
RAGSession + RAGMessage tables
Users can see their chat history
Can analyze trends
```

**Option B: Session-only (Not Saved)**
```
Chat disappears when page refreshes
Fresh start each session
Privacy-focused
```

**👉 Your choice**: [ A ] [ B ]

---

### 8️⃣ Feedback Collection

**Question**: Should we collect user feedback on RAG answers?

**Option A: Yes - Collect Ratings** ⭐ RECOMMENDED
```
After each answer:
👍 (helpful) - improves training
👎 (not helpful) - helps identify issues
```

**Option B: No - Don't Collect**
```
Keep answers private
Simpler implementation
```

**👉 Your choice**: [ A ] [ B ]

---

### 9️⃣ Cost Budget

**Question**: What's the max acceptable monthly cost for RAG APIs?

**Realistic costs**:
- MVP (1000 articles, 100 Q&A/day): ~$0.25/month
- Small (10K articles, 1000 Q&A/day): ~$2.50/month
- Medium (100K articles, 10K Q&A/day): ~$25/month
- Large (1M articles, 100K Q&A/day): ~$250/month

**We recommend**: Use OpenAI by default, optimize later if costs spike

**👉 Your choice**: [ Unlimited ] [ $50/month ] [ $100/month ] [ Other: $ __ ]

---

### 🔟 Launch Timeline

**Question**: When should RAG be available to users?

**Option A: Aggressive (2 weeks)**
```
Days 1-7: Implement Phase 1-3
Days 8-14: Test + fix bugs
Day 15: Launch to all users
Risk: May have bugs
```

**Option B: Normal (3 weeks)** ⭐ RECOMMENDED
```
Days 1-7: Phase 1-3
Days 8-14: Phase 4-5
Days 15-21: Testing + optimization
Day 22: Launch to all users
Risk: Low
```

**Option C: Conservative (4+ weeks)**
```
Longer testing cycle
Multiple rounds of user testing
Gradual rollout (beta → production)
Risk: Very low
```

**👉 Your choice**: [ A ] [ B ] [ C ]

---

## ✅ Approval Checklist

Before implementation starts, please confirm:

- [ ] **Decision #1** - Chat placement: ________
- [ ] **Decision #2** - Initial modules: ________
- [ ] **Decision #3** - Indexing strategy: ________
- [ ] **Decision #4** - Existing data: ________
- [ ] **Decision #5** - Module filtering: ________
- [ ] **Decision #6** - Row-level security: ________
- [ ] **Decision #7** - Message history: ________
- [ ] **Decision #8** - Feedback collection: ________
- [ ] **Decision #9** - Cost budget: ________
- [ ] **Decision #10** - Timeline: ________

- [ ] Budget approved for API costs (OpenAI/Claude/Gemini)
- [ ] Timeline confirmed with team
- [ ] Database backup taken (before schema changes)
- [ ] Team ready for 2-3 week intensive implementation
- [ ] Someone assigned to oversee quality/testing

---

## 📝 Notes & Constraints

**Any special requirements or constraints?**

```
[Space for notes]
```

---

## 🤝 Sign-Off

**Product Manager**: _________________ Date: _______

**Tech Lead**: _________________ Date: _______

**Other Stakeholders**: _________________ Date: _______

---

## 📍 What Happens Next

### If All Decisions Approved:

```
Day 1:
├─ 10am: Kick-off meeting
├─ 2pm: Database migration created
└─ EOD: First tests passing

Days 2-3: Complete Phase 1 (Infrastructure)
Days 4-6: Complete Phase 2 (Services)
Days 7-9: Complete Phase 3 (UI)
Days 10-12: Complete Phase 4 (Integration)
Days 13-14: Complete Phase 5 (Polish)

Day 15+: Testing + bug fixes
Final week: User acceptance testing
Launch: All systems ready ✅
```

### If Decisions Need Adjustment:

```
1. Note changes in "Notes" section
2. Send back for clarification
3. Implement only approved scope
4. May delay timeline
```

---

## 📞 Questions Before Starting?

**If you have questions about any decision, ask now:**

- Architecture questions? → See RAG_CROSS_FEATURE_PLAN.md
- Visual walkthrough? → See RAG_ARCHITECTURE_DIAGRAMS.md
- Quick overview? → See RAG_CROSS_FEATURE_SUMMARY.md

---

## 🎯 Summary

**10 decisions** need to be made before implementation.  
**Most are straightforward**, with recommended defaults.  
**Implementation starts** as soon as decisions are finalized.  
**Timeline: 2-3 weeks** to production-ready RAG.  

**Status**: 🟠 **AWAITING DECISIONS** → Ready to become 🟢 **IN PROGRESS**

---

**For questions or clarifications, review the main planning document:**  
📄 `RAG_CROSS_FEATURE_PLAN.md` (25KB, comprehensive guide)

**Ready to decide?** Fill out this checklist and return.  
**Let's build RAG!** 🚀
