# Design x Development - Complete Project Summary & Recovery Guide

**Purpose**: Single comprehensive document for entire Design x Development implementation
**Status**: Master Reference Document
**Created**: November 26, 2025
**Last Updated**: November 26, 2025

---

## 🎯 OBJECTIVE

Implement **Design x Development Vertical** for MADE OS by creating a complete, production-ready database design system that:
1. Reuses proven **Testing Vertical** architecture
2. Supports full design workflow: Intake → Concept → Feasibility → Approval → Delivery
3. Integrates seamlessly with existing CRM Foundation (Customer, Engagement, Media)
4. Enables iteration, versioning, and multi-reviewer approval
5. Tracks all design artifacts (files, specs, reviews, approvals)

---

## 📋 PROJECT SCOPE

### What We're Building

**6 New Database Models:**
1. `DesignProject` - Main container (like TestOrder)
2. `DesignBrief` - Intake requirements (like Sample)
3. `ProductDesign` - Individual design with versioning
4. `TechPack` - Manufacturing specifications (like TestReport)
5. `DesignDeck` - Collection & presentation (like TestSuite)
6. `DesignReview` - Feedback & approval workflow

**6 New Enums:**
1. DesignProjectStatus
2. DesignBriefStatus
3. ProductDesignStatus
4. TechPackStatus
5. DesignDeckStatus
6. DesignReviewStatus

**Feature Module Structure:**
- Service Layer (business logic)
- Repository Layer (database queries)
- Server Actions (API with permissions)
- Type Definitions (TypeScript types)

### What We're NOT Changing

- Customer model (only add relation)
- Engagement model (only add validation)
- Media model (only use existing entityType/entityId)
- Any existing tests or features
- Any existing permissions or auth

---

## 🔗 ARCHITECTURE COMPARISON

### Testing Vertical (Reference Model)

```
Engagement (type: TESTING)
    ↓
TestOrder (container)
    ├── Sample (input data)
    ├── TestSuite (collection)
    ├── Test (work item)
    ├── TestReport (output)
    └── Interaction (communication)

Workflow: Order → Sample → Test → Report
Focus: Measurement & data capture
Linear progression
```

### Design Vertical (What We're Building)

```
Engagement (type: DESIGN)
    ↓
DesignProject (container)
    ├── DesignBrief (input requirements)
    ├── ProductDesign (work items, with versioning)
    │   ├── v1 → REJECTED
    │   └── v2 → APPROVED
    │       └── TechPack (output specs)
    ├── DesignDeck (collection & presentation)
    └── DesignReview (feedback & approval)

Workflow: Project → Brief → Design → Review → Revision → Deck → Delivery
Focus: Creation, iteration, approval
Branching with feedback loops
```

---

## 📚 DOCUMENTATION FILES CREATED

### 1. `docs/design-development-plan.md` (Main Specification)
**Contains:**
- Executive summary
- Context & analysis (Testing vs Design)
- Complete database schema specification (all 6 models)
- All 6 enums with descriptions
- Relations summary
- 6-phase implementation roadmap
- Feature module structure
- Service & API patterns
- Type definitions template
- References

**Size:** ~700 lines
**Use Case:** Master reference, understand complete design

### 2. `docs/design-implementation-checklist.md` (Step-by-Step Guide)
**Contains:**
- Phase 1: Exact Prisma code to add to schema.prisma
- Phase 2: Complete types/design.types.ts code
- Phase 3-6: Directory structure and index files
- Verification checklist for each phase
- Quick reference file locations
- Common pitfalls to avoid
- Testing commands

**Size:** ~400 lines
**Use Case:** Copy-paste implementation, phase-by-phase execution

### 3. `docs/design-relationships-dataflow.md` (Visual Reference)
**Contains:**
- ASCII diagram of model relationships
- Detailed explanation of each relationship (9 total)
- Why each relationship exists
- Workflow examples (2 scenarios)
- Data flow timelines
- Query patterns for common operations
- DELETE CASCADE behavior

**Size:** ~600 lines
**Use Case:** Understand data relationships, write queries

---

## 🚀 IMPLEMENTATION PHASES (6 Weeks)

### Phase 1: Database Schema (Week 1 - Day 1-2)
**Objective:** Add all models and enums to Prisma

**Tasks:**
1. Add 6 models to `prisma/schema.prisma`
2. Add 6 enums to `prisma/schema.prisma`
3. Update Customer model with `designProjects` relation
4. Run migration: `yarn db:migrate`
5. Regenerate client: `yarn db:generate`

**Output:**
- New migration file in `prisma/migrations/`
- Updated Prisma client in `@/generated/prisma`
- No breaking changes to existing code

**Reference:**
- `design-implementation-checklist.md` → Phase 1

---

### Phase 2: Type Definitions (Week 1 - Day 3-4)
**Objective:** Create all TypeScript type definitions

**Tasks:**
1. Create `lib/features/design/` directory structure
2. Create `lib/features/design/types/design.types.ts` (all types)
3. Create `lib/features/design/types/index.ts` (barrel export)
4. Export from `lib/features/design/index.ts`

**Files to Create:**
- `lib/features/design/types/design.types.ts` (500+ lines)
- `lib/features/design/types/index.ts` (3 lines)

**Type Categories:**
- Base types (matching Prisma models)
- Input types (Create/Update)
- Filter types (Query filters)
- Relation types (with nested relations)
- Response types (ActionResult, PaginatedResult)
- Error types (DesignError)

**Reference:**
- `design-implementation-checklist.md` → Phase 2

---

### Phase 3: Repository Layer (Week 2 - Day 1-3)
**Objective:** Create database query layer

**Tasks:**
1. Create 6 repository files (one per model)
2. Each repository has:
   - `findById()` - Get single with relations
   - `findMany()` - Get multiple with filters
   - `create()` - Insert new
   - `update()` - Modify existing
   - `delete()` - Remove (cascade)
   - Additional helpers (count, aggregate, etc.)

3. Create `lib/features/design/repositories/index.ts`

**Files to Create:**
- `lib/features/design/repositories/design-project.repository.ts`
- `lib/features/design/repositories/design-brief.repository.ts`
- `lib/features/design/repositories/product-design.repository.ts`
- `lib/features/design/repositories/tech-pack.repository.ts`
- `lib/features/design/repositories/design-deck.repository.ts`
- `lib/features/design/repositories/design-review.repository.ts`
- `lib/features/design/repositories/index.ts`

**Pattern Example:**
```typescript
export class DesignProjectRepository {
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
  
  // ... findMany, create, update, delete, etc.
}
```

**Reference:**
- `design-development-plan.md` → API & Service Layer section
- `design-relationships-dataflow.md` → Querying Patterns

---

### Phase 4: Service Layer (Week 2 - Day 4-5)
**Objective:** Create business logic layer

**Tasks:**
1. Create 6 service files (one per model)
2. Each service has:
   - CRUD methods that wrap repositories
   - Input validation
   - Error handling with try/catch
   - Return `ActionResult` type
   - Business logic orchestration

3. Create `lib/features/design/services/index.ts`

**Additional Services:**
- `design-compatibility.service.ts` - Feasibility checking logic

**Files to Create:**
- `lib/features/design/services/design-project.service.ts`
- `lib/features/design/services/design-brief.service.ts`
- `lib/features/design/services/product-design.service.ts`
- `lib/features/design/services/tech-pack.service.ts`
- `lib/features/design/services/design-deck.service.ts`
- `lib/features/design/services/design-review.service.ts`
- `lib/features/design/services/design-compatibility.service.ts`
- `lib/features/design/services/index.ts`

**Pattern Example:**
```typescript
export class DesignProjectService {
  static async getDesignProjects(filters, options) {
    try {
      return await DesignProjectRepository.findMany(filters, options);
    } catch (error) {
      throw new Error(`Failed to fetch: ${error.message}`);
    }
  }
  
  static async createDesignProject(input) {
    try {
      if (!input.title?.trim()) {
        return { success: false, message: "Title required" };
      }
      const project = await DesignProjectRepository.create(input);
      return { success: true, data: project };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // ... update, delete, etc.
}
```

**Reference:**
- `design-development-plan.md` → Example Implementations

---

### Phase 5: Server Actions (Week 3 - Day 1-3)
**Objective:** Create API endpoints with permissions & real-time sync

**Tasks:**
1. Create 7 action files (6 models + 1 search)
2. Each action has:
   - Permission checks: `await requirePermission("design", "action")`
   - Session validation: `await auth()`
   - Service call delegation
   - Pusher real-time trigger: `await getPusher().trigger(...)`
   - Path revalidation: `revalidatePath(...)`
   - Try/catch with ActionResult return

3. Create `lib/features/design/actions/index.ts`

**Files to Create:**
- `lib/features/design/actions/design-project.actions.ts` (CRUD)
- `lib/features/design/actions/design-brief.actions.ts` (CRUD)
- `lib/features/design/actions/product-design.actions.ts` (CRUD)
- `lib/features/design/actions/tech-pack.actions.ts` (CRUD)
- `lib/features/design/actions/design-deck.actions.ts` (CRUD)
- `lib/features/design/actions/design-review.actions.ts` (CRUD)
- `lib/features/design/actions/search.actions.ts` (Search across all)
- `lib/features/design/actions/index.ts`

**Pattern Example:**
```typescript
"use server";

export async function createDesignProjectAction(input: CreateDesignProjectInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };
    
    // PERMISSION CHECK
    await requirePermission("design", "create");
    
    // SERVICE CALL
    const result = await DesignProjectService.createDesignProject({
      ...input,
      createdBy: session.user.id,
    });
    
    // SIDE EFFECTS
    if (result.success) {
      // Real-time notification
      await getPusher().trigger("private-global", "design_update", {
        action: "design_project_created",
        project: result.data,
      });
      
      // Cache revalidation
      revalidatePath("/design");
    }
    
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

**Pusher Events to Trigger:**
- `design_project_created`
- `design_project_updated`
- `design_project_deleted`
- `product_design_created`
- `product_design_updated`
- etc.

**Reference:**
- `design-development-plan.md` → Server Actions section
- Testing vertical: `lib/features/testing/actions/`

---

### Phase 6: UI Pages & Components (Week 3-4)
**Objective:** Create Next.js pages and React components

**Page Structure:**
```
app/(dashboard)/design/
├── page.tsx                      # List design projects
├── new/
│   └── page.tsx                  # Create new project
├── [id]/
│   ├── page.tsx                  # Project detail view
│   ├── brief/
│   │   └── page.tsx              # Edit brief
│   ├── designs/
│   │   ├── page.tsx              # List designs
│   │   └── [designId]/
│   │       ├── page.tsx          # Design detail
│   │       └── tech-pack/
│   │           └── page.tsx      # Tech pack detail
│   ├── deck/
│   │   └── page.tsx              # Deck editor
│   └── reviews/
│       └── page.tsx              # Reviews list
└── components/
    ├── design-project-form.tsx
    ├── design-project-list.tsx
    ├── product-design-card.tsx
    ├── tech-pack-form.tsx
    ├── design-review-dialog.tsx
    └── design-deck-builder.tsx
```

**Status**: To be implemented in Phase 6

**Reference:**
- Testing vertical: `app/(dashboard)/testing/`
- Events vertical: `app/(dashboard)/events/`

---

### Phase 7: Testing & Validation (Week 4)
**Objective:** Write unit, integration, and e2e tests

**Test Structure:**
```
tests/
├── unit/
│   └── features/design/
│       ├── design-project.service.test.ts
│       ├── design-brief.service.test.ts
│       ├── product-design.service.test.ts
│       └── tech-pack.service.test.ts
├── integration/
│   └── features/design/
│       ├── design-project.actions.test.ts
│       ├── product-design.actions.test.ts
│       └── design-review.actions.test.ts
└── e2e/
    └── design-workflow.spec.ts
```

**Test Coverage Target:** 80%+

**Reference:**
- Testing vertical: `tests/`

---

## 📖 HOW TO USE THIS DOCUMENTATION

### If You're New to the Project

1. **Read First:** `docs/design-development-plan.md` (Executive Summary + Database Design sections)
2. **Understand:** `docs/design-relationships-dataflow.md` (Model relationships)
3. **Then:** `docs/design-implementation-checklist.md` (Phase 1-2)

### If Implementing Phase 1-2

**Use:** `docs/design-implementation-checklist.md`
1. Copy schema code exactly
2. Follow step-by-step instructions
3. Run migration commands
4. Verify using checklist

### If Implementing Phase 3-5

**Reference:** 
- `docs/design-development-plan.md` → API & Service Layer section
- `docs/design-relationships-dataflow.md` → Querying Patterns section
- Testing vertical: `lib/features/testing/` (as reference implementation)

### If You Lose Connection/Network Issue

**Recovery Steps:**
1. Re-read this document (complete status overview)
2. Check current implementation status:
   ```bash
   # See which files exist
   ls -la lib/features/design/
   
   # Check Prisma schema
   cat prisma/schema.prisma | grep -A 50 "DesignProject"
   
   # Check migrations
   ls -la prisma/migrations/
   ```

3. Consult appropriate documentation file to continue
4. Do NOT re-run migrations that are already applied

---

## 🔑 KEY CONCEPTS

### 1. Model Hierarchy

```
CRM Foundation (Existing)
    ↓
    └── Engagement (type: "DESIGN")
        ↓
        └── DesignProject (Main Container)
            ├── DesignBrief (1:1 - Input/Requirements)
            ├── ProductDesign (1:N - Work Items)
            │   ├── ProductDesign (1:N - Versions)
            │   ├── TechPack (1:1 - Manufacturing Specs)
            │   └── DesignReview (1:N - Feedback)
            ├── DesignDeck (1:1 - Presentation)
            └── DesignReview (1:N - Project-level Feedback)
```

### 2. Status Workflows

**DesignProject:**
DRAFT → CONCEPT → FEASIBILITY → APPROVED → COMPLETED

**ProductDesign:**
DRAFT → CONCEPT → FEASIBILITY → APPROVED (or REJECTED)

**DesignReview:**
PENDING → APPROVED (or REVISION_NEEDED or REJECTED)

### 3. Versioning Strategy

- Each ProductDesign has optional `parentDesignId`
- If parentDesignId is set, this is a revision/iteration
- Version number incremented with each iteration
- Full history traceable back to original

### 4. File Management

- Use existing `Media` model for all files
- Link via `mediaIds` (JSON array of Media IDs)
- Or `outputFiles` (JSON with file metadata)
- No new file model needed

---

## ✅ SUCCESS CRITERIA

### Phase 1 Complete
- [ ] All 6 models in schema.prisma
- [ ] All 6 enums in schema.prisma
- [ ] Customer model has `designProjects` relation
- [ ] Migration executed successfully
- [ ] `yarn db:generate` runs without errors
- [ ] No breaking changes to existing features

### Phase 2 Complete
- [ ] `lib/features/design/types/design.types.ts` created (500+ lines)
- [ ] All type categories defined
- [ ] `lib/features/design/types/index.ts` exports all types
- [ ] `yarn check-types` passes

### Phase 3 Complete
- [ ] 6 repository files created
- [ ] All have CRUD methods
- [ ] Each includes proper relations
- [ ] `design-project.repository.ts` serves as template
- [ ] `yarn check-types` passes

### Phase 4 Complete
- [ ] 6 service files created
- [ ] All have validation and error handling
- [ ] All return `ActionResult` type
- [ ] `design-project.service.ts` serves as template
- [ ] `yarn check-types` passes

### Phase 5 Complete
- [ ] 7 action files created (6 models + search)
- [ ] All have permission checks
- [ ] All trigger Pusher notifications
- [ ] All revalidate relevant paths
- [ ] `yarn check-types` passes
- [ ] No permission system changes needed

### Phase 6 Complete
- [ ] All pages functional
- [ ] All components working
- [ ] Forms submitting via server actions
- [ ] Real-time updates via Pusher
- [ ] UI matches design/Events pattern

### Phase 7 Complete
- [ ] 80%+ test coverage
- [ ] All CRUD operations tested
- [ ] Permission checks tested
- [ ] Error scenarios tested
- [ ] E2E workflows tested

---

## 🔍 TROUBLESHOOTING

### Issue: Prisma Schema Syntax Error

**Solution:**
1. Check model definitions match exactly (spacing, commas, syntax)
2. Verify all relations have `@relation` and foreign keys
3. Run: `npx prisma validate`
4. Reference: `design-development-plan.md` → Database Design Specification

### Issue: Types Compilation Error

**Solution:**
1. Import enums from `@/generated/prisma/enums`
2. All fields must match Prisma schema exactly
3. Run: `yarn check-types`
4. Reference: `design-implementation-checklist.md` → Phase 2

### Issue: Repository Query Returns Wrong Data

**Solution:**
1. Check `include` object matches schema relations
2. Verify field names match Prisma model
3. Test query in `yarn db:studio`
4. Reference: `design-relationships-dataflow.md` → Querying Patterns

### Issue: Server Action Permission Denied

**Solution:**
1. Check permission module name matches: `"design"`
2. Add "design" module to database if not exists
3. Assign permissions to roles in Permissions UI
4. Reference: `lib/permissions.ts`

### Issue: Real-time Updates Not Working

**Solution:**
1. Check Pusher configuration in `.env`
2. Verify Pusher trigger syntax: `trigger("private-global", "design_update", data)`
3. Check client listening to "private-global" channel
4. Reference: `lib/realtime/`

---

## 🚀 QUICK START (From Scratch)

If starting fresh or restarting:

```bash
# 1. Navigate to project
cd /Users/nguyenpham/Source\ Code/madeapp

# 2. Read documentation
cat docs/design-development-plan.md | head -100

# 3. Phase 1: Add schema
# - Open prisma/schema.prisma
# - Copy models from design-implementation-checklist.md
# - Copy enums from design-implementation-checklist.md
# - Save file

# 4. Run migration
yarn db:migrate
# When prompted: Enter "add-design-models"

# 5. Regenerate
yarn db:generate

# 6. Verify
cat @/generated/prisma/index.d.ts | grep -A 5 "DesignProject"

# 7. Continue with Phase 2
# Open lib/features/design/types/design.types.ts
# Copy content from design-implementation-checklist.md
# ... and so on
```

---

## 📞 IMPORTANT CONTACTS & REFERENCES

### Project Files
- **Main Plan**: `docs/design-development-plan.md`
- **Checklist**: `docs/design-implementation-checklist.md`
- **Relations**: `docs/design-relationships-dataflow.md`
- **This File**: `docs/design-project-summary.md`

### Reference Implementations
- **Testing Vertical**: `lib/features/testing/`
- **Events Vertical**: `lib/features/events/`
- **Contacts**: `lib/features/contacts/`

### Configuration Files
- **Database**: `prisma/schema.prisma`
- **Auth**: `lib/auth.ts`
- **Permissions**: `lib/permissions.ts`
- **Real-time**: `lib/realtime/`

### Development Commands
```bash
yarn dev              # Start dev server
yarn db:studio       # Open Prisma Studio
yarn check-types     # Type checking
yarn format          # Format code
yarn test:unit       # Run unit tests
yarn db:migrate      # Run migrations
yarn db:generate     # Regenerate client
```

---

## 📝 CHANGE LOG

| Date | Status | Phase | Notes |
|------|--------|-------|-------|
| 2025-11-26 | ✅ Complete | Planning | Created complete documentation (4 files) |
| | | Phase 1 | Ready to implement |
| | | Phases 2-7 | Roadmap defined, templates prepared |

---

## 🎓 LEARNING PATH

If you're unfamiliar with the codebase:

1. **Understand MADE OS Architecture** (20 min)
   - Read: `.github/copilot-instructions.md`
   - Understand: CRM foundation, feature structure

2. **Study Testing Vertical** (30 min)
   - Read: `docs/testing-development-plan.md`
   - Explore: `lib/features/testing/`
   - Understand: Model relationships, service pattern

3. **Learn Design Pattern** (30 min)
   - Read: `docs/design-development-plan.md`
   - Compare: Testing vs Design workflows

4. **Implement Phase 1-2** (2-3 hours)
   - Use: `design-implementation-checklist.md`
   - Reference: `design-relationships-dataflow.md`

5. **Implement Phases 3-5** (8-10 hours)
   - Use: `design-development-plan.md` API section
   - Reference: Testing vertical code

---

## ✨ FINAL NOTES

### Design vs Testing Key Differences

| Aspect | Testing | Design |
|--------|---------|--------|
| **Linear vs Iterative** | Linear (Test → Report) | Iterative (Design → Review → Revision) |
| **Data Type** | Measurements | Creative assets + Specifications |
| **Approvals** | Simple (Yes/No) | Complex (Customer + Internal + Engineering) |
| **Versions** | Implicit in updates | Explicit versioning required |
| **Output** | Single report | Multiple files (DTG, Embroidery, etc.) |

### Implementation Philosophy

- **Reuse, Don't Reinvent**: Leverage Testing/Events patterns
- **Zero Breaking Changes**: No modifications to existing features
- **Gradual Rollout**: Implement phases sequentially
- **Test Driven**: Write tests as we implement
- **Documentation First**: Document before coding

### Success Measures

✅ All 6 models in database
✅ Full CRUD operations working
✅ Permission checks implemented
✅ Real-time sync via Pusher
✅ 80%+ test coverage
✅ UI pages for all operations
✅ Zero breaking changes

---

**Document Status**: ✅ COMPLETE & READY
**Last Review**: November 26, 2025
**Next Review**: After Phase 1 completion
**Confidence Level**: 99% (Based on Testing vertical reference)

---

## 🔐 Data Security & Access Control

### Permission Model

```
Module: "design"
Actions:
  - "create" (DesignProject, ProductDesign, etc.)
  - "read"   (View designs)
  - "update" (Edit designs)
  - "delete" (Remove designs)
  - "approve" (Approve designs, TechPacks)
  - "publish" (Publish DesignDeck)
```

### Implementation

All server actions include:
```typescript
await requirePermission("design", "create");  // Throws if denied
```

Setup in Permissions UI (admin):
1. Create Module: "design"
2. Create Actions: create, read, update, delete, approve, publish
3. Assign to Roles: Designer, Manager, Admin

---

**END OF DOCUMENT**

For implementation, start with `docs/design-implementation-checklist.md` Phase 1.
For understanding, start with `docs/design-development-plan.md`.
For reference while coding, use `docs/design-relationships-dataflow.md`.
