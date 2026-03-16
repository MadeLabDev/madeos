# Copilot Instructions for MADE (OS)

## Overview
MADE (OS) is a unified web application for MADE Laboratory, centralizing workflows across business verticals (Design, Events, Testing, Training) with integrated CRM, RBAC, dynamic forms, and knowledge base. Built with Next.js 16 App Router + Prisma, it replaces fragmented tools with a single hub enabling seamless collaboration with customers, partners, and internal teams.

**Reference Docs**: `.github/project-outline.md` (vision), `docs/IMPLEMENTATION_ROADMAP.md` (roadmap)

## Tech Stack & Setup
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.9
- **Database**: Prisma ORM v7, PostgreSQL (prod) / SQLite (dev) at `@/generated/prisma`
- **Auth**: NextAuth.js v5 (JWT + Google OAuth), session validation via `auth()` function
- **UI**: Shadcn UI + Tailwind CSS v4 (no custom CSS except `styles/`)
- **Rich Text**: Lexical editor for Knowledge articles
- **Real-time**: Pusher for live updates (channel: `private-global`)
- **Storage**: AWS S3 / DigitalOcean Spaces via `lib/features/upload/services/`
- **Testing**: Vitest (happy-dom, 80% coverage threshold) + Playwright e2e
- **Package Manager**: Yarn v1.22.22 (enforced via `preinstall` script)

## Architecture & Core Patterns

### Feature-Based Structure
Each feature module in `lib/features/[feature]/` contains:
```
[feature]/
  ├── actions/          # Server actions with permission checks
  ├── services/         # Business logic (validation, orchestration)
  ├── repositories/     # Direct Prisma queries
  ├── types/           # TypeScript interfaces & types
  └── index.ts         # Barrel exports
```
**Example**: `lib/features/contacts/` (getAllContacts → getContactsAction → contactRepository.getAllContacts)

### Server Actions & Permissions
All mutations (`create`, `update`, `delete`) use server actions with `"use server"` directive:
```typescript
"use server";
export async function createContactAction(data: CreateContactInput): Promise<ActionResult> {
  await requirePermission("customers", "create");  // Throws if denied
  const contact = await contactService.createContact(data);
  await getPusher().trigger("private-global", "contact_update", { action: "contact_created", contact });
  revalidatePath("/contacts");
  return { success: true, message: "Contact created", data: contact };
}
```
**Key Pattern**: Permission check first → business logic → real-time notification (Pusher) → cache revalidation → return `ActionResult`

### Session & Auth Flow
- Auth via `import { auth } from "@/lib/auth"` in server contexts
- NextAuth session includes user object with roles/permissions computed during JWT creation
- OAuth provider setup in `lib/auth.ts` (CredentialsProvider, GoogleProvider)
- User roles stored in `UserRole` → `Role` → `RolePermission` → `Module` + `Permission` models
- Permissions cached as `session.user.permissions` object: `{ [module]: [actions] }`

### Shared CRM Objects (Across Verticals)
- **Customer/Organization**: Top-level company record (industry, location, relationship stage)
- **Contact**: Person within a Customer (firstName, lastName, email, phone, roles)
- **Opportunity**: Sales pipeline entry (status: PROSPECTING → CLOSED_WON/LOST)
- **Engagement**: Unified project record (type: DESIGN, TESTING, TRAINING, EVENT)
- **Interaction**: Communication log (type: MEETING, CALL, EMAIL, NOTE)
- **Task**: Generic kanban tasks (reusable across verticals)

All linked via `customerId`/`contactId` foreign keys. Extend in feature services for vertical-specific logic.

### Database Patterns
- **IDs**: CUID format (`@default(cuid())`) in `prisma/schema.prisma`
- **Timestamps**: `createdAt`/`updatedAt` on all entities (auto-managed by Prisma)
- **Audit**: `createdBy`/`updatedBy` fields store user IDs (nullable, set manually in actions)
- **Media**: Separate `Media` model for file storage with S3 URLs + metadata
- **Relations**: Use explicit junction tables for many-to-many (e.g., `KnowledgeAssignedUser`, `KnowledgeCategoriesOnKnowledge`)
- **Visibility/Access**: Private content checks junction tables (e.g., `KnowledgeAssignedUser/Group`)

### Styling & Components
- **Shadcn UI**: Import from `@/components/ui/` (pre-configured buttons, dialogs, forms, etc.)
- **Tailwind v4**: Direct class usage, no custom CSS outside `styles/`
- **Dark Mode**: Handled by `next-themes` provider in layout; use `dark:` Tailwind classes
- **Form Fields**: React Hook Form + Zod for validation; components in `components/form-fields/` (rich-text-editor, media-thumbnail-field)
- **Responsive**: Use `md:`, `lg:` Tailwind breakpoints; width 1000 for desktop layout

### Error Handling & Validation
- **Server Actions**: Wrap in try/catch, return `ActionResult` object (`{ success, message, data }`)
- **Services**: Throw descriptive errors; validate input before DB calls (e.g., "Email already in use")
- **UI**: Use `react-error-boundary` for client error boundaries; Sonner toast for notifications
- **Zod**: Define input schemas in action handlers or feature types (e.g., `CreateContactInput`)

### Async Components & Suspense
Page components in `app/(dashboard)/` are server components by default. Wrap long-running fetches with Suspense:
```typescript
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AsyncContent />
    </Suspense>
  );
}
```

## Key Workflows

### Development
```bash
yarn dev                    # Start with NEXT_PUBLIC_DEV_MODE=true
yarn dev:prod-mode         # Start without dev features
yarn build && yarn start    # Production build
```

### Database
```bash
yarn db:generate           # Regenerate Prisma Client from schema
yarn db:migrate            # Run pending migrations (dev)
yarn db:seed               # Seed demo data (see prisma/seeds/)
yarn db:reset              # Drop + migrate + seed
yarn db:studio             # Open Prisma Studio GUI
```

### Testing
```bash
yarn test:unit            # Vitest on tests/unit/
yarn test:integration     # Vitest on tests/integration/
yarn test:e2e             # Playwright browser tests
yarn test:coverage        # Generate coverage report (80% threshold)
```

### Formatting
```bash
yarn format               # Prettier on app/, lib/, components/, prisma/
                         # Config: tabs (--use-tabs), width=1000, --prose-wrap always
```

### Type Checking
```bash
yarn check-types         # Project-wide TypeScript validation (strict mode)
```

## Code Conventions

### Imports
- **Absolute paths only**: `import { foo } from "@/lib/features/bar/services"`
- Configured in `tsconfig.json`: `"@/*": ["./*"]`
- Avoid relative imports (`../../../`)
- Use barrel exports (`index.ts`) to re-export from feature modules

### Naming
- **Features**: kebab-case folder names (`lib/features/post-tags/`)
- **Files**: camelCase for services/repositories, kebab-case for component/page files
- **Types**: PascalCase (e.g., `CreateContactInput`, `ContactListParams`, `ActionResult`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SITE_CONFIG`, `SIDEBAR_MENU_ITEMS`)
- **Modules**: Match database `Module.name` (e.g., "customers", "users", "events")

### API Response Pattern
All server actions return `ActionResult`:
```typescript
interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}
```

### Permission Modules
Permission modules must match database `Module.name`:
- `"customers"` - Contact/Customer operations
- `"users"` - User management
- `"events"` - Event management
- `"knowledge"` - Knowledge base
- `"roles"` - Role management (admin)

### Environment Variables
Required in `.env`:
```bash
DATABASE_URL="mysql://..."           # Prisma database
NEXTAUTH_SECRET="..."                # JWT secret
NEXTAUTH_URL="http://localhost:3000" # App URL
NEXT_PUBLIC_DEV_MODE="true"          # Enable demo panel
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM  # SMTP
PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_KEY  # Real-time
```

## Incomplete Features & Development Focus

### Status in Sidebar (`lib/config/sidebar-menu.ts`)
- ✅ **Implemented**: Dashboard, Profile Builder, Knowledge, Users, Contacts, Opportunities, User Groups, Backup
- 🚧 **Partial**: Events/Education (events, attendees, check-in working), Training/Support (SOP Library, Assessments in progress)
- ✅ **Implemented**: Testing x Development (Test Orders, Samples, Tests, Test Suites, Test Reports functional)
- ❌ **Not Started** (display: false): Design/Development verticals

### Current Priorities
1. **Type Safety & Action Constraints**: Standardize ActionResult and Zod schemas for all server actions; add contract tests for critical actions (contacts, knowledge, events). Enhance input validation and business error handling to reduce runtime bugs.
2. **Permission Coverage**: Audit all `lib/features/**/actions` to ensure every mutation has `requirePermission()` at the start; add unit tests for "deny/allow" per module (customers, events, knowledge, users).
3. **Cache & Revalidate**: Consistently apply strategy from `docs/CACHING_STRATEGY.md`: every action calls `revalidatePath()` with correct scope; add `revalidateModule(moduleName)` helper to prevent omissions.
4. **Error Boundaries UI**: Confirm all critical pages have `react-error-boundary` wrapper; standardize Sonner toast for action success/failure notifications.
5. **Security Headers**: Audit `next.config.ts` to add Content-Security-Policy, X-Frame-Options, Referrer-Policy, Permissions-Policy; configure CORS in `cors.ts` using allowlist domains from env.
6. **Secrets & Env Guard**: Create `env.mjs` (Zod) to validate required environment variables (DATABASE_URL, NEXTAUTH_SECRET, PUSHER, SMTP...); fail-fast when missing.
7. **Prisma Optimization**: Audit repositories for optimal select/include, avoid n+1 queries. Index frequently queried FKs (customerId, contactId, engagementId). Use `unstable_cache` for list pages with large pagination, with keys including filters.
8. **Pagination & Filters**: Standardize `site.ts` for page sizes; add consistent server-side filters (search, sort) on CRM list pages to reduce client load.
9. **Pusher Backoff**: Wrap `getPusher().trigger` with small retry/backoff and silent-fail to prevent minor errors from failing actions.
10. **NextAuth v5 Hardening**: Verify JWT enrichment, protect against privilege escalation; add rotation for NEXTAUTH_SECRET; define clear session max-age and idle timeout.
11. **RBAC Auditing**: Consistently record createdBy/updatedBy in all actions; add audit logs in `realtime/utils` for sensitive changes (users, roles, permissions).
12. **Rate Limiting**: Add middleware rate-limit for sensitive APIs (auth, uploads) based on IP/user.
13. **Profile Builder Completion**: Dynamic rendering of module fields from ModuleType (system='profile'); add preview, light versioning for profile schemas.
14. **Knowledge Forms Enhancement**: Insert dynamic fields below Lexical editor per system='knowledge'; support references to CRM entities (Customers/Contacts).
15. **Testing Vertical (🚧)**: Deploy UI following Events pattern: List/CRUD for TestOrder, Sample, TestSuite, Test, TestReport. Link Media for sample files. Auto-create Interaction on TestOrder status changes.
16. **Backup/Restore**: Complete `initialize-backup.ts` for scheduled snapshot backups; UI for downloading snapshots; test restore on SQLite dev.
17. **Observability**: Add light telemetry (performance marks, action latency); standardize page-level PageLoading + Suspense fallbacks.
18. **RAG Foundation** (when needed, non-breaking): Flag-driven activation with `enableRAG()` and guards `isRagEnabled()` in new actions. Local embeddings (Xenova) + Groq: Create simple services for embedding, vector search, RAG orchestration. Server actions: `searchKnowledgeAction`, `generateAnswerAction` with knowledge:read permission. UI hooks: Use `use-rag-status.ts` to toggle controls on Knowledge search bar.

## Vertical Workspaces

### Events x Education (Partial ✅)
- **Status**: Events, Sessions, Tickets, Registrations, Check-in functional
- **Flow**: Create Event → Sessions/Tickets → Registrations → QR Check-in
- **Key Models**: Event, Session, TicketType, Registration, CheckIn, Ticket
- **Integration Points**: Knowledge for materials, CRM Customers for sponsorships

### Testing x Development (In Progress 🚧)
- **Architecture**: Opportunity → Engagement (TESTING type) → TestOrder → TestSuite → Test → TestReport
- **Key Models**: TestOrder, Sample, TestSuite, Test, TestReport, Interaction, Media
- **Media Integration**: Track sample files via existing Media model
- **Database**: Models defined in schema, UI pages being built
- **Reference**: `docs/testing-development-plan.md`

### Training & Support (In Progress 🚧)
- **Flow**: Training Engagement → SOP Library → Sessions → Assessments
- **Status**: SOP Library and Assessments modules being implemented

### Design & Development (Planned ❌)
- **Flow**: DesignProject → Design Deck → Product Designs → TechPacks → Customer Approvals
- **Status**: Not started (display: false)

## Example Implementations

**Server Action** (with permission check + Pusher + cache revalidation):
```typescript
export async function createContactAction(data: CreateContactInput): Promise<ActionResult> {
  await requirePermission("customers", "create");
  const contact = await contactService.createContact(data);
  await getPusher().trigger("private-global", "contact_update", { action: "contact_created", contact });
  revalidatePath("/contacts");
  return { success: true, message: "Contact created", data: contact };
}
```

**Service** (validation + business logic):
```typescript
export async function createContact(data: CreateContactInput) {
  if (!data.email?.trim()) throw new Error("Email required");
  const existing = await contactRepository.getContactByEmail(data.email);
  if (existing) throw new Error("Email already in use");
  return contactRepository.createContact(data);
}
```

**Permission Check** (at action start):
```typescript
await requirePermission("module", "action");  // Throws on failure
// OR
const { allowed, user } = await checkPermission("module", "action");
if (!allowed) throw new Error("Insufficient permissions");
```

**Suspense + Server Component**:
```typescript
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AsyncDataComponent />
    </Suspense>
  );
}

async function AsyncDataComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## Key Files Reference
- **Auth**: `lib/auth.ts` (NextAuth config, session enrichment, providers)
- **Permissions**: `lib/permissions.ts` (checkPermission, requirePermission helpers)
- **Config**: `lib/config/site.ts` (pagination), `lib/config/sidebar-menu.ts` (nav structure)
- **Database**: `prisma/schema.prisma` (all models), `prisma/seeds/` (demo data)
- **Features**: `lib/features/` (30+ modules: users, contacts, opportunities, knowledge, events, etc.)
- **UI**: `components/ui/` (Shadcn pre-built), `components/form-fields/` (rich-text, media)
- **AI/RAG Foundation** (Foundation - optional, feature-flagged):
  - `lib/ai/` - Configuration for embeddings, LLM, feature flags
  - `lib/features/vector-search/` - RAG services (placeholder for future implementation)
  - `prisma/schema.prisma` - `KnowledgeVector`, `VectorSearchLog` models
- **Docs**: `.github/project-outline.md` (product), `docs/IMPLEMENTATION_ROADMAP.md` (roadmap)

## RAG Foundation (AI/Vector Search - Feature-Flagged)

### Overview
MADE OS has a complete **foundation for RAG (Retrieval-Augmented Generation)** that can be activated when needed. All features are:
- ✅ **Disabled by default** - No impact on current system
- ✅ **Feature-flagged** - Controlled via `Settings.rag_enabled`
- ✅ **Non-breaking** - New database tables don't affect existing features
- ✅ **Ready to activate** - Switch `rag_enabled = true` to start using

### What's Already Implemented
1. **Database Models** (`prisma/schema.prisma`):
   - `KnowledgeVector`: Stores embeddings of knowledge article chunks
   - `VectorSearchLog`: Audit trail for search queries and performance

2. **AI Configuration** (`lib/ai/`):
   - `embedding-config.ts`: Support for local (Xenova) or remote (OpenAI) embeddings
   - `llm-config.ts`: Support for Groq (free), OpenAI, Ollama, or search-only mode
   - `rag-feature-flag.ts`: Check/enable/disable RAG via settings

3. **Vector Search Module** (`lib/features/vector-search/`):
   - Scaffolded folder structure (actions, services, repositories, types)
   - Types defined for SearchResult, RAGAnswer, EmbeddingChunk, VectorQuery
   - Ready for implementation without blocking current code

### How to Activate RAG
When ready to implement RAG features:

1. **Enable via Settings**:
   ```typescript
   await enableRAG(); // Sets rag_enabled = true in database
   ```

2. **Install dependencies** (one-time):
   ```bash
   # For local embeddings (free)
   yarn add @xenova/transformers
   
   # For Groq LLM (recommended free option)
   yarn add groq-sdk
   
   # OR for OpenAI
   yarn add openai
   ```

3. **Set environment variables** (see `.env.example`):
   ```bash
   EMBEDDING_PROVIDER="local"  # or "openai"
   LLM_PROVIDER="groq"         # or "none", "openai", "ollama"
   GROQ_API_KEY="xxxx"         # if using Groq
   ```

4. **Implement services** in `lib/features/vector-search/services/`:
   - `embeddingService.ts`: Vectorize text
   - `vectorSearchService.ts`: Find similar vectors
   - `ragService.ts`: Orchestrate embedding → search → LLM answer

5. **Add server actions** in `lib/features/vector-search/actions/`:
   - `searchKnowledgeAction`: Semantic search on KB
   - `generateAnswerAction`: RAG Q&A with LLM

### Safe Implementation Pattern
All RAG features should check `isRagEnabled()` before execution:

```typescript
import { isRagEnabled } from "@/lib/ai";

export async function myRagAction(query: string) {
  // Guard: Check if RAG is enabled
  const ragEnabled = await isRagEnabled();
  if (!ragEnabled) {
    return { success: false, message: "RAG not enabled" };
  }

  // Safe to use RAG services now
  const results = await ragService.search(query);
  return { success: true, data: results };
}
```

### Use Cases (Ready to Implement)
- **Knowledge Search**: Semantic search on Knowledge Base articles
- **Q&A Bot**: Answer questions from KB using LLM
- **Recommendation**: Suggest related knowledge/resources
- **CRM Intelligence**: Find similar customers, leads, opportunities
- **Report Analysis**: Summarize and analyze test reports, event feedback

### Cost Model
- **With local embeddings (Xenova)**: $0/month
- **With Groq LLM**: $0/month (free tier)
- **With OpenAI**: $0.02/1M embedding tokens + $0.03/1K LLM tokens (~$3-5/month to start)

### Zero Breaking Changes
✅ Existing code runs unchanged
✅ New AI models/tables are dormant until activated
✅ Permission checks still apply to RAG features
✅ Caching strategy compatible with RAG queries

