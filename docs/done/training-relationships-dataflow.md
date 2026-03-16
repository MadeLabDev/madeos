# Training x Support - Relationships & Data Flow Guide

**Visual Reference for Model Relationships, Data Flow Scenarios, and Query Patterns**

---

## Visual Model Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING x SUPPORT SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │  Engagement      │
                          │ (type: TRAINING) │
                          └────────┬─────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
              ┌──────▼──────────┐         ┌──────▼──────────┐
              │  TrainingEngine │         │   Customer      │
              │  Engagement     │◄────────┤                 │
              │                 │         │                 │
              │  • title        │         └─────────────────┘
              │  • type         │
              │  • status       │         ┌──────────────────┐
              │  • phase        │◄────────┤   Contact        │
              │  • dates        │         │                  │
              └────┬────────────┘         └──────────────────┘
                   │
        ┌──────────┼──────────┬─────────────────┬──────────────┐
        │          │          │                 │              │
        ▼          ▼          ▼                 ▼              ▼
    ┌───────┐ ┌────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐
    │Session│ │Attendee│ │Assessment  TrainingReport  ImplementationPlan
    └───────┘ └────────┘ └─────────┘ └──────────────┘ └──────────────┘
        │          │          │
        └──────────┼──────────┘
                   │
              ┌────▼─────┐
              │SOPLibrary │
              └───────────┘


LEGEND:
  ───────►  One-to-Many (1:N) relation
  ◄────────  Many-to-One (N:1) relation
  ◄──────►  One-to-One (1:1) relation
```

---

## Detailed Relationship Explanations

### 1. **Engagement ↔ TrainingEngagement** (1:1)

**Purpose**: Link training-specific data to the unified Engagement model

**Schema**:
```prisma
// In Engagement model
trainingEngagements TrainingEngagement[]

// In TrainingEngagement model
engagement Engagement @relation(fields: [engagementId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
1. Customer requests training engagement
2. Create Engagement (type: TRAINING, status: PROPOSAL)
3. Create TrainingEngagement (engagementId: the engagement ID)
4. Engagement stores high-level info (customer, dates, budget)
5. TrainingEngagement stores training-specific info (type, delivery method, etc.)
```

**Example**:
```typescript
// Create with linked engagement
const engagement = await engagementRepository.create({
  customerId: "cust_123",
  type: "TRAINING",
  title: "Manufacturing Training",
  status: "ACTIVE"
});

const training = await trainingEngagementRepository.create({
  engagementId: engagement.id,
  customerId: "cust_123",
  title: "Manufacturing Best Practices",
  trainingType: "INSTRUCTOR_LED",
  phase: "DISCOVERY"
});
```

**Why This Pattern**:
- Keeps Engagement model lightweight
- Training-specific data isolated in TrainingEngagement
- Easy to extend with other engagement types (Design, Testing, etc.)
- Engagement can track metrics across all types

---

### 2. **TrainingEngagement ↔ TrainingSession** (1:N)

**Purpose**: Structure training into multiple sessions/modules

**Schema**:
```prisma
// In TrainingEngagement
sessions TrainingSession[]

// In TrainingSession
trainingEngagement TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
TrainingEngagement (Overall Program)
  ├─ TrainingSession #1 (Safety Overview - 2 hrs)
  ├─ TrainingSession #2 (Production Setup - 4 hrs)
  └─ TrainingSession #3 (Quality Control - 3 hrs)
```

**Example**:
```typescript
// Create training with 3 sessions
const training = await trainingEngagementRepository.create({
  engagementId: "eng_123",
  title: "Manufacturing Training",
});

// Session 1
await trainingSessionRepository.create({
  trainingEngagementId: training.id,
  title: "Safety Overview",
  sessionNumber: 1,
  duration: 2,
  startDate: new Date("2025-01-15"),
  endDate: new Date("2025-01-15"),
});

// Session 2
await trainingSessionRepository.create({
  trainingEngagementId: training.id,
  title: "Production Setup",
  sessionNumber: 2,
  duration: 4,
  startDate: new Date("2025-01-16"),
  endDate: new Date("2025-01-16"),
});

// Query all sessions for a training
const sessions = await trainingSessionRepository.getByTrainingId(training.id);
```

**Calculation**: Total duration = SUM(duration) of all sessions = 2 + 4 + 3 = 9 hours

---

### 3. **TrainingEngagement ↔ TrainingAttendee** (1:N)

**Purpose**: Track participants and their individual progress

**Schema**:
```prisma
// In TrainingEngagement
attendees TrainingAttendee[]

// In TrainingAttendee
trainingEngagement TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
TrainingEngagement (Manufacturing Training)
  ├─ Attendee: John (contact_123, LEARNER)
  │  ├─ registrationStatus: REGISTERED
  │  ├─ attendancePercentage: 100%
  │  ├─ baselineScore: 45/100
  │  ├─ finalScore: 78/100
  │  └─ competencyGained: INTERMEDIATE
  │
  ├─ Attendee: Jane (contact_456, LEARNER)
  │  └─ registrationStatus: ATTENDED
  │
  └─ Attendee: Mike (user_789, FACILITATOR)
     └─ registrationStatus: ATTENDED
```

**Example**:
```typescript
// Register participants
await trainingAttendeeRepository.create({
  trainingEngagementId: training.id,
  contactId: "contact_123",  // External contact
  registrationStatus: "REGISTERED",
  participantRole: "LEARNER",
});

await trainingAttendeeRepository.create({
  trainingEngagementId: training.id,
  userId: "user_789",  // Internal user
  registrationStatus: "REGISTERED",
  participantRole: "FACILITATOR",
});

// Get all attendees
const attendees = await trainingAttendeeRepository.getByTrainingId(training.id);

// Calculate statistics
const totalAttendees = attendees.length;  // 3
const passedCount = attendees.filter(a => a.finalScore >= 60).length;  // 2
const completionRate = (passedCount / totalAttendees) * 100;  // 66.7%
```

---

### 4. **TrainingSession ↔ TrainingAttendee** (N:M)

**Purpose**: Track which attendees attend which sessions

**Schema**:
```prisma
// In TrainingSession
attendances TrainingAttendee[]

// In TrainingAttendee
sessionIds String?  // JSON array: ["session_1", "session_2", "session_3"]
```

**Workflow**:
```
Session #1 (Safety Overview)
  ├─ Attended by: John, Jane, Mike
  └─ Absentees: (none)

Session #2 (Production Setup)
  ├─ Attended by: John, Jane
  └─ Absentees: Mike (conflict)

Session #3 (Quality Control)
  ├─ Attended by: John, Jane, Mike
  └─ Absentees: (none)
```

**Example**:
```typescript
// Record attendance
const attendee = await trainingAttendeeRepository.getById("attendee_123");

// Parse current sessions
const sessionIds = attendee.sessionIds ? JSON.parse(attendee.sessionIds) : [];

// Add session if not already attended
if (!sessionIds.includes("session_002")) {
  sessionIds.push("session_002");
}

// Update attendee
await trainingAttendeeRepository.update("attendee_123", {
  sessionIds: JSON.stringify(sessionIds),
});

// Calculate attendance percentage
const totalSessions = 3;
const attendedSessions = JSON.parse(attendee.sessionIds || "[]").length;
const attendancePercentage = (attendedSessions / totalSessions) * 100;
```

---

### 5. **TrainingEngagement ↔ Assessment** (1:N)

**Purpose**: Create pre/mid/post-training evaluations

**Schema**:
```prisma
// In TrainingEngagement
assessments Assessment[]

// In Assessment
trainingEngagement TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
TrainingEngagement (Manufacturing Training)
  ├─ Assessment #1 (PRE - Baseline)
  │  ├─ type: QUIZ
  │  ├─ timing: PRE
  │  └─ questions: 20 questions
  │
  ├─ Assessment #2 (MID - Checkpoint)
  │  ├─ type: PRACTICAL
  │  ├─ timing: MID
  │  └─ Hands-on exercise
  │
  └─ Assessment #3 (POST - Final)
     ├─ type: CERTIFICATION
     ├─ timing: POST
     └─ Formal exam
```

**Example**:
```typescript
// Create pre-assessment
const preAssessment = await assessmentRepository.create({
  trainingEngagementId: training.id,
  title: "Pre-Training Assessment",
  assessmentType: "QUIZ",
  administrationTiming: "PRE",
  passingScore: 60,
  questions: JSON.stringify([
    { id: 1, text: "What is lean manufacturing?", options: [...] },
    // ... 19 more questions
  ]),
});

// John takes pre-assessment
await assessmentRepository.update(preAssessment.id, {
  trainingAttendeeId: "attendee_john",
  score: 45,
  status: "GRADED",
  competencyLevel: "BEGINNER",  // 45% = BEGINNER level
  takenAt: new Date(),
});

// Create post-assessment (same questions, different scoring)
const postAssessment = await assessmentRepository.create({
  trainingEngagementId: training.id,
  title: "Post-Training Assessment",
  administrationTiming: "POST",
  // Same structure as pre-assessment
});

// John takes post-assessment
await assessmentRepository.update(postAssessment.id, {
  trainingAttendeeId: "attendee_john",
  score: 78,
  status: "PASSED",
  competencyLevel: "INTERMEDIATE",  // Improvement: BEGINNER → INTERMEDIATE
});
```

---

### 6. **TrainingSession ↔ Assessment** (1:N)

**Purpose**: Optional session-specific assessments

**Schema**:
```prisma
// In TrainingSession
assessments Assessment[]

// In Assessment
trainingSession TrainingSession? @relation(fields: [trainingSessionId], references: [id], onDelete: SetNull)
```

**Workflow**:
```
TrainingSession #2 (Production Setup)
  ├─ Pre-Session Assessment (Optional)
  │  └─ Check if attendee knows prerequisites
  │
  └─ Post-Session Assessment (Optional)
     └─ Verify understanding of session content
```

**Example**:
```typescript
// Create session-specific pre-assessment
const sessionPreAssessment = await assessmentRepository.create({
  trainingEngagementId: training.id,
  trainingSessionId: "session_002",
  title: "Production Setup - Prerequisites Check",
  assessmentType: "QUIZ",
  administrationTiming: "PRE",
  preRequisiteLevel: "BEGINNER",  // Must score at BEGINNER level to attend
});

// Only attendees who pass can attend session
const attendeeScore = 45; // BEGINNER level
const canAttend = attendeeScore >= 45;
```

---

### 7. **TrainingAttendee ↔ Assessment** (1:N)

**Purpose**: Track assessment results for each attendee

**Schema**:
```prisma
// In TrainingAttendee
assessmentScores Assessment[]

// In Assessment
trainee TrainingAttendee? @relation(fields: [trainingAttendeeId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
TrainingAttendee: John
  ├─ Pre-Assessment: 45/100 (BEGINNER)
  ├─ Mid-Assessment: 62/100 (INTERMEDIATE)
  └─ Post-Assessment: 78/100 (INTERMEDIATE) ✓ PASSED
```

**Example**:
```typescript
// Get all assessments for John
const johnAssessments = await assessmentRepository.getByAttendeeId("attendee_john");
// Returns: [PreAssessment(45), MidAssessment(62), PostAssessment(78)]

// Calculate improvement
const improvement = postScore - preScore;  // 78 - 45 = 33 points

// Determine certification eligibility
const certifiable = johnAssessments
  .filter(a => a.status === "PASSED")
  .length >= 2;  // Must pass at least 2 assessments
```

---

### 8. **TrainingEngagement ↔ TrainingReport** (1:1)

**Purpose**: Aggregate outcomes at training completion

**Schema**:
```prisma
// In TrainingEngagement
reports TrainingReport[]  // Usually one, but could be multiple (monthly, final, etc.)

// In TrainingReport
trainingEngagement TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
After Training Completion:
  1. Calculate all metrics from attendees & assessments
  2. Create TrainingReport
  3. Aggregate results:
     - Total participants: 3
     - Total attended: 3
     - Completion rate: 100%
     - Average score: 68.3
     - Certified: 2
  4. Generate certificates
  5. Publish report
```

**Example**:
```typescript
// Calculate report metrics
const attendees = await trainingAttendeeRepository.getByTrainingId(training.id);
const assessments = await assessmentRepository.getByTrainingId(training.id);

const totalParticipants = attendees.length;
const totalAttended = attendees.filter(a => a.registrationStatus === "ATTENDED").length;
const passedCount = attendees.filter(a => a.finalScore >= 60).length;

const avgScore = attendees.reduce((sum, a) => sum + (a.finalScore || 0), 0) / totalParticipants;
const completionRate = (totalAttended / totalParticipants) * 100;

// Create report
const report = await trainingReportRepository.create({
  trainingEngagementId: training.id,
  title: "Manufacturing Training - Final Report",
  totalParticipants,
  totalAttended,
  completionRate,
  averageScore: avgScore,
  passedCount,
  certificationsIssued: passedCount,
  status: "DRAFT",
});

// Publish when approved
await trainingReportRepository.update(report.id, {
  status: "PUBLISHED",
  publishedAt: new Date(),
  publishedBy: "user_admin",
});
```

---

### 9. **TrainingEngagement ↔ ImplementationPlan** (1:1)

**Purpose**: Post-training support and task tracking

**Schema**:
```prisma
// In TrainingEngagement
implementationPlan ImplementationPlan?

// In ImplementationPlan
trainingEngagement TrainingEngagement @relation(fields: [trainingEngagementId], references: [id], onDelete: Cascade)
```

**Workflow**:
```
After TrainingReport Published:
  1. Create ImplementationPlan
  2. Define 30-day action plan
  3. Create Tasks:
     - John: "Implement Safety procedures" (Task #1)
     - Jane: "Lead quality audits" (Task #2)
     - Mike: "Document SOP changes" (Task #3)
  4. Track progress over 30 days
  5. Calculate completion %
```

**Example**:
```typescript
// Create implementation plan
const plan = await implementationPlanRepository.create({
  trainingEngagementId: training.id,
  title: "Manufacturing Training - 30-Day Implementation",
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // 30 days
  goals: "Apply training knowledge to production floor",
  status: "DRAFT",
});

// Create implementation tasks (using generic Task model)
const task1 = await taskRepository.create({
  title: "John - Implement Safety procedures",
  entityType: "IMPLEMENTATION_PLAN",
  entityId: plan.id,
  assignedTo: "user_john",
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
  status: "TODO",
});

const task2 = await taskRepository.create({
  title: "Jane - Lead quality audits",
  entityType: "IMPLEMENTATION_PLAN",
  entityId: plan.id,
  assignedTo: "user_jane",
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),  // 14 days
  status: "TODO",
});

// Activate plan
await implementationPlanRepository.update(plan.id, {
  status: "ACTIVE",
  ownerUserId: "user_coordinator",
});

// Track progress
const tasks = await taskRepository.getByEntity("IMPLEMENTATION_PLAN", plan.id);
const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
const progressPercentage = (completedTasks / tasks.length) * 100;

// Update plan progress
await implementationPlanRepository.update(plan.id, {
  totalTasks: tasks.length,
  completedTasks,
  progressPercentage,
});
```

---

### 10. **SOPLibrary ↔ TrainingSession** (N:M)

**Purpose**: Link training sessions to reusable SOPs

**Schema**:
```prisma
// In TrainingSession
sopLibraryIds String?  // JSON array: ["sop_1", "sop_5", "sop_12"]
```

**Workflow**:
```
SOPLibrary (Company-wide):
  ├─ "Safety Procedures" (SOP_001, ACTIVE)
  ├─ "Production Setup" (SOP_002, ACTIVE)
  └─ "Quality Checkpoints" (SOP_003, ACTIVE)

TrainingSession #1 (Safety Overview)
  └─ Links to: SOP_001 ("Safety Procedures")

TrainingSession #2 (Production Setup)
  └─ Links to: SOP_001, SOP_002
```

**Example**:
```typescript
// Create training sessions with SOP links
const session1 = await trainingSessionRepository.create({
  trainingEngagementId: training.id,
  title: "Safety Overview",
  sopLibraryIds: JSON.stringify(["sop_001"]),
});

const session2 = await trainingSessionRepository.create({
  trainingEngagementId: training.id,
  title: "Production Setup",
  sopLibraryIds: JSON.stringify(["sop_001", "sop_002"]),
});

// Get associated SOPs for a session
const sopIds = JSON.parse(session2.sopLibraryIds || "[]");
const sops = await Promise.all(
  sopIds.map(id => sopLibraryRepository.getById(id))
);

// Use in training materials
const materials = sops.map(sop => ({
  title: sop.title,
  content: sop.content,
  version: sop.version,
}));
```

---

## Data Flow Scenarios

### Scenario 1: Complete Training Lifecycle (Happy Path)

```
Week 1: Setup
├─ Engagement created (type: TRAINING, status: ACTIVE)
├─ TrainingEngagement created (phase: DISCOVERY)
├─ Customer interviews (Interaction records)
└─ TrainingSession #1-3 designed

Week 2: Design
├─ SOPs linked to sessions
├─ Assessments created (pre, mid, post)
├─ Materials prepared
└─ Instructors assigned

Week 3: Registration
├─ TrainingAttendee records created
├─ Registrations confirmed
├─ Baseline pre-assessment administered
└─ TrainingEngagement status → SCHEDULED

Week 4: Execution
├─ Session #1 conducted (2025-01-15)
│  └─ Attendance recorded in TrainingAttendee.sessionIds
├─ Session #2 conducted (2025-01-16)
├─ Session #3 conducted (2025-01-17)
└─ Post-training assessments administered

Week 5: Reporting
├─ Assessments graded
├─ TrainingReport created & populated
├─ Certificates generated & issued
├─ TrainingEngagement status → COMPLETED
└─ Report published

Week 6-8: Implementation
├─ ImplementationPlan created
├─ Tasks assigned to attendees
├─ Task status tracked
└─ Plan marked COMPLETED when all tasks done
```

### Scenario 2: Partial Attendance & Remediation

```
Initial Setup
├─ 3 attendees registered (John, Jane, Mike)
└─ TrainingEngagement.maxParticipants: 3

Session Delivery
├─ Session #1: John, Jane, Mike attend (all 3 attended)
├─ Session #2: John, Jane attend; Mike absent (2/3 attended)
└─ Session #3: John, Jane, Mike attend (all 3 attended)

Assessment Results
├─ John: Pre-45 → Mid-62 → Post-78 (PASSED)
├─ Jane: Pre-62 → Mid-85 → Post-88 (PASSED)
└─ Mike: Pre-35 → Mid-48 → Post-52 (FAILED, below 60 threshold)

Report Generation
├─ totalParticipants: 3
├─ completionRate: 66.7% (2/3 completed)
├─ passedCount: 2
├─ failedCount: 1

Remediation
├─ Create new Assessment for Mike (RETAKE)
├─ Schedule makeup session
└─ Track as separate assessment instance
```

---

## Common Querying Patterns

### Pattern 1: Get All Training for a Customer

```typescript
const customerTrainings = await trainingEngagementRepository.getByCustomerId(
  "customer_123"
);

// Filter by status
const activeTrainings = customerTrainings.filter(
  t => t.status === "IN_PROGRESS"
);

// With all relations
const trainingsWithDetails = await Promise.all(
  customerTrainings.map(async (training) => ({
    ...training,
    sessions: await trainingSessionRepository.getByTrainingId(training.id),
    attendees: await trainingAttendeeRepository.getByTrainingId(training.id),
    report: await trainingReportRepository.getByTrainingId(training.id),
  }))
);
```

### Pattern 2: Calculate Attendee Statistics

```typescript
const attendee = await trainingAttendeeRepository.getById("attendee_123");
const assessments = await assessmentRepository.getByAttendeeId("attendee_123");

const preScore = assessments.find(a => a.administrationTiming === "PRE")?.score;
const postScore = assessments.find(a => a.administrationTiming === "POST")?.score;

const improvement = postScore - preScore;
const certified = postScore >= 60;
const competency = postScore >= 90 ? "EXPERT" : 
                   postScore >= 75 ? "ADVANCED" :
                   postScore >= 60 ? "INTERMEDIATE" :
                   postScore >= 45 ? "BEGINNER" :
                   "NOVICE";

return {
  attendeeName: attendee.user?.name || attendee.contact?.firstName,
  preScore,
  postScore,
  improvement,
  certified,
  competency,
};
```

### Pattern 3: Track Implementation Plan Progress

```typescript
const plan = await implementationPlanRepository.getById("plan_123");
const tasks = await taskRepository.getByEntity("IMPLEMENTATION_PLAN", plan.id);

const overallProgress = {
  total: tasks.length,
  completed: tasks.filter(t => t.status === "COMPLETED").length,
  inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
  todo: tasks.filter(t => t.status === "TODO").length,
  percentage: (tasks.filter(t => t.status === "COMPLETED").length / tasks.length) * 100,
};

// Group by assignee
const byAssignee = tasks.reduce((acc, task) => {
  const assignee = task.assignedTo || "Unassigned";
  if (!acc[assignee]) acc[assignee] = { total: 0, completed: 0 };
  acc[assignee].total++;
  if (task.status === "COMPLETED") acc[assignee].completed++;
  return acc;
}, {});

return {
  planStatus: plan.status,
  overallProgress,
  byAssignee,
  daysRemaining: Math.ceil((plan.endDate - new Date()) / (1000 * 60 * 60 * 24)),
};
```

### Pattern 4: Get Training Sessions by Date Range

```typescript
const trainingsSessions = await trainingSessionRepository.getByDateRange(
  new Date("2025-01-15"),
  new Date("2025-01-31"),
  { limit: 20, offset: 0 }
);

// With attendee counts
const sessionsWithAttendees = await Promise.all(
  trainingSessions.map(async (session) => ({
    ...session,
    totalAttendees: /* count from TrainingAttendee where sessionIds contains session.id */,
    averageScore: /* average of assessment scores for this session */,
  }))
);
```

### Pattern 5: Generate Training Completion Certificate

```typescript
const attendee = await trainingAttendeeRepository.getById("attendee_123");
const training = await trainingEngagementRepository.getById(
  attendee.trainingEngagementId
);
const report = await trainingReportRepository.getByTrainingId(training.id);

// Only certify if passed
if (attendee.finalScore >= 60) {
  // Generate certificate
  const certificate = {
    certificateNumber: `CERT-${training.id}-${attendee.id}-${Date.now()}`,
    recipientName: attendee.user?.name || attendee.contact?.firstName,
    trainingTitle: training.title,
    completionDate: new Date(),
    competencyLevel: attendee.competencyGained,
    issueDate: report.publishedAt,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  };

  // Save certificate & update attendee
  await trainingAttendeeRepository.update(attendee.id, {
    certificationIssued: true,
    certificateId: certificate.certificateNumber,
  });

  // Email certificate to attendee
  return certificate;
}
```

---

## DELETE CASCADE Behavior

### What Happens When You Delete...

```
DELETE TrainingEngagement
  ├─ CASCADE: Delete all TrainingSession
  ├─ CASCADE: Delete all TrainingAttendee
  ├─ CASCADE: Delete all Assessment
  ├─ CASCADE: Delete TrainingReport
  ├─ CASCADE: Delete ImplementationPlan
  └─ NOTE: Does NOT delete Engagement (parent)

DELETE TrainingSession
  └─ CASCADE: Delete all Assessment for this session
     (But Assessment can still exist if training-wide)

DELETE TrainingAttendee
  └─ CASCADE: Delete all Assessment scores for this attendee

DELETE Assessment
  └─ No cascades (just a data record)

DELETE ImplementationPlan
  └─ Does NOT delete Tasks (Tasks are generic, linked via entityType/entityId)
```

---

## Index Strategy

### Why These Indexes Exist

```
TrainingEngagement:
  ├─ [engagementId] → Quick lookup by engagement
  ├─ [customerId] → List trainings for customer
  ├─ [status] → Filter by status
  ├─ [instructorId] → Find trainer's assignments
  └─ [startDate], [completedAt] → Date range queries

TrainingSession:
  ├─ [trainingEngagementId] → Get all sessions for training
  ├─ [startDate] → Sort by date
  └─ [status] → Filter by status

TrainingAttendee:
  ├─ [trainingEngagementId] → Get all attendees
  ├─ [userId] → Find user's trainings
  └─ [registrationStatus] → Filter by status

Assessment:
  ├─ [trainingAttendeeId] → Get attendee's scores
  ├─ [assessmentType] → Find all quizzes/practical tests
  ├─ [status] → Find graded vs pending
  └─ [takenAt] → Timeline queries

TrainingReport:
  ├─ [trainingEngagementId] → One report per training
  └─ [status] → Find published reports

ImplementationPlan:
  ├─ [trainingEngagementId] → One plan per training
  └─ [status] → Track active plans
```

---

## Data Integrity Rules

### Constraints That Must Be Enforced (in Service Layer)

```
1. TrainingEngagement Constraints:
   └─ startDate must be before endDate
   └─ Can't create sessions with startDate before TrainingEngagement.startDate

2. TrainingSession Constraints:
   └─ startDate must be before endDate
   └─ Duration must match (endDate - startDate)
   └─ SessionNumber must be sequential within engagement

3. TrainingAttendee Constraints:
   └─ Either userId OR contactId must be present (not both null)
   └─ registeredAt must be before completionDate
   └─ Attendance % calculated from sessionIds.length / total sessions

4. Assessment Constraints:
   └─ passingScore usually 60 (configurable)
   └─ score must be 0-100
   └─ Only one assessment per (trainingEngagement + administrationTiming + assessmentType) allowed

5. TrainingReport Constraints:
   └─ One per TrainingEngagement
   └─ Can't publish unless all assessments graded
   └─ completionRate = totalAttended / totalParticipants

6. ImplementationPlan Constraints:
   └─ startDate must be after TrainingEngagement.completedAt
   └─ endDate should be 30-90 days after start
   └─ progressPercentage = completedTasks / totalTasks
```

---

**Document Version**: 1.0
**Specification Status**: ✅ COMPLETE
**Last Updated**: November 26, 2025
