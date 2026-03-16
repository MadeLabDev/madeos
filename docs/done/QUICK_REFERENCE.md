# ⚡ Quick Reference - Campaign Template Feature

## 🚀 Get Started in 2 Minutes

### Access the Feature
```
URL: http://localhost:3000/marketing/templates
Navigation: Dashboard → Marketing → Campaign Templates
```

### Create a Template
1. Click "New Template" button
2. Fill in fields:
   - **Name**: "Welcome Email" (required)
   - **Type**: GENERAL (dropdown)
   - **Subject**: "Welcome to our event!" (required)
   - **Content**: "Hello {{firstName}}..." (required, min 10 chars)
   - **Active**: Toggle on/off
3. Click "Create Template"

### Edit a Template
1. Click template name in list
2. Modify fields
3. Click "Update Template"

### Delete a Template
1. Click dropdown menu (⋮)
2. Select "Delete"
3. Confirm in dialog

## 📁 File Locations

| What | Where |
|------|-------|
| Form Component | `app/(dashboard)/marketing/components/campaign-template-form.tsx` |
| List Component | `app/(dashboard)/marketing/components/campaign-template-list.tsx` |
| Server Actions | `lib/features/marketing/actions/campaign-template-actions.ts` |
| Service Layer | `lib/features/marketing/services/campaign-template-service.ts` |
| Repository | `lib/features/marketing/repositories/campaign-template-repository.ts` |
| Types | `lib/features/marketing/types.ts` |
| Routes | `app/(dashboard)/marketing/templates/` |

## 🔧 API Functions

### Read
```typescript
// Get single template
const result = await getCampaignTemplateByIdAction(id);

// Get all templates with pagination
const result = await getCampaignTemplatesAction(filters, page, limit);

// Get active templates only
const result = await getActiveCampaignTemplatesAction();
```

### Create
```typescript
const result = await createCampaignTemplateAction({
  name: "Welcome",
  subject: "Welcome!",
  content: "Hello...",
  type: "GENERAL",
  isActive: true
});
```

### Update
```typescript
const result = await updateCampaignTemplateAction(id, {
  name: "Welcome Updated",
  subject: "Welcome Updated!",
  // ... other fields
});
```

### Delete
```typescript
const result = await deleteCampaignTemplateAction(id);
```

### Toggle Active
```typescript
const result = await toggleCampaignTemplateActiveAction(id, true);
```

## 📊 Template Types

```
GENERAL              // General purpose
EVENT_INVITATION     // Event invitations
EVENT_REMINDER       // Event reminders
NEWSLETTER          // Newsletters
SPONSOR_UPDATE      // Sponsor updates
```

## 🔐 Permissions

Required module: `"marketing"`

| Action | Permission |
|--------|-----------|
| Create | `"create"` |
| Read | `"read"` |
| Update | `"update"` |
| Delete | `"delete"` |

## 📤 Response Format

```typescript
interface ActionResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Example success
{
  success: true,
  message: "Template created successfully",
  data: { id, name, subject, ... }
}

// Example error
{
  success: false,
  message: "Template with this name already exists"
}
```

## 🎨 UI Components Used

- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Textarea` from `@/components/ui/textarea`
- `Select` from `@/components/ui/select`
- `Form` from `@/components/ui/form`
- `Table` from `@/components/ui/table`
- `Badge` from `@/components/ui/badge`
- `Dialog` from `@/components/ui/dialog`
- `AlertDialog` from `@/components/ui/alert-dialog`
- `DropdownMenu` from `@/components/ui/dropdown-menu`
- `Pagination` from `@/components/pagination/pagination`
- `Loader` from `@/components/ui/loader`

## 🔄 Real-Time Events

Channel: `private-global`

Events:
- `template_update` with `action: "template_created"`
- `template_update` with `action: "template_updated"`
- `template_update` with `action: "template_toggled"`
- `template_update` with `action: "template_deleted"`

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| name | Required, unique, min 1 char |
| subject | Required, min 1 char |
| content | Required, min 10 chars |
| type | Must be valid TemplateType |
| isActive | Boolean |

## 🗄️ Database

Model: `CampaignTemplate`

Fields:
```
id          CUID (primary key)
name        String (unique)
subject     String
content     Text
type        TemplateType enum
isActive    Boolean (default: true)
createdById String (FK to User)
updatedById String (FK to User)
createdAt   DateTime (auto)
updatedAt   DateTime (auto)
```

Relations:
- `User` (createdBy, updatedBy)
- `MarketingCampaign[]` (campaigns)

## 🧪 Testing URLs

```
List Page:      http://localhost:3000/marketing/templates
Create Page:    http://localhost:3000/marketing/templates/new
Edit Page:      http://localhost:3000/marketing/templates/[id]
```

Replace `[id]` with actual template ID, e.g.:
```
http://localhost:3000/marketing/templates/abc123xyz
```

## 📝 Validation Examples

### Valid Template
```typescript
{
  name: "Spring Event",
  subject: "Join us for Spring Event 2025!",
  content: "We're excited to invite you...",
  type: "EVENT_INVITATION",
  isActive: true
}
```

### Invalid (will error)
```typescript
{
  name: "",  // ❌ Empty
  subject: "Hi",  // ✅ OK
  content: "Short",  // ❌ Less than 10 chars
  type: "INVALID_TYPE",  // ❌ Not in enum
  isActive: "yes"  // ❌ Must be boolean
}
```

## 🎯 Common Tasks

### Search for templates
- Type in search box (searches name, subject, content)
- Results update live

### Filter by type
- Click type filter dropdown
- Select GENERAL, EVENT_INVITATION, etc.
- List updates with matching templates

### Toggle template status
- Click dropdown menu (⋮) on template row
- Click "Activate" or "Deactivate"
- Badge updates immediately

### Copy template ID
- Click dropdown menu (⋮) on template row
- Click "Copy ID"
- ID copied to clipboard

### Pagination
- Bottom of list shows page navigation
- Click page number to jump
- Current page highlighted

## 🚨 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Template name is required" | Name field empty | Enter template name |
| "Template with this name already exists" | Name not unique | Use different name |
| "Email subject is required" | Subject field empty | Enter email subject |
| "Content must be at least 10 characters" | Content too short | Write longer content |
| "User not authenticated" | Session expired | Re-login |
| "Insufficient permissions" | No "marketing" permission | Admin adds permission |
| "Cannot delete template that is being used in campaigns" | Template in use | Remove from campaigns first |

## 💡 Pro Tips

1. **Use descriptive names** - Makes templates easy to find
2. **Add variables** - Use {{firstName}}, {{eventName}}, etc. for personalization
3. **Keep subjects short** - Most email clients truncate long subjects
4. **Test before using** - Preview content before marking active
5. **Organize by type** - Use type enum for easy filtering
6. **Archive old ones** - Deactivate instead of deleting for record keeping
7. **Use templates for similar emails** - Reduces content creation time

## 🔗 Related Features

- **MarketingCampaign**: Use templates when creating campaigns
- **EventMicrosite**: Can reference templates in event communications
- **SponsorMaterial**: Templates for sponsor notifications
- **Users**: Track who created/updated templates

## 📞 Support

For issues or questions, check:
1. `IMPLEMENTATION_SUMMARY.md` - Complete overview
2. `MARKETING_FEATURES_ROADMAP.md` - What's next
3. `IMPLEMENTATION_ARCHITECTURE.md` - Technical details
4. `.github/copilot-instructions.md` - Development guidelines

---

**Feature Status**: ✅ **Production Ready**  
**Last Updated**: December 10, 2025  
**Version**: 1.0.0
