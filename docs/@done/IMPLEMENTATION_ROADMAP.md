# KẾ HOẠCH THỰC THI HOÀN THIỆN MADE OS

**Ngày bắt đầu**: December 11, 2025  
**Mục tiêu**: Hoàn thiện 18/94 models còn thiếu UI và features  
**Timeline**: 5 tuần (35 ngày làm việc)

---

## TUẦN 1: TRAINING & SUPPORT (5-7 ngày)

### Day 1-2: SOPLibrary Module
**Mục tiêu**: Tạo hệ thống quản lý tài liệu SOP

#### Backend Tasks
- [ ] Tạo `lib/features/sop-library/` structure
  ```
  sop-library/
  ├── repositories/
  │   └── sop-library.repository.ts
  ├── services/
  │   └── sop-library.service.ts
  ├── actions/
  │   └── sop-library.actions.ts
  ├── types/
  │   └── sop-library.types.ts
  └── index.ts
  ```

- [ ] Repository: `sop-library.repository.ts`
  ```typescript
  // CRUD operations for SOPLibrary model
  - getAllSOPs(filters?)
  - getSOPById(id)
  - createSOP(data)
  - updateSOP(id, data)
  - deleteSOP(id)
  - getSOPsByTrainingEngagement(engagementId)
  ```

- [ ] Service: `sop-library.service.ts`
  ```typescript
  // Business logic
  - Validate SOP data
  - Handle file attachments via Media model
  - Link to TrainingEngagement
  - Version control logic
  ```

- [ ] Actions: `sop-library.actions.ts`
  ```typescript
  // Server actions with permissions
  - listSOPsAction() - requirePermission("training", "read")
  - getSOPAction(id) - requirePermission("training", "read")
  - createSOPAction(data) - requirePermission("training", "create")
  - updateSOPAction(id, data) - requirePermission("training", "update")
  - deleteSOPAction(id) - requirePermission("training", "delete")
  ```

#### Frontend Tasks
- [ ] Tạo routes:
  ```
  app/(dashboard)/training-support/sop-library/
  ├── page.tsx           # List SOPs with filters
  ├── new/page.tsx       # Create SOP form
  └── [id]/
      ├── page.tsx       # SOP detail view
      └── edit/page.tsx  # Edit SOP form
  ```

- [ ] Components: `app/(dashboard)/training-support/sop-library/components/`
  ```typescript
  - SOPListTable.tsx
  - SOPCard.tsx
  - SOPForm.tsx
  - SOPFilters.tsx
  - SOPVersionHistory.tsx
  ```

- [ ] Features:
  - File upload/download
  - Version tracking
  - Access control (private/public)
  - Link to training engagements
  - Search and filter

#### Testing
- [ ] Unit tests: `tests/unit/features/sop-library/`
- [ ] Integration tests: Create → Read → Update → Delete flow
- [ ] Permission tests

---

### Day 3-4: Assessment Module
**Mục tiêu**: Tạo hệ thống đánh giá học viên

#### Backend Tasks
- [ ] Tạo `lib/features/assessments/` structure (tương tự SOPLibrary)

- [ ] Repository: `assessments.repository.ts`
  ```typescript
  - getAllAssessments(filters?)
  - getAssessmentById(id)
  - createAssessment(data)
  - updateAssessment(id, data)
  - deleteAssessment(id)
  - getAssessmentsByTrainingEngagement(engagementId)
  - getAssessmentsByUser(userId)
  - submitAssessmentResult(assessmentId, userId, data)
  ```

- [ ] Service: `assessments.service.ts`
  ```typescript
  // Business logic
  - Validate assessment data
  - Calculate scores
  - Generate certificates
  - Send completion emails
  ```

- [ ] Actions: `assessments.actions.ts` (with permissions)

#### Frontend Tasks
- [ ] Tạo routes:
  ```
  app/(dashboard)/training-support/assessments/
  ├── page.tsx           # List assessments
  ├── new/page.tsx       # Create assessment
  ├── [id]/
  │   ├── page.tsx       # Assessment detail
  │   ├── edit/page.tsx  # Edit assessment
  │   └── take/page.tsx  # Take assessment (for users)
  └── results/page.tsx   # Assessment results
  ```

- [ ] Components:
  ```typescript
  - AssessmentListTable.tsx
  - AssessmentForm.tsx
  - QuestionBuilder.tsx
  - AssessmentTaker.tsx (for users)
  - ResultsTable.tsx
  - ScoreCard.tsx
  ```

#### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E test: Create assessment → User takes → Submit → View results

---

### Day 5: TrainingReport UI
**Mục tiêu**: Tạo UI cho training reports

#### Backend Tasks
- [ ] Verify `lib/features/training/` has report logic
- [ ] Add report generation service if missing
- [ ] Add report actions with permissions

#### Frontend Tasks
- [ ] Tạo routes:
  ```
  app/(dashboard)/training-support/reports/
  ├── page.tsx           # List reports
  ├── new/page.tsx       # Generate new report
  └── [id]/
      ├── page.tsx       # Report detail/view
      └── export/page.tsx # Export report (PDF/Excel)
  ```

- [ ] Components:
  ```typescript
  - ReportListTable.tsx
  - ReportGeneratorForm.tsx
  - ReportViewer.tsx
  - ReportCharts.tsx (attendance, completion rates)
  - ExportOptions.tsx
  ```

#### Testing
- [ ] Report generation tests
- [ ] Export functionality tests

---

### Day 6-7: Training Sessions Completion
**Mục tiêu**: Hoàn thiện training sessions UI

#### Tasks
- [ ] Enhance `/training-support/sessions` pages
- [ ] Add session scheduler
- [ ] Add attendance tracking
- [ ] Add session materials management
- [ ] Link to SOPLibrary and Assessments
- [ ] Add calendar view for sessions

#### Components
```typescript
- SessionScheduler.tsx
- SessionCalendar.tsx
- AttendanceTracker.tsx
- SessionMaterialsList.tsx
```

#### Testing
- [ ] Full CRUD tests
- [ ] Calendar functionality tests

---

## TUẦN 2: TESTING VERTICAL (7-10 ngày)

### Day 8-9: TestOrder CRUD
**Mục tiêu**: Hoàn thiện test order management

#### Backend Verification
- [ ] Verify `lib/features/testing/` has all needed logic
- [ ] Add missing services if needed
- [ ] Verify permission checks

#### Frontend Tasks
- [ ] Hoàn thiện routes:
  ```
  app/(dashboard)/test-management/orders/
  ├── page.tsx           # List orders with status filters
  ├── new/page.tsx       # Create order form
  └── [id]/
      ├── page.tsx       # Order detail + status tracking
      ├── edit/page.tsx  # Edit order
      └── samples/page.tsx # Manage order samples
  ```

- [ ] Components:
  ```typescript
  - TestOrderListTable.tsx
  - TestOrderForm.tsx
  - TestOrderDetail.tsx
  - OrderStatusTracker.tsx (workflow visualization)
  - OrderSamplesList.tsx
  - OrderTestSuitesList.tsx
  ```

- [ ] Features:
  - Order workflow: PENDING → IN_PROGRESS → COMPLETED
  - Link to Customer/Opportunity/Engagement
  - Sample management
  - Test suite assignment
  - Status updates with Pusher

#### Testing
- [ ] Full CRUD tests
- [ ] Workflow tests
- [ ] Real-time updates tests

---

### Day 10-11: Sample & Test CRUD
**Mục tiêu**: Hoàn thiện sample và test management

#### Sample Management
- [ ] Routes:
  ```
  app/(dashboard)/test-management/samples/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Sample detail
      ├── edit/page.tsx
      └── tests/page.tsx # Tests for this sample
  ```

- [ ] Components:
  ```typescript
  - SampleListTable.tsx
  - SampleForm.tsx
  - SampleDetail.tsx
  - SampleMediaGallery.tsx (photos/files)
  - SampleQRCode.tsx
  ```

#### Test Management
- [ ] Routes:
  ```
  app/(dashboard)/test-management/tests/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Test execution view
      ├── edit/page.tsx
      └── results/page.tsx # Test results
  ```

- [ ] Components:
  ```typescript
  - TestListTable.tsx
  - TestForm.tsx
  - TestExecutionView.tsx
  - TestResultsForm.tsx
  ```

#### Testing
- [ ] CRUD tests for both
- [ ] Media upload tests

---

### Day 12-13: TestSuite CRUD
**Mục tiêu**: Hoàn thiện test suite management

#### Tasks
- [ ] Routes:
  ```
  app/(dashboard)/test-management/suites/
  ├── page.tsx           # List suites
  ├── new/page.tsx       # Create suite
  └── [id]/
      ├── page.tsx       # Suite detail
      ├── edit/page.tsx
      └── tests/page.tsx # Tests in suite
  ```

- [ ] Components:
  ```typescript
  - TestSuiteListTable.tsx
  - TestSuiteForm.tsx
  - TestSuiteDetail.tsx
  - TestSuiteBuilder.tsx (drag-drop tests)
  - SuiteTemplateSelector.tsx
  ```

- [ ] Features:
  - Template system for common test suites
  - Drag-drop test ordering
  - Bulk test assignment
  - Suite duplication

#### Testing
- [ ] CRUD tests
- [ ] Template tests
- [ ] Assignment tests

---

### Day 14-15: TestReport CRUD
**Mục tiêu**: Hoàn thiện test report system

#### Tasks
- [ ] Routes:
  ```
  app/(dashboard)/test-management/reports/
  ├── page.tsx           # List reports
  ├── new/page.tsx       # Generate report
  └── [id]/
      ├── page.tsx       # Report viewer
      ├── edit/page.tsx  # Edit report
      └── export/page.tsx # Export options
  ```

- [ ] Components:
  ```typescript
  - TestReportListTable.tsx
  - ReportGeneratorForm.tsx
  - ReportViewer.tsx (with charts/tables)
  - ReportExporter.tsx (PDF/Excel)
  - ReportTemplateSelector.tsx
  ```

- [ ] Features:
  - Auto-generate from completed tests
  - Custom report templates
  - Pass/Fail summary
  - Charts and visualizations
  - PDF/Excel export
  - Email distribution

#### Testing
- [ ] Report generation tests
- [ ] Export tests
- [ ] Template tests

---

### Day 16-17: Testing Vertical Integration & Polish
**Mục tiêu**: Tích hợp và hoàn thiện testing vertical

#### Tasks
- [ ] Add Pusher events for all testing entities
- [ ] Add permission checks to all actions
- [ ] Add cache revalidation
- [ ] Polish all UI components
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Integration testing
- [ ] E2E testing: Full testing workflow

#### E2E Test Flow
```
1. Create Customer & Opportunity
2. Create TestOrder
3. Add Samples with media
4. Assign TestSuite
5. Execute Tests
6. Generate TestReport
7. Export and email report
```

---

## TUẦN 3: FINANCE & BILLING (5-7 ngày)

### Day 18-19: Invoice Module
**Mục tiêu**: Tạo hệ thống quản lý hóa đơn

#### Backend Tasks
- [ ] Tạo `lib/features/invoices/` structure
  ```
  invoices/
  ├── repositories/
  │   └── invoice.repository.ts
  ├── services/
  │   └── invoice.service.ts
  ├── actions/
  │   └── invoice.actions.ts
  ├── types/
  │   └── invoice.types.ts
  └── index.ts
  ```

- [ ] Repository: `invoice.repository.ts`
  ```typescript
  - getAllInvoices(filters?)
  - getInvoiceById(id)
  - createInvoice(data)
  - updateInvoice(id, data)
  - deleteInvoice(id)
  - getInvoicesByCustomer(customerId)
  - markAsPaid(id, paymentId)
  ```

- [ ] Service: `invoice.service.ts`
  ```typescript
  // Business logic
  - Generate invoice number
  - Calculate totals (subtotal, tax, total)
  - Send invoice email
  - Generate PDF
  - Process payment
  - Handle payment status updates
  ```

- [ ] Actions: `invoice.actions.ts` (with permissions)

#### Frontend Tasks
- [ ] Tạo routes:
  ```
  app/(dashboard)/billing/invoices/
  ├── page.tsx           # List invoices
  ├── new/page.tsx       # Create invoice
  └── [id]/
      ├── page.tsx       # Invoice detail
      ├── edit/page.tsx  # Edit invoice
      ├── preview/page.tsx # Print preview
      └── pay/page.tsx   # Payment form
  ```

- [ ] Components:
  ```typescript
  - InvoiceListTable.tsx
  - InvoiceForm.tsx
  - InvoiceDetail.tsx
  - InvoicePreview.tsx (print-friendly)
  - PaymentForm.tsx
  - InvoiceStatusBadge.tsx
  ```

#### Testing
- [ ] CRUD tests
- [ ] Payment processing tests
- [ ] PDF generation tests

---

### Day 20-21: Subscription Module
**Mục tiêu**: Tạo hệ thống quản lý subscription

#### Backend Tasks
- [ ] Tạo `lib/features/subscriptions/` structure

- [ ] Repository: `subscriptions.repository.ts`
  ```typescript
  - getAllSubscriptions(filters?)
  - getSubscriptionById(id)
  - createSubscription(data)
  - updateSubscription(id, data)
  - cancelSubscription(id)
  - renewSubscription(id)
  - getSubscriptionsByUser(userId)
  - getSubscriptionHistory(subscriptionId)
  ```

- [ ] Service: `subscriptions.service.ts`
  ```typescript
  // Business logic
  - Calculate pricing based on plan
  - Handle subscription lifecycle
  - Process renewals
  - Send renewal reminders
  - Handle cancellations
  - Apply discounts/coupons
  ```

- [ ] Actions: `subscriptions.actions.ts` (with permissions)

#### Frontend Tasks
- [ ] Tạo routes:
  ```
  app/(dashboard)/billing/subscriptions/
  ├── page.tsx           # List subscriptions
  ├── new/page.tsx       # Create subscription
  └── [id]/
      ├── page.tsx       # Subscription detail
      ├── edit/page.tsx  # Edit/upgrade/downgrade
      ├── cancel/page.tsx # Cancel subscription
      └── history/page.tsx # Subscription history
  ```

- [ ] Components:
  ```typescript
  - SubscriptionListTable.tsx
  - SubscriptionForm.tsx
  - SubscriptionDetail.tsx
  - PlanSelector.tsx
  - UpgradeDowngradeFlow.tsx
  - BillingHistoryTable.tsx
  ```

#### Testing
- [ ] CRUD tests
- [ ] Lifecycle tests
- [ ] Payment integration tests

---

### Day 22-23: Payment Integration & Polish
**Mục tiêu**: Tích hợp payment gateway và hoàn thiện

#### Tasks
- [ ] Wire Payment model to Invoices
- [ ] Stripe/payment gateway integration
- [ ] Payment webhooks handler
- [ ] Refund processing
- [ ] Payment history views
- [ ] Invoice auto-generation from subscriptions
- [ ] Email notifications for billing events
- [ ] Add all Pusher events
- [ ] Add permission checks
- [ ] Integration testing

#### Routes
```
app/(dashboard)/billing/
├── page.tsx               # Billing overview
├── payment-methods/page.tsx # Manage payment methods
└── history/page.tsx       # Payment history
```

---

## TUẦN 4: DESIGN PROJECTS (7-10 ngày)

### Day 24-25: DesignProject & DesignBrief CRUD
**Mục tiêu**: Hoàn thiện project và brief management

#### DesignProject
- [ ] Routes:
  ```
  app/(dashboard)/design-projects/projects/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Project overview
      ├── edit/page.tsx
      ├── briefs/page.tsx # Project briefs
      └── timeline/page.tsx # Project timeline
  ```

- [ ] Components:
  ```typescript
  - ProjectListTable.tsx
  - ProjectForm.tsx
  - ProjectOverview.tsx
  - ProjectTimeline.tsx
  - ProjectStatusTracker.tsx
  ```

#### DesignBrief
- [ ] Routes:
  ```
  app/(dashboard)/design-projects/briefs/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Brief detail
      ├── edit/page.tsx
      └── approve/page.tsx # Approval workflow
  ```

- [ ] Components:
  ```typescript
  - BriefListTable.tsx
  - BriefForm.tsx
  - BriefDetail.tsx
  - ApprovalWorkflow.tsx
  ```

#### Testing
- [ ] CRUD tests for both
- [ ] Workflow tests

---

### Day 26-27: DesignDeck & ProductDesign CRUD
**Mục tiêu**: Hoàn thiện design deck và product design

#### DesignDeck
- [ ] Routes:
  ```
  app/(dashboard)/design-projects/design-decks/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Deck viewer
      ├── edit/page.tsx
      └── present/page.tsx # Presentation mode
  ```

- [ ] Components:
  ```typescript
  - DeckListTable.tsx
  - DeckEditor.tsx
  - DeckViewer.tsx (gallery/slideshow)
  - DeckPresenter.tsx
  ```

#### ProductDesign
- [ ] Routes:
  ```
  app/(dashboard)/design-projects/designs/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Design detail
      ├── edit/page.tsx
      └── versions/page.tsx # Design versions
  ```

- [ ] Components:
  ```typescript
  - DesignListGrid.tsx
  - DesignForm.tsx
  - DesignDetail.tsx
  - DesignVersionHistory.tsx
  - DesignComparison.tsx
  ```

#### Testing
- [ ] CRUD tests
- [ ] Version control tests

---

### Day 28-29: TechPack & DesignReview CRUD
**Mục tiêu**: Hoàn thiện tech pack và design review

#### TechPack
- [ ] Routes:
  ```
  app/(dashboard)/design-projects/tech-packs/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Tech pack detail
      ├── edit/page.tsx
      └── export/page.tsx # Export tech pack
  ```

- [ ] Components:
  ```typescript
  - TechPackListTable.tsx
  - TechPackForm.tsx
  - TechPackDetail.tsx
  - TechPackExporter.tsx (PDF)
  - SpecificationEditor.tsx
  ```

#### DesignReview
- [ ] Routes:
  ```
  app/(dashboard)/design-projects/design-reviews/
  ├── page.tsx
  ├── new/page.tsx
  └── [id]/
      ├── page.tsx       # Review detail
      ├── edit/page.tsx
      └── feedback/page.tsx # Collect feedback
  ```

- [ ] Components:
  ```typescript
  - ReviewListTable.tsx
  - ReviewForm.tsx
  - ReviewDetail.tsx
  - FeedbackCollector.tsx
  - ReviewStatusTracker.tsx
  ```

#### Testing
- [ ] CRUD tests
- [ ] Export tests
- [ ] Feedback workflow tests

---

### Day 30-31: Design Projects Integration
**Mục tiêu**: Tích hợp và hoàn thiện design vertical

#### Tasks
- [ ] Wire all modules together
- [ ] Project workflow: Brief → Deck → Designs → TechPack → Review → Approval
- [ ] Add approval workflows
- [ ] Add media galleries for all entities
- [ ] Customer approval interface
- [ ] Add Pusher events
- [ ] Add permission checks
- [ ] Polish all UIs
- [ ] Integration testing
- [ ] E2E testing

---

## TUẦN 5: POLISH & TESTING (5 ngày)

### Day 32: Marketing Polish
**Mục tiêu**: Hoàn thiện marketing features

#### Tasks
- [ ] Add CampaignEmail tracking UI
  ```
  app/(dashboard)/marketing/campaigns/[id]/emails/page.tsx
  ```
- [ ] Email statistics dashboard
- [ ] Email preview/send interface
- [ ] A/B testing support
- [ ] Add tests

---

### Day 33: Blog/Post System Polish
**Mục tiêu**: Hoàn thiện blog system

#### Tasks
- [ ] Polish Post CRUD pages
- [ ] Add rich text editor (Lexical)
- [ ] Add featured image support
- [ ] Add post scheduling
- [ ] Add post preview
- [ ] Add SEO metadata fields
- [ ] Add tests

---

### Day 34: Testing & Documentation
**Mục tiêu**: Complete testing và documentation

#### Tasks
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run E2E tests for critical flows
- [ ] Fix failing tests
- [ ] Improve test coverage to ≥ 80%
- [ ] Update all documentation
- [ ] Update API documentation
- [ ] Update copilot instructions
- [ ] Create deployment checklist

---

### Day 35: Final Review & Deploy Prep
**Mục tiêu**: Final review and deployment preparation

#### Tasks
- [ ] Code review of all new features
- [ ] Type check: `pnpm exec tsc --noEmit`
- [ ] Lint check: `pnpm lint`
- [ ] Build check: `pnpm build`
- [ ] Performance testing
- [ ] Security audit
- [ ] Database migration scripts
- [ ] Seed data for new features
- [ ] Create deployment guide
- [ ] Create user training materials

---

## CHECKLIST HOÀN THIỆN FEATURE

Mỗi feature cần đánh dấu hoàn thành:

### Backend
- [ ] Repository với tất cả CRUD operations
- [ ] Service với business logic và validation
- [ ] Actions với `requirePermission()` checks
- [ ] Types và interfaces đầy đủ
- [ ] Barrel export trong `index.ts`
- [ ] Pusher events on mutations
- [ ] Cache revalidation via `revalidatePath()`

### Frontend
- [ ] List page với filters và pagination
- [ ] Create page với form validation
- [ ] Detail page với all entity data
- [ ] Edit page với pre-filled form
- [ ] Components reusable và documented
- [ ] Loading states
- [ ] Error handling
- [ ] Success notifications

### Testing
- [ ] Unit tests cho repositories
- [ ] Unit tests cho services
- [ ] Unit tests cho actions
- [ ] Integration tests cho workflows
- [ ] E2E tests cho critical flows
- [ ] Permission tests
- [ ] Coverage ≥ 80%

### Documentation
- [ ] Feature documented
- [ ] API endpoints documented
- [ ] Usage examples
- [ ] Screenshots nếu cần

---

## DAILY WORKFLOW

### Morning (9:00 - 12:00)
1. Review previous day's work
2. Check tests passing
3. Implement backend (repositories → services → actions)
4. Write unit tests

### Afternoon (13:00 - 17:00)
1. Implement frontend (routes → components)
2. Wire backend to frontend
3. Add Pusher events and permissions
4. Write integration tests

### Evening (Optional polish time)
1. Code review
2. Documentation updates
3. Bug fixes
4. Performance optimization

---

## SUCCESS CRITERIA

✅ **Feature Complete When:**
- [ ] All CRUD operations working
- [ ] Permission checks in place
- [ ] Real-time updates working
- [ ] Tests passing with ≥ 80% coverage
- [ ] TypeScript with no errors
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] User tested

✅ **Project Complete When:**
- [ ] All 18 missing features implemented
- [ ] All 94 database models have working UI
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Ready for production deployment

---

## TRACKING PROGRESS

### Weekly Updates
- End of Week 1: Training & Support ✅
- End of Week 2: Testing Vertical ✅
- End of Week 3: Finance & Billing ✅
- End of Week 4: Design Projects ✅
- End of Week 5: Polish & Deploy Ready ✅

### Daily Stand-up Questions
1. What did I complete yesterday?
2. What will I complete today?
3. Any blockers?
4. Tests passing?

---

**Last Updated**: December 11, 2025  
**Status**: Ready to Execute  
**Next Action**: Start Day 1 - SOPLibrary Module
