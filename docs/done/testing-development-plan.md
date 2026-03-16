# Testing x Development Workspace - Final Implementation Plan

## Overview
This document outlines the final, safest implementation plan for the "Testing x Development" vertical workspace in MADE OS. This approach maximizes reuse of existing infrastructure while adding only necessary new models.

## Current Status
- **Status**: Not implemented (display: false in sidebar-menu.ts)
- **Existing Infrastructure**: Customer model (used as Organization), Media model (for file attachments)
- **Database**: No testing-specific models exist
- **UI**: No pages or components created

## Final Architecture Decision

### 1. **Reuse Customer as Organization**
- **Existing Customer model** serves as Organization
- **Type field** already supports: customer, partner, vendor
- **No changes** to existing Customer model or data

### 2. **Reuse Media for File Attachments**
- **Existing Media model** handles all file storage
- **Add entity linking fields**: `entityType`, `entityId`
- **No separate File model** needed

### 3. **Add Contact Model**
- **New Contact model** linked to Customer
- **Represents people** within organizations

## Database Models to Add

### CRM Foundation Models

```prisma
/// *
///  * Contact - People within organizations (customers)
///  * Shared contacts across verticals
model Contact {
  id             String      @id @default(cuid())
  customerId     String      // Liên kết với Customer hiện có
  firstName      String
  lastName       String
  email          String      @unique
  phone          String?
  title          String?
  isPrimary      Boolean     @default(false)
  tags           String?     // JSON array of tags
  metaData       Json?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  createdBy      String?
  updatedBy      String?
  
  customer       Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([email])
}

/// *
///  * Opportunity - Sales pipeline opportunities
///  * Shared across Design, Events, Testing, Training verticals
model Opportunity {
  id             String            @id @default(cuid())
  customerId     String            // Liên kết với Customer hiện có
  title          String
  description    String?
  value          Float?
  stage          OpportunityStage  @default(PROSPECTING)
  probability    Int?              @default(0)
  expectedClose  DateTime?
  ownerId        String
  source         String?
  metaData       Json?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  createdBy      String?
  updatedBy      String?
  
  customer       Customer          @relation(fields: [customerId], references: [id], onDelete: Cascade)
  engagements    Engagement[]
  
  @@index([customerId])
  @@index([stage])
  @@index([ownerId])
}

/// *
///  * Engagement - Unified engagement object
///  * Represents Design Project, Test Order, Training Engagement, Event Production
model Engagement {
  id             String           @id @default(cuid())
  opportunityId  String?
  customerId     String           // Liên kết với Customer hiện có
  title          String
  type           EngagementType   // DESIGN, TESTING, TRAINING, EVENT
  status         EngagementStatus @default(DRAFT)
  priority       String?          @default("MEDIUM")
  startDate      DateTime?
  dueDate        DateTime?
  completedAt    DateTime?
  budget         Float?
  description    String?
  assignedTo     String?          // User ID
  metaData       Json?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  createdBy      String?
  updatedBy      String?
  
  opportunity    Opportunity?    @relation(fields: [opportunityId], references: [id])
  customer       Customer        @relation(fields: [customerId], references: [id], onDelete: Cascade)
  testOrders     TestOrder[]     // For testing engagements
  
  @@index([customerId])
  @@index([type])
  @@index([status])
  @@index([assignedTo])
}

/// *
///  * Interaction - Communication logs
///  * Meetings, calls, emails, notes
model Interaction {
  id             String           @id @default(cuid())
  customerId     String?          // Liên kết với Customer hiện có
  contactId      String?
  type           InteractionType  // MEETING, CALL, EMAIL, NOTE
  subject        String
  description    String?
  date           DateTime
  duration       Int?             // minutes
  participants   String?          // JSON array
  outcome        String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  createdBy      String?
  updatedBy      String?
  
  @@index([customerId])
  @@index([contactId])
  @@index([type])
  @@index([date])
}

/// *
///  * Task - Generic task management across verticals
///  * Kanban-style tasks for engagements, projects, support tickets, etc.
model Task {
  id             String      @id @default(cuid())
  title          String
  description    String?
  
  // Generic entity linking
  entityType     String      // ENGAGEMENT, TEST_ORDER, TRAINING_SESSION, SUPPORT_TICKET, etc.
  entityId       String      // ID của entity tương ứng
  
  status         TaskStatus  @default(TODO)
  priority       String      @default("MEDIUM")
  assignedTo     String?
  dueDate        DateTime?
  completedAt    DateTime?
  
  // Task-specific fields
  taskType       String?     // TESTING_SAMPLE, TRAINING_MODULE, SUPPORT_ISSUE, etc.
  category       String?     // For filtering/grouping
  tags           String?     // JSON array
  
  // Workflow fields
  parentTaskId   String?     // For subtasks
  order          Int         @default(0)  // For kanban ordering
  
  metaData       Json?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  createdBy      String?
  updatedBy      String?
  
  // Relations
  parentTask     Task?       @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  subtasks       Task[]      @relation("TaskHierarchy")
  
  @@index([entityType, entityId])
  @@index([status])
  @@index([assignedTo])
  @@index([dueDate])
  @@index([taskType])
  @@index([category])
}
```

### Testing-Specific Models

```prisma
/// *
///  * TestOrder - Main testing order from CRM engagement
///  * Created from opportunities, tracks testing workflow
model TestOrder {
  id             String           @id @default(cuid())
  engagementId   String
  title          String
  description    String?
  status         TestOrderStatus  @default(DRAFT)
  priority       String           @default("MEDIUM")
  requestedBy    String           // User ID
  assignedTo     String?          // User ID
  startDate      DateTime?
  dueDate        DateTime?
  completedAt    DateTime?
  budget         Float?
  notes          String?
  metaData       Json?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  createdBy      String?
  updatedBy      String?
  
  engagement     Engagement      @relation(fields: [engagementId], references: [id], onDelete: Cascade)
  samples        Sample[]
  testSuites     TestSuiteOnOrder[]
  tests          Test[]
  reports        TestReport[]
  
  @@index([engagementId])
  @@index([status])
  @@index([assignedTo])
  @@index([dueDate])
}

/// *
///  * Sample - Physical/digital samples for testing
///  * Tracks sample logistics and status
model Sample {
  id             String         @id @default(cuid())
  testOrderId    String
  name           String
  description    String?
  type           SampleType     @default(PHYSICAL)
  quantity       Int            @default(1)
  receivedDate   DateTime?
  receivedFrom   String?
  storageLocation String?
  condition      String?
  status         SampleStatus   @default(RECEIVED)
  notes          String?
  mediaIds       String?        // JSON array of Media IDs
  metaData       Json?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  createdBy      String?
  updatedBy      String?
  
  testOrder      TestOrder      @relation(fields: [testOrderId], references: [id], onDelete: Cascade)
  tests          Test[]
  
  @@index([testOrderId])
  @@index([status])
}

/// *
///  * TestSuite - Standardized test collections
///  * Templates for common testing procedures
model TestSuite {
  id             String     @id @default(cuid())
  name           String
  description    String?
  category       String?
  isActive       Boolean    @default(true)
  estimatedHours Float?
  metaData       Json?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  createdBy      String?
  updatedBy      String?
  
  orders         TestSuiteOnOrder[]
  tests          Test[]
  
  @@index([category])
  @@index([isActive])
}

/// *
///  * TestSuiteOnOrder - Junction for test suites assigned to orders
model TestSuiteOnOrder {
  id           String    @id @default(cuid())
  testOrderId  String
  testSuiteId  String
  assignedAt   DateTime  @default(now())
  assignedBy   String?
  
  testOrder    TestOrder @relation(fields: [testOrderId], references: [id], onDelete: Cascade)
  testSuite    TestSuite @relation(fields: [testSuiteId], references: [id], onDelete: Cascade)
  
  @@unique([testOrderId, testSuiteId])
  @@index([testOrderId])
  @@index([testSuiteId])
}

/// *
///  * Test - Individual test executions
///  * Records test results and data
model Test {
  id             String       @id @default(cuid())
  testOrderId    String
  testSuiteId    String?
  sampleId       String?
  name           String
  description    String?
  method         String?
  parameters     Json?        // Test parameters
  expectedResult String?
  actualResult   String?
  status         TestStatus   @default(PENDING)
  startedAt      DateTime?
  completedAt    DateTime?
  performedBy    String?      // User ID
  notes          String?
  data           Json?        // Captured test data
  mediaIds       String?      // JSON array of Media IDs
  metaData       Json?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  createdBy      String?
  updatedBy      String?
  
  testOrder      TestOrder    @relation(fields: [testOrderId], references: [id], onDelete: Cascade)
  testSuite      TestSuite?   @relation(fields: [testSuiteId], references: [id])
  sample         Sample?      @relation(fields: [sampleId], references: [id])
  
  @@index([testOrderId])
  @@index([status])
  @@index([performedBy])
}

/// *
///  * TestReport - Generated test reports
///  * Standardized reports for customers
model TestReport {
  id             String         @id @default(cuid())
  testOrderId    String
  title          String
  summary        String?
  findings       String?        @db.LongText
  recommendations String?       @db.LongText
  status         ReportStatus   @default(DRAFT)
  version        Int            @default(1)
  generatedAt    DateTime?
  approvedAt     DateTime?
  approvedBy     String?
  publishedAt    DateTime?
  mediaId        String?        // PDF report file
  metaData       Json?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  createdBy      String?
  updatedBy      String?
  
  testOrder      TestOrder      @relation(fields: [testOrderId], references: [id], onDelete: Cascade)
  
  @@index([testOrderId])
  @@index([status])
  @@index([publishedAt])
}
```

### Required Changes to Existing Models

#### Update Media Model
```prisma
model Media {
  // ... all existing fields remain unchanged
  
  // Add entity linking for attachments
  entityType     String?     // ENGAGEMENT, OPPORTUNITY, TEST_ORDER, etc.
  entityId       String?     // ID của entity
  
  @@index([entityType, entityId])  // Add this index
}
```

#### Update Customer Model
```prisma
model Customer {
  // ... all existing fields remain unchanged
  
  contacts         Contact[]  // Add this relation
  
  // ... all existing relations remain unchanged
}
```

## Implementation Benefits

1. **Zero Risk**: No changes to existing models or data
2. **Maximum Reuse**: Leverages Customer and Media infrastructure
3. **Future-Ready**: Task model supports Training/Support verticals
4. **Consistent**: Follows existing MADE OS patterns
5. **Scalable**: CRM foundation supports all verticals

## Next Steps

1. Add all new models to `schema.prisma`
2. Update Media and Customer models with minimal additions
3. Run migration: `npx prisma migrate dev --name add-crm-testing-models`
4. Update seeds with sample data
5. Implement feature structure following Events pattern
6. Test thoroughly before enabling in sidebar

This plan ensures the Testing x Development workspace integrates seamlessly with the existing MADE OS while maintaining system stability.
</content>
<parameter name="filePath">/Users/nguyenpham/Source Code/madeapp/docs/testing-development-plan.md
