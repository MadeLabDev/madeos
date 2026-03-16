# MADE OS — AI Execution Plan (Dec 11, 2025)

This plan enumerates missing or incomplete areas across the project and defines concrete, atomic tasks that AI can implement. Tasks are grouped by feature area and follow existing architecture patterns: repositories → services → actions with permission checks, Pusher notifications, and cache revalidation.

## Guiding Principles
- Use feature-based structure in `lib/features/*` with barrel exports.
- Always enforce permissions via `requirePermission()` in server actions.
- Return `ActionResult` with `{ success, message, data }`.
- Revalidate relevant paths after mutations and emit Pusher events.
- Follow Tailwind/Shadcn UI patterns; avoid custom CSS outside `styles/`.

---

## 1) Profile Builder (Priority)
- Task: Render dynamic modules from `ModuleType` for system='profile', locked=true under Profile Builder UI.
- Steps:
  - Implement `profile` form rendering via `components/module-form` using `ModuleFormField`.
  - Add service in `lib/features/profile/services/` to map `ModuleType` → UI schema.
  - Add actions in `lib/features/profile/actions/` with permission module `users`.
  - Emit Pusher `profile_update` and revalidate `/profile`.
- Deliverables:
  - `profileService.ts`, `profile.actions.ts`, UI wiring in `app/(dashboard)/profile`.

## 2) Knowledge Forms — Dynamic Fields (Priority)
- Task: Add dynamic fields below Lexical editor for `system='knowledge'` modules.
- Steps:
  - Build `knowledgeFormService.ts` to derive fields from `ModuleType`.
  - Integrate with existing Knowledge create/edit pages and `ModuleFormField`.
  - Ensure permission module `knowledge` and correct cache revalidation.
- Deliverables:
  - `lib/features/knowledge/services/knowledgeFormService.ts`, action updates, UI integration.

## 3) Testing x Development (In Progress 🚧)
- Status: DB models defined; UI/features partially implemented.
- Task: Implement full flow: Opportunity → Engagement(TESTING) → TestOrder → TestSuite → Test → TestReport.
- Steps:
  - Create repositories/services/actions for missing entities.
  - Pages under `app/(dashboard)/testing/*` with list/create/edit patterns.
  - Media attachments via existing `Media` model.
  - Real-time updates: Pusher `testing_update` channels.
- Deliverables:
  - Feature module files and pages with revalidation and permissions.

## 4) Events x Education (Partial ✅)
- Task: Complete edge cases and update flows.
- Steps:
  - Implement update handlers where types use `Partial<...>` (registrations, check-ins, payments, tickets) ensuring validation and audit fields.
  - Add missing permission checks in actions and services.
  - Strengthen check-in device/location tracking; Pusher emit on updates.
- Deliverables:
  - Action/service updates; tests for repository CRUD and actions.

## 5) Training & Support (Not Started ❌)
- Task: Initialize feature scaffolding.
- Steps:
  - Create `lib/features/training/*` repositories/services/actions.
  - Replace TODOs that use `"system"` with authenticated user context via `auth()`.
  - UI pages under `app/(dashboard)/training/*` using list/create/edit patterns.
- Deliverables:
  - Training registration/service/actions with proper audit fields and permissions.

## 6) Design & Development (Not Started ❌)
- Task: Implement DesignProject → DesignDeck → ProductDesigns → TechPacks → Approvals.
- Steps:
  - Add repositories/services/actions for design entities.
  - Build forms using React Hook Form + Zod; attach media.
  - Pusher updates and cache revalidation.
- Deliverables:
  - Feature modules and pages; initial unit tests.

## 7) Marketing & Finance Verticals (Not Started ❌)
- Task: Scaffold feature areas following Events pattern.
- Steps:
  - Define repositories/services/actions for campaigns, templates, microsites, sponsors (Marketing) and invoicing, payments, budgets (Finance).
  - UI pages under respective dashboards; permission modules `marketing`, `finance`.
- Deliverables:
  - Minimal CRUD and list views; integration points to CRM.

## 8) Knowledge Categories — Permission Checks (TODO)
- Task: Add missing `requirePermission()` in category actions.
- Files:
  - `lib/features/knowledge-categories/actions/category.actions.ts` — add checks for create/update/delete with module `knowledge`.
- Deliverables:
  - Updated actions with guards; unit tests.

## 9) Vector Search (RAG) — URL Generation (TODO)
- Task: Generate canonical URLs based on module/type in `rag-service.ts`.
- Files:
  - `lib/features/vector-search/services/rag-service.ts` — replace `url: undefined`.
- Steps:
  - Map `sourceModule` + entity ID to app routes, e.g., `/knowledge/[id]`.
- Deliverables:
  - Helper `getEntityUrl(module, id)` and usage in rag results.

## 10) Storage — Local Client Filesystem Check (TODO)
- Task: Implement actual filesystem existence check.
- Files:
  - `lib/storage/local-client.ts` — replace placeholder in `exists()`.
- Steps:
  - Use Node fs APIs in server contexts; guard for browser.
- Deliverables:
  - Robust `exists(path)` implementation with tests.

## 11) Backup — R2 Delete (TODO)
- Task: Implement deletion from R2 storage when removing backups.
- Files:
  - `lib/features/backup/services/backup-service.ts` — fill TODO.
- Steps:
  - Use existing storage client abstraction; add retry + logging.
- Deliverables:
  - Service method to remove R2 object and metadata.

## 12) Auth Context in Training Actions (TODO)
- Task: Replace `"system"` audit values with actual `user.id`.
- Files:
  - `lib/features/training/actions/training-registration.actions.ts`.
- Steps:
  - Import `auth` and inject `createdBy`, `updatedBy`, `checkedInById`.
- Deliverables:
  - Updated actions; tests verifying audit fields.

## 13) Site Info Cache API — Coverage & Validation
- Task: Add tests and strengthen `setSiteInfoCache()` semantics.
- Files:
  - `lib/config/site.ts`.
- Steps:
  - Validate partial input keys; emit dev logs reflecting cache state.
- Deliverables:
  - Unit tests; stricter types.

## 14) Sidebar Menu Visibility (Optional)
- Task: Ensure modules marked Not Started are hidden until ready.
- Files:
  - `lib/config/sidebar-menu.ts`.
- Steps:
  - Confirm `display: false` for planned verticals; wire flags from `Settings`.
- Deliverables:
  - Consistent sidebar state for verticals.

## 15) Testing & Coverage
- Task: Add unit tests in `tests/unit/` for updated actions/services; integration tests for flows.
- Steps:
  - Use Vitest; ensure 80% coverage threshold remains.
  - Add Playwright basic e2e for list/create/edit for new modules.
- Deliverables:
  - Test files and passing CI.

---

## Execution Order
1. Knowledge Categories permission checks (quick wins).
2. Training actions audit context.
3. Vector Search URL generation.
4. Local storage filesystem check.
5. Backup R2 delete.
6. Profile Builder dynamic modules.
7. Knowledge forms dynamic fields.
8. Testing vertical completion.
9. Events polish.
10. Design + Training scaffolding.
11. Marketing + Finance scaffolding.
12. Site cache API tests.
13. Sidebar visibility controls.
14. Add tests and coverage.

## Acceptance Criteria
- All actions enforce `requirePermission()` and return `ActionResult`.
- Pusher notifications fire with correct channels per feature.
- Cache revalidation targets correct paths after mutations.
- New features integrate with existing CRM objects and media.
- Tests pass with coverage ≥ 80%.

## Quick Commands
```bash
# Type checking
yarn check-types

# Run unit tests
yarn test:unit

# Run integration tests
yarn test:integration

# E2E tests
yarn test:e2e

# Prisma
yarn db:migrate && yarn db:seed
```
