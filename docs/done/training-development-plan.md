# Training x Support Vertical - Development Plan

**Status**: ✅ Complete Specification
**Version**: 1.0
**Date Created**: November 26, 2025
**Last Updated**: November 26, 2025

---

## Executive Summary

### Goal
Build a **Training x Support vertical** for MADE (OS) that enables delivery of training engagements, knowledge capture, assessment of learner competency, and post-training implementation support. This vertical is distinct from Events (which handles large-scale public events) and focuses on structured, customer-specific training programs with tracked outcomes and follow-up support.

### Key Differentiators from Events
| Aspect | Events | Training |
|--------|--------|----------|
| **Scope** | Large public events (100-1000+ attendees) | Focused training for teams (5-50 people) |
| **Duration** | Single day or multi-day sprint | Multi-session over weeks/months |
| **Outcome** | Attendance tracking | Skills certification + implementation |
| **Follow-up** | Post-event materials | Support tasks + SOP tracking |
| **Assessment** | Optional | Core component |
| **Documentation** | Event materials | SOP library + assessments |

### Scope & Approach
This vertical follows the **Testing & Design pattern**: a core engagement linked to structured business objects with versioning, approval workflows, and multi-phase execution.

**Pattern Foundation:**
- **TestOrder** → **TrainingEngagement** (main container)
- **Sample** → **TrainingSession** (execution units)
- **TestSuite** → **SOPLibrary** (reusable knowledge)
- **Test** → **Assessment** (competency checks)
- **TestReport** → **TrainingReport** (outcomes)
- **NEW**: **ImplementationPlan** (post-training support)

---

## Context & Analysis

### Why Training x Support is Different

#### 1. **Core Model Differences**
Testing workflows are **linear and measurement-focused**:
```
Test Order → Sample → Test → Report
   (one-time, capture data, archive)
```

Training workflows are **iterative with feedback loops**:
```
Training Engagement
  → Training Sessions (multi-phase)
  → Assessments (pre/during/post)
  → Training Report (outcome)
  → Implementation Plan (follow-up support)
```

#### 2. **Unique Features of Training**
- **Pre-training assessment** (baseline skill level)
- **Multiple training methods** (classroom, online, hybrid, self-paced)
- **Competency-based progression** (pre-req assessment before session)
- **Attendance + Engagement tracking** (similar to Events CheckIn)
- **Certification capability** (issue certificates upon completion)
- **Post-training support** (Implementation tasks, SOP tracking)
- **Knowledge reuse** (SOP Library shared across engagements)

#### 3. **Key Business Objects**
- **TrainingEngagement**: Main container (linked to Engagement model, type: TRAINING)
- **TrainingSession**: Individual learning unit (online/classroom/hybrid)
- **TrainingAttendee**: Participant registration (similar to Event Registration)
- **Assessment**: Pre/during/post learning evaluation (QUIZ, PRACTICAL, CERTIFICATION)
- **TrainingReport**: Learning outcome & certification (aggregate of assessments)
- **SOPLibrary**: Reusable standard operating procedures (linked to Sessions)
- **ImplementationPlan**: Post-training action items (follow-up support tasks)
- **ImplementationTask**: Specific action items (use generic Task model with entityType)

#### 4. **Workflow Overview**
```
Engagement Created (type: TRAINING)
    ↓
TrainingEngagement Setup (Discovery, Duration, Learner Audience)
    ↓
TrainingSession Creation (Content, Duration, Delivery Method)
    ↓
Pre-Training Assessment (Baseline Competency)
    ↓
Training Execution (TrainingAttendee Registration → Attendance)
    ↓
Mid/Post-Training Assessment (Competency Check)
    ↓
TrainingReport Generation (Certificate Issuance)
    ↓
ImplementationPlan Creation (Follow-up Tasks)
    ↓
Support Tracking (Task Completion, SOP Coverage)
```

---

## Database Design Specification

### Overview
**6 new models** (plus leveraging existing Engagement, Customer, Contact, Media, Task, Interaction):
1. **TrainingEngagement** - Main container
2. **TrainingSession** - Learning units
3. **TrainingAttendee** - Participant registrations
4. **Assessment** - Competency evaluations
5. **TrainingReport** - Outcomes & certificates
6. **ImplementationPlan** - Post-training support
7. **SOPLibrary** - Reusable knowledge base

### Model Details

#### 1. **TrainingEngagement** (47 lines)
**Purpose**: Main container for training delivery, linked to Engagement (type: TRAINING).

```prisma
model TrainingEngagement {
  id                 String                 @id @default(cuid())
  
  // Links to Engagement & Customer
  engagementId       String
  customerId         String
  
  // Basic Info
  title              String
  description        String?                @db.Text
  trainingType       TrainingType           @default(INSTRUCTOR_LED)
  deliveryMethod     DeliveryMethod         @default(HYBRID)
  
  // Scheduling
  startDate          DateTime?
  endDate            DateTime?
  totalDurationHours Float?
  
  // Participants
  targetAudience     String?                // Role/Department target
  maxParticipants    Int?
  minParticipants    Int?
  
  // Status & Workflow
  status             TrainingStatus         @default(PLANNING)
  phase              TrainingPhase          @default(DISCOVERY)
  certificationLevel CertificationLevel     @default(NONE)  // NONE, COMPLETION, COMPETENCY
  
  // Contact & Responsibility
  requestedBy        String                 // User ID
  instructorId       String?                // Assigned trainer
  coordinatorId      String?                // Program coordinator
  contactId          String?                // Primary participant contact
  
  // Dates
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt
  startedAt          DateTime?
  completedAt        DateTime?
  
  // Audit & Metadata
  createdBy          String?
  updatedBy          String?
  metaData           Json?
  
  // Relations
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
```

#### 2. **TrainingSession** (45 lines)
**Purpose**: Individual training module/class within an engagement.

```prisma
model TrainingSession {
  id                    String            @id @default(cuid())
  
  // Link to Engagement
  trainingEngagementId  String
  
  // Basic Info
  title                 String
  description           String?           @db.Text
  sessionNumber         Int               // Sequence in training program
  
  // Content & Delivery
  deliveryMethod        DeliveryMethod    @default(HYBRID)
  duration              Float             // Hours
  contentUrl            String?           // LMS link, video, etc.
  location              String?           // Physical location for in-person
  
  // Scheduling
  startDate             DateTime
  endDate               DateTime
  
  // Facilitation
  instructorId          String?           // Assigned trainer
  maxCapacity           Int?
  
  // Status
  status                SessionStatus     @default(PLANNED)
  
  // SOP Links
  sopLibraryIds         String?           // JSON array of SOP IDs
  
  // Assessment Settings
  hasPreAssessment      Boolean           @default(false)
  hasPostAssessment     Boolean           @default(false)
  preRequisiteLevel     CompetencyLevel?  // Required skill before session
  
  // Dates
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  recordedUrl           String?           // For recording/replay
  
  // Audit
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  // Relations
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  attendances           TrainingAttendee[]
  assessments           Assessment[]      // Pre/post assessments for this session
  
  @@index([trainingEngagementId])
  @@index([startDate])
  @@index([status])
  @@index([instructorId])
}
```

#### 3. **TrainingAttendee** (42 lines)
**Purpose**: Participant registration for training engagement (similar to Event Registration).

```prisma
model TrainingAttendee {
  id                    String            @id @default(cuid())
  
  // Links
  trainingEngagementId  String
  userId                String?           // Internal user
  contactId             String?           // External contact
  sessionIds            String?           // JSON array of attended sessions
  
  // Registration Info
  registrationStatus    AttendeeStatus    @default(INVITED)  // INVITED, REGISTERED, ATTENDED, DROPPED
  registeredAt          DateTime          @default(now())
  completionDate        DateTime?
  
  // Role
  participantRole       ParticipantRole   @default(LEARNER)  // LEARNER, FACILITATOR, OBSERVER
  
  // Performance Tracking
  attendancePercentage  Float?            // % of sessions attended
  baselineScore         Float?            // Pre-training assessment score
  finalScore            Float?            // Post-training assessment score
  competencyGained      CompetencyLevel?  // Assessed competency after training
  
  // Certification
  certificationIssued   Boolean           @default(false)
  certificateId         String?           // Reference to certificate (Media or custom)
  
  // Follow-up
  assignedImplementationTasks Int?        // Count of tasks assigned post-training
  completedImplementationTasks Int?       // Count of completed tasks
  
  // Dates
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  
  // Audit
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  // Relations
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  user                  User?             @relation(fields: [userId], references: [id])
  contact               Contact?          @relation(fields: [contactId], references: [id])
  assessmentScores      Assessment[]      // Assessments taken by this attendee
  
  @@index([trainingEngagementId])
  @@index([userId])
  @@index([registrationStatus])
  @@index([registeredAt])
}
```

#### 4. **Assessment** (48 lines)
**Purpose**: Competency evaluations at different stages (pre/during/post-training).

```prisma
model Assessment {
  id                    String            @id @default(cuid())
  
  // Links
  trainingEngagementId  String
  trainingSessionId     String?           // Optional - specific to a session
  trainingAttendeeId    String?           // Specific attendee (null if template)
  
  // Assessment Info
  title                 String
  description           String?           @db.Text
  assessmentType        AssessmentType    @default(QUIZ)  // QUIZ, PRACTICAL, CERTIFICATION, SURVEY
  
  // Timing
  administrationTiming  TimingType        @default(POST)  // PRE, MID, POST
  dueDate               DateTime?
  
  // Content
  questions             String?           // JSON array of questions
  passingScore          Float?            // Minimum score to pass
  
  // Results (for taken assessments)
  status                AssessmentStatus  @default(NOT_TAKEN)  // NOT_TAKEN, IN_PROGRESS, COMPLETED, PASSED, FAILED
  score                 Float?            // Actual score (0-100)
  competencyLevel       CompetencyLevel?  // NOVICE, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  feedback              String?           // Feedback from assessor
  reviewedAt            DateTime?
  reviewedBy            String?           // User ID (instructor/assessor)
  
  // Media
  attachmentIds         String?           // JSON array of Media IDs (answer documents, rubrics)
  
  // Dates
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  takenAt               DateTime?
  
  // Audit
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  // Relations
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
```

#### 5. **TrainingReport** (45 lines)
**Purpose**: Aggregate learning outcomes, competency summary, and certification tracking.

```prisma
model TrainingReport {
  id                    String            @id @default(cuid())
  
  // Links
  trainingEngagementId  String            @unique  // One report per engagement
  
  // Report Info
  title                 String
  description           String?           @db.Text
  reportType            ReportType        @default(COMPLETION)  // COMPLETION, COMPETENCY, CERTIFICATION
  
  // Engagement Summary
  totalParticipants     Int?
  totalAttended         Int?
  completionRate        Float?            // % of participants who completed
  averageScore          Float?
  overallCompetency     CompetencyLevel?  // NOVICE, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  
  // Assessment Results
  passedCount           Int               @default(0)
  failedCount           Int               @default(0)
  averageAttendance     Float?
  
  // Certification
  certificationsIssued  Int               @default(0)
  certificationTemplate String?           // Reference to certificate template
  
  // Key Findings
  keyFindings           String?           @db.Text
  recommendations       String?           @db.Text
  successMetrics        Json?             // Custom success metrics
  
  // Status
  status                ReportStatus      @default(DRAFT)  // DRAFT, REVIEW, APPROVED, PUBLISHED
  publishedAt           DateTime?
  publishedBy           String?
  
  // Media (certificates, PDFs)
  reportFileId          String?           // Report PDF or export
  certificatesFileId    String?           // Batch certificate file
  
  // Dates
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  reportDate            DateTime          @default(now())
  
  // Audit
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  // Relations
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  
  @@index([trainingEngagementId])
  @@index([status])
  @@index([reportDate])
}
```

#### 6. **ImplementationPlan** (41 lines)
**Purpose**: Post-training action items and support tracking.

```prisma
model ImplementationPlan {
  id                    String            @id @default(cuid())
  
  // Links
  trainingEngagementId  String            @unique  // One plan per engagement
  
  // Plan Info
  title                 String
  description           String?           @db.Text
  
  // Timeline
  startDate             DateTime
  endDate               DateTime
  estimatedDurationDays Int?
  
  // Goals
  goals                 String?           @db.Text
  successCriteria       String?           @db.Text
  
  // Scope
  applicableDepartments String?           // JSON array
  applicableRoles       String?           // JSON array
  
  // Status
  status                PlanStatus        @default(DRAFT)  // DRAFT, ACTIVE, ON_HOLD, COMPLETED
  
  // Coordination
  ownerUserId           String?           // Plan owner/coordinator
  supportContactId      String?           // MADE support contact
  
  // Progress
  totalTasks            Int               @default(0)
  completedTasks        Int               @default(0)
  progressPercentage    Float?            // Calculated: completedTasks / totalTasks
  
  // Review & Sign-off
  reviewedAt            DateTime?
  reviewedBy            String?           // MADE reviewer
  approvedAt            DateTime?
  approvedBy            String?           // Customer approval
  
  // Dates
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  
  // Audit
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  // Relations
  trainingEngagement    TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
  
  @@index([trainingEngagementId])
  @@index([status])
  @@index([endDate])
}
```

#### 7. **SOPLibrary** (37 lines)
**Purpose**: Reusable standard operating procedures linked to training sessions.

```prisma
model SOPLibrary {
  id                    String            @id @default(cuid())
  
  // Basic Info
  title                 String
  slug                  String            @unique
  description           String?           @db.Text
  category              String?           // Category (e.g., "Production", "QA", "Shipping")
  
  // Content
  content               String            @db.Text  // Lexical editor content
  version               Int               @default(1)
  versionNotes          String?
  
  // Applicability
  applicableDepartments String?           // JSON array
  applicableRoles       String?           // JSON array
  requiredCertifications String?          // JSON array of certification types
  
  // Status
  status                SOPStatus         @default(DRAFT)  // DRAFT, ACTIVE, ARCHIVED, DEPRECATED
  effectiveDate         DateTime?
  sunsetDate            DateTime?         // When SOP becomes obsolete
  
  // Tracking
  attachmentIds         String?           // JSON array of Media IDs (guides, templates)
  coverImageId          String?           // Cover/thumbnail
  
  // Usage
  lastReviewedAt        DateTime?
  lastReviewedBy        String?
  reviewCycleMonths     Int               @default(12)  // Annual review
  
  // Dates
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  
  // Audit
  createdBy             String?
  updatedBy             String?
  metaData              Json?
  
  // Relations (future: many-to-many to TrainingSession)
  
  @@index([slug])
  @@index([category])
  @@index([status])
  @@index([createdAt])
}
```

---

## Enums

### TrainingType
```prisma
enum TrainingType {
  INSTRUCTOR_LED      // Traditional classroom training
  SELF_PACED          // Online self-paced learning
  BLENDED             // Mix of instructor and self-paced
  WORKSHOP            // Hands-on workshop format
  MENTORING           // One-on-one mentoring
  CERTIFICATION_PREP  // Prep for external certification
}
```

### DeliveryMethod
```prisma
enum DeliveryMethod {
  IN_PERSON           // Physical classroom
  ONLINE              // Virtual/synchronous
  HYBRID              // Combination of in-person and online
  ASYNCHRONOUS        // Self-paced online (no live component)
  RECORDED            // Pre-recorded sessions
}
```

### TrainingStatus
```prisma
enum TrainingStatus {
  PLANNING            // Initial planning phase
  DISCOVERY           // Gathering requirements
  DESIGN              // Designing curriculum
  SCHEDULED           // Ready to execute
  IN_PROGRESS         // Currently running
  ON_HOLD             // Paused/suspended
  COMPLETED           // Finished and reported
  CANCELLED           // Cancelled
}
```

### TrainingPhase
```prisma
enum TrainingPhase {
  DISCOVERY           // Understand needs
  DESIGN              // Create curriculum
  DEVELOPMENT         // Develop materials
  DELIVERY            // Run training
  ASSESSMENT          // Measure outcomes
  SUPPORT             // Post-training support
}
```

### CertificationLevel
```prisma
enum CertificationLevel {
  NONE                // No certification
  COMPLETION          // Certificate of completion
  COMPETENCY          // Competency-based certification
  EXTERNAL_ALIGNED    // Aligned with external standards
}
```

### SessionStatus
```prisma
enum SessionStatus {
  PLANNED             // Not yet started
  IN_PROGRESS         // Currently running
  COMPLETED           // Finished
  CANCELLED           // Cancelled
  RECORDED            // Available as recording
}
```

### AttendeeStatus
```prisma
enum AttendeeStatus {
  INVITED             // Invitation sent
  REGISTERED          // Registered but not attended
  ATTENDED            // Participated
  PARTIAL             // Attended some sessions
  DROPPED             // Withdrew before completion
  COMPLETED           // Finished all sessions
}
```

### ParticipantRole
```prisma
enum ParticipantRole {
  LEARNER             // Participant learning content
  FACILITATOR         // Instructor/trainer
  OBSERVER            // Watching but not participating
  GUEST_LECTURER      // Guest speaker
}
```

### CompetencyLevel
```prisma
enum CompetencyLevel {
  NOVICE              // New to topic
  BEGINNER            // Basic understanding
  INTERMEDIATE        // Can perform with guidance
  ADVANCED            // Can perform independently
  EXPERT              // Can teach others / lead
}
```

### AssessmentType
```prisma
enum AssessmentType {
  QUIZ                // Knowledge test
  PRACTICAL           // Hands-on/skills test
  CERTIFICATION       // Formal certification exam
  SURVEY              // Feedback/satisfaction survey
  SELF_ASSESSMENT     // Learner self-evaluation
}
```

### TimingType
```prisma
enum TimingType {
  PRE                 // Before training (baseline)
  MID                 // During training (mid-course)
  POST                // After training (final)
}
```

### AssessmentStatus
```prisma
enum AssessmentStatus {
  NOT_TAKEN           // Not yet attempted
  IN_PROGRESS         // Started but not completed
  COMPLETED           // Submitted
  GRADED              // Reviewed and scored
  PASSED              // Passed (if applicable)
  FAILED              // Failed (if applicable)
}
```

### ReportType
```prisma
enum ReportType {
  COMPLETION          // Simple completion report
  COMPETENCY          // Competency-based assessment results
  CERTIFICATION       // Certification issuance report
  EVALUATION          // Training effectiveness evaluation
}
```

### ReportStatus
```prisma
enum ReportStatus {
  DRAFT               // Being prepared
  REVIEW              // Waiting for approval
  APPROVED            // Approved
  PUBLISHED           // Shared with stakeholders
}
```

### PlanStatus
```prisma
enum PlanStatus {
  DRAFT               // Being prepared
  ACTIVE              // Execution in progress
  ON_HOLD             // Paused
  COMPLETED           // All tasks done
  CANCELLED           // Cancelled
}
```

### SOPStatus
```prisma
enum SOPStatus {
  DRAFT               // Being authored
  ACTIVE              // In use
  ARCHIVED            // No longer used but kept for history
  DEPRECATED          // Replaced by newer version
}
```

---

## Key Relationships

### 1. **Engagement → TrainingEngagement** (1:1)
- One Training Engagement per Training-type Engagement
- Engagement holds high-level info, TrainingEngagement has training-specific fields

### 2. **TrainingEngagement → TrainingSession** (1:N)
- One training program has multiple sessions/modules
- Sessions ordered by sessionNumber
- Each session has start/end dates

### 3. **TrainingEngagement → TrainingAttendee** (1:N)
- Multiple participants per engagement
- Tracks individual attendance and performance
- Can include internal users or external contacts

### 4. **TrainingSession → TrainingAttendee** (N:M)
- Attendees attend multiple sessions
- Tracked via sessionIds JSON array in TrainingAttendee
- Can calculate attendance percentage

### 5. **TrainingSession → Assessment** (1:N)
- Pre/post assessments per session (optional)
- Or single comprehensive assessment for whole engagement

### 6. **TrainingAttendee → Assessment** (1:N)
- Each attendee takes assessments
- Multiple results tracked (pre, mid, post)
- Scores and competency levels recorded

### 7. **TrainingEngagement → TrainingReport** (1:1)
- One report per engagement
- Aggregate of all assessments and outcomes
- Generated at end of training

### 8. **TrainingEngagement → ImplementationPlan** (1:1)
- One plan per training engagement
- Created after training completion
- Tasks tracked separately (using generic Task model)

### 9. **SOPLibrary → TrainingSession** (N:M)
- Multiple SOPs per session
- Stored as sopLibraryIds JSON array in TrainingSession
- Can be reused across different trainings

---

## Data Flow Examples

### Scenario 1: Standard Instructor-Led Training

```
1. Customer contacts MADE about training needs
   → Create Engagement (type: TRAINING)
   → Create TrainingEngagement (title: "Manufacturing Best Practices")

2. Discovery & Design (2 weeks)
   → Create TrainingSession #1: "Safety Overview" (2 hours)
   → Create TrainingSession #2: "Production Setup" (4 hours)
   → Create TrainingSession #3: "Quality Control" (3 hours)
   → Link 5 relevant SOPLibrary items

3. Registration (1 week before)
   → Create TrainingAttendee #1 (John - contact)
   → Create TrainingAttendee #2 (Jane - contact)
   → Create TrainingAttendee #3 (Mike - user)
   → Status: REGISTERED

4. Pre-Training Assessment
   → Create Assessment #1 (type: QUIZ, timing: PRE)
   → John scores 45/100 (BEGINNER level)
   → Jane scores 62/100 (INTERMEDIATE level)

5. Training Delivery (Week of Dec 2)
   → Session #1: 2024-12-02, 9:00-11:00 (20 people attend)
   → Session #2: 2024-12-03, 9:00-13:00 (19 people, 1 absent)
   → Session #3: 2024-12-04, 13:00-16:00 (20 people attend)
   → Record attendance in TrainingAttendee.sessionIds

6. Post-Training Assessment
   → Create Assessment #2 (type: QUIZ, timing: POST)
   → John scores 78/100 (INTERMEDIATE level) ✓ PASSED
   → Jane scores 85/100 (ADVANCED level) ✓ PASSED
   → Mike scores 52/100 (BEGINNER level) ✗ FAILED

7. Report Generation
   → Create TrainingReport
   → totalParticipants: 3
   → passedCount: 2, failedCount: 1
   → averageScore: 71.7
   → competionsIssued: 2
   → status: DRAFT → APPROVED → PUBLISHED

8. Post-Training Support (2 months)
   → Create ImplementationPlan
   → Create Task #1: "John - Implement Safety procedures"
   → Create Task #2: "Jane - Lead quality audits"
   → Create Task #3: "Mike - Retake failed assessment"
   → Track completion over 60 days
```

### Scenario 2: Self-Paced + Assessment Training

```
1. Create TrainingEngagement
   → trainingType: SELF_PACED
   → deliveryMethod: ASYNCHRONOUS
   → startDate: 2025-01-01, endDate: 2025-03-31

2. Create TrainingSession #1
   → contentUrl: https://lms.example.com/course/123
   → duration: 8 hours (self-paced)
   → hasPreAssessment: true
   → hasPostAssessment: true

3. Registration
   → 15 team members registered

4. Pre-Assessment
   → QUIZ with 20 questions
   → Average score: 35/100

5. Self-Paced Learning
   → Tracked via LMS integration
   → Video views, quiz attempts, time spent
   → Progress: 0% → 30% → 60% → 100%

6. Post-Assessment
   → Same QUIZ, different questions
   → Average score: 78/100
   → 13 passed, 2 failed

7. Report
   → Certificate issued to 13
   → Recommendations for 2 who failed
```

---

## Implementation Benefits

### For MADE
1. **Systematic training delivery** with measurable outcomes
2. **Reusable SOPs** across customers (efficiency)
3. **Certification capability** as a service offering
4. **Post-training support** drives longer engagements and retention
5. **Assessment data** for training effectiveness validation

### For Customers
1. **Structured learning** with clear goals and milestones
2. **Competency verification** (certification)
3. **Follow-up support** ensures knowledge application
4. **SOP documentation** for ongoing reference
5. **Training records** for compliance and audits

### For MADE Employees
1. **Clear training delivery process** (less context switching)
2. **Reusable materials** (SOPs, assessments)
3. **Outcome tracking** (impact measurement)
4. **Scalability** (train trainers, outsource delivery)

---

## Implementation Roadmap

### Phase 1: Core Data Models (1-2 days)
**Deliverable**: Database schema with all 7 models

Steps:
1. Add enums to `prisma/schema.prisma` (all 11 enums)
2. Add models to `prisma/schema.prisma` (TrainingEngagement, TrainingSession, TrainingAttendee, Assessment, TrainingReport, ImplementationPlan, SOPLibrary)
3. Update Engagement model with relation to TrainingEngagement
4. Update Customer model with relation to TrainingEngagement (if not already present)
5. Run: `yarn db:migrate` (migration name: "add-training-models")
6. Run: `yarn db:generate` (regenerate Prisma client)

**Verification**:
- All 7 models exist in `@/generated/prisma`
- All enums exported
- No migration conflicts

### Phase 2: Type Definitions (1 day)
**Deliverable**: Complete TypeScript types file

Steps:
1. Create: `lib/features/training/types/training.types.ts`
2. Define base types (matching models)
3. Define input types (CreateTrainingEngagementInput, etc.)
4. Define filter types (TrainingEngagementFilter, etc.)
5. Define response types (ActionResult for all operations)
6. Run: `yarn check-types` (ensure zero type errors)

**Verification**:
- All types match models
- No TypeScript errors
- Input types have Zod validation schemas

### Phase 3: Repository Layer (2-3 days)
**Deliverable**: CRUD database access layer

Files:
- `lib/features/training/repositories/training-engagement.repository.ts`
- `lib/features/training/repositories/training-session.repository.ts`
- `lib/features/training/repositories/training-attendee.repository.ts`
- `lib/features/training/repositories/assessment.repository.ts`
- `lib/features/training/repositories/training-report.repository.ts`
- `lib/features/training/repositories/implementation-plan.repository.ts`
- `lib/features/training/repositories/sop-library.repository.ts`
- `lib/features/training/repositories/index.ts`

Methods per repository:
- `getAll()` with pagination & filters
- `getById(id)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `getByEngagementId()` (for related models)

**Verification**:
- All CRUD operations work
- Filters properly applied
- Pagination working

### Phase 4: Service Layer (2-3 days)
**Deliverable**: Business logic & validation layer

Files:
- `lib/features/training/services/training-engagement.service.ts`
- `lib/features/training/services/training-session.service.ts`
- `lib/features/training/services/training-attendee.service.ts`
- `lib/features/training/services/assessment.service.ts`
- `lib/features/training/services/training-report.service.ts`
- `lib/features/training/services/implementation-plan.service.ts`
- `lib/features/training/services/sop-library.service.ts`
- `lib/features/training/services/index.ts`

Key logic:
- Validation (dates, participant count, etc.)
- Status transitions (e.g., DRAFT → IN_PROGRESS only if has sessions)
- Calculations (attendance %, competency level, progress %)
- Assessment grading (calculate passing scores)
- Report generation (aggregate assessments, issue certificates)

**Verification**:
- Business rules enforced
- Proper error messages
- Transaction integrity

### Phase 5: Server Actions (2 days)
**Deliverable**: Public API with permissions & real-time sync

Files:
- `lib/features/training/actions/training-engagement.actions.ts` (CRUD)
- `lib/features/training/actions/training-session.actions.ts` (CRUD)
- `lib/features/training/actions/training-attendee.actions.ts` (CRUD + attendance)
- `lib/features/training/actions/assessment.actions.ts` (CRUD + grading)
- `lib/features/training/actions/training-report.actions.ts` (CRUD + publish)
- `lib/features/training/actions/implementation-plan.actions.ts` (CRUD + progress)
- `lib/features/training/actions/sop-library.actions.ts` (CRUD)
- `lib/features/training/actions/search.actions.ts` (unified search)
- `lib/features/training/actions/index.ts`

Pattern for each action:
```typescript
"use server";
export async function createTrainingEngagementAction(
  data: CreateTrainingEngagementInput
): Promise<ActionResult> {
  // 1. Permission check
  await requirePermission("training", "create");
  
  // 2. Business logic via service
  const engagement = await trainingEngagementService.createTrainingEngagement(data);
  
  // 3. Real-time sync (Pusher)
  await getPusher().trigger("private-global", "training_update", {
    action: "training_engagement_created",
    engagement,
  });
  
  // 4. Cache revalidation
  revalidatePath("/training");
  
  // 5. Return result
  return {
    success: true,
    message: "Training engagement created",
    data: engagement,
  };
}
```

**Verification**:
- All actions have permission checks
- Pusher integration working
- Cache revalidation active
- Error handling in place

### Phase 6: UI Pages & Components (3-5 days)
**Deliverable**: User interface for training management

Pages:
- `/training` - List all trainings
- `/training/[id]` - Training detail & management
- `/training/[id]/sessions` - Manage sessions
- `/training/[id]/attendees` - Manage participants
- `/training/[id]/assessments` - Create & grade assessments
- `/training/[id]/reports` - View & publish reports
- `/training/[id]/implementation` - Track implementation plan
- `/sop-library` - SOP management

Components (per feature):
- List components (table with filters)
- Detail components (full record view)
- Form components (create/edit dialogs)
- Status badge components
- Progress indicator components
- Assessment components (quiz builder, grading UI)
- Report preview components

**Verification**:
- All CRUD operations accessible via UI
- Responsive design working
- Form validation active
- Real-time updates via Pusher

### Phase 7: Testing & Validation (2-3 days)
**Deliverable**: 80%+ test coverage

Tests:
- Unit tests (services, repositories) - 30+ tests
- Integration tests (actions + services) - 20+ tests
- E2E tests (user workflows) - 10+ tests
- Coverage report: 80%+

**Verification**:
- `yarn test:unit` passes
- `yarn test:integration` passes
- `yarn test:e2e` passes
- Coverage report shows 80%+

---

## Technical Patterns

### Permission Module
```
Module Name: "training"
Actions: "create", "read", "update", "delete", "grade_assessments", "publish_reports"
```

### Event Pattern (Pusher)
```typescript
// When training event changes
await getPusher().trigger("private-global", "training_update", {
  action: "training_engagement_created" | "session_started" | "assessment_completed",
  data: {/* model data */},
});
```

### Status Transitions
```
TrainingEngagement:
  PLANNING → DISCOVERY → DESIGN → SCHEDULED → IN_PROGRESS → COMPLETED

TrainingAttendee:
  INVITED → REGISTERED → ATTENDED/PARTIAL → COMPLETED

Assessment:
  NOT_TAKEN → IN_PROGRESS → GRADED → PASSED/FAILED
```

### Calculation Examples
```typescript
// Attendance percentage
attendancePercentage = (sessionIds.length / totalSessions) * 100

// Competency level from score
if (score >= 90) return CompetencyLevel.EXPERT
if (score >= 75) return CompetencyLevel.ADVANCED
if (score >= 60) return CompetencyLevel.INTERMEDIATE
if (score >= 45) return CompetencyLevel.BEGINNER
return CompetencyLevel.NOVICE

// Report completion rate
completionRate = (totalAttended / totalParticipants) * 100

// Implementation plan progress
progressPercentage = (completedTasks / totalTasks) * 100
```

---

## Success Criteria

### Phase 1 Completion
✅ All models in database
✅ All migrations applied
✅ No schema errors

### Phase 2 Completion
✅ All types compile without errors
✅ Input validation schemas complete
✅ TypeScript strict mode passes

### Phase 3 Completion
✅ All CRUD operations work
✅ Filters applied correctly
✅ Pagination working

### Phase 4 Completion
✅ Business logic enforced
✅ Status transitions validated
✅ Calculations accurate

### Phase 5 Completion
✅ Permission checks in place
✅ Real-time sync working
✅ Error handling complete

### Phase 6 Completion
✅ All pages render
✅ All forms functional
✅ Real-time updates working

### Phase 7 Completion
✅ 80%+ test coverage
✅ All tests passing
✅ No critical bugs

---

## Key Differences from Testing Vertical

| Aspect | Testing | Training |
|--------|---------|----------|
| **Purpose** | Measure product quality | Develop people skills |
| **Duration** | Days/weeks (measurement) | Weeks/months (learning) |
| **Main Model** | TestOrder | TrainingEngagement |
| **Key Workflow** | Order → Sample → Test → Report | Engagement → Sessions → Assessments → Report |
| **Output** | Quality metrics | Competency/Certification |
| **Follow-up** | Archive | Implementation support |
| **Reusability** | Low (test-specific) | High (SOPs shared) |
| **Participants** | Samples/products | People (Training Attendees) |
| **Assessment** | Optional | Core |
| **Versioning** | Not needed | Not needed (sessioning) |

---

## Appendix: Field Mapping

### TrainingEngagement ↔ Related Models
```
TrainingEngagement
  ├─ Links to Engagement (type: TRAINING)
  ├─ Links to Customer
  ├─ 1:N → TrainingSession
  ├─ 1:N → TrainingAttendee
  ├─ 1:N → Assessment
  ├─ 1:1 → TrainingReport
  └─ 1:1 → ImplementationPlan
```

### Assessment Scoring
```
Score Range → Competency Level → Status
0-44        → NOVICE         → FAILED
45-59       → BEGINNER       → FAILED/PASSED*
60-74       → INTERMEDIATE   → PASSED
75-89       → ADVANCED       → PASSED
90-100      → EXPERT         → PASSED
*Depends on passingScore field
```

---

## Questions for Implementation

1. Should SOPLibrary be customer-specific or company-wide?
   → **Answer**: Company-wide (shared across customers)

2. Should assessment results generate Interactions/notes automatically?
   → **Answer**: Optional feature, can be implemented in Phase 5+

3. Should training sessions support multiple instructors?
   → **Answer**: Currently single instructor (instructorId), can extend to array if needed

4. Should implementation plan tasks use the generic Task model?
   → **Answer**: Yes, via entityType="IMPLEMENTATION_PLAN" and entityId pointing to ImplementationPlan.id

5. Should training certificates be Media files or generated on-demand?
   → **Answer**: Generated on-demand using template + attendee data, optional Media export

---

**Document Version**: 1.0
**Specification Status**: ✅ COMPLETE
**Ready for Phase 1**: YES
