# Training x Support - Implementation Checklist

**Phase-by-Phase Implementation Guide with Copy-Paste Code**

---

## PHASE 1: DATABASE SCHEMA (1-2 Days)

### Step 1.1: Add Enums to Prisma Schema

**File**: `prisma/schema.prisma` (after existing enums)

Copy and paste these enums:

```prisma
// Training x Support Enums
enum TrainingType {
  INSTRUCTOR_LED
  SELF_PACED
  BLENDED
  WORKSHOP
  MENTORING
  CERTIFICATION_PREP
}

enum DeliveryMethod {
  IN_PERSON
  ONLINE
  HYBRID
  ASYNCHRONOUS
  RECORDED
}

enum TrainingStatus {
  PLANNING
  DISCOVERY
  DESIGN
  SCHEDULED
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum TrainingPhase {
  DISCOVERY
  DESIGN
  DEVELOPMENT
  DELIVERY
  ASSESSMENT
  SUPPORT
}

enum CertificationLevel {
  NONE
  COMPLETION
  COMPETENCY
  EXTERNAL_ALIGNED
}

enum SessionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RECORDED
}

enum AttendeeStatus {
  INVITED
  REGISTERED
  ATTENDED
  PARTIAL
  DROPPED
  COMPLETED
}

enum ParticipantRole {
  LEARNER
  FACILITATOR
  OBSERVER
  GUEST_LECTURER
}

enum CompetencyLevel {
  NOVICE
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

enum AssessmentType {
  QUIZ
  PRACTICAL
  CERTIFICATION
  SURVEY
  SELF_ASSESSMENT
}

enum TimingType {
  PRE
  MID
  POST
}

enum AssessmentStatus {
  NOT_TAKEN
  IN_PROGRESS
  COMPLETED
  GRADED
  PASSED
  FAILED
}

enum ReportType {
  COMPLETION
  COMPETENCY
  CERTIFICATION
  EVALUATION
}

enum ReportStatus {
  DRAFT
  REVIEW
  APPROVED
  PUBLISHED
}

enum PlanStatus {
  DRAFT
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum SOPStatus {
  DRAFT
  ACTIVE
  ARCHIVED
  DEPRECATED
}
```

### Step 1.2: Add Models to Prisma Schema

**File**: `prisma/schema.prisma` (after TestOrder and related test models)

Copy and paste these 7 models:

```prisma
model TrainingEngagement {
  id                 String                 @id @default(cuid())
  engagementId       String
  customerId         String
  title              String
  description        String?                @db.Text
  trainingType       TrainingType           @default(INSTRUCTOR_LED)
  deliveryMethod     DeliveryMethod         @default(HYBRID)
  startDate          DateTime?
  endDate            DateTime?
  totalDurationHours Float?
  targetAudience     String?
  maxParticipants    Int?
  minParticipants    Int?
  status             TrainingStatus         @default(PLANNING)
  phase              TrainingPhase          @default(DISCOVERY)
  certificationLevel CertificationLevel     @default(NONE)
  requestedBy        String
  instructorId       String?
  coordinatorId      String?
  contactId          String?
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt
  startedAt          DateTime?
  completedAt        DateTime?
  createdBy          String?
  updatedBy          String?
  metaData           Json?
  
  engagement         Engagement             @relation(fields: [engagementId], references: [id], onDelete: Cascade)
  customer           Customer               @relation(fields: [customerId], references: [id], onDelete: Cascade)
  contact            Contact?               @relation(fields: [contactId], references: [id])
  sessions           TrainingSession[]
  attendees          TrainingAttendee[]
  assessments        Assessment[]
  reports            TrainingReport[]
  implementationPlan ImplementationPlan?
  
  @@index([engagementId])
  @@index([customerId])
  @@index([status])
  @@index([phase])
  @@index([instructorId])
  @@index([startDate])
  @@index([completedAt])
}

model TrainingSession {
  id                    String            @id @default(cuid())
  trainingEngagementId  String
  title                 String
  description           String?           @db.Text
  sessionNumber         Int
  deliveryMethod        DeliveryMethod    @default(HYBRID)
  duration              Float
  contentUrl            String?
  location              String?
  startDate             DateTime
  endDate               DateTime
  instructorId          String?
  maxCapacity           Int?
  status                SessionStatus     @default(PLANNED)
  sopLibraryIds         String?
  hasPreAssessment      Boolean           @default(false)
  hasPostAssessment     Boolean           @default(false)
  preRequisiteLevel     CompetencyLevel?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  recordedUrl           String?
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  attendances           TrainingAttendee[]
  assessments           Assessment[]
  
  @@index([trainingEngagementId])
  @@index([startDate])
  @@index([status])
  @@index([instructorId])
}

model TrainingAttendee {
  id                    String            @id @default(cuid())
  trainingEngagementId  String
  userId                String?
  contactId             String?
  sessionIds            String?
  registrationStatus    AttendeeStatus    @default(INVITED)
  registeredAt          DateTime          @default(now())
  completionDate        DateTime?
  participantRole       ParticipantRole   @default(LEARNER)
  attendancePercentage  Float?
  baselineScore         Float?
  finalScore            Float?
  competencyGained      CompetencyLevel?
  certificationIssued   Boolean           @default(false)
  certificateId         String?
  assignedImplementationTasks Int?
  completedImplementationTasks Int?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  user                  User?             @relation(fields: [userId], references: [id])
  contact               Contact?          @relation(fields: [contactId], references: [id])
  assessmentScores      Assessment[]
  
  @@index([trainingEngagementId])
  @@index([userId])
  @@index([registrationStatus])
  @@index([registeredAt])
}

model Assessment {
  id                    String            @id @default(cuid())
  trainingEngagementId  String
  trainingSessionId     String?
  trainingAttendeeId    String?
  title                 String
  description           String?           @db.Text
  assessmentType        AssessmentType    @default(QUIZ)
  administrationTiming  TimingType        @default(POST)
  dueDate               DateTime?
  questions             String?
  passingScore          Float?
  status                AssessmentStatus  @default(NOT_TAKEN)
  score                 Float?
  competencyLevel       CompetencyLevel?
  feedback              String?
  reviewedAt            DateTime?
  reviewedBy            String?
  attachmentIds         String?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  takenAt               DateTime?
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  trainingSession       TrainingSession?  @relation(fields: [trainingSessionId], references: [id], onDelete: SetNull)
  trainee               TrainingAttendee? @relation(fields: [trainingAttendeeId], references: [id], onDelete: Cascade)
  
  @@index([trainingEngagementId])
  @@index([trainingAttendeeId])
  @@index([assessmentType])
  @@index([status])
  @@index([competencyLevel])
  @@index([takenAt])
}

model TrainingReport {
  id                    String            @id @default(cuid())
  trainingEngagementId  String            @unique
  title                 String
  description           String?           @db.Text
  reportType            ReportType        @default(COMPLETION)
  totalParticipants     Int?
  totalAttended         Int?
  completionRate        Float?
  averageScore          Float?
  overallCompetency     CompetencyLevel?
  passedCount           Int               @default(0)
  failedCount           Int               @default(0)
  averageAttendance     Float?
  certificationsIssued  Int               @default(0)
  certificationTemplate String?
  keyFindings           String?           @db.Text
  recommendations       String?           @db.Text
  successMetrics        Json?
  status                ReportStatus      @default(DRAFT)
  publishedAt           DateTime?
  publishedBy           String?
  reportFileId          String?
  certificatesFileId    String?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  reportDate            DateTime          @default(now())
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  
  @@index([trainingEngagementId])
  @@index([status])
  @@index([reportDate])
}

model ImplementationPlan {
  id                    String            @id @default(cuid())
  trainingEngagementId  String            @unique
  title                 String
  description           String?           @db.Text
  startDate             DateTime
  endDate               DateTime
  estimatedDurationDays Int?
  goals                 String?           @db.Text
  successCriteria       String?           @db.Text
  applicableDepartments String?
  applicableRoles       String?
  status                PlanStatus        @default(DRAFT)
  ownerUserId           String?
  supportContactId      String?
  totalTasks            Int               @default(0)
  completedTasks        Int               @default(0)
  progressPercentage    Float?
  reviewedAt            DateTime?
  reviewedBy            String?
  approvedAt            DateTime?
  approvedBy            String?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  
  @@index([trainingEngagementId])
  @@index([status])
  @@index([endDate])
}

model SOPLibrary {
  id                    String            @id @default(cuid())
  title                 String
  slug                  String            @unique
  description           String?           @db.Text
  category              String?
  content               String            @db.Text
  version               Int               @default(1)
  versionNotes          String?
  applicableDepartments String?
  applicableRoles       String?
  requiredCertifications String?
  status                SOPStatus         @default(DRAFT)
  effectiveDate         DateTime?
  sunsetDate            DateTime?
  attachmentIds         String?
  coverImageId          String?
  lastReviewedAt        DateTime?
  lastReviewedBy        String?
  reviewCycleMonths     Int               @default(12)
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  @@index([slug])
  @@index([category])
  @@index([status])
  @@index([createdAt])
}
```

### Step 1.3: Update Engagement Model

**File**: `prisma/schema.prisma` (find the Engagement model)

Add this field to the Engagement model:

```prisma
trainingEngagements TrainingEngagement[]  // Add this line
```

### Step 1.4: Update Customer Model

**File**: `prisma/schema.prisma` (find the Customer model)

Add this field to the Customer model if not present:

```prisma
trainingEngagements TrainingEngagement[]  // Add this line
```

### Step 1.5: Update Contact Model

**File**: `prisma/schema.prisma` (find the Contact model)

Add this field to the Contact model if not present:

```prisma
trainingEngagements TrainingEngagement[]  // Add this line
trainingAttendees   TrainingAttendee[]    // Add this line
```

### Step 1.6: Run Database Migration

```bash
cd /Users/nguyenpham/Source\ Code/madeapp

# Create migration
yarn db:migrate

# When prompted, enter migration name:
# add-training-models

# Generate Prisma client
yarn db:generate

# Verify in Prisma Studio
yarn db:studio
```

### Step 1.7: Verification Checklist

- [ ] All 7 models created successfully
- [ ] All 11 enums defined
- [ ] Migration completed without errors
- [ ] `@/generated/prisma` updated with new models
- [ ] All enums exported and accessible
- [ ] No schema validation errors

---

## PHASE 2: TYPE DEFINITIONS (1 Day)

### Step 2.1: Create Types File

**File**: `lib/features/training/types/training.types.ts`

Copy and paste:

```typescript
import {
  TrainingStatus,
  TrainingPhase,
  TrainingType,
  DeliveryMethod,
  CertificationLevel,
  SessionStatus,
  AttendeeStatus,
  ParticipantRole,
  CompetencyLevel,
  AssessmentType,
  TimingType,
  AssessmentStatus,
  ReportType,
  ReportStatus,
  PlanStatus,
  SOPStatus,
} from "@/generated/prisma";

// ============= BASE TYPES =============

export interface TrainingEngagementType {
  id: string;
  engagementId: string;
  customerId: string;
  title: string;
  description?: string | null;
  trainingType: TrainingType;
  deliveryMethod: DeliveryMethod;
  startDate?: Date | null;
  endDate?: Date | null;
  totalDurationHours?: number | null;
  targetAudience?: string | null;
  maxParticipants?: number | null;
  minParticipants?: number | null;
  status: TrainingStatus;
  phase: TrainingPhase;
  certificationLevel: CertificationLevel;
  requestedBy: string;
  instructorId?: string | null;
  coordinatorId?: string | null;
  contactId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

export interface TrainingSessionType {
  id: string;
  trainingEngagementId: string;
  title: string;
  description?: string | null;
  sessionNumber: number;
  deliveryMethod: DeliveryMethod;
  duration: number;
  contentUrl?: string | null;
  location?: string | null;
  startDate: Date;
  endDate: Date;
  instructorId?: string | null;
  maxCapacity?: number | null;
  status: SessionStatus;
  sopLibraryIds?: string | null;
  hasPreAssessment: boolean;
  hasPostAssessment: boolean;
  preRequisiteLevel?: CompetencyLevel | null;
  createdAt: Date;
  updatedAt: Date;
  recordedUrl?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

export interface TrainingAttendeeType {
  id: string;
  trainingEngagementId: string;
  userId?: string | null;
  contactId?: string | null;
  sessionIds?: string | null;
  registrationStatus: AttendeeStatus;
  registeredAt: Date;
  completionDate?: Date | null;
  participantRole: ParticipantRole;
  attendancePercentage?: number | null;
  baselineScore?: number | null;
  finalScore?: number | null;
  competencyGained?: CompetencyLevel | null;
  certificationIssued: boolean;
  certificateId?: string | null;
  assignedImplementationTasks?: number | null;
  completedImplementationTasks?: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

export interface AssessmentType {
  id: string;
  trainingEngagementId: string;
  trainingSessionId?: string | null;
  trainingAttendeeId?: string | null;
  title: string;
  description?: string | null;
  assessmentType: AssessmentType;
  administrationTiming: TimingType;
  dueDate?: Date | null;
  questions?: string | null;
  passingScore?: number | null;
  status: AssessmentStatus;
  score?: number | null;
  competencyLevel?: CompetencyLevel | null;
  feedback?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  attachmentIds?: string | null;
  createdAt: Date;
  updatedAt: Date;
  takenAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

export interface TrainingReportType {
  id: string;
  trainingEngagementId: string;
  title: string;
  description?: string | null;
  reportType: ReportType;
  totalParticipants?: number | null;
  totalAttended?: number | null;
  completionRate?: number | null;
  averageScore?: number | null;
  overallCompetency?: CompetencyLevel | null;
  passedCount: number;
  failedCount: number;
  averageAttendance?: number | null;
  certificationsIssued: number;
  certificationTemplate?: string | null;
  keyFindings?: string | null;
  recommendations?: string | null;
  successMetrics?: Record<string, any> | null;
  status: ReportStatus;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  reportFileId?: string | null;
  certificatesFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  reportDate: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

export interface ImplementationPlanType {
  id: string;
  trainingEngagementId: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  estimatedDurationDays?: number | null;
  goals?: string | null;
  successCriteria?: string | null;
  applicableDepartments?: string | null;
  applicableRoles?: string | null;
  status: PlanStatus;
  ownerUserId?: string | null;
  supportContactId?: string | null;
  totalTasks: number;
  completedTasks: number;
  progressPercentage?: number | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

export interface SOPLibraryType {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  content: string;
  version: number;
  versionNotes?: string | null;
  applicableDepartments?: string | null;
  applicableRoles?: string | null;
  requiredCertifications?: string | null;
  status: SOPStatus;
  effectiveDate?: Date | null;
  sunsetDate?: Date | null;
  attachmentIds?: string | null;
  coverImageId?: string | null;
  lastReviewedAt?: Date | null;
  lastReviewedBy?: string | null;
  reviewCycleMonths: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  metaData?: Record<string, any> | null;
}

// ============= INPUT TYPES =============

export interface CreateTrainingEngagementInput {
  engagementId: string;
  customerId: string;
  title: string;
  description?: string;
  trainingType?: TrainingType;
  deliveryMethod?: DeliveryMethod;
  startDate?: Date;
  endDate?: Date;
  totalDurationHours?: number;
  targetAudience?: string;
  maxParticipants?: number;
  minParticipants?: number;
  certificationLevel?: CertificationLevel;
  requestedBy: string;
  instructorId?: string;
  coordinatorId?: string;
  contactId?: string;
  metaData?: Record<string, any>;
}

export interface UpdateTrainingEngagementInput {
  title?: string;
  description?: string;
  trainingType?: TrainingType;
  deliveryMethod?: DeliveryMethod;
  startDate?: Date;
  endDate?: Date;
  totalDurationHours?: number;
  targetAudience?: string;
  maxParticipants?: number;
  minParticipants?: number;
  status?: TrainingStatus;
  phase?: TrainingPhase;
  certificationLevel?: CertificationLevel;
  instructorId?: string;
  coordinatorId?: string;
  contactId?: string;
  metaData?: Record<string, any>;
}

// Similar input interfaces for other models...
// (Create/Update patterns for all 7 models)

// ============= FILTER TYPES =============

export interface TrainingEngagementFilter {
  search?: string;
  status?: TrainingStatus;
  phase?: TrainingPhase;
  trainingType?: TrainingType;
  customerId?: string;
  instructorId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  sortBy?: "createdAt" | "startDate" | "completedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Similar filter interfaces for other models...

// ============= RESPONSE TYPES =============

export interface ActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============= RELATION TYPES =============

export interface TrainingEngagementWithRelations extends TrainingEngagementType {
  sessions: TrainingSessionType[];
  attendees: TrainingAttendeeType[];
  assessments: AssessmentType[];
  reports: TrainingReportType[];
  implementationPlan?: ImplementationPlanType;
}

export interface TrainingSessionWithRelations extends TrainingSessionType {
  attendances: TrainingAttendeeType[];
  assessments: AssessmentType[];
}

export interface TrainingAttendeeWithRelations extends TrainingAttendeeType {
  assessmentScores: AssessmentType[];
}
```

### Step 2.2: Create Index File

**File**: `lib/features/training/types/index.ts`

```typescript
export * from "./training.types";
```

### Step 2.3: Type Checking

```bash
cd /Users/nguyenpham/Source\ Code/madeapp

# Run full type check
yarn check-types
```

### Step 2.4: Verification Checklist

- [ ] All types match database models
- [ ] No TypeScript compilation errors
- [ ] Input types cover Create/Update operations
- [ ] Filter types match query parameters
- [ ] Response types standardized
- [ ] Relations properly typed

---

## PHASE 3-7: IMPLEMENTATION PATH

### Phase 3: Repository Layer (2-3 days)
- Create `lib/features/training/repositories/` with 7 repository files
- Reference: `lib/features/testing/repositories/` for patterns
- Key methods: getAll, getById, create, update, delete, getByEngagementId

### Phase 4: Service Layer (2-3 days)
- Create `lib/features/training/services/` with 7 service files
- Reference: `lib/features/testing/services/` for patterns
- Implement validation, status transitions, calculations

### Phase 5: Server Actions (2 days)
- Create `lib/features/training/actions/` with 8 action files
- Use pattern: Permission check → Service call → Pusher trigger → Revalidate path

### Phase 6: UI Components (3-5 days)
- Create pages: `/training`, `/training/[id]`, `/training/[id]/sessions`, etc.
- Create components: Lists, forms, dialogs, status badges, progress indicators
- Reference: `app/(dashboard)/events/` and `app/(dashboard)/testing/` for patterns

### Phase 7: Testing & Validation (2-3 days)
- Write unit tests for services
- Write integration tests for actions
- Write E2E tests for workflows
- Target 80%+ coverage

---

## VERIFICATION CHECKLIST

### After Phase 1
```bash
✅ All enums visible in @/generated/prisma/enums
✅ All models created in database
✅ Migration successful
✅ No foreign key violations
✅ Indexes created
```

### After Phase 2
```bash
✅ yarn check-types passes
✅ All type definitions match models
✅ No TS errors
✅ Input validation ready
```

### After Phase 3
```bash
✅ All CRUD operations functional
✅ Filters working
✅ Pagination implemented
✅ Relations properly queried
```

### After Phase 4
```bash
✅ Business logic enforced
✅ Status transitions validated
✅ Calculations accurate
✅ Error messages descriptive
```

### After Phase 5
```bash
✅ Permission checks in place
✅ Real-time sync via Pusher
✅ Cache revalidation active
✅ Error handling complete
```

### After Phase 6
```bash
✅ All pages render
✅ All forms submit
✅ Real-time updates work
✅ Responsive design active
```

### After Phase 7
```bash
✅ Unit tests: 30+ passing
✅ Integration tests: 20+ passing
✅ E2E tests: 10+ passing
✅ Coverage: 80%+
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: Migration fails with foreign key constraint
**Solution**: Ensure Engagement and Customer models have trainEngagements relations added (Step 1.3-1.4)

### Issue: TypeScript errors after Phase 2
**Solution**: Verify all types are exported from `lib/features/training/types/index.ts`

### Issue: Prisma client not generating
**Solution**: Delete `node_modules/.prisma` and run `yarn db:generate` again

### Issue: Tests fail with database not found
**Solution**: Ensure migrations are applied: `yarn db:migrate`

---

**Implementation Status**: READY TO START
**Estimated Timeline**: 3-4 weeks for all 7 phases
**First Task**: Phase 1 (Copy enums and models to prisma/schema.prisma)
