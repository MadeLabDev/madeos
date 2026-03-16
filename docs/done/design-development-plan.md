# Design x Development Workspace - Database Design Plan

**Status**: Planning (Not yet implemented)
**Created**: November 26, 2025
**Purpose**: Complete guide to implement Design x Development vertical using Testing vertical as pattern reference
**Last Updated**: November 26, 2025

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Context & Analysis](#context--analysis)
3. [Database Design Specification](#database-design-specification)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Feature Module Structure](#feature-module-structure)
6. [API & Service Layer](#api--service-layer)
7. [Type Definitions](#type-definitions)
8. [Enums Reference](#enums-reference)

---

## EXECUTIVE SUMMARY

### Goal
Implement **Design x Development Vertical** for MADE OS by replicating the proven **Testing x Development** pattern, adapted for design workflows instead of testing workflows.

### Key Decisions
- **Reuse CRM Foundation**: Customer, Contact, Opportunity, Engagement, Interaction, Task, Media models
- **Vertical-Specific Models**: Add 6 new design models (DesignProject, DesignBrief, ProductDesign, TechPack, DesignDeck, DesignReview)
- **Pattern Inheritance**: Follow Testing's 3-layer architecture (CRM → Vertical → Workflow-specific)
- **File Management**: Leverage existing Media model for all design asset storage

### Scope
- Database schema (Prisma models + enums)
- Feature module structure (services, repositories, actions)
- Type definitions (TypeScript interfaces)
- Zero changes to existing working models

---

## CONTEXT & ANALYSIS

### Reference: Testing x Development (Working Model)

**Testing Architecture:**
```
CRM Layer (existing)
    ↓
Opportunity → Engagement (type: TESTING)
    ↓
TestOrder → Sample → TestSuite → Test → TestReport
```

**Key Testing Models:**
1. **TestOrder** - Main container from Engagement (like a sales order)
   - Links to Engagement (1:N)
   - Contains multiple Samples, TestSuites, Tests, Reports
   - Has workflow status: DRAFT → ACTIVE → COMPLETED
   
2. **Sample** - Input data (physical/digital samples to test)
   - 1 TestOrder → N Samples
   - Tracks sample condition, location, quantity
   - Linked to Media for attachments
   
3. **TestSuite** - Reusable collection of tests
   - N:N junction (TestSuiteOnOrder) with TestOrder
   - Defines standardized test procedures
   - Can be applied to multiple test orders
   
4. **Test** - Individual test execution
   - Performs actual testing work
   - Captures measured data (parameters, results)
   - Has status: PENDING → IN_PROGRESS → COMPLETED
   
5. **TestReport** - Generated output (versioned)
   - Contains findings, recommendations
   - Can be DRAFT → REVIEW → APPROVED → PUBLISHED
   - Tracks approval workflow

**Testing Enums (Workflow Management):**
```
TestOrderStatus: DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
SampleStatus: RECEIVED, IN_PROCESSING, PROCESSED, RETURNED, DISPOSED
TestStatus: PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
ReportStatus: DRAFT, REVIEW, APPROVED, PUBLISHED, REJECTED
```

**Testing Feature Structure:**
```
lib/features/testing/
├── actions/          # Server actions (permission checks, triggers, revalidation)
├── services/         # Business logic (validation, orchestration)
├── repositories/     # Database queries (Prisma)
├── types/           # TypeScript interfaces
└── index.ts         # Barrel exports
```

### Design x Development Requirements (from Project Outline)

**Key Objects:**
- Design Project
- Design Deck
- Product Design
- Mockups
- Graphic Specs
- Separation Files
- Output Files (DTG/DTF/Transfer)
- Embroidery Files
- Engineering Specifications
- Tech Packs
- Optional product configurator

**Core Workflows:**
1. **Intake**: Create project from Opportunity + intake form (brand assets, goals, constraints)
2. **Concepting**: Upload assets, select products, add decoration details, run compatibility logic
3. **Feasibility/Engineering**: Validate compatibility, status: Draft → Feasibility → Approved
4. **Deliverables**: Design deck, tech packs, asset files, versioning, customer approvals

**Deliverables Output:**
- Design deck (presentation)
- Tech packs (manufacturing specs)
- Asset files (all design files)
- Versioning tracked
- Customer approvals

### Pattern Mapping: Testing → Design

| Aspect | Testing | Design |
|--------|---------|--------|
| **Main Container** | TestOrder | **DesignProject** |
| **Input/Brief** | Sample | **DesignBrief** |
| **Work Item** | Test | **ProductDesign** |
| **Collection** | TestSuite | **DesignDeck** |
| **Output/Report** | TestReport | **DesignReview** + **TechPack** |
| **Workflow Type** | Linear (Test → Report) | Iterative (Design → Review → Revision) |
| **Data Focus** | Measurements | Versions & Approvals |
| **Status Flow** | Sequential | Branching (with revisions) |

### Key Differences (Design vs Testing)

**Testing Characteristic:**
- Linear progression through test phase
- Focus on capturing measured data
- Report generation is final step
- Minimal iteration needed

**Design Characteristics:**
- Iterative refinement with feedback loops
- Multiple design versions/iterations
- Multiple review cycles (customer, internal, feasibility)
- Multiple output file types (DTG, DTF, Embroidery, Specs)
- Approval workflow before production

**Design Additional Needs:**
1. **Versioning** - Design iterations, not just updates
2. **Feedback Loop** - Review → Revision → Re-review cycle
3. **File Type Variety** - Different output formats for different manufacturing methods
4. **Feasibility Checking** - Engineering validation of designs
5. **Asset Management** - Complex file organization (brand kit, design files, output files)
6. **Deck/Presentation** - Collection of approved designs + documentation

---

## DATABASE DESIGN SPECIFICATION

### Models to Add

#### 1. DesignProject
**Purpose**: Main container for a design engagement
**Analogous to**: TestOrder in Testing vertical
**Relations**: 1 Engagement → N DesignProjects

```prisma
model DesignProject {
  id             String              @id @default(cuid())
  
  // Core links
  engagementId   String              // From Engagement (type: DESIGN)
  customerId     String              // From Customer
  
  // Basic info
  title          String
  description    String?
  
  // Workflow
  status         DesignProjectStatus @default(DRAFT)
  priority       String              @default("MEDIUM")  // LOW, MEDIUM, HIGH
  
  // Assignment & ownership
  requestedBy    String              // User ID (who initiated)
  assignedTo     String?             // Lead Designer
  
  // Timeline
  startDate      DateTime?
  dueDate        DateTime?
  completedAt    DateTime?
  
  // Budget
  budget         Float?              // Design budget allocation
  
  // Metadata
  metaData       Json?               // Additional custom fields
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
  createdBy      String?             // Audit field
  updatedBy      String?             // Audit field
  
  // Relations
  engagement     Engagement          @relation(fields: [engagementId], references: [id], onDelete: Cascade)
  customer       Customer            @relation("DesignProjects", fields: [customerId], references: [id], onDelete: Cascade)
  brief          DesignBrief?        // 1:1 - One brief per project
  designs        ProductDesign[]     // 1:N - Many designs
  deck           DesignDeck?         // 1:1 - One main deck
  reviews        DesignReview[]      // 1:N - Many reviews
  
  // Indexes
  @@index([engagementId])
  @@index([customerId])
  @@index([status])
  @@index([assignedTo])
  @@index([dueDate])
  @@index([createdAt])
}
```

**Explanation:**
- Links to Engagement (must be type: DESIGN)
- Contains all project metadata and timeline
- Gateway to brief, designs, deck, and reviews
- Single assignedTo (lead designer responsible)

---

#### 2. DesignBrief
**Purpose**: Capture initial requirements and constraints
**Analogous to**: Sample in Testing (input data)
**Relations**: 1 DesignProject → 1 DesignBrief

```prisma
model DesignBrief {
  id                String             @id @default(cuid())
  designProjectId   String             @unique  // 1:1 relationship
  
  // Brand & target info
  brandAssets       String?            // JSON: logo references, brand files, etc.
  targetAudience    String?            // Description of target market
  
  // Constraints & requirements
  constraints       String?            // JSON: size limits, color restrictions, materials, etc.
  inspirations      String?            // JSON array of inspiration references/URLs
  
  // Deliverables definition
  deliverables      String?            // JSON: list of expected outputs
  // Example: ["tshirt_mockups", "embroidery_files", "tech_pack"]
  
  // Timeline & budget
  budget            Float?             // Project budget from intake
  timeline          String?            // JSON: phases and internal deadlines
  
  // Additional details
  notes             String?            @db.Text  // Long-form notes from intake meeting
  
  // Brand kit files (link to Media)
  mediaIds          String?            // JSON array of Media IDs (brand assets, references)
  
  // Approval status
  status            DesignBriefStatus  @default(PENDING)  // PENDING, APPROVED, REJECTED
  approvedAt        DateTime?
  approvedBy        String?
  
  // Metadata
  metaData          Json?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  createdBy         String?
  updatedBy         String?
  
  // Relations
  designProject     DesignProject      @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([designProjectId])
  @@index([status])
  @@index([createdAt])
}
```

**Explanation:**
- Single brief per project (intake questionnaire)
- Stores all customer requirements as JSON
- Tracks brand assets and inspiration files
- Requires approval before design work begins
- Acts as reference throughout design process

---

#### 3. ProductDesign
**Purpose**: Individual design for a specific product variant
**Analogous to**: Test in Testing (individual work item)
**Relations**: 1 DesignProject → N ProductDesigns, N ProductDesigns → 1 TechPack

```prisma
model ProductDesign {
  id                String              @id @default(cuid())
  designProjectId   String              // Parent project
  
  // Basic identification
  name              String              // e.g., "Classic T-Shirt Front", "Cap Embroidery"
  description       String?
  
  // Design classification
  designType        String              @default("GRAPHIC")  
  // Types: GRAPHIC, EMBROIDERY, PRINT, DTG, DTF, SCREEN_PRINT, SUBLIMATION, etc.
  productType       String?             // e.g., "T-Shirt", "Cap", "Tote Bag", "Hoodie"
  
  // Design assets & specs
  mockupUrl         String?             // URL to mockup image (from Media)
  graphicSpecsFile  String?             // Graphic specs document/file reference
  
  // Color & layer information
  layerInfo         Json?               // JSON: layer breakdown for separation
  // {layers: [{name, color, type}, ...]}
  colorSeparations  String?             // JSON array of color separations
  // [{color_name: "Black", pantone: "...", rgb: "...", }]
  
  // Engineering & feasibility
  status            ProductDesignStatus @default(DRAFT)
  // DRAFT → CONCEPT → FEASIBILITY → APPROVED → REJECTED
  
  feasibilityNotes  String?             @db.Text  // Engineering feedback
  compatibilityCheck Boolean            @default(false)  // Validated against product specs
  
  // Decoration details
  decorationDetails Json?               // JSON: position, size, rotation, placement
  // {x: 50, y: 50, width: 200, height: 150, rotation: 0, colors: [...]}
  
  // File associations
  mediaIds          String?             // JSON array of Media IDs (design files)
  
  // Versioning
  version           Int                 @default(1)  // Version number
  parentDesignId    String?             // If this is iteration/revision
  
  // Work tracking
  assignedTo        String?             // Designer working on this
  startedAt         DateTime?
  completedAt       DateTime?
  
  // Metadata
  metaData          Json?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  createdBy         String?
  updatedBy         String?
  
  // Relations
  designProject     DesignProject       @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  parentDesign      ProductDesign?      @relation("DesignVersions", fields: [parentDesignId], references: [id])
  versions          ProductDesign[]     @relation("DesignVersions")  // Revisions
  techPack          TechPack?           // 1:1 - One tech pack per approved design
  reviews           DesignReview[]      // 1:N - Multiple reviews
  
  // Indexes
  @@index([designProjectId])
  @@index([status])
  @@index([designType])
  @@index([productType])
  @@index([assignedTo])
  @@index([parentDesignId])
  @@index([createdAt])
}
```

**Explanation:**
- Represents one specific design within a project
- Can have multiple versions (iterations)
- Tracks design files via mediaIds
- Stores technical specifications (colors, layers, positioning)
- Feasibility status tracks engineering validation
- Links to single TechPack when approved
- Multiple reviews track feedback

---

#### 4. TechPack
**Purpose**: Manufacturing specifications and output files for approved design
**Analogous to**: Test Results/Report output
**Relations**: 1 ProductDesign → 1 TechPack

```prisma
model TechPack {
  id                String           @id @default(cuid())
  productDesignId   String           @unique  // 1:1 relationship
  
  // Basic info
  name              String
  description       String?
  
  // Manufacturing specifications
  sizing            Json?            // JSON: size chart, measurements, tolerances
  // {sizes: [{label: "S", chest: 38, length: 28}]}
  
  materials         Json?            // JSON: material list, costs, suppliers
  // [{material: "100% Cotton", supplier: "XYZ", cost: 5.50}]
  
  colors            Json?            // JSON: final color specifications
  // [{name: "Black", pantone: "Black 6C", rgb: "000000", cmyk: "0,0,0,100"}]
  
  // Production information
  decorationMethod  String           // Manufacturing process
  // Values: DTG, DTF, EMBROIDERY, SCREEN_PRINT, SUBLIMATION, etc.
  
  productionNotes   String?          @db.Text  // Detailed production instructions
  qualitySpecs      Json?            // Quality standards and tolerances
  
  // Output files specification
  outputFiles       String?          // JSON array of output file specifications
  // [{type: "DTG_PRINT", filename: "design_DTG.tiff", mediaId: "...", fileSize: 50000},
  //  {type: "EMBROIDERY", filename: "design.pes", mediaId: "...", fileSize: 100000},
  //  {type: "TECH_PACK_PDF", filename: "techpack.pdf", mediaId: "..."}]
  
  // Approval workflow
  status            TechPackStatus   @default(DRAFT)
  // DRAFT → REVIEW → APPROVED → PRODUCTION_READY
  
  approvedAt        DateTime?
  approvedBy        String?
  
  // Metadata
  metaData          Json?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  createdBy         String?
  updatedBy         String?
  
  // Relations
  productDesign     ProductDesign    @relation(fields: [productDesignId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([productDesignId])
  @@index([status])
  @@index([decorationMethod])
  @@index([approvedAt])
  @@index([createdAt])
}
```

**Explanation:**
- Created after design is approved
- Contains all manufacturing data (sizing, materials, colors)
- Tracks multiple output file types (DTG, Embroidery, PDF, etc.)
- Each output file linked to Media model via mediaId
- Follows approval workflow (DRAFT → PRODUCTION_READY)
- Audit fields track who approved and when

---

#### 5. DesignDeck
**Purpose**: Collection and presentation of approved designs
**Analogous to**: TestSuite (collection of items)
**Relations**: 1 DesignProject → 1 DesignDeck

```prisma
model DesignDeck {
  id                String           @id @default(cuid())
  designProjectId   String           @unique  // 1:1 - Main deck per project
  
  // Presentation info
  title             String
  description       String?
  
  // Content references
  coverUrl          String?          // Deck thumbnail/cover image
  designIds         String?          // JSON array of included ProductDesign IDs
  // Example: ["design_1", "design_2", "design_3"]
  
  // Documentation files
  deckUrl           String?          // Final deck file (PDF, PowerPoint, etc.)
  mediaIds          String?          // JSON array of Media IDs (all deck assets)
  
  // Publishing workflow
  status            DesignDeckStatus @default(DRAFT)
  // DRAFT → REVIEW → APPROVED → PUBLISHED
  
  publishedAt       DateTime?
  publishedBy       String?
  
  // Versioning
  version           Int              @default(1)  // Track deck versions
  notes             String?          // Release notes or summary
  
  // Metadata
  metaData          Json?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  createdBy         String?
  updatedBy         String?
  
  // Relations
  designProject     DesignProject    @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([designProjectId])
  @@index([status])
  @@index([publishedAt])
  @@index([createdAt])
}
```

**Explanation:**
- One deck per project (main presentation)
- References selected designs via designIds JSON array
- Stores deck file (PowerPoint/PDF) via Media
- Tracks presentation status (DRAFT → PUBLISHED)
- Versioning allows updating deck as project evolves
- Used for customer delivery/presentation

---

#### 6. DesignReview
**Purpose**: Feedback, approval, and revision tracking
**Analogous to**: TestReport (output + approval workflow)
**Relations**: 1 DesignProject → N DesignReviews, 1 ProductDesign → N DesignReviews (optional)

```prisma
model DesignReview {
  id                String              @id @default(cuid())
  designProjectId   String              // Parent project
  productDesignId   String?             // Optional: specific design if reviewing individual item
  
  // Review details
  title             String
  description       String?
  
  // Feedback content
  feedback          String?             @db.Text  // Detailed feedback/comments
  requestedChanges  Json?               // JSON: structured change requests
  // [{field: "colors", suggestion: "Use darker blue", priority: "HIGH"}]
  
  attachments       String?             // JSON array of Media IDs (annotated images, references)
  
  // Review metadata
  reviewType        String              @default("CUSTOMER")
  // Types: CUSTOMER, INTERNAL, FEASIBILITY, ENGINEERING
  
  // Approval workflow
  status            DesignReviewStatus  @default(PENDING)
  // PENDING → APPROVED / REVISION_NEEDED / REJECTED
  
  reviewedAt        DateTime?
  reviewedBy        String?             // Who performed the review
  approvedAt        DateTime?
  approvedBy        String?             // Who approved
  
  // Versioning
  version           Int                 @default(1)  // Track review versions
  
  // Related files
  mediaIds          String?             // JSON array of Media IDs (annotated mockups, references)
  
  // Metadata
  metaData          Json?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  createdBy         String?
  updatedBy         String?
  
  // Relations
  designProject     DesignProject       @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
  productDesign     ProductDesign?      @relation(fields: [productDesignId], references: [id])
  
  // Indexes
  @@index([designProjectId])
  @@index([productDesignId])
  @@index([status])
  @@index([reviewType])
  @@index([reviewedAt])
  @@index([createdAt])
}
```

**Explanation:**
- Can be at project level (general feedback) or design level (specific)
- Captures customer, internal, and engineering feedback
- Structured requestedChanges for clarity
- Multiple reviews possible (revision loop)
- Tracks approval workflow (PENDING → APPROVED/REVISION_NEEDED)
- Attached files for annotated mockups, references
- Audit fields for review attribution

---

### Enums to Add

```prisma
/// *
/// Design Project Status - Main workflow
enum DesignProjectStatus {
  DRAFT              // Initial state, intake in progress
  CONCEPT            // Early design concepts being explored
  FEASIBILITY        // Engineering validation phase
  APPROVED           // Final design approved, ready for production
  COMPLETED          // Project finished and delivered
  ON_HOLD            // Temporarily paused
  CANCELLED          // Project cancelled
}

/// *
/// Design Brief Status - Intake approval
enum DesignBriefStatus {
  PENDING            // Awaiting approval
  APPROVED           // Brief approved, design can start
  REJECTED           // Brief rejected, needs revision
}

/// *
/// Product Design Status - Design evolution
enum ProductDesignStatus {
  DRAFT              // Initial sketch/concept
  CONCEPT            // Developed concept, not yet validated
  FEASIBILITY        // Under engineering review
  APPROVED           // Engineering approved, ready for tech pack
  REJECTED           // Failed feasibility, needs revision
}

/// *
/// Tech Pack Status - Manufacturing specs
enum TechPackStatus {
  DRAFT              // Initial specifications
  REVIEW             // Under review by manufacturing
  APPROVED           // Approved for manufacturing
  PRODUCTION_READY   // Ready to send to production
}

/// *
/// Design Deck Status - Presentation/delivery
enum DesignDeckStatus {
  DRAFT              // In progress
  REVIEW             // Under review
  APPROVED           // Approved for presentation
  PUBLISHED          // Delivered to customer
}

/// *
/// Design Review Status - Feedback workflow
enum DesignReviewStatus {
  PENDING            // Awaiting review response
  APPROVED           // Review approved, no changes needed
  REVISION_NEEDED    // Changes requested, iteration required
  REJECTED           // Design rejected, major revision needed
}

/// *
/// Review Type - Who is reviewing
enum DesignReviewType {
  CUSTOMER           // Customer feedback/approval
  INTERNAL           // Internal team review
  FEASIBILITY        // Engineering feasibility check
  ENGINEERING        // Manufacturing engineer validation
}
```

---

### Relations Summary

```
Customer (existing)
  ↓
  └── DesignProject (1:N)
      ├── DesignBrief (1:1)
      ├── ProductDesign (1:N)
      │   ├── TechPack (1:1)
      │   └── DesignReview (1:N)
      ├── DesignDeck (1:1)
      └── DesignReview (1:N)

Engagement (existing, type: DESIGN)
  ↓
  └── DesignProject (1:N)

Media (existing)
  ↓
  Linked via:
  - DesignBrief.mediaIds (brand assets)
  - ProductDesign.mediaIds (design files)
  - DesignDeck.mediaIds (deck assets)
  - TechPack.outputFiles[] (output files)
  - DesignReview.mediaIds (annotated files)
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Schema & Models (Week 1)
**Objective**: Add all models and enums to Prisma schema

**Tasks:**
1. Add all 6 models to `prisma/schema.prisma`
   - DesignProject
   - DesignBrief
   - ProductDesign
   - TechPack
   - DesignDeck
   - DesignReview

2. Add all 6 enums to `prisma/schema.prisma`
   - DesignProjectStatus
   - DesignBriefStatus
   - ProductDesignStatus
   - TechPackStatus
   - DesignDeckStatus
   - DesignReviewStatus

3. Update existing models:
   - Customer: Add `designProjects` relation
   - Engagement: Add validation for type: DESIGN

4. Run migration:
   ```bash
   yarn db:migrate  # Migration name: "add-design-models"
   ```

5. Regenerate Prisma client:
   ```bash
   yarn db:generate
   ```

**Deliverable**: Updated schema.prisma with all design models

---

### Phase 2: Feature Module Structure (Week 1-2)
**Objective**: Create TypeScript types and repository layer

**Create Directory Structure:**
```
lib/features/design/
├── actions/
│   ├── design-project.actions.ts
│   ├── design-brief.actions.ts
│   ├── product-design.actions.ts
│   ├── tech-pack.actions.ts
│   ├── design-deck.actions.ts
│   ├── design-review.actions.ts
│   ├── search.actions.ts
│   └── index.ts
├── services/
│   ├── design-project.service.ts
│   ├── design-brief.service.ts
│   ├── product-design.service.ts
│   ├── tech-pack.service.ts
│   ├── design-deck.service.ts
│   ├── design-review.service.ts
│   ├── design-compatibility.service.ts
│   └── index.ts
├── repositories/
│   ├── design-project.repository.ts
│   ├── design-brief.repository.ts
│   ├── product-design.repository.ts
│   ├── tech-pack.repository.ts
│   ├── design-deck.repository.ts
│   ├── design-review.repository.ts
│   └── index.ts
├── types/
│   ├── design.types.ts
│   └── index.ts
└── index.ts
```

**Type Definitions Template:**

File: `lib/features/design/types/design.types.ts`
```typescript
import {
  DesignProjectStatus,
  DesignBriefStatus,
  ProductDesignStatus,
  TechPackStatus,
  DesignDeckStatus,
  DesignReviewStatus,
  DesignReviewType,
} from "@/generated/prisma/enums";

// Base types
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

// ... [Similar types for DesignBrief, ProductDesign, TechPack, DesignDeck, DesignReview]

// Input types for creating/updating
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

// ... [Similar input types for all models]

// Filter types for queries
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

// ... [Similar filter types for all models]

// Relation types (with nested relations)
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

// Standard response type
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
```

**Repository Pattern Example:**

File: `lib/features/design/repositories/design-project.repository.ts`
```typescript
import { prisma } from "@/lib/prisma";
import {
  DesignProjectWithRelations,
  CreateDesignProjectInput,
  UpdateDesignProjectInput,
  DesignProjectFilters,
} from "../types";

export class DesignProjectRepository {
  /**
   * Find design project by ID with all relations
   */
  static async findById(id: string): Promise<DesignProjectWithRelations | null> {
    return prisma.designProject.findUnique({
      where: { id },
      include: {
        brief: true,
        designs: true,
        deck: true,
        reviews: true,
      },
    });
  }

  /**
   * Find multiple design projects with pagination and filters
   */
  static async findMany(
    filters: DesignProjectFilters = {},
    options: { skip?: number; take?: number } = {}
  ): Promise<DesignProjectWithRelations[]> {
    const where: any = {};

    if (filters.engagementId) where.engagementId = filters.engagementId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.requestedBy) where.requestedBy = filters.requestedBy;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.designProject.findMany({
      where,
      include: {
        brief: true,
        designs: true,
        deck: true,
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
    });
  }

  /**
   * Create new design project
   */
  static async create(
    input: CreateDesignProjectInput & { updatedBy: string }
  ): Promise<DesignProjectWithRelations> {
    return prisma.designProject.create({
      data: input,
      include: {
        brief: true,
        designs: true,
        deck: true,
        reviews: true,
      },
    });
  }

  /**
   * Update design project
   */
  static async update(
    id: string,
    input: UpdateDesignProjectInput
  ): Promise<DesignProjectWithRelations> {
    return prisma.designProject.update({
      where: { id },
      data: input,
      include: {
        brief: true,
        designs: true,
        deck: true,
        reviews: true,
      },
    });
  }

  /**
   * Delete design project
   */
  static async delete(id: string): Promise<DesignProjectWithRelations> {
    return prisma.designProject.delete({
      where: { id },
      include: {
        brief: true,
        designs: true,
        deck: true,
        reviews: true,
      },
    });
  }

  /**
   * Count design projects by status
   */
  static async countByStatus(customerId: string): Promise<Record<string, number>> {
    const statuses = await prisma.designProject.groupBy({
      by: ["status"],
      where: { customerId },
      _count: true,
    });

    return statuses.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);
  }
}
```

**Deliverables:**
- All type definitions in `lib/features/design/types/design.types.ts`
- All repositories in `lib/features/design/repositories/`
- All services in `lib/features/design/services/`
- Index files with barrel exports

---

### Phase 3: Service Layer (Week 2)
**Objective**: Business logic and validation

**Service Pattern Example:**

File: `lib/features/design/services/design-project.service.ts`
```typescript
import { DesignProjectRepository } from "../repositories";
import {
  CreateDesignProjectInput,
  UpdateDesignProjectInput,
  ActionResult,
  DesignProjectWithRelations,
  DesignProjectFilters,
} from "../types";

export class DesignProjectService {
  /**
   * Get all design projects with filters
   */
  static async getDesignProjects(
    filters: DesignProjectFilters = {},
    options: { skip?: number; take?: number } = {}
  ): Promise<DesignProjectWithRelations[]> {
    try {
      return await DesignProjectRepository.findMany(filters, options);
    } catch (error) {
      throw new Error(
        `Failed to fetch design projects: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get single design project by ID
   */
  static async getDesignProjectById(
    id: string
  ): Promise<DesignProjectWithRelations | null> {
    try {
      return await DesignProjectRepository.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to fetch design project: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Create new design project with validation
   */
  static async createDesignProject(
    input: CreateDesignProjectInput & { createdBy: string }
  ): Promise<ActionResult<DesignProjectWithRelations>> {
    try {
      // Validation
      if (!input.title?.trim()) {
        return {
          success: false,
          message: "Project title is required",
        };
      }

      const designProject = await DesignProjectRepository.create({
        ...input,
        updatedBy: input.createdBy,
      });

      return {
        success: true,
        data: designProject,
        message: "Design project created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create design project",
      };
    }
  }

  /**
   * Update design project
   */
  static async updateDesignProject(
    id: string,
    input: UpdateDesignProjectInput & { updatedBy: string }
  ): Promise<ActionResult<DesignProjectWithRelations>> {
    try {
      const existing = await DesignProjectRepository.findById(id);
      if (!existing) {
        return {
          success: false,
          message: "Design project not found",
        };
      }

      const designProject = await DesignProjectRepository.update(id, input);

      return {
        success: true,
        data: designProject,
        message: "Design project updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update design project",
      };
    }
  }

  /**
   * Delete design project
   */
  static async deleteDesignProject(
    id: string
  ): Promise<ActionResult<DesignProjectWithRelations>> {
    try {
      const existing = await DesignProjectRepository.findById(id);
      if (!existing) {
        return {
          success: false,
          message: "Design project not found",
        };
      }

      const designProject = await DesignProjectRepository.delete(id);

      return {
        success: true,
        data: designProject,
        message: "Design project deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete design project",
      };
    }
  }
}
```

---

### Phase 4: Server Actions (Week 2-3)
**Objective**: API endpoints with permission checks and real-time sync

**Server Actions Pattern Example:**

File: `lib/features/design/actions/design-project.actions.ts`
```typescript
"use server";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { DesignProjectService } from "../services";
import { CreateDesignProjectInput, UpdateDesignProjectInput, ActionResult } from "../types";
import { revalidatePath } from "next/cache";
import { getPusher } from "@/lib/realtime";

/**
 * Get all design projects (READ action)
 */
export async function getDesignProjectsAction(filters: any = {}, options: any = {}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    // No permission check needed for read (if allowed in RBAC)
    const projects = await DesignProjectService.getDesignProjects(filters, options);
    return { success: true, data: projects };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch design projects",
    };
  }
}

/**
 * Create design project (CREATE action)
 */
export async function createDesignProjectAction(
  input: CreateDesignProjectInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check permission
    await requirePermission("design", "create");

    const result = await DesignProjectService.createDesignProject({
      ...input,
      createdBy: session.user.id,
      requestedBy: input.requestedBy || session.user.id,
    });

    if (result.success) {
      // Trigger real-time notification
      await getPusher().trigger("private-global", "design_update", {
        action: "design_project_created",
        project: result.data,
      });

      // Revalidate cache
      revalidatePath("/design");
      revalidatePath("/design-projects");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create design project",
    };
  }
}

/**
 * Update design project (UPDATE action)
 */
export async function updateDesignProjectAction(
  id: string,
  input: UpdateDesignProjectInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check permission
    await requirePermission("design", "update");

    const result = await DesignProjectService.updateDesignProject(id, {
      ...input,
      updatedBy: session.user.id,
    });

    if (result.success) {
      // Trigger real-time notification
      await getPusher().trigger("private-global", "design_update", {
        action: "design_project_updated",
        project: result.data,
      });

      // Revalidate cache
      revalidatePath("/design");
      revalidatePath(`/design/${id}`);
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update design project",
    };
  }
}

/**
 * Delete design project (DELETE action)
 */
export async function deleteDesignProjectAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check permission
    await requirePermission("design", "delete");

    const result = await DesignProjectService.deleteDesignProject(id);

    if (result.success) {
      // Trigger real-time notification
      await getPusher().trigger("private-global", "design_update", {
        action: "design_project_deleted",
        projectId: id,
      });

      // Revalidate cache
      revalidatePath("/design");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete design project",
    };
  }
}
```

**Key Patterns:**
1. Always check `requirePermission("design", "action")`
2. Add `createdBy`/`updatedBy` from session
3. Trigger Pusher notification on success
4. Revalidate relevant paths
5. Return `ActionResult` type
6. Wrap in try/catch with proper error handling

---

### Phase 5: UI Pages & Components (Week 3-4)
**Objective**: Create Next.js pages and React components

**Page Structure:**
```
app/(dashboard)/design/
├── page.tsx                 # List all design projects
├── [id]/
│   ├── page.tsx            # Design project detail
│   ├── brief/
│   │   └── page.tsx        # Design brief section
│   ├── designs/
│   │   ├── page.tsx        # Product designs list
│   │   └── [designId]/
│   │       └── page.tsx    # Individual design detail
│   ├── deck/
│   │   └── page.tsx        # Design deck section
│   └── reviews/
│       └── page.tsx        # Reviews & feedback section
├── new/
│   └── page.tsx            # Create new design project
└── components/
    ├── design-project-list.tsx
    ├── design-project-form.tsx
    ├── product-design-card.tsx
    └── design-review-dialog.tsx
```

**Status**: To be implemented in Phase 5

---

### Phase 6: Testing & Validation (Week 4)
**Objective**: Unit tests, integration tests, e2e tests

**Test Structure:**
```
tests/
├── unit/
│   └── features/design/
│       ├── design-project.service.test.ts
│       └── design-project.repository.test.ts
├── integration/
│   └── features/design/
│       └── design-project.actions.test.ts
└── e2e/
    └── design-workflow.spec.ts
```

**Status**: To be implemented in Phase 6

---

## FEATURE MODULE STRUCTURE

### Directory Organization

```
lib/features/design/                    # Main feature module
├── actions/
│   ├── design-project.actions.ts       # CRUD server actions for DesignProject
│   ├── design-brief.actions.ts         # CRUD server actions for DesignBrief
│   ├── product-design.actions.ts       # CRUD server actions for ProductDesign
│   ├── tech-pack.actions.ts            # CRUD server actions for TechPack
│   ├── design-deck.actions.ts          # CRUD server actions for DesignDeck
│   ├── design-review.actions.ts        # CRUD server actions for DesignReview
│   ├── search.actions.ts               # Search across all design items
│   └── index.ts                        # Export all actions
│
├── services/
│   ├── design-project.service.ts       # Business logic for DesignProject
│   ├── design-brief.service.ts         # Business logic for DesignBrief
│   ├── product-design.service.ts       # Business logic for ProductDesign
│   ├── tech-pack.service.ts            # Business logic for TechPack
│   ├── design-deck.service.ts          # Business logic for DesignDeck
│   ├── design-review.service.ts        # Business logic for DesignReview
│   ├── design-compatibility.service.ts # Feasibility check logic
│   └── index.ts                        # Export all services
│
├── repositories/
│   ├── design-project.repository.ts    # DB queries for DesignProject
│   ├── design-brief.repository.ts      # DB queries for DesignBrief
│   ├── product-design.repository.ts    # DB queries for ProductDesign
│   ├── tech-pack.repository.ts         # DB queries for TechPack
│   ├── design-deck.repository.ts       # DB queries for DesignDeck
│   ├── design-review.repository.ts     # DB queries for DesignReview
│   └── index.ts                        # Export all repositories
│
├── types/
│   ├── design.types.ts                 # All TypeScript type definitions
│   └── index.ts                        # Export all types
│
└── index.ts                            # Barrel export of feature module
```

### Barrel Export Pattern

**File: `lib/features/design/index.ts`**
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

## API & SERVICE LAYER

### Service Class Pattern

Each service class (`*Service`) contains:
1. **Read operations** - `get*`, `find*`
2. **Write operations** - `create*`, `update*`, `delete*`
3. **Business logic** - Validation, orchestration
4. **Error handling** - Try/catch with descriptive messages

### Server Actions Pattern

Each action file (`*.actions.ts`) contains:
1. **Permission check** - `await requirePermission("module", "action")`
2. **Session validation** - `await auth()`
3. **Service call** - Delegate to service layer
4. **Side effects** - Pusher trigger, cache revalidation
5. **Response** - Return `ActionResult` type

### Error Handling Strategy

```typescript
// In Services
try {
  // Logic
} catch (error) {
  return {
    success: false,
    message: error instanceof Error ? error.message : "Unknown error",
  };
}

// In Actions
try {
  await requirePermission(...);
  const result = await Service.method(...);
  if (result.success) {
    await getPusher().trigger(...);
    revalidatePath(...);
  }
  return result;
} catch (error) {
  return {
    success: false,
    message: error instanceof Error ? error.message : "Error message",
  };
}
```

---

## TYPE DEFINITIONS

### Category 1: Domain Types

```typescript
// Base types matching Prisma models
type DesignProject { ... }
type DesignBrief { ... }
type ProductDesign { ... }
type TechPack { ... }
type DesignDeck { ... }
type DesignReview { ... }
```

### Category 2: Input Types

```typescript
// For create operations
type CreateDesignProjectInput { ... }
type CreateDesignBriefInput { ... }
// ...

// For update operations
type UpdateDesignProjectInput { ... }
type UpdateDesignBriefInput { ... }
// ...
```

### Category 3: Filter Types

```typescript
// For query operations
type DesignProjectFilters { ... }
type DesignBriefFilters { ... }
// ...
```

### Category 4: Relation Types

```typescript
// With nested relations
type DesignProjectWithRelations { ... }
type ProductDesignWithRelations { ... }
// ...
```

### Category 5: Response Types

```typescript
// Standard API responses
interface ActionResult<T = any> { ... }
interface PaginatedResult<T> { ... }
```

---

## ENUMS REFERENCE

### DesignProjectStatus
Workflow states for main design project:
- **DRAFT**: Initial state, intake in progress
- **CONCEPT**: Early concepts being explored
- **FEASIBILITY**: Engineering validation phase
- **APPROVED**: Design approved, ready for production
- **COMPLETED**: Project finished and delivered
- **ON_HOLD**: Temporarily paused
- **CANCELLED**: Project cancelled

### DesignBriefStatus
Approval of intake brief:
- **PENDING**: Awaiting approval
- **APPROVED**: Brief approved, design can start
- **REJECTED**: Brief rejected, needs revision

### ProductDesignStatus
Evolution of individual design:
- **DRAFT**: Initial sketch/concept
- **CONCEPT**: Developed concept, not validated
- **FEASIBILITY**: Under engineering review
- **APPROVED**: Engineering approved, ready for tech pack
- **REJECTED**: Failed feasibility, needs revision

### TechPackStatus
Manufacturing specification approval:
- **DRAFT**: Initial specifications
- **REVIEW**: Under review by manufacturing
- **APPROVED**: Approved for manufacturing
- **PRODUCTION_READY**: Ready to send to production

### DesignDeckStatus
Presentation/delivery status:
- **DRAFT**: In progress
- **REVIEW**: Under review
- **APPROVED**: Approved for presentation
- **PUBLISHED**: Delivered to customer

### DesignReviewStatus
Feedback workflow:
- **PENDING**: Awaiting review response
- **APPROVED**: Review approved, no changes needed
- **REVISION_NEEDED**: Changes requested, iteration required
- **REJECTED**: Design rejected, major revision needed

---

## NEXT STEPS

### Immediate Actions
1. **Create documentation file** (THIS FILE) ✅
2. **Review and validate design** with team
3. **Get approval** before implementation

### Implementation Order
1. **Phase 1**: Add schema models + run migration
2. **Phase 2**: Create types and repositories
3. **Phase 3**: Implement services
4. **Phase 4**: Create server actions
5. **Phase 5**: Build UI pages and components
6. **Phase 6**: Write tests

### Success Criteria
- All 6 models created and migrated
- All types defined and typed correctly
- All CRUD operations working
- Permission checks implemented
- Real-time sync via Pusher working
- At least 80% test coverage
- UI pages functional for all operations

---

## REFERENCES

### Similar Patterns
- **Testing x Development**: `docs/testing-development-plan.md`
- **Events x Education**: Implementation in progress
- **CRM Foundation**: `lib/features/contacts/`, `lib/features/opportunities/`

### Key Files
- **Database Schema**: `prisma/schema.prisma`
- **Auth/Permissions**: `lib/auth.ts`, `lib/permissions.ts`
- **Real-time**: `lib/realtime/`
- **Testing Feature**: `lib/features/testing/`

### Documentation
- **Project Outline**: `.github/project-outline.md`
- **Testing Plan**: `docs/testing-development-plan.md`
- **Caching Strategy**: `docs/CACHING_STRATEGY.md`

---

## APPENDIX: Key Differences Summary

### Design vs Testing Workflow

| Aspect | Testing | Design |
|--------|---------|--------|
| **Primary Goal** | Capture measured data | Create & approve designs |
| **Data Focus** | Test results, measurements | Design files, specifications |
| **Iteration** | Minimal, mostly linear | Multiple revisions & approvals |
| **Output** | Reports (single type) | Files (multiple types) |
| **Approval Flow** | Simple (DRAFT → APPROVED) | Complex (with revisions) |
| **Main Model** | TestOrder | DesignProject |
| **Input Container** | Sample | DesignBrief |
| **Work Item** | Test | ProductDesign |
| **Output** | TestReport | TechPack + DesignReview |
| **Collection** | TestSuite | DesignDeck |

### Design Implementation Complexity

**Lower Complexity:**
- Model relationships (straightforward 1:N, 1:1 patterns)
- CRUD operations (similar to Testing)
- Type definitions (similar structure)

**Higher Complexity:**
- JSON fields for complex data (colors, layers, specifications)
- Versioning logic (tracking design iterations)
- Revision workflow (REVISION_NEEDED status)
- Multiple file type outputs (different decoration methods)
- Feasibility checking logic

---

## REVISION HISTORY

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-26 | 1.0 | Initial comprehensive plan | AI Analysis |
| | | - Database schema design | |
| | | - Service/Repository patterns | |
| | | - Implementation roadmap | |
| | | - Type definitions template | |

---

**Document Status**: ✅ Complete & Ready for Implementation
**Last Reviewed**: November 26, 2025
**Next Review Date**: After Phase 1 completion
