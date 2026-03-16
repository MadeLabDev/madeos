# 🗂️ MADE OS ARCHITECTURE & DATA FLOW

**Version**: 1.0  
**Date**: January 6, 2026  
**For**: Understanding system structure and data relationships

---

## 🏛️ SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MADE OS DASHBOARD                             │
│            http://localhost:3000/dashboard                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐   ┌─────▼─────┐   ┌────▼─────┐
        │  CRM      │   │ Events    │   │ Testing  │
        │ Vertical  │   │ Vertical  │   │ Vertical │
        └───────────┘   └───────────┘   └──────────┘
              │               │               │
        ┌─────▼─────┐   ┌─────▼─────┐   ┌────▼─────┐
        │ Training  │   │ Design    │   │ Knowledge│
        │ Vertical  │   │ Vertical  │   │ Base     │
        └───────────┘   └───────────┘   └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Shared CRM       │
                    │  Customers         │
                    │  Contacts          │
                    │  Opportunities     │
                    │  Interactions      │
                    │  Tasks             │
                    └────────────────────┘
```

---

## 📊 FEATURE COMPLETION PYRAMID

```
                        ▲
                       ╱│╲
                      ╱ │ ╲
                     ╱  │  ╲       🏆 PRODUCTION READY
                    ╱   │   ╲      ✅ 100% Complete
                   ╱────┼────╲
                  ╱     │     ╲    🟢 HIGH CONFIDENCE
                 ╱      │      ╲   ✅ 90%+ Complete
                ╱───────┼───────╲
               ╱        │        ╲  🟡 MEDIUM CONFIDENCE
              ╱         │         ╲ ✅ 60-90% Complete
             ╱──────────┼──────────╲
            ╱           │           ╲ 🔴 NEEDS WORK
           ╱            │            ╲ ⏳ <60% Complete
          ╱─────────────┼─────────────╲
         ╱______________|______________╲

         PYRAMID LEVELS (Top to Bottom):
         1. CRM - ✅ 95% (Customers, Contacts, Opps, Interactions)
         2. Knowledge - ✅ 90% (Articles, Categories, Tags, Search)
         3. Events - ✅ 80% (Events, Sessions, Registrations, Check-in)
         4. Testing - ✅ 60% (Orders, Samples, Reports schema)
         5. Training - ⏳ 5% (SOP, Assessment, Sessions)
         6. Design - ❌ 0% (Projects, Tech Packs, Mockups)
         7. RAG - 🟡 30% (Foundation only, needs services)
         8. Billing - 🟡 40% (Schema, missing UI/Stripe)
```

---

## 🔄 DATA FLOW EXAMPLES

### Example 1: Creating an Event (Complete Vertical)

```
User Action                Developer Code
─────────────────────────────────────────────────────────────

1. Click "Create Event"
                          → app/(dashboard)/events/new/page.tsx
                          → Renders EventForm component

2. Fill form (name, date, location)
                          → React Hook Form + Zod validation

3. Click "Save"
                          → Calls createEventAction(formData)
                          → "use server" directive

4. Server-side:
                          → requirePermission("events", "create")
                          → eventService.validateEventData()
                          → eventRepository.createEvent()
                          → Save to PostgreSQL

5. Real-time update:
                          → getPusher().trigger(
                              "private-global",
                              "event_created",
                              { event }
                            )

6. Cache refresh:
                          → revalidatePath("/events")

7. Toast notification:
                          → toast.success("Event created")
                          → router.push("/events")

8. Other users see update:
                          → usePusher hook in list page
                          → Detects "event_created" event
                          → Reloads list automatically
```

---

### Example 2: Creating a Test Order with Sample Upload (Complex Vertical)

```
User Action                  Developer Code
──────────────────────────────────────────────────────────────

1. Go to Testing → Test Orders → Create

2. Select Opportunity:
                             → Loads customer info
                             → Links TestOrder → Opportunity

3. Fill test details:
                             → Type, expected samples, deadline
                             → createTestOrderAction()

4. Server:
                             → Create TestOrder record
                             → Link to Opportunity
                             → Link to Customer (from Opp)
                             → Create Interaction (test_order_created)

5. Upload Samples:
                             → File picker → Upload to S3
                             → Create Media record
                             → Link Media → Sample
                             → uploadSampleAction()

6. Select Test Suite:
                             → Browse test suite library
                             → Add suite to order
                             → linkTestSuiteAction()

7. Submit Order:
                             → Status: DRAFT → SUBMITTED
                             → Auto-generate initial report
                             → Create Interaction

8. Real-time:
                             → Pusher: test_order_created
                             → Pusher: sample_uploaded
                             → Other team members see update

9. Auto-actions:
                             → Calculate expected completion
                             → Create task reminder
                             → Send email to assigned tester
```

---

## 🏗️ FEATURE MODULE STRUCTURE

```
lib/features/[feature-name]/
│
├── types/
│   ├── [feature].types.ts      Input/output schemas (Zod + interfaces)
│   └── index.ts                Barrel export
│
├── repositories/
│   ├── [feature].repository.ts Database CRUD operations
│   │   ├── getAll()
│   │   ├── getById()
│   │   ├── create()
│   │   ├── update()
│   │   └── delete()
│   └── index.ts                Barrel export
│
├── services/
│   ├── [feature].service.ts    Business logic + validation
│   │   ├── validate()
│   │   ├── checkDuplicates()
│   │   └── checkDependencies()
│   └── index.ts                Barrel export
│
├── actions/
│   ├── [feature].actions.ts    Server actions (use server)
│   │   ├── list[Feature]Action()
│   │   ├── get[Feature]Action()
│   │   ├── create[Feature]Action()
│   │   ├── update[Feature]Action()
│   │   └── delete[Feature]Action()
│   └── index.ts                Barrel export
│
└── index.ts                    Main barrel export
    export * from "./types"
    export * from "./repositories"
    export * from "./services"
    export * from "./actions"


app/(dashboard)/[vertical]/[feature]/
│
├── page.tsx                    List page (server component)
│   ├── listAction() → fetches data
│   ├── DataTable component (client)
│   └── Pusher real-time updates
│
├── new/page.tsx                Create page
│   └── Form component with validation
│
├── [id]/page.tsx               Detail page
│   ├── Displays entity data
│   └── Edit / Delete buttons
│
├── [id]/edit/page.tsx          Edit page
│   └── Form component (pre-filled)
│
└── components/
    ├── [Feature]Form.tsx       React Hook Form + Zod
    ├── [Feature]Table.tsx      DataTable component
    ├── [Feature]Details.tsx    Detail view
    └── [Feature]Filters.tsx    Search & filter UI
```

---

## 🔐 PERMISSION FLOW

```
┌─────────────────────────────────────────────────────┐
│     User Action → Server Action Call                 │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  auth() - Get JWT session   │
        │  Extract: user.id, roles    │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  requirePermission()         │
        │  Check: module + action      │
        │  Lookup in session.user      │
        │  .permissions[module]        │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │  Decision                            │
        ├──────────────┬──────────────────────┤
        │              │                      │
    ✅ ALLOWED      ❌ DENIED           ⚠️ ERROR
        │              │                      │
        │         throw Error            catch & return
        │         "Insufficient          { success: false }
        │         permissions"
        │              │
    Continue to   Return 403
    business logic or error toast
```

---

## 📊 DATABASE RELATIONSHIPS

```
Customer (Organization)
    ├── 1:N → Contact
    │           ├── 1:N → Interaction
    │           └── 1:N → Task
    │
    └── 1:N → Opportunity
                ├── 1:N → Engagement
                │           ├── 1:N → TestOrder (Testing)
                │           ├── 1:N → TrainingEngagement (Training)
                │           ├── 1:N → DesignProject (Design)
                │           └── 1:N → Event (Events)
                │
                └── (Many-to-One) → Interaction

Knowledge (Article)
    ├── 1:N → KnowledgeVersion
    ├── N:N → KnowledgeCategory
    ├── N:N → KnowledgeTag
    └── 1:N → KnowledgeVector (for RAG)

Event
    ├── 1:N → Session
    │           └── N:N → Speaker
    ├── N:N → Sponsor
    ├── 1:N → Registration
    │           ├── 1:N → Ticket
    │           └── 1:N → CheckIn
    └── 1:1 → EventMicrosite

TestOrder
    ├── 1:N → Sample
    │           └── 1:1 → Media
    ├── N:N → TestSuite
    └── 1:N → TestReport

User
    ├── N:N → Role
    │           └── N:N → Permission
    └── N:N → UserGroup
```

---

## 🔄 REQUEST LIFECYCLE

```
CLIENT                          SERVER                      DATABASE
│                               │                           │
├─ Click button                 │                           │
│                               │                           │
├─ Trigger action()             │                           │
│                               │                           │
├─────────────────────────────> │                           │
│ "use server" call             │                           │
│ (serialized data)             │                           │
│                               ├─ Receive request          │
│                               │                           │
│                               ├─ auth() - Get session     │
│                               │                           │
│                               ├─ requirePermission()      │
│                               │ Check access              │
│                               │                           │
│                               ├─ Validate (Zod)          │
│                               │                           │
│                               ├─ Call service             │
│                               │                           │
│                               ├─────────────────────────> │
│                               │ Query/Mutation            │
│                               │                           │
│                               │ <─ Result                 │
│                               │ (data or error)           │
│                               │                           │
│                               ├─ getPusher().trigger()    │
│                               │ Broadcast event           │
│                               │                           │
│                               ├─ revalidatePath()         │
│                               │ Invalidate cache          │
│                               │                           │
│ <─────────────────────────────┤                           │
│ ActionResult { success, data } │                           │
│                               │                           │
├─ if (success) toast.success() │                           │
├─ if (error) toast.error()     │                           │
│                               │                           │
├─ Subscribe to Pusher          │                           │
│ (usePusher hook)              │                           │
│                               │                           │
├─ Detect event from            │                           │
│ other users                   │                           │
│                               │                           │
├─ Revalidate list              │                           │
│ (useEffect + refetch)         │                           │
│                               │                           │
└─ UI updates                   │                           │
  (cached page reload)          │                           │
```

---

## 🎯 DAILY WORKFLOW FOR DEVELOPERS

```
MORNING
├─ Check dashboard: docs/DETAILED_ACTION_ITEMS.md
├─ Review your assigned subtasks
├─ Check blockers from standup
└─ Run: yarn check-types, yarn test:unit

DEVELOPMENT
├─ Create feature module (following template)
├─ Every 30min: yarn check-types (catch errors early)
├─ Every action: Add test
├─ Before commit:
│  ├─ yarn check-types → 0 errors
│  ├─ yarn test:unit features/[your-feature]
│  ├─ yarn format lib/features/[your-feature]
│  └─ Manual testing on http://localhost:3000
└─ Push to branch (create PR)

CODE REVIEW
├─ Peer reviews using PR template
├─ Check: Types, permissions, tests, real-time
├─ Test real-time with multiple browsers
├─ Verify cache invalidation works
└─ Merge when approved

DAILY STANDUP
├─ What did I complete?
├─ What's blocking me?
├─ Do I need help?
└─ Update docs/DETAILED_ACTION_ITEMS.md status
```

---

## 🧪 TESTING STRATEGY

```
Unit Tests (30%)
├─ Repository: CRUD operations
├─ Service: Validation, business logic
└─ Actions: Permission checks, return structure

Integration Tests (50%)
├─ Full flow: Create → Read → Update → Delete
├─ Permission enforcement
├─ Real-time (Pusher) events
├─ Cache invalidation
└─ Database transactions

E2E Tests (20%)
├─ User login → dashboard
├─ Complete user journeys
├─ Multi-user real-time scenarios
└─ Error recovery

COVERAGE TARGET: >80% for critical features
RUN: yarn test:unit && yarn test:e2e
```

---

## 📈 PERFORMANCE EXPECTATIONS

```
API Response Times:
├─ List (10 items): <100ms
├─ Get (detail): <50ms
├─ Create: <200ms
├─ Update: <150ms
└─ Delete: <100ms

With pagination (100+ items):
├─ Initial load: <300ms
├─ Search/filter: <200ms
└─ Real-time update: <500ms (Pusher)

Frontend:
├─ Page load (with Suspense): <1s
├─ Form submission: <500ms
├─ Data table rendering: <200ms
└─ Search input debounce: 300ms
```

---

## 🚀 DEPLOYMENT CHECKLIST

```
BEFORE EACH RELEASE:

Functionality
├─ All features implemented: ✅
├─ E2E tests passing: ✅
├─ Manual testing complete: ✅
└─ Permission audit: ✅

Code Quality
├─ Types: yarn check-types → 0 errors: ✅
├─ Tests: 80%+ coverage: ✅
├─ Lint: yarn format: ✅
└─ No console errors: ✅

Performance
├─ Lighthouse score ≥80: ✅
├─ API <200ms for list: ✅
├─ No n+1 queries: ✅
└─ Bundle size <500KB: ✅

Security
├─ Security headers configured: ✅
├─ CORS properly set: ✅
├─ Environment validation: ✅
└─ Rate limiting: ✅

Documentation
├─ README updated: ✅
├─ API docs updated: ✅
├─ Deployment guide: ✅
└─ Rollback plan: ✅

DEPLOY
├─ Tag release: v1.2.0
├─ Merge to main
├─ Build production
├─ Deploy to staging
├─ Smoke tests
├─ Deploy to production
└─ Monitor logs
```

---

## 📞 QUICK TROUBLESHOOTING

| Issue | Cause | Fix |
|-------|-------|-----|
| Type error on import | Missing re-export | Add to types/index.ts: `export type { ActionResult }` |
| Permission denied | Missing module name | Check copilot-instructions.md for correct module name |
| Real-time not working | Pusher not triggered | Add `await getPusher().trigger()` in action |
| Cache not invalidating | Missing revalidatePath | Add `revalidatePath("/path")` after mutation |
| Form validation fails | Wrong Zod schema import | Check types/ folder, use correct schema |
| Tests failing | Database state dirty | Run `yarn db:reset` before tests |
| Slow list query | N+1 problem | Add `include` or `select` in repository |

---

## 📚 REFERENCE MATERIALS

**Quick Links**:
1. `.github/copilot-instructions.md` - Architecture overview
2. `docs/FEATURE_DEVELOPMENT_TEMPLATE.md` - Standards
3. `docs/DEVELOPER_QUICK_REFERENCE.md` - Implementation guide
4. `lib/features/events/` - Reference implementation
5. `app/(dashboard)/events/` - Reference UI

**Run These Commands**:
```bash
yarn dev                  # Start development server
yarn check-types         # TypeScript validation
yarn test:unit          # Unit tests
yarn test:e2e           # End-to-end tests
yarn format             # Prettier + lint
yarn db:studio          # View database GUI
```

---

## 🎯 SUCCESS DEFINITION

You know you're done when:

- ✅ Feature listed on dashboard
- ✅ Full CRUD working (create, read, update, delete)
- ✅ Permissions enforced
- ✅ Real-time updates working
- ✅ Tests passing (>80% coverage)
- ✅ No type errors
- ✅ No console errors
- ✅ Performance <200ms for list

**Then document completion in**: `docs/DETAILED_ACTION_ITEMS.md` ✅

