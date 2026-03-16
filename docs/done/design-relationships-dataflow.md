# Design x Development - Database Relationships & Data Flow

**Purpose**: Visual guide to understand model relationships and data flow
**Status**: Reference document
**Last Updated**: November 26, 2025

---

## MODEL RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│ CRM FOUNDATION (Existing Models)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Customer                                                        │
│    ├── Contacts[]                                               │
│    ├── Opportunities[]                                          │
│    ├── Engagements[]              ← Type: "DESIGN"             │
│    └── DesignProjects[]           ← NEW RELATION              │
│                                                                  │
│  Engagement (type: "DESIGN")                                    │
│    └── DesignProjects[]            ← Links here               │
│                                                                  │
│  Media (existing)                                               │
│    └── Can be linked via entityType + entityId                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DESIGN VERTICAL (New Models)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DesignProject (1)                                              │
│    │                                                             │
│    ├─────┬──────────┬───────────┬─────────────────────┐        │
│    │     │          │           │                     │        │
│    │     │          │           │                     │        │
│    ▼     ▼          ▼           ▼                     ▼        │
│  Brief   Designs   Deck      Reviews             Engagement  │
│    │     │N:1      │1:1      │1:N                (back ref)  │
│    │     ├─────────┤         │                          │     │
│    │     │         │         │                          │     │
│    │     ▼         │         │                          │     │
│    │   ProductDesign         │                          │     │
│    │     │         │         │                          │     │
│    │     ├─────────┼─────────┤                          │     │
│    │     │         │         │                          │     │
│    │     ▼         │         │                          │     │
│    │   TechPack    │         │                          │     │
│    │     │         │         │                          │     │
│    │     └─────────┼─────────┘                          │     │
│    │               │                                     │     │
│    └───────────────┴─────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LINKING TO MEDIA (External Files)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DesignBrief.mediaIds              → Media files              │
│  ProductDesign.mediaIds            → Design/mockup files     │
│  TechPack.outputFiles[]            → Manufacturing files     │
│  DesignDeck.mediaIds               → Deck assets             │
│  DesignReview.mediaIds             → Annotated images        │
│                                                                  │
│  Note: Media model not modified, linked via JSON arrays        │
│        and entityType/entityId fields                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## DETAILED RELATIONSHIPS

### 1. DesignProject ← → Engagement

**Relation Type**: Many-to-One (N:1)
```
1 Engagement (type: "DESIGN")
    ↓
    N DesignProjects
```

**Why**:
- One engagement can spawn multiple design projects over time
- Or a single design project is one engagement instance

**Database References**:
```prisma
DesignProject.engagementId → Engagement.id (Foreign Key)
Engagement (implicit inverse relation)
```

**Data Flow**:
1. Customer creates Opportunity
2. Opportunity moves to Design stage → Engagement created (type: DESIGN)
3. DesignProject created, linking to this Engagement
4. All design work flows through this project

**Example Query**:
```typescript
// Get all design projects for an engagement
const engagement = await prisma.engagement.findUnique({
  where: { id: engagementId },
  include: {
    designProjects: true,  // All design projects
  },
});
```

---

### 2. DesignProject ← → Customer

**Relation Type**: Many-to-One (N:1)
```
1 Customer
    ↓
    N DesignProjects
```

**Why**:
- Customer can have multiple design projects
- Need direct link for permission filtering and customer portal

**Database References**:
```prisma
DesignProject.customerId → Customer.id (Foreign Key)
Customer.designProjects → DesignProject[] (Relation)
```

**Example Query**:
```typescript
// Get all design projects for a customer
const customer = await prisma.customer.findUnique({
  where: { id: customerId },
  include: {
    designProjects: {
      include: {
        brief: true,
        designs: true,
      },
    },
  },
});
```

---

### 3. DesignProject ← → DesignBrief

**Relation Type**: One-to-One (1:1)
```
1 DesignProject
    ↓
    1 DesignBrief
```

**Why**:
- Each project has exactly one intake/brief
- Brief captures all initial requirements
- Brief is created when project starts

**Database References**:
```prisma
DesignBrief.designProjectId → DesignProject.id (Foreign Key, Unique)
DesignProject.brief → DesignBrief (Optional Relation)
```

**Workflow**:
1. Create DesignProject
2. Create DesignBrief (linked to project)
3. Brief must be APPROVED before design work starts
4. Brief becomes reference throughout project

**Example Query**:
```typescript
// Get project with brief
const project = await prisma.designProject.findUnique({
  where: { id: projectId },
  include: {
    brief: true,  // Will be null if not created yet
  },
});

// Create brief
const brief = await prisma.designBrief.create({
  data: {
    designProjectId: projectId,
    brandAssets: JSON.stringify({...}),
    constraints: JSON.stringify({...}),
    // ... other fields
  },
});
```

---

### 4. DesignProject ← → ProductDesign

**Relation Type**: One-to-Many (1:N)
```
1 DesignProject
    ↓
    N ProductDesigns
```

**Why**:
- One project can have multiple product designs
- Each design represents a variant/item in the project

**Database References**:
```prisma
ProductDesign.designProjectId → DesignProject.id (Foreign Key)
DesignProject.designs → ProductDesign[] (Relation)
```

**Workflow Examples**:
- Project: "Company Logo T-Shirt Campaign"
  - ProductDesign 1: "T-Shirt Front Print"
  - ProductDesign 2: "T-Shirt Back Print"
  - ProductDesign 3: "T-Shirt Sleeve Logo"

- Project: "Brand Identity Package"
  - ProductDesign 1: "Business Card Design"
  - ProductDesign 2: "Letterhead Design"
  - ProductDesign 3: "Email Signature Design"

**Example Query**:
```typescript
// Get all designs in a project
const project = await prisma.designProject.findUnique({
  where: { id: projectId },
  include: {
    designs: {
      include: {
        techPack: true,
        reviews: true,
      },
    },
  },
});

// Create new design
const design = await prisma.productDesign.create({
  data: {
    designProjectId: projectId,
    name: "T-Shirt Front Print",
    designType: "GRAPHIC",
    productType: "T-Shirt",
    // ... other fields
  },
});
```

---

### 5. ProductDesign ← → ProductDesign (Versions)

**Relation Type**: Self-Referencing (1:N)
```
ProductDesign (v1)
    ↓
    ProductDesign (v2, parentDesignId = v1.id)
    ↓
    ProductDesign (v3, parentDesignId = v2.id)
```

**Why**:
- Track design iterations/revisions
- Keep history of changes
- Reference back to parent version

**Database References**:
```prisma
ProductDesign.parentDesignId → ProductDesign.id (Optional Foreign Key)
ProductDesign.versions → ProductDesign[] (Relation)
```

**Workflow**:
1. Create initial design (version: 1, parentDesignId: null)
2. Customer reviews → requests changes
3. Create new version (version: 2, parentDesignId: v1.id)
4. Update design based on feedback
5. Repeat cycle as needed

**Example Query**:
```typescript
// Get design with all versions
const design = await prisma.productDesign.findUnique({
  where: { id: designId },
  include: {
    parentDesign: true,          // Reference to previous version
    versions: {                  // All child versions
      orderBy: { version: "asc" },
    },
  },
});

// Create new version
const newVersion = await prisma.productDesign.create({
  data: {
    designProjectId: originalDesign.designProjectId,
    parentDesignId: designId,    // Link to parent
    version: originalDesign.version + 1,
    // ... copy other fields from original ...
  },
});
```

**Version Tracking**:
- v1: Initial design
- v2: First revision (based on feedback)
- v3: Second revision
- etc.

---

### 6. ProductDesign ← → TechPack

**Relation Type**: One-to-One (1:1)
```
ProductDesign (APPROVED status)
    ↓
    1 TechPack
```

**Why**:
- TechPack created only when design is APPROVED
- TechPack contains manufacturing specs for this design
- One design → one manufacturing specification

**Database References**:
```prisma
TechPack.productDesignId → ProductDesign.id (Foreign Key, Unique)
ProductDesign.techPack → TechPack (Optional Relation)
```

**Workflow**:
1. ProductDesign status: DRAFT → CONCEPT → FEASIBILITY → APPROVED
2. When APPROVED, TechPack can be created
3. TechPack engineer specifies sizing, materials, colors, output files
4. TechPack contains what manufacturing needs

**Example Query**:
```typescript
// Get design with its tech pack
const design = await prisma.productDesign.findUnique({
  where: { id: designId },
  include: {
    techPack: true,  // Will be null if design not approved
  },
});

// Create tech pack for approved design
const techPack = await prisma.techPack.create({
  data: {
    productDesignId: designId,
    name: "Tech Pack: T-Shirt Front",
    decorationMethod: "DTG",  // Direct-to-Garment
    sizing: JSON.stringify({
      sizes: [
        { label: "S", chest: 38, length: 28 },
        { label: "M", chest: 40, length: 29 },
        // ...
      ],
    }),
    outputFiles: JSON.stringify([
      {
        type: "DTG_PRINT",
        filename: "design_DTG.tiff",
        mediaId: "media_123",
      },
      {
        type: "TECH_PACK_PDF",
        filename: "techpack.pdf",
        mediaId: "media_456",
      },
    ]),
  },
});
```

---

### 7. ProductDesign ← → DesignReview

**Relation Type**: One-to-Many (1:N)
```
ProductDesign
    ↓
    N DesignReviews (productDesignId = design.id)
```

**Why**:
- Multiple reviews can happen on same design
- Customer review → internal review → feasibility check → re-review

**Database References**:
```prisma
DesignReview.productDesignId → ProductDesign.id (Optional Foreign Key)
ProductDesign.reviews → DesignReview[] (Relation)
```

**Workflow**:
1. Design completed
2. Create DesignReview (reviewType: CUSTOMER)
3. Customer provides feedback
4. If REVISION_NEEDED:
   - Create new version of ProductDesign
   - Create new DesignReview for revised design
5. If APPROVED:
   - Can proceed to TechPack creation

**Example Query**:
```typescript
// Get design with all reviews
const design = await prisma.productDesign.findUnique({
  where: { id: designId },
  include: {
    reviews: {
      orderBy: { createdAt: "desc" },
    },
  },
});

// Get review history for a design
const reviews = await prisma.designReview.findMany({
  where: { productDesignId: designId },
  orderBy: { createdAt: "asc" },
});
```

---

### 8. DesignProject ← → DesignReview

**Relation Type**: One-to-Many (1:N)
```
DesignProject
    ↓
    N DesignReviews (designProjectId = project.id)
```

**Why**:
- Project-level reviews (overall project feedback)
- Separate from individual design reviews
- Can review whole project scope

**Database References**:
```prisma
DesignReview.designProjectId → DesignProject.id (Foreign Key)
DesignProject.reviews → DesignReview[] (Relation)
```

**Example Query**:
```typescript
// Get project reviews (not specific to any design)
const reviews = await prisma.designReview.findMany({
  where: {
    designProjectId: projectId,
    productDesignId: null,  // Project-level reviews
  },
});

// Get all reviews (project + design level)
const allReviews = await prisma.designReview.findMany({
  where: { designProjectId: projectId },
  orderBy: { createdAt: "desc" },
});
```

---

### 9. DesignProject ← → DesignDeck

**Relation Type**: One-to-One (1:1)
```
DesignProject
    ↓
    1 DesignDeck
```

**Why**:
- One main deck per project
- Contains presentation of approved designs
- Delivered to customer

**Database References**:
```prisma
DesignDeck.designProjectId → DesignProject.id (Foreign Key, Unique)
DesignProject.deck → DesignDeck (Optional Relation)
```

**Workflow**:
1. Project has multiple ProductDesigns
2. Designs are approved through review cycle
3. Create DesignDeck referencing selected designs
4. Deck pulls in approved designs via `designIds` JSON array
5. Deck can be versioned as project evolves

**Example Query**:
```typescript
// Get project with its deck
const project = await prisma.designProject.findUnique({
  where: { id: projectId },
  include: {
    deck: true,
    designs: true,  // To see which designs can be in deck
  },
});

// Create deck
const deck = await prisma.designDeck.create({
  data: {
    designProjectId: projectId,
    title: "Design Package - Presentation",
    designIds: JSON.stringify([designId1, designId2, designId3]),
    status: "DRAFT",
  },
});

// Parse designIds and get actual designs
const deckJson = JSON.parse(deck.designIds || "[]");
const designs = await prisma.productDesign.findMany({
  where: {
    id: { in: deckJson },
  },
});
```

---

## DATA FLOW EXAMPLES

### Example 1: Simple Design Project

```
Timeline:
Week 1:
  Day 1:
    - Customer creates Opportunity ("Redesign Company Logo")
    - Opportunity moves to Design engagement
    - DesignProject created
    - DesignBrief created with brand guidelines
    
  Day 2:
    - DesignBrief approved by customer
    - Designer creates ProductDesign v1
    
  Day 5:
    - ProductDesign v1 status: FEASIBILITY (engineering review)
    - Review shows color issue
    - Create ProductDesign v2 (parentDesignId: v1)
    
Week 2:
  Day 1:
    - ProductDesign v2 status: APPROVED
    - Create TechPack with specifications
    - Create DesignDeck with the design
    
  Day 3:
    - DesignDeck published (status: PUBLISHED)
    - Project delivered to customer
    - DesignProject status: COMPLETED
```

**Database State**:
```
DesignProject (COMPLETED)
  ├── Engagement (DESIGN)
  ├── Customer
  ├── DesignBrief (APPROVED)
  ├── ProductDesigns (N=2)
  │   ├── ProductDesign v1 (REJECTED)
  │   │   └── DesignReview (REVISION_NEEDED)
  │   └── ProductDesign v2 (APPROVED)
  │       ├── TechPack (APPROVED)
  │       └── DesignReview (APPROVED)
  └── DesignDeck (PUBLISHED)
```

### Example 2: Multi-Design Project

```
Project: "Full Merchandise Package"
  - 5 designs needed:
    1. T-Shirt Front
    2. T-Shirt Back
    3. Cap
    4. Tote Bag
    5. Hoodie Pocket

Timeline:
  Week 1: Create brief, all 5 ProductDesigns created (v1)
  Week 2: T-Shirt Front → APPROVED, others → REVISION_NEEDED
  Week 3: Others create v2, T-Shirt Back → APPROVED
  Week 4: Remaining 3 → APPROVED
  Week 5: Create TechPacks for all 5, create DesignDeck
  Week 6: DesignDeck published, project complete
```

**Database State**:
```
DesignProject (COMPLETED)
  ├── DesignBrief (APPROVED)
  ├── ProductDesigns (N=5)
  │   ├── T-Shirt Front
  │   │   ├── v1 (APPROVED)
  │   │   └── TechPack
  │   ├── T-Shirt Back
  │   │   ├── v1 (REJECTED)
  │   │   ├── v2 (APPROVED)
  │   │   └── TechPack
  │   ├── Cap
  │   │   ├── v1 (REJECTED)
  │   │   ├── v2 (REJECTED)
  │   │   ├── v3 (APPROVED)
  │   │   └── TechPack
  │   └── ... (2 more)
  └── DesignDeck (PUBLISHED)
      └── designIds: [cap_v3, tshirt_front_v1, tshirt_back_v2, ...]
```

---

## QUERYING PATTERNS

### Get Full Project Context

```typescript
const project = await prisma.designProject.findUnique({
  where: { id: projectId },
  include: {
    engagement: true,
    customer: true,
    brief: true,
    designs: {
      include: {
        techPack: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    },
    deck: {
      include: {
        designProject: false,  // Avoid circular
      },
    },
    reviews: {
      orderBy: { createdAt: "desc" },
    },
  },
});
```

### Get Design with History

```typescript
const design = await prisma.productDesign.findUnique({
  where: { id: designId },
  include: {
    designProject: {
      include: {
        customer: true,
      },
    },
    parentDesign: true,  // Previous version
    versions: {          // All child versions
      orderBy: { version: "asc" },
    },
    techPack: true,
    reviews: {
      orderBy: { createdAt: "desc" },
    },
  },
});
```

### Get All Designs Needing Review

```typescript
const designsNeedingReview = await prisma.productDesign.findMany({
  where: {
    status: "FEASIBILITY",  // Under engineering review
    designProject: {
      status: { not: "CANCELLED" },
    },
  },
  include: {
    designProject: {
      include: { customer: true },
    },
  },
});
```

### Count Statuses in Project

```typescript
const statusCounts = await prisma.productDesign.groupBy({
  by: ["status"],
  where: { designProjectId: projectId },
  _count: true,
});

// Result:
// [
//   { status: "DRAFT", _count: 2 },
//   { status: "APPROVED", _count: 3 },
//   { status: "REJECTED", _count: 1 },
// ]
```

---

## DELETE CASCADE BEHAVIOR

When a parent record is deleted, all children are cascade deleted:

```
DELETE DesignProject
  → CASCADE delete DesignBrief (if exists)
  → CASCADE delete ProductDesigns
      → CASCADE delete TechPacks (if exist)
      → CASCADE delete DesignReviews (for this design)
  → CASCADE delete DesignDeck (if exists)
  → CASCADE delete DesignReviews (for this project)
```

---

**Document Status**: ✅ Complete Reference Guide
**Use as reference while implementing repositories and services**
