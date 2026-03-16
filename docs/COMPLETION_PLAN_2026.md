# 📋 KẾ HOẠCH HOÀN THIỆN TOÀN DỰ ÁN MADE OS - 2026

**Ngày tạo**: January 6, 2026  
**Tính cấp bách**: 🔴 **CAO** - Cần hoàn thiện triệt để trước khi lên production  
**Mục tiêu chính**: Hoàn thiện 100% các tính năng trên Dashboard để sạch sẽ, consistent, production-ready

---

## 🎯 TÓM TẮT TÌNH TRẠNG HIỆN TẠI

### ✅ ĐÃ HOÀN THIỆN (75%)

| Tính năng | Trạng thái | Ghi chú |
|-----------|-----------|--------|
| Dashboard | ✅ Cơ bản | Hiển thị stats |
| Profile Builder | ✅ Hoàn chỉnh | Dynamic fields, versioning |
| Knowledge Base | ✅ Hoàn chỉnh | Lexical editor, categories, tags |
| CRM - Contacts | ✅ Hoàn chỉnh | CRUD, interactions, files |
| CRM - Opportunities | ✅ Hoàn chỉnh | Pipeline, linked engagement |
| CRM - Customer | ✅ Hoàn chỉnh | Organization profile, relationships |
| User Management | ✅ Hoàn chỉnh | RBAC, permissions, user groups |
| Events x Education | ✅ 80% | Events, Sessions, Registrations, Check-in ✓; Speakers, Sponsors in progress |
| Testing x Development | ✅ 60% | TestOrder, Sample, TestSuite structure; UI còn thiếu |
| Billing & Pricing | ✅ 40% | Schema tạo sẵn; UI/tích hợp Stripe còn thiếu |
| Backup | ✅ 20% | Initialized; UI download/restore còn thiếu |

### 🚧 ĐANG PHÁT TRIỂN (20%)

| Tính năng | Tiến độ | Ưu tiên | Dự kiến hoàn |
|-----------|--------|--------|------------|
| **Training & Support** | 0% | 🔴 HIGH | Tuần 1-2 |
| • SOP Library | Không bắt đầu | HIGH | 3 ngày |
| • Assessment Module | Không bắt đầu | HIGH | 3 ngày |
| • Training Engagement UI | Không bắt đầu | MEDIUM | 2 ngày |
| **Design x Development** | 0% | 🟡 MEDIUM | Tuần 3-4 |
| • Design Project | Không bắt đầu | MEDIUM | 5 ngày |
| • Tech Packs | Không bắt đầu | MEDIUM | 5 ngày |
| **RAG Foundation** | 30% | 🟡 MEDIUM | Tuần 5+ |
| • Vector Search Service | Scaffolded | MEDIUM | 4 ngày |
| • Embeddings + LLM Integration | Configured | LOW | Khi enable |

### ❌ CHƯA BẮT ĐẦU (5%)

| Tính năng | Lý do | Ảnh hưởng | Quyết định |
|-----------|------|----------|-----------|
| **Design Workspace** | Phức tạp, không ưu tiên | Không critical | Tiếp sau T/S |
| **Custom RAG Deployment** | Phụ thuộc feature-flag | Low risk | Khi cần |

---

## 📌 TUẦN 1: TRAINING & SUPPORT (Ưu tiên 🔴)

### Tại sao?
- **6 bảng schema** định nghĩa sẵn nhưng **không có UI/actions**
- **Training Engagements** cần quản lý hoàn chỉnh
- **Là foundation** cho các tính năng Knowledge + Assessment

### 📅 Day 1-2: SOPLibrary Module

#### Backend (Completed Structure ✓)
```
lib/features/sop-library/
├── actions/sop-library.actions.ts          ← ✅ Cần hoàn thiện
├── services/sop-library.service.ts         ← ✅ Cần viết
├── repositories/sop-library.repository.ts  ← ✅ Cần viết
├── types/sop-library.types.ts              ← ✅ Có sơ khai
└── index.ts                                 ← ✅ Đã tạo
```

**Cần làm**:
- [ ] `sop-library.repository.ts` - CRUD queries
  ```typescript
  - getAllSOPs(filters?: { search?, engagementId?, status? })
  - getSOPById(id) + include versions, media
  - createSOP(data: CreateSOPInput) with Media link
  - updateSOP(id, data) + version tracking
  - deleteSOP(id) with cascade
  - getSOPsByTrainingEngagement(engagementId)
  ```
  
- [ ] `sop-library.service.ts` - Validation + Business Logic
  ```typescript
  - validateSOPData() - Required: title, content, status
  - handleMediaAttachment() - Link Media via repository
  - trackSOPVersion() - Create SOPVersion entry on update
  - enrichSOPWithMetadata() - Add formatting, timestamps
  ```

- [ ] `sop-library.actions.ts` - Server Actions + Permissions
  ```typescript
  - listSOPsAction(filters, pagination) 
    → requirePermission("training", "read")
  - getSOPAction(id)
    → requirePermission("training", "read")
  - createSOPAction(data)
    → requirePermission("training", "create")
    → Validate + Service + Pusher + Revalidate
  - updateSOPAction(id, data)
    → requirePermission("training", "update")
  - deleteSOPAction(id)
    → requirePermission("training", "delete")
  ```

- [ ] `sop-library.types.ts` - Type Definitions
  ```typescript
  - SOPLibrary (from schema)
  - SOPVersion (audit trail)
  - CreateSOPInput (form data)
  - UpdateSOPInput (form data)
  - SOPFilter (search, status, engagement)
  - SOPWithVersions (nested type)
  ```

#### Frontend (Day 2)
**Routes**:
```
app/(dashboard)/training-support/sop-library/
├── page.tsx                    ← List + Filters
├── new/page.tsx                ← Create form (Lexical editor)
├── [id]/
│   ├── page.tsx                ← Detail view + actions
│   └── edit/page.tsx           ← Edit form
└── components/
    ├── SOPListTable.tsx        ← Searchable table
    ├── SOPForm.tsx             ← Create/Edit form
    ├── SOPVersionHistory.tsx   ← Version tracking UI
    └── SOPFilters.tsx          ← Advanced search
```

**Features to Implement**:
- ✅ List + Pagination (10 SOPs/page)
- ✅ Create with Lexical editor for content
- ✅ Edit with version history tracking
- ✅ Delete with confirmation
- ✅ Upload media files (PDF, DOC, ZIP)
- ✅ Filter by: Training Engagement, Status, Created Date
- ✅ Real-time updates (Pusher)
- ✅ Access control (private/public per SOP)

#### Testing (Integrated)
```
tests/unit/features/sop-library/
├── sop-library.repository.test.ts
├── sop-library.service.test.ts
└── sop-library.actions.test.ts
```
- [ ] CRUD operations
- [ ] Permission enforcement
- [ ] Validation rules
- [ ] Media linking
- [ ] Version tracking

---

### 📅 Day 3-4: Assessment Module

**Same structure as SOPLibrary**, adapted for Assessments:

#### Backend
```
lib/features/assessments/
├── repositories/assessments.repository.ts
├── services/assessments.service.ts
├── actions/assessments.actions.ts
├── types/assessments.types.ts
└── index.ts
```

**Queries**:
```typescript
- getAllAssessments(filters?: { trainingId?, type?, status? })
- getAssessmentById(id) + include questions, results
- createAssessment(data) with questions array
- updateAssessment(id, data) + version
- submitAssessmentResult(assessmentId, userId, answers)
- getAssessmentResults(assessmentId) - List results + scores
- calculateScore(answers, assessment) - Auto-grade logic
```

**Features**:
- Multiple question types: Multiple Choice, Short Answer, Essay, True/False
- Auto-scoring for MCQ, manual for essay
- Passing threshold configuration
- Results tracking per user
- Certification generation (optional)

#### Frontend
```
app/(dashboard)/training-support/assessments/
├── page.tsx
├── new/page.tsx
├── [id]/
│   ├── page.tsx
│   └── results/page.tsx
└── components/
    ├── AssessmentForm.tsx
    ├── QuestionBuilder.tsx (Drag-drop)
    ├── AssessmentTaker.tsx (Read-only for users)
    └── ResultsAnalytics.tsx
```

---

### 📅 Day 5: Training Engagement & Session Management

**Backend**:
- [ ] `lib/features/training/` (New folder)
- [ ] Link Training Engagement → SOPLibrary, Assessments, Sessions
- [ ] Create Training Session tracking

**Frontend**:
- [ ] Training dashboard showing all active trainings
- [ ] Session calendar view
- [ ] Attendee management per session
- [ ] Progress tracking (SOP completion, Assessment scores)

---

## 📌 TUẦN 2: EVENTS COMPLETION & TESTING UI (Ưu tiên 🔴)

### Day 1-2: Events Module - Speakers & Sponsors Complete

**Current Status**: Events ✅, Sessions ✅, Registrations ✅, Check-in ✅
**Missing**: Speakers CRUD, Sponsors CRUD, complete integrations

#### Backend
```
lib/features/speakers/
├── repositories/speakers.repository.ts
├── services/speakers.service.ts
├── actions/speakers.actions.ts
└── types/speakers.types.ts

lib/features/sponsors/
├── repositories/sponsors.repository.ts
├── services/sponsors.service.ts
├── actions/sponsors.actions.ts
└── types/sponsors.types.ts
```

**Speaker Features**:
- [ ] Speaker profile (bio, photo, social links)
- [ ] Session assignment (one speaker → multiple sessions)
- [ ] Speaker communications (email, contract)
- [ ] Speaker payment tracking

**Sponsor Features**:
- [ ] Sponsorship packages (Bronze, Silver, Gold)
- [ ] Deliverables checklist (branding placement, booth, email mentions)
- [ ] Asset uploads & approval
- [ ] Payment & invoice tracking

#### Frontend
```
app/(dashboard)/events/[id]/
├── speakers/page.tsx           ← List speakers
├── speakers/new/page.tsx       ← Add speaker
├── sponsors/page.tsx           ← List sponsors
└── sponsors/new/page.tsx       ← Add sponsor
```

### Day 3-4: Testing Vertical - Complete UI

**Current Status**: Schema ✅, API scaffolded; UI missing
**Models**: TestOrder, Sample, TestSuite, Test, TestReport

#### Frontend Structure
```
app/(dashboard)/testing/
├── page.tsx                     ← Dashboard/Overview
├── test-orders/
│   ├── page.tsx                 ← List orders
│   ├── new/page.tsx             ← Create order (linked to Opportunity)
│   └── [id]/
│       ├── page.tsx             ← Order detail
│       ├── samples/page.tsx     ← Samples management
│       ├── test-suites/page.tsx ← Test suites
│       └── reports/page.tsx     ← Test reports
├── test-suites/
│   ├── page.tsx                 ← Library of test suites
│   └── new/page.tsx
├── test-reports/
│   ├── page.tsx                 ← All reports
│   └── [id]/page.tsx            ← Report detail + PDF export
└── components/
    ├── OrderForm.tsx
    ├── SampleUpload.tsx
    ├── TestSuiteBuilder.tsx
    └── ReportGenerator.tsx
```

**Key Features**:
- [ ] Create Test Order from Opportunity
- [ ] Upload samples (with media tracking)
- [ ] Create Test Suites (parameters, acceptance criteria)
- [ ] Log test execution
- [ ] Auto-generate test reports (PDF export)
- [ ] Link interactions (create Interaction on order status change)
- [ ] Real-time progress tracking

#### Backend Completion
```typescript
// In lib/features/test-orders/actions/test-orders.actions.ts
- listTestOrdersAction(filters, pagination)
- getTestOrderAction(id)
- createTestOrderAction(data) - Link to Opportunity
- updateTestOrderAction(id, data)
- changeTestOrderStatusAction(id, newStatus) - Auto-create Interaction
- deleteTestOrderAction(id)

// In lib/features/test-reports/actions/test-reports.actions.ts
- generateTestReportAction(testOrderId)
- exportReportAsPDFAction(reportId)
- getTestReportAction(id)
```

### Day 5: Billing & Stripe Integration (Start)

**Current**: Schema ✅; UI/integration 40%

**To implement**:
- [ ] Pricing page (list service packages)
- [ ] Invoice management UI
- [ ] Payment status tracking
- [ ] Stripe webhook handling
- [ ] Email notifications (payment received, invoice)

---

## 📌 TUẦN 3-4: DESIGN WORKSPACE (Ưu tiên 🟡)

### Day 1-3: Design Project & Workflow

**Complex scope**, but follow Events pattern:

```
app/(dashboard)/design/
├── page.tsx                     ← Dashboard
├── projects/
│   ├── page.tsx                 ← List projects
│   ├── new/page.tsx             ← New design project (from Opportunity)
│   └── [id]/
│       ├── page.tsx             ← Project detail
│       ├── designs/page.tsx     ← Product designs CRUD
│       ├── mockups/page.tsx     ← Mockups + approval workflow
│       └── tech-packs/page.tsx  ← Tech packs + versioning
```

**Backend Structure**:
```
lib/features/design-projects/
lib/features/product-designs/
lib/features/mockups/
lib/features/tech-packs/
```

**Key Actions**:
- [ ] Create design project from opportunity
- [ ] Upload product files, brand assets
- [ ] Create mockups with decoration details
- [ ] Validate compatibility (product + decoration type)
- [ ] Version tech packs
- [ ] Customer approval workflow
- [ ] Auto-generate PDF tech packs

---

## 📌 TUẦN 5+: RAG & VECTOR SEARCH (Ưu tiên 🟡)

### Current Status
- ✅ Database models (KnowledgeVector, VectorSearchLog)
- ✅ Config files (embedding-config.ts, llm-config.ts)
- ✅ Feature scaffold (lib/features/vector-search/)
- ❌ Actual implementation (services, actions, UI)

### Phase 1: Enable & Test (Day 1-2)

```typescript
// 1. Enable RAG in settings
await enableRAG();  // Sets Setting.rag_enabled = true

// 2. Set environment
EMBEDDING_PROVIDER=local
LLM_PROVIDER=groq
GROQ_API_KEY=xxx
```

### Phase 2: Implement Services (Day 3-4)

```
lib/features/vector-search/services/
├── embeddingService.ts        ← Xenova for local embeddings
├── vectorSearchService.ts     ← Cosine similarity search
└── ragService.ts              ← Orchestrate pipeline
```

**embeddingService.ts**:
```typescript
- chunkText(content, chunkSize=500, overlap=100)
- generateEmbedding(text) - Xenova or OpenAI
- createKnowledgeVectors(articleId, content) - Batch insert
```

**vectorSearchService.ts**:
```typescript
- searchByVector(queryEmbedding, topK=5)
- getCandidateDocuments(query, topK=10)
```

**ragService.ts**:
```typescript
- searchKnowledge(query)
  → Embed query
  → Search vectors
  → Fetch full articles
  → Return with scores
  
- generateAnswer(query)
  → searchKnowledge()
  → Pass to Groq with system prompt + context
  → Parse + cite sources
  → Return answer with citations
```

### Phase 3: Server Actions & UI (Day 5)

```typescript
// lib/features/vector-search/actions/
- searchKnowledgeAction(query, topK=5)
  → requirePermission("knowledge", "read")
  → Check isRagEnabled()
  → Return { results, took, citations }

- generateAnswerAction(query)
  → requirePermission("knowledge", "read")
  → Check isRagEnabled()
  → Return { answer, sources, model, tokens }
```

**Knowledge Search UI**:
- Add "Semantic Search" toggle on Knowledge page
- Show results with relevance scores
- Display cited sources
- Generate Answer button with streaming response

---

## 🔧 QUALITY ASSURANCE & HARDENING (All Weeks)

### Priority 1️⃣: Type Safety & Validation
**Status**: 132 type errors from refactoring
**Action**:
- [ ] Fix all ActionResult re-exports in types/index.ts (20 files)
- [ ] Add message property to all ActionResult returns (30 locations)
- [ ] Standardize Zod schemas for all mutations
- [ ] Run `yarn check-types` → 0 errors before completion

### Priority 2️⃣: Permission Coverage
**Action**:
- [ ] Audit all actions → confirm `requirePermission()` at start
- [ ] Add unit tests for "deny/allow" per module:
  ```
  tests/unit/permissions/
  ├── customers.permissions.test.ts
  ├── events.permissions.test.ts
  ├── knowledge.permissions.test.ts
  └── users.permissions.test.ts
  ```

### Priority 3️⃣: Cache & Revalidation Strategy
**Action**:
- [ ] Document caching strategy per module in `docs/CACHING_STRATEGY.md`
- [ ] Ensure every action calls `revalidatePath()` or `revalidateTag()`
- [ ] Create helper: `revalidateModule(moduleName)` to prevent omissions
- [ ] Test cache invalidation on data mutations

### Priority 4️⃣: Error Handling & User Feedback
**Action**:
- [ ] Wrap all critical pages with `react-error-boundary`
- [ ] Add Sonner toast notifications:
  ```typescript
  toast.success("Contact created")
  toast.error("Failed to save contact", { description: error.message })
  ```
- [ ] Show loading states consistently (PageLoading, Suspense)

### Priority 5️⃣: Security Hardening
**Action**:
- [ ] Update `next.config.ts`:
  - [ ] Add Content-Security-Policy header
  - [ ] Add X-Frame-Options: DENY
  - [ ] Add Referrer-Policy: strict-origin-when-cross-origin
  - [ ] Add Permissions-Policy (microphone, camera, geolocation)

- [ ] Create `env.mjs` (Zod validation):
  ```typescript
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    // ... all required env vars
  })
  
  // Fail-fast on startup if env incomplete
  ```

- [ ] Audit CORS in `lib/cors.ts`:
  ```typescript
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
  const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
  }
  ```

### Priority 6️⃣: Real-time & Observability
**Action**:
- [ ] Add Pusher error handling with retry/backoff:
  ```typescript
  export async function safePusherTrigger(channel, event, data) {
    for (let i = 0; i < 3; i++) {
      try {
        await getPusher().trigger(channel, event, data)
        return
      } catch (e) {
        if (i === 2) console.error('Pusher failed:', e)
        await sleep(1000 * Math.pow(2, i))
      }
    }
  }
  ```

- [ ] Add performance monitoring:
  ```typescript
  // In actions
  const start = performance.now()
  const result = await businessLogic()
  const duration = performance.now() - start
  // Log to analytics
  ```

---

## 📊 DETAILED COMPLETION CHECKLIST

### ✅ Phase 1: Training & Support (Week 1, 5 days)

| Task | Days | Status |
|------|------|--------|
| SOP Library - Backend | 1.5 | ⬜ To do |
| SOP Library - Frontend | 1 | ⬜ To do |
| SOP Library - Tests | 0.5 | ⬜ To do |
| Assessment - Backend | 1.5 | ⬜ To do |
| Assessment - Frontend | 1 | ⬜ To do |
| Training Engagement - Integration | 1 | ⬜ To do |
| **Total** | **~6 days** | 🟡 Ready |

### ✅ Phase 2: Events & Testing (Week 2, 5 days)

| Task | Days | Status |
|------|------|--------|
| Speakers - Backend | 1 | ⬜ To do |
| Speakers - Frontend | 1 | ⬜ To do |
| Sponsors - Backend | 1 | ⬜ To do |
| Sponsors - Frontend | 1 | ⬜ To do |
| Testing Vertical - Complete UI | 2 | ⬜ To do |
| Testing Vertical - Backend | 1 | ⬜ To do |
| **Total** | **~7 days** | 🟡 Ready |

### ✅ Phase 3: Design Workspace (Week 3-4, ~8 days)

| Task | Days | Status |
|------|------|--------|
| Design Projects - Backend | 2 | ⬜ To do |
| Design Projects - Frontend | 2 | ⬜ To do |
| Tech Packs - Backend | 1.5 | ⬜ To do |
| Tech Packs - Frontend | 1.5 | ⬜ To do |
| **Total** | **~7 days** | 🟡 Ready |

### ✅ Phase 4: RAG Implementation (Week 5, 5 days)

| Task | Days | Status |
|------|------|--------|
| Vector Services | 2 | ⬜ To do |
| Server Actions | 1.5 | ⬜ To do |
| Knowledge UI Integration | 1 | ⬜ To do |
| Testing & Documentation | 0.5 | ⬜ To do |
| **Total** | **~5 days** | 🟡 Ready |

### ✅ QA & Hardening (Throughout, ~10 days)

| Task | Days | Status |
|------|------|--------|
| Fix Type Errors (ActionResult) | 2 | 🔴 Critical |
| Permission Coverage Tests | 1.5 | ⬜ To do |
| Caching Strategy | 1 | ⬜ To do |
| Error Boundaries & Toast | 1 | ⬜ To do |
| Security Headers & Env | 1.5 | ⬜ To do |
| Real-time & Observability | 1.5 | ⬜ To do |
| End-to-end Testing | 2 | ⬜ To do |
| **Total** | **~10 days** | 🟡 Ready |

---

## 🚀 EXECUTION TIMELINE

```
WEEK 1 (Jan 6-10): Training & Support
  Day 1-2: SOP Library (back + front)
  Day 3-4: Assessment Module (back + front)
  Day 5: Training Engagement + Integration
  DAILY: Fix type errors & QA

WEEK 2 (Jan 13-17): Events & Testing
  Day 1-2: Speakers module (back + front)
  Day 3: Sponsors module (back + front)
  Day 4-5: Testing Vertical - Complete UI & backend
  DAILY: Permission testing, Cache validation

WEEK 3-4 (Jan 20-31): Design Workspace
  Day 1-3: Design Projects (back + front)
  Day 4-7: Tech Packs, Mockups, Approval workflow
  DAILY: Security hardening, Error handling

WEEK 5+ (Feb): RAG & Optimization
  Day 1-2: Vector services + Groq integration
  Day 3-4: Server actions + UI
  Day 5+: Testing, Docs, Fine-tuning
```

**Total Effort**: ~35 development days (7 weeks @ 5 days/week)

---

## 📚 DOCUMENTATION & REFERENCES

- `docs/FEATURE_DEVELOPMENT_TEMPLATE.md` ← Follow this for all new modules
- `docs/IMPLEMENTATION_ROADMAP.md` ← Status tracking
- `.github/copilot-instructions.md` ← Architecture & patterns
- `lib/features/[feature]/` ← Examples: contacts, events, knowledge

---

## ⚠️ KNOWN BLOCKERS & DEPENDENCIES

1. **Type Errors** - Must fix before testing (2 days)
2. **Pusher Real-time** - Critical for events, testing, assessments
3. **Stripe Integration** - Needed for billing (low priority initially)
4. **Media Handling** - Used by SOP, Assessment, Testing (already working)
5. **Lexical Editor** - Used by SOP, Knowledge (already integrated)

---

## 🎯 SUCCESS CRITERIA

By end of completion:

- ✅ 0 type errors (`yarn check-types`)
- ✅ All modules have full CRUD (create, read, update, delete)
- ✅ All actions have permission checks
- ✅ All pages have error boundaries + loading states
- ✅ All mutations have Pusher real-time + cache revalidation
- ✅ Test coverage >80% for critical features
- ✅ Dashboard shows all 4 verticals as "Complete"
- ✅ No unimplemented pages or 404s
- ✅ Performance: <200ms response time for list actions
- ✅ Production-ready: Security headers, env validation, error handling

---

## 📞 NEXT STEPS

1. **Review** this plan with team
2. **Prioritize** based on business needs
3. **Assign** features to developers
4. **Create** tracking issues in GitHub
5. **Start Phase 1** immediately (SOP + Assessment)
6. **Daily standup** to track progress & blockers

