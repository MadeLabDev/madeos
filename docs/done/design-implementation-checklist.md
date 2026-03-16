# Design x Development - Implementation Checklist & Code Templates

**Purpose**: Step-by-step guide with code templates for implementing Design x Development
**Status**: Ready to execute
**Last Updated**: November 26, 2025

---

## PHASE 1: DATABASE SCHEMA & MIGRATION

### 1.1 Add Models to Prisma Schema

**File**: `prisma/schema.prisma`

**Location**: Add after existing models (around line 1200+, before enums)

**Code to Add**:

```prisma
// ============================================================================
// DESIGN x DEVELOPMENT MODELS
// ============================================================================

/// *
/// DesignProject - Main container for design engagement
/// Linked to Engagement (type: DESIGN)
/// Similar to TestOrder in Testing vertical
model DesignProject {
  id             String              @id @default(cuid())
  engagementId   String
  customerId     String
  title          String
  description    String?
  status         DesignProjectStatus @default(DRAFT)
  priority       String              @default("MEDIUM")
  requestedBy    String
  assignedTo     String?
  startDate      DateTime?
  dueDate        DateTime?
  completedAt    DateTime?
  budget         Float?
  metaData       Json?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
  createdBy      String?
  updatedBy      String?
  
  engagement     Engagement          @relation(fields: [engagementId], references: [id], onDelete: Cascade)
  customer       Customer            @relation("DesignProjects", fields: [customerId], references: [id], onDelete: Cascade)
  brief          DesignBrief?
  designs        ProductDesign[]
  deck           DesignDeck?
  reviews        DesignReview[]
  
  @@index([engagementId])
  @@index([customerId])
  @@index([status])
  @@index([assignedTo])
  @@index([dueDate])
  @@index([createdAt])
}

/// *
/// DesignBrief - Intake form and requirements
/// One brief per project, captures all initial requirements
model DesignBrief {
  id                String             @id @default(cuid())
  designProjectId   String             @unique
  brandAssets       String?
  targetAudience    String?
  constraints       String?
  inspirations      String?
  deliverables      String?
  budget            Float?
  timeline          String?
  notes             String?            @db.Text
  mediaIds          String?
  status            DesignBriefStatus  @default(PENDING)
  approvedAt        DateTime?
  approvedBy        String?
  metaData          Json?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  createdBy         String?
  updatedBy         String?
  
  designProject     DesignProject      @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  
  @@index([designProjectId])
  @@index([status])
  @@index([createdAt])
}

/// *
/// ProductDesign - Individual design for a product
/// Can have multiple versions/iterations
/// Links to single TechPack when approved
model ProductDesign {
  id                String              @id @default(cuid())
  designProjectId   String
  name              String
  description       String?
  designType        String              @default("GRAPHIC")
  productType       String?
  mockupUrl         String?
  graphicSpecsFile  String?
  layerInfo         Json?
  colorSeparations  String?
  status            ProductDesignStatus @default(DRAFT)
  feasibilityNotes  String?             @db.Text
  compatibilityCheck Boolean            @default(false)
  decorationDetails Json?
  mediaIds          String?
  version           Int                 @default(1)
  parentDesignId    String?
  assignedTo        String?
  startedAt         DateTime?
  completedAt       DateTime?
  metaData          Json?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  createdBy         String?
  updatedBy         String?
  
  designProject     DesignProject       @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  parentDesign      ProductDesign?      @relation("DesignVersions", fields: [parentDesignId], references: [id])
  versions          ProductDesign[]     @relation("DesignVersions")
  techPack          TechPack?
  reviews           DesignReview[]
  
  @@index([designProjectId])
  @@index([status])
  @@index([designType])
  @@index([productType])
  @@index([assignedTo])
  @@index([parentDesignId])
  @@index([createdAt])
}

/// *
/// TechPack - Manufacturing specifications and output files
/// Created from approved ProductDesign
/// Contains sizing, materials, production specs, output files
model TechPack {
  id                String           @id @default(cuid())
  productDesignId   String           @unique
  name              String
  description       String?
  sizing            Json?
  materials         Json?
  colors            Json?
  decorationMethod  String
  productionNotes   String?          @db.Text
  qualitySpecs      Json?
  outputFiles       String?
  status            TechPackStatus   @default(DRAFT)
  approvedAt        DateTime?
  approvedBy        String?
  metaData          Json?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  createdBy         String?
  updatedBy         String?
  
  productDesign     ProductDesign    @relation(fields: [productDesignId], references: [id], onDelete: Cascade)
  
  @@index([productDesignId])
  @@index([status])
  @@index([decorationMethod])
  @@index([approvedAt])
  @@index([createdAt])
}

/// *
/// DesignDeck - Collection and presentation of approved designs
/// One main deck per project
/// Contains references to selected designs and documentation
model DesignDeck {
  id                String           @id @default(cuid())
  designProjectId   String           @unique
  title             String
  description       String?
  coverUrl          String?
  designIds         String?
  deckUrl           String?
  mediaIds          String?
  status            DesignDeckStatus @default(DRAFT)
  publishedAt       DateTime?
  publishedBy       String?
  version           Int              @default(1)
  notes             String?
  metaData          Json?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  createdBy         String?
  updatedBy         String?
  
  designProject     DesignProject    @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  
  @@index([designProjectId])
  @@index([status])
  @@index([publishedAt])
  @@index([createdAt])
}

/// *
/// DesignReview - Feedback and approval for designs
/// Can be at project level or design level
/// Tracks approval workflow and revision requests
model DesignReview {
  id                String              @id @default(cuid())
  designProjectId   String
  productDesignId   String?
  title             String
  description       String?
  feedback          String?             @db.Text
  requestedChanges  Json?
  attachments       String?
  reviewType        String              @default("CUSTOMER")
  status            DesignReviewStatus  @default(PENDING)
  reviewedAt        DateTime?
  reviewedBy        String?
  approvedAt        DateTime?
  approvedBy        String?
  version           Int                 @default(1)
  mediaIds          String?
  metaData          Json?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  createdBy         String?
  updatedBy         String?
  
  designProject     DesignProject       @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  productDesign     ProductDesign?      @relation(fields: [productDesignId], references: [id])
  
  @@index([designProjectId])
  @@index([productDesignId])
  @@index([status])
  @@index([reviewType])
  @@index([reviewedAt])
  @@index([createdAt])
}
```

### 1.2 Add Enums to Prisma Schema

**File**: `prisma/schema.prisma`

**Location**: Add after existing enums (around line 1365+)

**Code to Add**:

```prisma
// ============================================================================
// DESIGN x DEVELOPMENT ENUMS
// ============================================================================

enum DesignProjectStatus {
  DRAFT
  CONCEPT
  FEASIBILITY
  APPROVED
  COMPLETED
  ON_HOLD
  CANCELLED
}

enum DesignBriefStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ProductDesignStatus {
  DRAFT
  CONCEPT
  FEASIBILITY
  APPROVED
  REJECTED
}

enum TechPackStatus {
  DRAFT
  REVIEW
  APPROVED
  PRODUCTION_READY
}

enum DesignDeckStatus {
  DRAFT
  REVIEW
  APPROVED
  PUBLISHED
}

enum DesignReviewStatus {
  PENDING
  APPROVED
  REVISION_NEEDED
  REJECTED
}
```

### 1.3 Update Existing Models

**File**: `prisma/schema.prisma`

**In Customer Model** (find existing Customer model, add to relations):

```prisma
model Customer {
  // ... existing fields ...
  
  // Add this line to relations section:
  designProjects     DesignProject[]    // Add this relation
  
  // ... rest of model ...
}
```

### 1.4 Run Migration

```bash
# In terminal, run:
cd /Users/nguyenpham/Source\ Code/madeapp

# Create migration
yarn db:migrate

# When prompted, enter migration name: "add-design-models"

# Regenerate Prisma client
yarn db:generate
```

**Expected Output**:
- Migration file created in `prisma/migrations/`
- Prisma client regenerated in `@/generated/prisma`
- No errors in console

**Verification**:
- Check `prisma/migrations/` folder for new migration
- Check `@/generated/prisma/index.d.ts` has new types

---

## PHASE 2: TYPE DEFINITIONS

### 2.1 Create Design Types File

**File**: `lib/features/design/types/design.types.ts`

**Create**: New file

**Code**:

```typescript
import {
  DesignProjectStatus,
  DesignBriefStatus,
  ProductDesignStatus,
  TechPackStatus,
  DesignDeckStatus,
  DesignReviewStatus,
} from "@/generated/prisma/enums";

// ============================================================================
// BASE TYPES (matching Prisma models)
// ============================================================================

export type DesignProject = {
  id: string;
  engagementId: string;
  customerId: string;
  title: string;
  description?: string | null;
  status: DesignProjectStatus;
  priority: string;
  requestedBy: string;
  assignedTo?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  budget?: number | null;
  metaData?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type DesignBrief = {
  id: string;
  designProjectId: string;
  brandAssets?: string | null;
  targetAudience?: string | null;
  constraints?: string | null;
  inspirations?: string | null;
  deliverables?: string | null;
  budget?: number | null;
  timeline?: string | null;
  notes?: string | null;
  mediaIds?: string | null;
  status: DesignBriefStatus;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  metaData?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type ProductDesign = {
  id: string;
  designProjectId: string;
  name: string;
  description?: string | null;
  designType: string;
  productType?: string | null;
  mockupUrl?: string | null;
  graphicSpecsFile?: string | null;
  layerInfo?: any;
  colorSeparations?: string | null;
  status: ProductDesignStatus;
  feasibilityNotes?: string | null;
  compatibilityCheck: boolean;
  decorationDetails?: any;
  mediaIds?: string | null;
  version: number;
  parentDesignId?: string | null;
  assignedTo?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  metaData?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type TechPack = {
  id: string;
  productDesignId: string;
  name: string;
  description?: string | null;
  sizing?: any;
  materials?: any;
  colors?: any;
  decorationMethod: string;
  productionNotes?: string | null;
  qualitySpecs?: any;
  outputFiles?: string | null;
  status: TechPackStatus;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  metaData?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type DesignDeck = {
  id: string;
  designProjectId: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  designIds?: string | null;
  deckUrl?: string | null;
  mediaIds?: string | null;
  status: DesignDeckStatus;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  version: number;
  notes?: string | null;
  metaData?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type DesignReview = {
  id: string;
  designProjectId: string;
  productDesignId?: string | null;
  title: string;
  description?: string | null;
  feedback?: string | null;
  requestedChanges?: any;
  attachments?: string | null;
  reviewType: string;
  status: DesignReviewStatus;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  version: number;
  mediaIds?: string | null;
  metaData?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

// ============================================================================
// INPUT TYPES (for create/update operations)
// ============================================================================

export type CreateDesignProjectInput = {
  engagementId: string;
  customerId: string;
  title: string;
  description?: string;
  priority?: string;
  requestedBy: string;
  assignedTo?: string | null;
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
  metaData?: any;
};

export type UpdateDesignProjectInput = Partial<CreateDesignProjectInput> & {
  status?: DesignProjectStatus;
  completedAt?: Date;
};

export type CreateDesignBriefInput = {
  designProjectId: string;
  brandAssets?: string;
  targetAudience?: string;
  constraints?: string;
  inspirations?: string;
  deliverables?: string;
  budget?: number;
  timeline?: string;
  notes?: string;
  mediaIds?: string;
};

export type UpdateDesignBriefInput = Partial<CreateDesignBriefInput> & {
  status?: DesignBriefStatus;
  approvedAt?: Date;
  approvedBy?: string;
};

export type CreateProductDesignInput = {
  designProjectId: string;
  name: string;
  description?: string;
  designType?: string;
  productType?: string;
  mockupUrl?: string;
  graphicSpecsFile?: string;
  layerInfo?: any;
  colorSeparations?: string;
  decorationDetails?: any;
  mediaIds?: string;
  parentDesignId?: string;
  assignedTo?: string;
};

export type UpdateProductDesignInput = Partial<CreateProductDesignInput> & {
  status?: ProductDesignStatus;
  feasibilityNotes?: string;
  compatibilityCheck?: boolean;
  completedAt?: Date;
};

export type CreateTechPackInput = {
  productDesignId: string;
  name: string;
  description?: string;
  sizing?: any;
  materials?: any;
  colors?: any;
  decorationMethod: string;
  productionNotes?: string;
  qualitySpecs?: any;
  outputFiles?: string;
};

export type UpdateTechPackInput = Partial<CreateTechPackInput> & {
  status?: TechPackStatus;
  approvedAt?: Date;
  approvedBy?: string;
};

export type CreateDesignDeckInput = {
  designProjectId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  designIds?: string;
  deckUrl?: string;
  mediaIds?: string;
};

export type UpdateDesignDeckInput = Partial<CreateDesignDeckInput> & {
  status?: DesignDeckStatus;
  publishedAt?: Date;
  publishedBy?: string;
};

export type CreateDesignReviewInput = {
  designProjectId: string;
  productDesignId?: string;
  title: string;
  description?: string;
  feedback?: string;
  requestedChanges?: any;
  attachments?: string;
  reviewType?: string;
  mediaIds?: string;
};

export type UpdateDesignReviewInput = Partial<CreateDesignReviewInput> & {
  status?: DesignReviewStatus;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
};

// ============================================================================
// FILTER TYPES (for query operations)
// ============================================================================

export type DesignProjectFilters = {
  engagementId?: string;
  customerId?: string;
  status?: DesignProjectStatus;
  assignedTo?: string;
  requestedBy?: string;
  dueDate?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
};

export type DesignBriefFilters = {
  designProjectId?: string;
  status?: DesignBriefStatus;
  createdAfter?: Date;
  createdBefore?: Date;
};

export type ProductDesignFilters = {
  designProjectId?: string;
  designType?: string;
  productType?: string;
  status?: ProductDesignStatus;
  assignedTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
};

export type TechPackFilters = {
  productDesignId?: string;
  decorationMethod?: string;
  status?: TechPackStatus;
  createdAfter?: Date;
  createdBefore?: Date;
};

export type DesignDeckFilters = {
  designProjectId?: string;
  status?: DesignDeckStatus;
  publishedAfter?: Date;
  publishedBefore?: Date;
  search?: string;
};

export type DesignReviewFilters = {
  designProjectId?: string;
  productDesignId?: string;
  status?: DesignReviewStatus;
  reviewType?: string;
  reviewedAfter?: Date;
  reviewedBefore?: Date;
  search?: string;
};

// ============================================================================
// RELATION TYPES (with nested relations)
// ============================================================================

export type DesignProjectWithRelations = DesignProject & {
  brief?: DesignBrief | null;
  designs?: ProductDesign[];
  deck?: DesignDeck | null;
  reviews?: DesignReview[];
};

export type ProductDesignWithRelations = ProductDesign & {
  designProject?: DesignProject;
  versions?: ProductDesign[];
  techPack?: TechPack | null;
  reviews?: DesignReview[];
};

export type DesignDeckWithRelations = DesignDeck & {
  designProject?: DesignProject;
};

export type DesignReviewWithRelations = DesignReview & {
  designProject?: DesignProject;
  productDesign?: ProductDesign | null;
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class DesignError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "DesignError";
  }
}

// ============================================================================
// RE-EXPORT ENUMS
// ============================================================================

export {
  DesignProjectStatus,
  DesignBriefStatus,
  ProductDesignStatus,
  TechPackStatus,
  DesignDeckStatus,
  DesignReviewStatus,
};
```

### 2.2 Create Types Index File

**File**: `lib/features/design/types/index.ts`

**Create**: New file

**Code**:

```typescript
export * from "./design.types";
```

---

## PHASE 3: REPOSITORY LAYER

### 3.1 Create Design Project Repository

**File**: `lib/features/design/repositories/design-project.repository.ts`

**Create**: New file

**Code**: [See design-development-plan.md for template]

### 3.2 Create Other Repositories

Create similar files for:
- `design-brief.repository.ts`
- `product-design.repository.ts`
- `tech-pack.repository.ts`
- `design-deck.repository.ts`
- `design-review.repository.ts`

### 3.3 Create Repositories Index

**File**: `lib/features/design/repositories/index.ts`

**Create**: New file

**Code**:

```typescript
export { DesignProjectRepository } from "./design-project.repository";
export { DesignBriefRepository } from "./design-brief.repository";
export { ProductDesignRepository } from "./product-design.repository";
export { TechPackRepository } from "./tech-pack.repository";
export { DesignDeckRepository } from "./design-deck.repository";
export { DesignReviewRepository } from "./design-review.repository";
```

---

## PHASE 4: SERVICE LAYER

### 4.1 Create Services Index

**File**: `lib/features/design/services/index.ts`

**Create**: New file

**Code**:

```typescript
export { DesignProjectService } from "./design-project.service";
export { DesignBriefService } from "./design-brief.service";
export { ProductDesignService } from "./product-design.service";
export { TechPackService } from "./tech-pack.service";
export { DesignDeckService } from "./design-deck.service";
export { DesignReviewService } from "./design-review.service";
```

---

## PHASE 5: SERVER ACTIONS

### 5.1 Create Actions Index

**File**: `lib/features/design/actions/index.ts`

**Create**: New file

**Code**:

```typescript
export * from "./design-project.actions";
export * from "./design-brief.actions";
export * from "./product-design.actions";
export * from "./tech-pack.actions";
export * from "./design-deck.actions";
export * from "./design-review.actions";
export * from "./search.actions";
```

---

## PHASE 6: FEATURE MODULE INDEX

### 6.1 Create Feature Module Index

**File**: `lib/features/design/index.ts`

**Create**: New file

**Code**:

```typescript
// Export all services
export * from "./services";

// Export all repositories
export * from "./repositories";

// Export all actions
export * from "./actions";

// Export all types
export * from "./types";
```

---

## VERIFICATION CHECKLIST

After implementing each phase, verify:

### Phase 1: Schema & Migration
- [ ] Models added to `prisma/schema.prisma`
- [ ] Enums added to `prisma/schema.prisma`
- [ ] Customer model updated with `designProjects` relation
- [ ] Migration created successfully
- [ ] `yarn db:generate` executed without errors
- [ ] New types in `@/generated/prisma` include Design models

### Phase 2: Types
- [ ] `lib/features/design/types/` directory created
- [ ] `design.types.ts` has all type definitions
- [ ] `index.ts` exports all types
- [ ] No TypeScript errors in types file
- [ ] Types match Prisma schema exactly

### Phase 3: Repositories
- [ ] `lib/features/design/repositories/` directory created
- [ ] All 6 repositories created
- [ ] Each repository has CRUD methods
- [ ] `index.ts` exports all repositories
- [ ] No TypeScript errors

### Phase 4: Services
- [ ] `lib/features/design/services/` directory created
- [ ] All 6 services created
- [ ] Each service wraps repository calls
- [ ] Services include validation and error handling
- [ ] `index.ts` exports all services

### Phase 5: Server Actions
- [ ] `lib/features/design/actions/` directory created
- [ ] All 6 action files created
- [ ] Each action includes permission checks
- [ ] Actions trigger Pusher notifications
- [ ] Actions revalidate paths
- [ ] `index.ts` exports all actions

### Phase 6: Module Index
- [ ] `lib/features/design/index.ts` created
- [ ] All exports are correct
- [ ] Module is importable as `@/lib/features/design`

---

## QUICK REFERENCE: Important File Locations

```
Database:
  prisma/schema.prisma                    (Add models, enums, relations)

Types:
  lib/features/design/types/design.types.ts
  lib/features/design/types/index.ts

Repositories:
  lib/features/design/repositories/*.ts   (6 files)
  lib/features/design/repositories/index.ts

Services:
  lib/features/design/services/*.ts       (6 files)
  lib/features/design/services/index.ts

Actions:
  lib/features/design/actions/*.ts        (7 files)
  lib/features/design/actions/index.ts

Module:
  lib/features/design/index.ts            (Barrel export)
```

---

## COMMON PITFALLS TO AVOID

1. **Migration Issues**
   - Always run `yarn db:generate` after migration
   - Never modify migration files after creation
   - Use consistent casing (camelCase for fields, PascalCase for relations)

2. **Type Errors**
   - Import enums from `@/generated/prisma/enums`
   - All type names must match exactly
   - Use `?` for nullable fields, `| null` for optional relations

3. **Repository Patterns**
   - Always include relations in queries
   - Use consistent include patterns across repositories
   - Add indexes for frequently queried fields

4. **Service Layer**
   - Always validate input before querying DB
   - Wrap in try/catch, return ActionResult
   - Don't expose Prisma errors directly to user

5. **Server Actions**
   - Always check `"use server"` directive
   - Always call `requirePermission()` first
   - Trigger Pusher notification AFTER DB success
   - Revalidate paths related to the resource

---

## TESTING COMMANDS

```bash
# Type checking
yarn check-types

# Format code (before committing)
yarn format

# Run unit tests (after creating tests)
yarn test:unit

# View database (GUI)
yarn db:studio

# Check migrations status
yarn db:migrate status
```

---

**Document Status**: ✅ Complete Implementation Guide Ready
**Use this document to execute Phase 1-6 step by step**
