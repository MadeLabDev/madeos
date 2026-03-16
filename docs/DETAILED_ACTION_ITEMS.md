# 🎬 DANH SÁCH CÔNG VIỆC CHI TẾT - MADE OS COMPLETION

**Generated**: January 6, 2026  
**Total Subtasks**: 120+  
**Estimated Effort**: 35 development days

---

## 🔴 PRIORITY 1: FIX TYPE ERRORS (2 days) - START IMMEDIATELY

### Subtask 1.1: Fix ActionResult Re-exports (1 day)
- [ ] Search for all `types/index.ts` files missing ActionResult export
- [ ] Add `export type { ActionResult } from "@/lib/types"` to:
  - [ ] `lib/features/assessments/types/index.ts`
  - [ ] `lib/features/backup/types/index.ts`
  - [ ] `lib/features/design-briefs/types/index.ts`
  - [ ] `lib/features/event-microsites/types/index.ts`
  - [ ] `lib/features/invoices/types/index.ts`
  - [ ] `lib/features/samples/types/index.ts`
  - [ ] `lib/features/sop-library/types/index.ts`
  - [ ] (20+ more files)
- [ ] Run `yarn check-types` → Verify count drops to <50 errors

### Subtask 1.2: Add Message Property to ActionResults (0.5 days)
- [ ] Find all `return { success: true, data: ... }` without message
- [ ] Add meaningful message for each return:
  ```typescript
  // Before
  return { success: true, data: result }
  
  // After
  return { success: true, message: "Contact created successfully", data: result }
  ```
- [ ] Files affected:
  - [ ] `lib/features/events/services/`
  - [ ] `lib/features/knowledge/services/`
  - [ ] `lib/features/profile/services/`
  - [ ] `lib/features/testing/services/`
- [ ] Run `yarn check-types` → Verify 0 errors

### Subtask 1.3: Fix PaginatedResult Structure (0.5 days)
- [ ] Check `lib/features/knowledge/repositories/knowledge.repository.ts:121`
- [ ] Change `items` property to `data`
- [ ] Update all callers of this repository method
- [ ] Verify consistency across all list actions

---

## 🟡 PRIORITY 2: WEEK 1 - TRAINING & SUPPORT

### SUBTASK 2.1: SOP Library Backend (1.5 days)

#### 2.1.1: Create Repository Layer
- [ ] Create `lib/features/sop-library/repositories/sop-library.repository.ts`
- [ ] Implement queries:
  - [ ] `getAllSOPs(filters?, pagination?)` with CASE_INSENSITIVE search
  - [ ] `getSOPById(id)` with includes: versions, media, author
  - [ ] `getSOPByIdForEdit(id)` with lock checking
  - [ ] `createSOP(data)` with default version creation
  - [ ] `updateSOP(id, data)` with version tracking
  - [ ] `deleteSOP(id)` with cascade to versions
  - [ ] `getSOPsByEngagement(engagementId)` for Training Engagement view
  - [ ] `searchSOPs(query)` for Knowledge linking
- [ ] Add Prisma select/include optimization (no n+1)
- [ ] Add pagination: 10, 25, 50 per page options

#### 2.1.2: Create Service Layer
- [ ] Create `lib/features/sop-library/services/sop-library.service.ts`
- [ ] Implement:
  - [ ] `validateSOPData(data)` - Zod schema validation
  - [ ] `validateSOPTitle(title, excludeId?)` - Check for duplicates
  - [ ] `createSOP(data)` - Service orchestrator
  - [ ] `updateSOP(id, data)` - With version tracking
  - [ ] `deleteSOP(id)` - With cascade handling
  - [ ] `getSOPWithContext(id)` - Include engagement, author, latest version
  - [ ] `linkMediaToSOP(sopId, mediaId)` - Attach files
  - [ ] `unlinkMediaFromSOP(sopId, mediaId)` - Detach files
  - [ ] `trackSOPVersion(sopId, changeReason)` - Auto-version on update
- [ ] Use Zod for input validation:
  ```typescript
  const CreateSOPInput = z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(10),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    engagementId: z.string().cuid(),
    isPublic: z.boolean().default(false),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  ```

#### 2.1.3: Create Server Actions
- [ ] Create `lib/features/sop-library/actions/sop-library.actions.ts`
- [ ] Implement:
  - [ ] `listSOPsAction(filters, pagination, page)`
    - Require: `requirePermission("training", "read")`
    - Return: `PaginatedResult<SOP[]>`
  - [ ] `getSOPAction(id)`
    - Require: `requirePermission("training", "read")`
    - Return: `ActionResult<SOPWithContext>`
  - [ ] `createSOPAction(data)`
    - Require: `requirePermission("training", "create")`
    - Validate → Service → Pusher.trigger("sop_created") → revalidatePath("/training-support/sop-library")
  - [ ] `updateSOPAction(id, data)`
    - Require: `requirePermission("training", "update")`
    - Track version → Pusher → Revalidate
  - [ ] `deleteSOPAction(id)`
    - Require: `requirePermission("training", "delete")`
    - Cascade delete → Pusher → Revalidate
  - [ ] `publishSOPAction(id)` - Change status to PUBLISHED
  - [ ] `archiveSOPAction(id)` - Change status to ARCHIVED
  - [ ] `uploadSOPMediaAction(sopId, file)` - Handle file upload + Media creation
- [ ] All actions return standardized `ActionResult<T>`
- [ ] All mutations trigger Pusher on channel `private-global`

#### 2.1.4: Create Type Definitions
- [ ] Create `lib/features/sop-library/types/sop-library.types.ts`
- [ ] Define:
  ```typescript
  export type SOP = {
    id: string
    title: string
    content: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    engagementId: string
    engagement?: TrainingEngagement
    isPublic: boolean
    category?: string
    tags?: string[]
    media?: Media[]
    versions?: SOPVersion[]
    createdBy: string
    createdAt: Date
    updatedAt: Date
  }
  
  export type SOPVersion = {
    id: string
    sopId: string
    versionNumber: number
    changeReason: string
    createdBy: string
    createdAt: Date
  }
  
  export type CreateSOPInput = z.infer<typeof CreateSOPInput>
  export type UpdateSOPInput = z.infer<typeof UpdateSOPInput>
  export type SOPFilter = { search?: string; status?: string; engagementId?: string }
  ```

#### 2.1.5: Create Index/Barrel Exports
- [ ] Update `lib/features/sop-library/index.ts`:
  ```typescript
  export * from "./types"
  export * from "./actions"
  export * from "./services"
  export * from "./repositories"
  ```

### SUBTASK 2.2: SOP Library Frontend (1 day)

#### 2.2.1: Create Routes & Pages
- [ ] Create `app/(dashboard)/training-support/sop-library/page.tsx`
  - [ ] List view with DataTable
  - [ ] Search, filter by status, engagement
  - [ ] Pagination (10, 25, 50)
  - [ ] Create button
  - [ ] Bulk delete with confirmation
  - [ ] Real-time updates via Pusher

- [ ] Create `app/(dashboard)/training-support/sop-library/new/page.tsx`
  - [ ] Form with Lexical editor
  - [ ] Media upload section
  - [ ] Status dropdown
  - [ ] Engagement selector
  - [ ] Tags input
  - [ ] Save draft / Publish actions

- [ ] Create `app/(dashboard)/training-support/sop-library/[id]/page.tsx`
  - [ ] Read-only view
  - [ ] Display media
  - [ ] Show version history
  - [ ] Edit button
  - [ ] Delete button
  - [ ] Download SOP as PDF

- [ ] Create `app/(dashboard)/training-support/sop-library/[id]/edit/page.tsx`
  - [ ] Edit form (same as new)
  - [ ] Pre-fill current data
  - [ ] Show version changes
  - [ ] Save with version tracking

#### 2.2.2: Create Components
- [ ] `components/sop-library/SOPListTable.tsx`
  - [ ] Columns: Title, Status, Engagement, Updated, Actions
  - [ ] Sorting, filtering
  - [ ] Real-time status updates

- [ ] `components/sop-library/SOPForm.tsx`
  - [ ] React Hook Form integration
  - [ ] Zod validation
  - [ ] Lexical editor for content
  - [ ] Media upload preview
  - [ ] Submit handler with error toast

- [ ] `components/sop-library/SOPVersionHistory.tsx`
  - [ ] Timeline of changes
  - [ ] Change reason display
  - [ ] Created by/date info
  - [ ] Rollback option (optional)

- [ ] `components/sop-library/SOPFilters.tsx`
  - [ ] Search input
  - [ ] Status select (Draft, Published, Archived)
  - [ ] Engagement multiselect
  - [ ] Clear filters button

- [ ] `components/sop-library/SOPMediaSection.tsx`
  - [ ] Upload dropzone
  - [ ] Media thumbnails
  - [ ] Delete media
  - [ ] Download links

#### 2.2.3: Add Error Boundaries & Loading States
- [ ] Wrap pages with `react-error-boundary`
- [ ] Add Suspense with fallback: `<PageLoading />`
- [ ] Toast notifications for all actions
- [ ] Loading buttons on form submit

#### 2.2.4: Add Real-time Updates
- [ ] Use Pusher hook to listen for sop_created, sop_updated events
- [ ] Revalidate list on create/update/delete
- [ ] Show toast when SOP updated by other user

### SUBTASK 2.3: SOP Library Tests (0.5 days)
- [ ] Create `tests/unit/features/sop-library/sop-library.repository.test.ts`
  - [ ] Test CRUD operations
  - [ ] Test pagination
  - [ ] Test search with case-insensitive
  - [ ] Test include/select optimization

- [ ] Create `tests/unit/features/sop-library/sop-library.service.test.ts`
  - [ ] Test validation
  - [ ] Test version tracking
  - [ ] Test duplicate checking
  - [ ] Test media linking

- [ ] Create `tests/unit/features/sop-library/sop-library.actions.test.ts`
  - [ ] Test permission checks (allow/deny)
  - [ ] Test action success paths
  - [ ] Test error handling
  - [ ] Test Pusher trigger calls

- [ ] Run `yarn test:unit` → All pass

---

### SUBTASK 2.4: Assessment Module (1.5 days - Similar to SOP)

#### Structure
```
lib/features/assessments/
├── repositories/assessments.repository.ts    ← CRUD + results queries
├── services/assessments.service.ts           ← Validation + grading logic
├── actions/assessments.actions.ts            ← Server actions
├── types/assessments.types.ts                ← Type definitions
└── index.ts                                   ← Barrel export
```

#### Key Implementations
- [ ] **Repository**:
  - `getAllAssessments(filters?, pagination?)`
  - `getAssessmentById(id)` with questions included
  - `createAssessment(data)` with questions array
  - `updateAssessment(id, data)`
  - `deleteAssessment(id)` with cascade
  - `submitAssessmentResult(assessmentId, userId, answers)` - Track response
  - `getAssessmentResults(assessmentId)` - List submissions
  - `calculateScore(assessment, answers)` - Auto-grade logic

- [ ] **Service**:
  - `validateAssessmentData(data)` - Zod validation
  - `validateQuestionData(question)` - Question validation
  - `submitAssessment(assessmentId, userId, answers)` - Orchestrate submission
  - `calculateAndGradeResult(assessment, answers)` - Score calculator
  - `generateCertificate(resultId)` - Optional: PDF generation
  - `notifyUserResult(userId, resultId, score)` - Email/notification

- [ ] **Actions**:
  - `listAssessmentsAction(filters?, pagination?)`
  - `getAssessmentAction(id)`
  - `createAssessmentAction(data)`
  - `updateAssessmentAction(id, data)`
  - `deleteAssessmentAction(id)`
  - `submitAssessmentAction(assessmentId, answers)` - User submission
  - `getAssessmentResultsAction(assessmentId)` - Admin view results
  - `getUserAssessmentResultAction(assessmentId, userId)` - User view own result

- [ ] **Types**:
  ```typescript
  type Assessment = {
    id: string
    title: string
    description?: string
    questions: Question[]
    passingScore: number
    totalPoints: number
    timeLimit?: number
    allowRetake: boolean
    trainingId: string
    training?: TrainingEngagement
    createdAt: Date
    updatedAt: Date
  }
  
  type Question = {
    id: string
    assessmentId: string
    type: 'MCQ' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE'
    question: string
    points: number
    order: number
    options?: string[] // For MCQ
    correctAnswers?: string[] // For auto-grade
    options?: QuestionOption[]
  }
  
  type AssessmentResult = {
    id: string
    assessmentId: string
    userId: string
    answers: UserAnswer[]
    score: number
    passed: boolean
    submittedAt: Date
  }
  ```

#### Frontend
- [ ] Create list page: `app/(dashboard)/training-support/assessments/page.tsx`
- [ ] Create form page: `app/(dashboard)/training-support/assessments/new/page.tsx`
  - [ ] Question builder with drag-drop
  - [ ] Type selector (MCQ, Essay, etc.)
  - [ ] Option management for MCQ
  - [ ] Points per question
  - [ ] Passing score setup

- [ ] Create detail page: `app/(dashboard)/training-support/assessments/[id]/page.tsx`
  - [ ] Read-only assessment view
  - [ ] Edit button
  - [ ] Take assessment button
  - [ ] Results button

- [ ] Create taker page: `app/(dashboard)/training-support/assessments/[id]/take/page.tsx`
  - [ ] Read-only assessment
  - [ ] Input fields for answers
  - [ ] Timer display (if timeLimit set)
  - [ ] Submit button
  - [ ] Results calculation

- [ ] Create results page: `app/(dashboard)/training-support/assessments/[id]/results/page.tsx`
  - [ ] List of all submissions
  - [ ] Scores, passed/failed status
  - [ ] Individual result detail view

#### Tests
- [ ] Unit tests for assessment repository (CRUD, scoring)
- [ ] Unit tests for grading logic (auto-score, manual review)
- [ ] Unit tests for permissions
- [ ] Integration test: Create → Submit → Grade flow

---

### SUBTASK 2.5: Training Engagement Integration (1 day)

#### Backend
- [ ] Create/update `lib/features/training/` feature module
- [ ] Update Engagement model to link:
  - [ ] Training Engagement → SOPLibrary (1:N)
  - [ ] Training Engagement → Assessments (1:N)
  - [ ] Training Engagement → TrainingSessions (1:N)
- [ ] Create server actions:
  - [ ] `createTrainingEngagementAction(opportunityId)` - Convert opportunity
  - [ ] `linkSOPToTrainingAction(trainingId, sopId)`
  - [ ] `unlinkSOPFromTrainingAction(trainingId, sopId)`
  - [ ] `linkAssessmentToTrainingAction(trainingId, assessmentId)`
  - [ ] `createTrainingSessionAction(trainingId, data)` - Session scheduling
  - [ ] `trackTrainingProgressAction(trainingId, userId)` - SOP completion %

#### Frontend
- [ ] Create dashboard: `app/(dashboard)/training-support/page.tsx`
  - [ ] List active trainings
  - [ ] Progress chart (sessions scheduled, SOPs published, assessments active)
  - [ ] Quick actions (create new, view details)

- [ ] Create detail page: `app/(dashboard)/training-support/[id]/page.tsx`
  - [ ] Engagement details
  - [ ] Linked SOPs section
  - [ ] Linked Assessments section
  - [ ] Sessions/schedule section
  - [ ] Attendees/progress section

- [ ] Create components:
  - [ ] `TrainingProgressCard` - Show completion status
  - [ ] `LinkedSOPsSection` - List + link/unlink
  - [ ] `LinkedAssessmentsSection` - List + link/unlink
  - [ ] `TrainingSessionsList` - Calendar view

#### Tests
- [ ] Integration test: Create training → link SOP → link assessment
- [ ] Permission tests: Only training:update can link resources

---

## 🟡 PRIORITY 3: WEEK 2 - EVENTS & TESTING

### SUBTASK 3.1: Speakers Module Backend (1 day)

#### Structure
```
lib/features/speakers/
├── repositories/speakers.repository.ts
├── services/speakers.service.ts
├── actions/speakers.actions.ts
├── types/speakers.types.ts
└── index.ts
```

#### Implementation
- [ ] **Repository**: CRUD + queries for speaker sessions, payments, contracts
- [ ] **Service**: Validation, speaker-session linking, payment tracking
- [ ] **Actions**: Permission-based CRUD actions
- [ ] **Types**: Speaker, SpeakerSession, SpeakerPayment types

#### Key Queries
```typescript
- getAllSpeakers(filters?: { search?, eventId? }, pagination?)
- getSpeakerById(id) with sessions, payments
- createSpeaker(data)
- updateSpeaker(id, data)
- deleteSpeaker(id)
- getSpeakersByEvent(eventId)
- linkSpeakerToSession(speakerId, sessionId)
- unlinkSpeakerFromSession(speakerId, sessionId)
- trackSpeakerPayment(speakerId, amount, status)
```

### SUBTASK 3.2: Speakers Module Frontend (1 day)

#### Pages
- [ ] `app/(dashboard)/events/[id]/speakers/page.tsx` - List speakers in event
- [ ] `app/(dashboard)/events/[id]/speakers/new/page.tsx` - Add speaker
- [ ] `app/(dashboard)/events/[id]/speakers/[speakerId]/page.tsx` - Speaker detail + assign sessions
- [ ] `app/(dashboard)/events/[id]/speakers/[speakerId]/edit/page.tsx` - Edit speaker

#### Features
- [ ] Search speakers (searchable contact database or create new)
- [ ] Assign to sessions
- [ ] Track payment status
- [ ] Download speaker agreement
- [ ] Send email to speakers
- [ ] Display speaker bio + photo on event microsite

---

### SUBTASK 3.3: Sponsors Module Backend (1 day)

#### Implementation (Same pattern as Speakers)
- [ ] **Repository**: CRUD + sponsor-event linking, deliverables tracking
- [ ] **Service**: Validate sponsor data, track deliverables, manage assets
- [ ] **Actions**: Create, update, delete sponsors; manage deliverables
- [ ] **Types**: Sponsor, SponsorPackage, SponsorDeliverable, SponsorAsset

#### Key Queries
```typescript
- getAllSponsors(filters?, pagination?)
- getSponsorById(id) with deliverables, assets
- getSponsorsByEvent(eventId)
- createSponsor(data)
- updateSponsor(id, data)
- deleteSponsor(id)
- trackSponsorDeliverable(sponsorId, deliverableId, status)
- uploadSponsorAsset(sponsorId, file)
```

### SUBTASK 3.4: Sponsors Module Frontend (1 day)

#### Pages
- [ ] `app/(dashboard)/events/[id]/sponsors/page.tsx` - List sponsors
- [ ] `app/(dashboard)/events/[id]/sponsors/new/page.tsx` - Add sponsor
- [ ] `app/(dashboard)/events/[id]/sponsors/[sponsorId]/page.tsx` - Detail + deliverables
- [ ] `app/(dashboard)/events/[id]/sponsors/[sponsorId]/edit/page.tsx` - Edit

#### Features
- [ ] Sponsorship package selection
- [ ] Deliverables checklist (branding placement, booth, email mentions, etc.)
- [ ] Asset upload & approval workflow
- [ ] Payment tracking
- [ ] Email templates for sponsor communications

---

### SUBTASK 3.5: Testing Vertical - Complete UI (2 days)

#### Create Routes Structure
```
app/(dashboard)/testing/
├── page.tsx                              ← Overview dashboard
├── test-orders/
│   ├── page.tsx                          ← List orders
│   ├── new/page.tsx                      ← Create (linked to Opportunity)
│   └── [id]/
│       ├── page.tsx                      ← Order detail
│       ├── samples/page.tsx              ← Manage samples
│       ├── test-suites/page.tsx          ← Select/create test suites
│       └── reports/page.tsx              ← View test reports
├── test-suites/
│   ├── page.tsx                          ← Library of test suites
│   ├── new/page.tsx                      ← Create suite
│   └── [id]/
│       ├── page.tsx                      ← Suite detail
│       └── edit/page.tsx                 ← Edit suite
├── test-reports/
│   ├── page.tsx                          ← All reports
│   └── [id]/
│       ├── page.tsx                      ← Report detail + PDF
│       └── edit/page.tsx                 ← Add notes, update status
└── components/
    ├── TestOrderForm.tsx
    ├── SampleUploadSection.tsx
    ├── TestSuiteBuilder.tsx
    ├── TestReportGenerator.tsx
    └── TestingDashboard.tsx
```

#### Page Implementation

**Testing Dashboard** (`app/(dashboard)/testing/page.tsx`):
- [ ] Stats cards: Total orders, In progress, Completed, Reports generated
- [ ] Recent orders list
- [ ] Test suites library quick access
- [ ] Active samples view

**Test Orders List** (`app/(dashboard)/testing/test-orders/page.tsx`):
- [ ] DataTable with: Order ID, Customer, Status, Samples, Created
- [ ] Filters: Status, Date range, Customer, Test type
- [ ] Create new order button
- [ ] Real-time status updates via Pusher

**Create Test Order** (`app/(dashboard)/testing/test-orders/new/page.tsx`):
- [ ] Link to Opportunity (required)
- [ ] Customer pre-filled from Opportunity
- [ ] Sample type selector
- [ ] Expected delivery date
- [ ] Special instructions textarea
- [ ] Submit action

**Order Detail** (`app/(dashboard)/testing/test-orders/[id]/page.tsx`):
- [ ] Tabs: Overview, Samples, Test Suites, Reports
- [ ] Overview tab:
  - [ ] Order info (ID, customer, status, dates)
  - [ ] Edit button
  - [ ] Delete button
  - [ ] Change status dropdown

**Manage Samples** (`app/(dashboard)/testing/test-orders/[id]/samples/page.tsx`):
- [ ] List samples for order
- [ ] Upload new sample button
- [ ] Sample upload form:
  - [ ] File upload (with file size validation)
  - [ ] Sample type (Product, Component, Raw Material, etc.)
  - [ ] Quantity
  - [ ] Notes
  - [ ] Auto-link to Media
- [ ] Sample list:
  - [ ] File link + download
  - [ ] Type, quantity, upload date
  - [ ] Delete button
  - [ ] Status badge

**Select Test Suites** (`app/(dashboard)/testing/test-orders/[id]/test-suites/page.tsx`):
- [ ] Browse test suite library
- [ ] Search/filter by category, type
- [ ] Add suite to order button
- [ ] View suite details popup
- [ ] Custom test parameters per order

**View Reports** (`app/(dashboard)/testing/test-orders/[id]/reports/page.tsx`):
- [ ] Generated reports list
- [ ] Download PDF button
- [ ] View details button
- [ ] Generate new report button

**Test Suite Library** (`app/(dashboard)/testing/test-suites/page.tsx`):
- [ ] List all test suites
- [ ] Search/filter by category
- [ ] Create new suite button
- [ ] Duplicate suite button
- [ ] Delete with confirmation

**Create/Edit Test Suite** (`app/(dashboard)/testing/test-suites/new/page.tsx`):
- [ ] Suite name, description
- [ ] Test type (Functional, Performance, Compatibility, etc.)
- [ ] Add test parameters:
  - [ ] Parameter name, value range, unit
  - [ ] Pass/fail criteria
  - [ ] Add/remove buttons
- [ ] Expected duration estimate

**Test Reports** (`app/(dashboard)/testing/test-reports/page.tsx`):
- [ ] All reports list
- [ ] Filter by: Order, Date, Status, Conclusion
- [ ] View report button
- [ ] Download PDF button

**Report Detail** (`app/(dashboard)/testing/test-reports/[id]/page.tsx`):
- [ ] Header: Order info, dates, conclusion
- [ ] Executive summary
- [ ] Test results table:
  - [ ] Parameter, Expected, Actual, Status (Pass/Fail)
- [ ] Notes section (editable)
- [ ] Samples section (linked media)
- [ ] Sign-off section (with date, signature)
- [ ] PDF download button
- [ ] Email report button

#### Backend Completion

**test-orders.actions.ts**:
- [ ] `listTestOrdersAction(filters?, pagination?)`
- [ ] `getTestOrderAction(id)`
- [ ] `createTestOrderAction(data)` - Link to Opportunity
- [ ] `updateTestOrderAction(id, data)`
- [ ] `changeTestOrderStatusAction(id, newStatus)` - Auto-create Interaction
- [ ] `deleteTestOrderAction(id)`

**test-reports.actions.ts**:
- [ ] `generateTestReportAction(testOrderId)` - Auto-generate from test results
- [ ] `getTestReportAction(id)`
- [ ] `updateTestReportAction(id, data)` - Edit notes, conclusion
- [ ] `exportReportAsPDFAction(reportId)`
- [ ] `emailReportAction(reportId, recipientEmail)`

**test-suites.actions.ts**:
- [ ] `listTestSuitesAction(filters?, pagination?)`
- [ ] `getTestSuiteAction(id)`
- [ ] `createTestSuiteAction(data)`
- [ ] `updateTestSuiteAction(id, data)`
- [ ] `duplicateTestSuiteAction(id)` - Clone suite
- [ ] `deleteTestSuiteAction(id)`

**samples.actions.ts**:
- [ ] `uploadSampleAction(testOrderId, file, metadata)`
- [ ] `getSamplesForOrderAction(testOrderId)`
- [ ] `deleteSampleAction(sampleId)`

#### Components to Create
- [ ] `TestingDashboard.tsx` - Stats + recent activity
- [ ] `TestOrderForm.tsx` - React Hook Form + Zod
- [ ] `SampleUploadSection.tsx` - File upload + media
- [ ] `TestSuiteBuilder.tsx` - Dynamic parameter form
- [ ] `TestParametersTable.tsx` - Results display
- [ ] `TestReportPDF.tsx` - PDF generation template

#### Real-time & Auto-generation
- [ ] On status change: Auto-create Interaction record
- [ ] On sample upload: Trigger any auto-tests (if configured)
- [ ] On test completion: Auto-generate report draft
- [ ] Pusher events: test_order_created, status_changed, report_generated

---

## 🟡 PRIORITY 4: WEEK 3-4 - DESIGN WORKSPACE

(Follow similar pattern to Testing, but more complex with compatibility logic)

### SUBTASK 4.1: Design Projects Backend (2 days)
- [ ] Create `lib/features/design-projects/` module
- [ ] CRUD operations
- [ ] Link to Opportunity
- [ ] Track design stages (Intake → Concept → Feasibility → Approved → Delivered)
- [ ] Auto-create Interaction on stage change

### SUBTASK 4.2: Design Projects Frontend (2 days)
- [ ] Design dashboard
- [ ] Project list + create form
- [ ] Project detail page
- [ ] Design upload section
- [ ] Stage progression UI
- [ ] Approval workflow

### SUBTASK 4.3: Tech Packs & Deliverables (1.5 days)
- [ ] Tech pack generation from design
- [ ] Version tracking
- [ ] PDF export
- [ ] Customer sharing/approval

---

## 🟡 PRIORITY 5: WEEK 5+ - RAG IMPLEMENTATION

### SUBTASK 5.1: Vector Services (2 days)

#### 5.1.1: Embedding Service
- [ ] Create `lib/features/vector-search/services/embeddingService.ts`
- [ ] Implement:
  ```typescript
  - chunkText(content, chunkSize=500, overlap=100)
  - generateEmbedding(text): Promise<number[]>
  - createKnowledgeVectors(articleId, content)
  - updateKnowledgeVectors(articleId, content)
  - deleteKnowledgeVectors(articleId)
  ```

#### 5.1.2: Vector Search Service
- [ ] Create `lib/features/vector-search/services/vectorSearchService.ts`
- [ ] Implement:
  ```typescript
  - searchByVector(embedding, topK=5)
  - cosineSimilarity(vec1, vec2): number
  - getCandidateDocuments(query, topK=10)
  ```

#### 5.1.3: RAG Orchestration Service
- [ ] Create `lib/features/vector-search/services/ragService.ts`
- [ ] Implement:
  ```typescript
  - searchKnowledge(query, topK=5)
  - generateAnswer(query, conversationContext?)
  - streamAnswer(query) - For streaming responses
  - enrichContextWithCitations(answer, sources)
  - logSearchQuery(query, results, userId)
  ```

### SUBTASK 5.2: Server Actions (1 day)

#### 5.2.1: Search Actions
- [ ] Create `lib/features/vector-search/actions/search.actions.ts`
- [ ] Implement:
  ```typescript
  - searchKnowledgeAction(query, topK=5)
    → requirePermission("knowledge", "read")
    → Check isRagEnabled()
    → Return { results, citations, took, model }
  ```

#### 5.2.2: Generation Actions
- [ ] Create `lib/features/vector-search/actions/generation.actions.ts`
- [ ] Implement:
  ```typescript
  - generateAnswerAction(query, context?)
    → requirePermission("knowledge", "read")
    → Check isRagEnabled()
    → Return { answer, sources, model, tokensUsed }
  ```

### SUBTASK 5.3: Knowledge UI Integration (1 day)

#### 5.3.1: Knowledge Search Enhancement
- [ ] Add search mode toggle: "Keyword" | "Semantic" | "AI"
- [ ] Show semantic search results with relevance scores
- [ ] Add "Ask AI" button to search results
- [ ] Display AI answer with source citations
- [ ] Show token usage + cost estimate

#### 5.3.2: Knowledge Article Enhancement
- [ ] Add "Find Similar" button on article view
- [ ] Show related articles via RAG
- [ ] Add "Ask about this article" chatbot integration

### SUBTASK 5.4: Testing & Documentation (0.5 days)
- [ ] Test embedding generation
- [ ] Test vector search accuracy
- [ ] Test RAG answer quality
- [ ] Document setup, usage, cost model
- [ ] Create troubleshooting guide

---

## 🔧 PRIORITY 6: QA & HARDENING (Throughout, ~10 days)

### SUBTASK 6.1: Permission Coverage Tests (1.5 days)

#### 6.1.1: Create Permission Test Suite
- [ ] Create `tests/unit/permissions/` directory
- [ ] Create test files for each module:
  - [ ] `customers.permissions.test.ts`
  - [ ] `events.permissions.test.ts`
  - [ ] `knowledge.permissions.test.ts`
  - [ ] `training.permissions.test.ts`
  - [ ] `testing.permissions.test.ts`

#### 6.1.2: Test Pattern
```typescript
describe("Customers Permissions", () => {
  it("should allow read with customers:read", async () => {
    // Mock permission grant
    // Call action
    // Assert success
  })
  
  it("should deny read without customers:read", async () => {
    // Mock permission deny
    // Call action
    // Assert error
  })
  
  // Repeat for create, update, delete
})
```

### SUBTASK 6.2: Caching & Revalidation (1 day)
- [ ] Document caching strategy per module in `docs/CACHING_STRATEGY.md`
- [ ] Create helper: `lib/cache/revalidateModule.ts`
  ```typescript
  export function revalidateModule(moduleName: string) {
    // Revalidate all common paths for module
    const paths = getModulePaths(moduleName)
    paths.forEach(path => revalidatePath(path))
  }
  ```
- [ ] Audit all actions for revalidatePath/revalidateTag calls
- [ ] Add caching for list actions with heavy filtering
- [ ] Test cache invalidation on mutations

### SUBTASK 6.3: Error Boundaries & UI (1 day)
- [ ] Wrap all critical pages with `react-error-boundary`
- [ ] Create error fallback component: `components/error/PageErrorFallback.tsx`
- [ ] Add Sonner toast notifications for:
  - [ ] Action success
  - [ ] Action error
  - [ ] Validation error
  - [ ] Permission denied
- [ ] Add PageLoading skeleton component
- [ ] Test loading states throughout app

### SUBTASK 6.4: Security Hardening (1.5 days)

#### 6.4.1: Security Headers
- [ ] Update `next.config.ts`:
  ```typescript
  const securityHeaders = [
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()'
    }
  ]
  ```

#### 6.4.2: Environment Validation
- [ ] Create `env.mjs`:
  ```typescript
  import { z } from 'zod'
  
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    // ... all required vars
  })
  
  export const env = envSchema.parse(process.env)
  ```
- [ ] Import in `lib/index.ts` to fail-fast on startup

#### 6.4.3: CORS Configuration
- [ ] Update `lib/cors.ts`:
  ```typescript
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  
  export const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
  ```

### SUBTASK 6.5: Real-time & Observability (1.5 days)

#### 6.5.1: Pusher Error Handling
- [ ] Create `lib/realtime/safePusher.ts`:
  ```typescript
  export async function safePusherTrigger(channel: string, event: string, data: any) {
    for (let i = 0; i < 3; i++) {
      try {
        await getPusher().trigger(channel, event, data)
        return
      } catch (e) {
        if (i === 2) {
          console.error(`Pusher trigger failed after 3 retries:`, e)
          return // Silent fail
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
  }
  ```
- [ ] Replace all `getPusher().trigger()` calls with `safePusherTrigger()`

#### 6.5.2: Performance Monitoring
- [ ] Add action latency tracking:
  ```typescript
  export async function trackedAction(name: string, fn: () => Promise<any>) {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      // Log to analytics
      if (duration > 1000) console.warn(`${name} took ${duration}ms`)
      return result
    } catch (e) {
      const duration = performance.now() - start
      console.error(`${name} failed after ${duration}ms`, e)
      throw e
    }
  }
  ```

### SUBTASK 6.6: Audit & Compliance (1 day)
- [ ] Verify all createdBy/updatedBy fields populated in actions
- [ ] Create audit log for sensitive changes (users, roles, permissions)
- [ ] Add rate limiting for auth/upload endpoints
- [ ] Review JWT enrichment in NextAuth session callback
- [ ] Test role-based access control thoroughly

### SUBTASK 6.7: End-to-End Testing (2 days)
- [ ] Create Playwright test suite for critical flows:
  - [ ] User login + dashboard access
  - [ ] Create SOP → publish → view
  - [ ] Create assessment → submit → grade
  - [ ] Create event → add speakers → add sponsors
  - [ ] Create test order → upload sample → generate report
- [ ] Test real-time updates (Pusher)
- [ ] Test permission enforcement
- [ ] Run `yarn test:e2e` → All pass

---

## 📊 EXECUTION CHECKLIST

Use this checklist to track progress:

```
WEEK 1: Training & Support
- [ ] SOP Library Backend (1.5d)
- [ ] SOP Library Frontend (1d)
- [ ] SOP Library Tests (0.5d)
- [ ] Assessment Backend (1.5d)
- [ ] Assessment Frontend (1d)
- [ ] Training Engagement Integration (1d)
- [ ] Type error fixes (1d)
- [ ] Permission tests (0.5d)
Status: ______________

WEEK 2: Events & Testing
- [ ] Speakers Module (2d)
- [ ] Sponsors Module (2d)
- [ ] Testing Vertical Complete (2d)
- [ ] Caching strategy (1d)
- [ ] Error boundaries (1d)
- [ ] Real-time testing (1d)
Status: ______________

WEEK 3-4: Design Workspace
- [ ] Design Projects (4d)
- [ ] Tech Packs (2d)
- [ ] Security hardening (1.5d)
- [ ] E2E tests (2d)
Status: ______________

WEEK 5+: RAG
- [ ] Vector services (2d)
- [ ] Server actions (1d)
- [ ] UI integration (1d)
- [ ] Testing & docs (0.5d)
Status: ______________
```

---

## 🎯 Success Metrics

**Before starting**: Run baseline
- [ ] `yarn check-types` - Record error count
- [ ] `yarn test:unit` - Record coverage %
- [ ] `yarn test:e2e` - Record test count

**After completion** (Target state):
- ✅ `yarn check-types` → 0 errors
- ✅ `yarn test:unit` → >80% coverage
- ✅ All features working end-to-end
- ✅ No performance regressions
- ✅ Security audit passed
- ✅ Production-ready

---

## 📞 Questions & Next Steps

1. **Priority ranking**: Adjust based on business needs
2. **Resource allocation**: Assign subtasks to developers
3. **Timeline**: Confirm 35-day estimate is realistic
4. **Dependencies**: Identify any blockers upfront
5. **Stakeholder review**: Get approval before starting Phase 1

