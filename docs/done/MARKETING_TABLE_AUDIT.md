# Marketing Tables Audit Report

## Summary
Kiểm tra tất cả các bảng trong Marketing module để xác định trạng thái sử dụng, thiếu components, và kế hoạch hoàn thiện.

---

## 1. CampaignTemplate (Mẫu Email)

### Trạng thái Database
✅ **Bảng đã tạo trong schema** (`prisma/schema.prisma`)
- Các field: name, subject, content, type, isActive
- Relations: MarketingCampaign (many-to-many)
- Audit fields: createdById, updatedById, createdAt, updatedAt
- Enums: TemplateType (GENERAL, EVENT_INVITATION, EVENT_REMINDER, NEWSLETTER, SPONSOR_UPDATE)

### Trạng thái Backend
✅ **Service, Repository, Actions đã tạo**
- Chưa có CampaignTemplate-specific service/repository
- CampaignTemplate được quản lý qua MarketingCampaign (in templates array)
- Cần: Tạo campaign-template-service.ts, campaign-template-repository.ts, campaign-template-actions.ts

### Trạng thái Components UI
❌ **CHƯA ĐƯỢC TẠO - CẦN THỰC HIỆN**
- Không có components cho CampaignTemplate
- Cần tạo:
  - `campaign-template-list.tsx` - Danh sách templates
  - `campaign-template-form.tsx` - Form tạo/chỉnh sửa template
  - `campaign-template-detail.tsx` - Chi tiết template
  - `app/(dashboard)/marketing/templates/` folder

### Permissions
- Module: "marketing"
- Actions: create, read, update, delete

### Kế hoạch Thực hiện
1. ✅ Types đã tạo trong `lib/features/marketing/types.ts`
2. ❌ Service layer chưa tách riêng
3. ❌ UI components chưa tạo
4. ❌ Routes/Pages chưa tạo
5. ❌ Pagination logic chưa implement

---

## 2. EventMicrosite (Trang Marketing Sự Kiện)

### Trạng thái Database
✅ **Bảng đã tạo trong schema**
- Các field: eventId (unique), heroTitle, heroSubtitle, heroImageId, description, agenda, speakers, sponsors, ctaText, ctaUrl, isPublished, publishedAt
- Relations: Event (one-to-one), Media (heroImage), User (createdBy, updatedBy)

### Trạng thái Backend
✅ **Service, Repository, Actions đã tạo**
- `microsite-repository.ts` - ✅ Đầy đủ CRUD operations
- `microsite-service.ts` - ✅ Business logic
- `microsite-actions.ts` - ✅ Server actions với permission checks

### Trạng thái Components UI
✅ **Có components nhưng CHƯA HOÀN CHỈNH**
- `event-microsite-list.tsx` - ✅ Exists
- `event-microsite-form.tsx` - ✅ Exists
- `event-microsite-detail.tsx` - ✅ Exists
- `app/(dashboard)/marketing/microsites/` folder - ✅ Exists
- `[eventId]/` subpage - ✅ Exists
- `new/` create page - ✅ Exists

### Permissions
- Module: "events"
- Actions: create, read, update, delete

### Issues & Enhancements Needed
1. ⚠️ Chưa có publish/unpublish flow
2. ⚠️ Cần improve form validation
3. ⚠️ Cần image upload integration
4. ⚠️ Cần preview mode
5. ⚠️ Chưa có pagination test

### Kế hoạch
- ✅ Core functionality exists
- 🔄 Needs testing & refinement
- 🔄 Needs preview & publishing features

---

## 3. SponsorMaterial (Tài Liệu Nhà Tài Trợ)

### Trạng thái Database
✅ **Bảng đã tạo trong schema**
- Các field: eventId, sponsorId, title, description, type, fileId, url, dueDate, status, notes
- Relations: Event, Media (file), User (createdBy, updatedBy, approvedBy)
- Enums: MaterialType, MaterialStatus

### Trạng thái Backend
✅ **Service, Repository, Actions đã tạo**
- `sponsor-repository.ts` - ✅ Đầy đủ operations
- `sponsor-service.ts` - ✅ Business logic
- `sponsor-actions.ts` - ✅ Server actions

### Trạng thái Components UI
✅ **Có components nhưng CẦN CẢI THIỆN**
- `sponsor-material-list.tsx` - ✅ Exists
- `sponsor-material-form.tsx` - ✅ Exists
- `sponsor-materials-by-event.tsx` - ✅ Exists (for event detail page)
- `app/(dashboard)/marketing/sponsors/` folder - ✅ Exists
- Routes: `[id]/, event/, new/` - ✅ Exists

### Permissions
- Module: "events"
- Actions: create, read, update, delete

### Features Needed
1. ⚠️ File upload/management integration
2. ⚠️ Due date tracking & alerts
3. ⚠️ Approval workflow
4. ⚠️ Status badges/indicators
5. ⚠️ Sponsor contact linking

### Kế hoạch
- ✅ Core exists
- 🔄 Needs approval workflow
- 🔄 Needs file management
- 🔄 Needs notifications/alerts

---

## 4. MarketingCampaign (Chiến Dịch Marketing)

### Trạng thái Database
✅ **Bảng đã tạo trong schema**
- Các field: title, description, type, status, targetAudience, scheduledAt, sentAt
- Relations: User (createdBy, updatedBy), CampaignEmail, CampaignTemplate
- Enums: CampaignType, CampaignStatus

### Trạng thái Backend
✅ **Service, Repository, Actions đã tạo**
- `campaign-repository.ts` - ✅ Exists
- `campaign-service.ts` - ✅ Exists
- `campaign-actions.ts` - ✅ Exists
- `email-repository.ts` - ✅ For CampaignEmail

### Trạng thái Components UI
✅ **Có components**
- `marketing-campaign-list.tsx` - ✅ Exists
- Routes: `campaigns/[id]/, campaigns/new/` - ✅ Exists

### Permissions
- Module: "marketing"
- Actions: create, read, update, delete

### Features Needed
1. ⚠️ Campaign detail page
2. ⚠️ Template selection in form
3. ⚠️ Email recipient management
4. ⚠️ Scheduling logic
5. ⚠️ Analytics/metrics dashboard

---

## 5. CampaignEmail (Email trong Chiến Dịch)

### Trạng thái
✅ **Table + Repository chỉ để đọc dữ liệu từ Campaign**
- Mục đích: Track email sent history
- Không cần CRUD UI riêng - Quản lý qua Campaign
- Cần: Email analytics view

---

## 6. MarketingModule Summary Table

| Table | Database | Service | Repository | Actions | UI Components | Status |
|-------|----------|---------|------------|---------|----------------|--------|
| CampaignTemplate | ✅ | ❌ | ❌ | ❌ | ❌ | 🔴 Not Started |
| EventMicrosite | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 Partial |
| SponsorMaterial | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 Partial |
| MarketingCampaign | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 Partial |
| CampaignEmail | ✅ | N/A | ✅ | N/A | ❌ | 🟡 Analytics Only |

---

## Implementation Checklist

### Phase 1: CampaignTemplate (High Priority)
- [ ] Create `lib/features/marketing/services/campaign-template-service.ts`
- [ ] Create `lib/features/marketing/repositories/campaign-template-repository.ts`
- [ ] Create `lib/features/marketing/actions/campaign-template-actions.ts`
- [ ] Create `app/(dashboard)/marketing/components/campaign-template-form.tsx`
- [ ] Create `app/(dashboard)/marketing/components/campaign-template-list.tsx`
- [ ] Create `app/(dashboard)/marketing/templates/` folder with pages
- [ ] Add routes: `templates/new`, `templates/[id]`
- [ ] Add permissions check in actions
- [ ] Test CRUD operations

### Phase 2: EventMicrosite (Medium Priority)
- [ ] Add publish/unpublish workflow
- [ ] Improve image upload handling
- [ ] Add preview mode
- [ ] Add publish scheduling
- [ ] Improve validation
- [ ] Add SEO fields (meta title, description)
- [ ] Test all operations

### Phase 3: SponsorMaterial (Medium Priority)
- [ ] Add file upload/management
- [ ] Implement approval workflow
- [ ] Add due date alerts
- [ ] Add notification to sponsors
- [ ] Add status tracking dashboard
- [ ] Improve filtering & search

### Phase 4: MarketingCampaign (Medium Priority)
- [ ] Create campaign detail page
- [ ] Add template selection UI
- [ ] Implement recipient management
- [ ] Add scheduling logic
- [ ] Create analytics dashboard
- [ ] Add email preview functionality

---

## Key Development Principles

### Structure Follow
When implementing CampaignTemplate or other missing features, follow exact pattern:

```
lib/features/marketing/
├── services/campaign-template-service.ts
│   ├── createTemplate(data, userId)
│   ├── updateTemplate(id, data, userId)
│   ├── deleteTemplate(id)
│   ├── getTemplate(id)
│   ├── getTemplates(filters, page, limit)
│   └── Full error handling & validation
├── repositories/campaign-template-repository.ts
│   ├── Direct Prisma queries
│   ├── No business logic
│   └── Return raw data
├── actions/campaign-template-actions.ts
│   ├── "use server" directive
│   ├── requirePermission("marketing", "action")
│   ├── Call service, then Pusher, then revalidatePath
│   └── Return ActionResult<T>
└── types/
    ├── CampaignTemplate interface
    ├── CreateCampaignTemplateInput
    ├── UpdateCampaignTemplateInput
    └── CampaignTemplateFilters
```

### UI Component Pattern
```
app/(dashboard)/marketing/
├── components/
│   ├── campaign-template-form.tsx (Form - reusable)
│   ├── campaign-template-list.tsx (List with pagination)
│   ├── campaign-template-detail.tsx (Detail view)
│   └── index.ts (barrel export)
├── templates/ (page routes)
│   ├── page.tsx (list page)
│   ├── new/
│   │   └── page.tsx (create page)
│   └── [id]/
│       └── page.tsx (detail/edit page)
```

### Permission & Validation Checklist
- ✅ Check requirePermission("marketing", "create") before create
- ✅ Validate input with Zod schema
- ✅ Ensure createdBy/updatedBy audit fields
- ✅ Handle errors properly (throw with message)
- ✅ Return ActionResult with success/message
- ✅ Call getPusher().trigger() for real-time
- ✅ Call revalidatePath() for cache
- ✅ Test pagination with limit & offset

### Database & Type Constraints
- ✅ Use CUID for IDs
- ✅ ISO DateTime for timestamps
- ✅ Proper foreign key relations
- ✅ Index frequently queried fields
- ✅ Use enums from schema for type safety

---

## Testing Strategy

### Unit Tests
- Services: Test all business logic methods
- Repositories: Test all Prisma queries
- Actions: Test permission checks, error handling

### Integration Tests
- Full CRUD workflows
- Permission enforcement
- Pagination & filtering
- Error scenarios

### E2E Tests (Playwright)
- Create/Edit/Delete flows
- UI interactions
- Navigation
- Form validation

---

## Timeline Estimate

- **CampaignTemplate**: 3-4 hours (complete from scratch)
- **EventMicrosite**: 2-3 hours (testing & refinements)
- **SponsorMaterial**: 2-3 hours (approval workflow)
- **MarketingCampaign**: 2-3 hours (analytics & scheduling)
- **Total**: 9-13 hours for full completion

---

## Notes
- All tables have database models ✅
- Some have partial implementations 🟡
- CampaignTemplate completely missing UI 🔴
- Follow established patterns in contacts/, events/, knowledge/
- Always check permissions in actions
- Always validate input with Zod
- Always test after implementation
