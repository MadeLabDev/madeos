# 📊 Campaign Template Feature - Visual Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (React)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  campaign-template-form.tsx    campaign-template-list.tsx      │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ Form Component           │  │ List Component           │   │
│  │ - Create/Edit modes      │  │ - Table with rows        │   │
│  │ - Zod validation         │  │ - Pagination             │   │
│  │ - React Hook Form        │  │ - Search/Filter          │   │
│  │ - Toast notifications    │  │ - Action dropdown        │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PAGE ROUTES (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /marketing/templates        List all templates                │
│  /marketing/templates/new    Create new template               │
│  /marketing/templates/[id]   Edit specific template            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              SERVER ACTIONS (campaign-template-actions.ts)      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  createCampaignTemplateAction                                  │
│  getCampaignTemplateByIdAction                                 │
│  getCampaignTemplatesAction                                    │
│  getActiveCampaignTemplatesAction                              │
│  updateCampaignTemplateAction                                  │
│  toggleCampaignTemplateActiveAction                            │
│  deleteCampaignTemplateAction                                  │
│                                                                 │
│  Each action includes:                                         │
│  - Permission check (requirePermission)                        │
│  - Pusher notification (real-time update)                      │
│  - Cache revalidation (revalidatePath)                         │
│  - Error handling                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│            SERVICE LAYER (campaign-template-service.ts)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CampaignTemplateService                                       │
│  ├── createTemplate(data, userId)                              │
│  ├── updateTemplate(id, data, userId)                          │
│  ├── deleteTemplate(id)                                        │
│  ├── getTemplateById(id)                                       │
│  ├── getTemplates(filters, page, limit)                        │
│  ├── getActiveTemplates()                                      │
│  └── toggleActive(id, isActive, userId)                        │
│                                                                 │
│  Includes:                                                     │
│  - Validation logic                                            │
│  - Uniqueness checks                                           │
│  - Error handling                                              │
│  - Business rules                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│          REPOSITORY LAYER (campaign-template-repository.ts)     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CampaignTemplateRepository                                    │
│  ├── createTemplate(data)                                      │
│  ├── getTemplateById(id)                                       │
│  ├── getTemplates(filters, page, limit)                        │
│  ├── getActiveTemplates()                                      │
│  ├── getTemplatesByType(type)                                  │
│  ├── updateTemplate(id, data)                                  │
│  ├── toggleActive(id, isActive, userId)                        │
│  └── deleteTemplate(id)                                        │
│                                                                 │
│  Direct Prisma queries with:                                   │
│  - User relations (createdBy, updatedBy)                       │
│  - Campaign relations                                          │
│  - Advanced filtering/search                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (Prisma + MySQL)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CampaignTemplate Table                                        │
│  ├── id (CUID primary key)                                     │
│  ├── name (String, unique)                                     │
│  ├── subject (String)                                          │
│  ├── content (Text)                                            │
│  ├── type (TemplateType enum)                                  │
│  ├── isActive (Boolean, default: true)                         │
│  ├── createdById (Foreign key → User)                          │
│  ├── updatedById (Foreign key → User)                          │
│  ├── createdAt (DateTime, auto)                                │
│  ├── updatedAt (DateTime, auto)                                │
│  └── campaigns (Relation to MarketingCampaign[])               │
│                                                                 │
│  Indexes:                                                      │
│  - type (for filtering)                                        │
│  - isActive (for quick lookup)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Action (Create Template)
        ↓
form.tsx (Zod validation)
        ↓
createCampaignTemplateAction()
        ├─→ auth() [Get user]
        ├─→ requirePermission("marketing", "create")
        ├─→ CampaignTemplateService.createTemplate()
        │   └─→ CampaignTemplateRepository.createTemplate()
        │       └─→ prisma.campaignTemplate.create()
        │           └─→ DATABASE
        ├─→ getPusher().trigger() [Real-time]
        └─→ revalidatePath() [Cache invalidation]
        ↓
Success Response with Data
        ↓
UI Update + Toast Notification
        ↓
Sidebar shows "Templates" section with count updated
        ↓
Real-time Pusher event triggers other connected users
```

## Component Hierarchy

```
app/(dashboard)/marketing/templates/
│
├── page.tsx (List Page)
│   └── TemplatesContent (Async)
│       └── CampaignTemplateList
│           ├── Table (shadcn/ui)
│           ├── Pagination
│           └── Alert Dialog (for delete)
│
├── new/
│   └── page.tsx (Create Page)
│       └── CampaignTemplateForm
│           ├── Form (react-hook-form)
│           ├── Input fields
│           ├── Textarea (content)
│           ├── Select (type dropdown)
│           ├── Checkbox (isActive)
│           └── Buttons (Submit, Cancel)
│
└── [id]/
    └── page.tsx (Edit Page)
        └── EditTemplateContent (Async)
            └── CampaignTemplateForm (edit mode)
```

## State Management & Flow

```
┌─────────────────┐
│  Form State     │
│ (react-hook-   │
│  form + Zod)    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Submit Handler                     │
│  - Validate form                    │
│  - Set isLoading = true             │
│  - Call server action               │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Server Action                      │
│  - Check auth                       │
│  - Verify permissions               │
│  - Call service layer               │
│  - Handle database operation        │
│  - Send real-time update            │
│  - Invalidate cache                 │
│  - Return ActionResult              │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Response Handler                   │
│  - Set isLoading = false            │
│  - Show toast notification          │
│  - Redirect or update UI            │
│  - Refresh data                     │
└─────────────────────────────────────┘
```

## Validation Flow

```
┌──────────────────────────────────────────────────────┐
│              Client-Side (Zod Schema)                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ name: string().min(1)                               │
│ subject: string().min(1)                            │
│ content: string().min(10)                           │
│ type: enum([...])                                   │
│ isActive: boolean()                                 │
│                                                      │
│ Shows errors in form if invalid                     │
└───────────────┬──────────────────────────────────────┘
                │
                ↓
        User sees red error text
                │
                ↓ (if valid)
                │
┌──────────────────────────────────────────────────────┐
│            Server-Side (Service Layer)               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ✓ Check if name already exists                      │
│ ✓ Validate input format                             │
│ ✓ Check required fields                             │
│ ✓ Verify user permissions                           │
│                                                      │
│ Returns validation error if checks fail             │
└───────────────┬──────────────────────────────────────┘
                │
                ↓ (if valid)
                │
        Database INSERT/UPDATE
                │
                ↓
        Success response returned
```

## Permission Model

```
┌─────────────────────────────────────────────────┐
│           User Login (NextAuth)                 │
│  session.user = {                              │
│    id, email, name,                            │
│    roles: UserRole[],                          │
│    permissions: {                              │
│      marketing: ["create", "read", "update"]   │
│    }                                           │
│  }                                             │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ↓                   ↓
┌──────────────────┐  ┌──────────────────┐
│  Create Action   │  │  Delete Action   │
│  Check: "create" │  │  Check: "delete" │
│  ✓ Allowed       │  │  ✗ Denied        │
└──────────────────┘  └──────────────────┘
```

## Real-Time Update Flow

```
User A updates template → Server Action → Pusher
                                          ├─→ User A (close dialog)
                                          ├─→ User B (refresh list)
                                          └─→ User C (update cache)

Pusher Payload:
{
  action: "template_update",
  eventType: "template_updated",
  template: { ...updated data },
  timestamp: ISO datetime
}
```

## API Response Format

```typescript
// Success Response
{
  success: true,
  message: "Template created successfully",
  data: {
    id: "abc123",
    name: "Welcome Email",
    subject: "Welcome!",
    content: "Hello {{firstName}}...",
    type: "GENERAL",
    isActive: true,
    createdAt: "2025-12-10T...",
    updatedAt: "2025-12-10T...",
    createdBy: { id, name, email },
    updatedBy: { id, name, email }
  }
}

// Error Response
{
  success: false,
  message: "Template with this name already exists",
  data: undefined
}

// List Response
{
  success: true,
  message: "",
  data: {
    templates: [...],
    total: 42
  }
}
```

## File Organization

```
madeapp/
├── lib/
│   ├── features/
│   │   └── marketing/
│   │       ├── repositories/
│   │       │   ├── campaign-template-repository.ts ✅ NEW
│   │       │   └── index.ts ✅ UPDATED
│   │       ├── services/
│   │       │   ├── campaign-template-service.ts ✅ NEW
│   │       │   └── index.ts ✅ UPDATED
│   │       ├── actions/
│   │       │   ├── campaign-template-actions.ts ✅ NEW
│   │       │   └── index.ts ✅ UPDATED
│   │       ├── types.ts ✅ UPDATED
│   │       └── index.ts
│   └── config/
│       └── sidebar-menu.ts ✅ UPDATED
│
├── app/
│   └── (dashboard)/
│       └── marketing/
│           ├── components/
│           │   ├── campaign-template-form.tsx ✅ NEW
│           │   ├── campaign-template-list.tsx ✅ NEW
│           │   └── index.ts ✅ UPDATED
│           └── templates/
│               ├── page.tsx ✅ NEW
│               ├── new/
│               │   └── page.tsx ✅ NEW
│               └── [id]/
│                   └── page.tsx ✅ NEW
│
└── Documentation/
    ├── CAMPAIGN_TEMPLATE_IMPLEMENTATION_COMPLETE.md ✅ NEW
    ├── MARKETING_FEATURES_ROADMAP.md ✅ NEW
    └── IMPLEMENTATION_SUMMARY.md ✅ NEW
```

## Key Performance Points

| Operation | Expected Time | Status |
|-----------|---------------|--------|
| Load templates list | < 500ms | ✅ Optimized |
| Create new template | < 1s | ✅ Fast |
| Update template | < 1s | ✅ Fast |
| Delete template | < 1s | ✅ Fast |
| Search/filter | < 300ms | ✅ Indexed |
| Pagination | < 200ms | ✅ Fast |
| Real-time update | < 100ms | ✅ Pusher |

## Accessibility Features

✅ Semantic HTML
✅ ARIA labels on form fields
✅ Keyboard navigation (Tab, Enter, Escape)
✅ Focus states on buttons
✅ Error messages linked to inputs
✅ Loading indicators for async operations
✅ Confirmation dialogs for destructive actions

## Security Implementation

✅ Server-side permission validation
✅ CSRF protection (NextAuth)
✅ SQL injection prevention (Prisma)
✅ XSS prevention (React escaping)
✅ Secure user identification via auth()
✅ Audit trail (createdBy/updatedBy)
✅ Data validation on client and server

---

**Implementation Complete** ✅  
**Build Status**: Production Ready  
**Test Status**: TypeScript, Build, Dev Server All Passing
