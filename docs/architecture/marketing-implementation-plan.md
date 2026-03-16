# Marketing Functionality Implementation Plan

## Overview
Based on the MADE (OS) Project Outline, marketing functionality should enable users to:
1. **Manage event microsite content** - Public-facing marketing pages for events
2. **Send communications and campaigns** - Email campaigns and automated communications
3. **Manage sponsor-related materials** - Sponsor assets and deliverables

## Current State Analysis

### ✅ Existing Infrastructure
- **Email Service**: Complete email infrastructure with templates (`lib/email/`)
- **Event Model**: Basic event structure exists but lacks marketing fields
- **Knowledge Base**: Content management system that could be extended
- **CRM**: Contact and organization management for campaign targeting

### ❌ Missing Components
- No marketing feature directory (`lib/features/marketing/`)
- No marketing database models (Campaign, EmailCampaign, etc.)
- Marketing sidebar menu set to `display: false`
- No marketing permissions defined
- No event microsite content management
- No sponsor material management

## Implementation Plan

### Phase 1: Database Models & Core Infrastructure

#### 1.1 Marketing Database Models

```prisma
// Campaign - Marketing campaigns (email, social, etc.)
model MarketingCampaign {
  id          String             @id @default(cuid())
  title       String
  description String?            @db.Text
  type        CampaignType       @default(EMAIL)
  status      CampaignStatus     @default(DRAFT)
  targetAudience String?         @db.Text
  scheduledAt DateTime?
  sentAt      DateTime?
  createdById String
  updatedById String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  createdBy   User               @relation("CampaignCreatedBy", fields: [createdById], references: [id])
  updatedBy   User               @relation("CampaignUpdatedBy", fields: [updatedById], references: [id])
  emails      CampaignEmail[]
  templates   CampaignTemplate[]

  @@index([status])
  @@index([type])
  @@index([scheduledAt])
}

// CampaignEmail - Individual emails within a campaign
model CampaignEmail {
  id          String           @id @default(cuid())
  campaignId  String
  subject     String
  content     String           @db.Text
  recipientEmail String
  recipientName  String?
  status      EmailStatus      @default(PENDING)
  sentAt      DateTime?
  openedAt    DateTime?
  clickedAt   DateTime?
  error       String?
  createdAt   DateTime         @default(now())

  campaign    MarketingCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@index([recipientEmail])
  @@index([status])
}

// CampaignTemplate - Reusable email templates
model CampaignTemplate {
  id          String             @id @default(cuid())
  name        String
  subject     String
  content     String             @db.Text
  type        TemplateType       @default(GENERAL)
  isActive    Boolean            @default(true)
  createdById String
  updatedById String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  createdBy   User               @relation("TemplateCreatedBy", fields: [createdById], references: [id])
  updatedBy   User               @relation("TemplateUpdatedBy", fields: [updatedById], references: [id])
  campaigns   MarketingCampaign[]

  @@index([type])
  @@index([isActive])
}

// EventMicrosite - Marketing content for event microsites
model EventMicrosite {
  id          String           @id @default(cuid())
  eventId     String           @unique
  heroTitle   String
  heroSubtitle String?
  heroImageId String?
  description String           @db.Text
  agenda      String?          @db.Text
  speakers    String?          @db.Text
  sponsors    String?          @db.Text
  ctaText     String?
  ctaUrl      String?
  isPublished Boolean          @default(false)
  publishedAt DateTime?
  createdById String
  updatedById String
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  event       Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  heroImage   Media?           @relation(fields: [heroImageId], references: [id])
  createdBy   User             @relation("MicrositeCreatedBy", fields: [createdById], references: [id])
  updatedBy   User             @relation("MicrositeUpdatedBy", fields: [updatedById], references: [id])

  @@index([eventId])
  @@index([isPublished])
}

// SponsorMaterial - Sponsor-related assets and deliverables
model SponsorMaterial {
  id          String           @id @default(cuid())
  eventId     String
  sponsorId   String           // Links to Contact/Organization
  title       String
  description String?          @db.Text
  type        MaterialType     @default(ASSET)
  fileId      String?
  url         String?
  dueDate     DateTime?
  status      MaterialStatus   @default(PENDING)
  notes       String?          @db.Text
  createdById String
  updatedById String
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  event       Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  file        Media?           @relation(fields: [fileId], references: [id])
  createdBy   User             @relation("MaterialCreatedBy", fields: [createdById], references: [id])
  updatedBy   User             @relation("MaterialUpdatedBy", fields: [updatedById], references: [id])

  @@index([eventId])
  @@index([sponsorId])
  @@index([status])
  @@index([dueDate])
}
```

#### 1.2 Required Enums

```prisma
enum CampaignType {
  EMAIL
  SOCIAL
  WEBINAR
  NEWSLETTER
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  CANCELLED
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  COMPLAINT
}

enum TemplateType {
  GENERAL
  EVENT_INVITATION
  EVENT_REMINDER
  NEWSLETTER
  SPONSOR_UPDATE
}

enum MaterialType {
  ASSET
  LOGO
  BANNER
  PRESENTATION
  CONTRACT
  REPORT
}

enum MaterialStatus {
  PENDING
  SUBMITTED
  APPROVED
  REJECTED
  REVISION_REQUESTED
}
```

### Phase 2: Feature Implementation

#### 2.1 Marketing Feature Structure
```
lib/features/marketing/
├── actions/
│   ├── campaign.actions.ts
│   ├── microsite.actions.ts
│   └── sponsor.actions.ts
├── services/
│   ├── campaign.service.ts
│   ├── microsite.service.ts
│   └── sponsor.service.ts
├── repositories/
│   ├── campaign.repository.ts
│   ├── microsite.repository.ts
│   └── sponsor.repository.ts
├── types/
│   ├── campaign.types.ts
│   ├── microsite.types.ts
│   ├── sponsor.types.ts
│   └── index.ts
└── index.ts
```

#### 2.2 Email Templates
Extend existing email templates with marketing-specific ones:
- `campaign-email.tsx` - Generic campaign template
- `event-microsite-invitation.tsx` - Event invitation
- `newsletter.tsx` - Newsletter template

#### 2.3 UI Components Structure
```
app/(dashboard)/marketing/
├── campaigns/
│   ├── page.tsx                    # Campaign list
│   ├── new/page.tsx               # Create campaign
│   ├── [id]/
│   │   ├── page.tsx              # Campaign details
│   │   ├── edit/page.tsx         # Edit campaign
│   │   └── emails/page.tsx       # Campaign emails
├── microsites/
│   ├── page.tsx                   # Microsite list
│   ├── [eventId]/
│   │   ├── page.tsx              # Microsite editor
│   │   └── preview/page.tsx      # Public preview
├── sponsors/
│   ├── page.tsx                   # Sponsor materials
│   ├── [eventId]/page.tsx        # Event sponsor materials
└── templates/
    ├── page.tsx                   # Template library
    ├── new/page.tsx              # Create template
    └── [id]/edit/page.tsx        # Edit template
```

### Phase 3: Integration Points

#### 3.1 Event Integration
- Extend Event model with microsite relationship
- Add microsite management to event detail pages
- Integrate sponsor material management with event workflow

#### 3.2 CRM Integration
- Use existing Contact/Organization models for campaign targeting
- Link sponsor materials to CRM contacts
- Leverage existing interaction tracking for campaign analytics

#### 3.3 Email Integration
- Extend existing email service for bulk sending
- Add campaign tracking (opens, clicks)
- Integrate with existing KnowledgeEmailLog patterns

### Phase 4: Permissions & Security

#### 4.1 Marketing Permissions
```typescript
// In permissions.ts
{
  marketing: {
    campaigns: ['create', 'read', 'update', 'delete', 'send'],
    microsites: ['create', 'read', 'update', 'publish'],
    sponsors: ['create', 'read', 'update', 'approve'],
    templates: ['create', 'read', 'update', 'delete']
  }
}
```

#### 4.2 Public Access
- Event microsites should be publicly accessible
- Implement proper authentication for microsite editing
- Secure sponsor material access

### Phase 5: Implementation Priority

#### 5.1 MVP Features (Phase 1)
1. **Campaign Management**
   - Create/edit email campaigns
   - Basic email sending (single recipient)
   - Campaign status tracking

2. **Email Templates**
   - Template library
   - Basic template editor
   - Template assignment to campaigns

#### 5.2 Core Features (Phase 2)
3. **Event Microsites**
   - Microsite content editor
   - Public microsite display
   - Basic customization options

4. **Sponsor Materials**
   - Material upload/tracking
   - Status management
   - File association

#### 5.3 Advanced Features (Phase 3)
5. **Bulk Email Campaigns**
   - Mass email sending
   - Recipient list management
   - Email analytics (opens, clicks)

6. **Advanced Microsites**
   - Rich content editor
   - Custom styling
   - Registration integration

7. **Sponsor Portal**
   - Self-service material uploads
   - Approval workflows
   - Contract management

## Technical Considerations

### Database Migration Strategy
- Add new tables without affecting existing data
- Create indexes for performance
- Implement proper foreign key relationships

### Email Infrastructure Scaling
- Implement queue system for bulk emails
- Add rate limiting and throttling
- Monitor delivery rates and bounces

### Content Management
- Use existing Knowledge Base patterns for rich text editing
- Implement version control for microsites
- Add media management integration

### Analytics & Reporting
- Track campaign performance metrics
- Implement basic reporting dashboard
- Export capabilities for external analysis

## Success Metrics

### Functional Metrics
- ✅ Campaigns can be created and sent
- ✅ Event microsites are publicly accessible
- ✅ Sponsor materials can be managed
- ✅ Email templates are reusable

### Performance Metrics
- Email delivery rate > 95%
- Microsite load time < 3 seconds
- Campaign creation time < 5 minutes

### User Experience Metrics
- Intuitive campaign creation workflow
- Easy microsite content management
- Clear sponsor material tracking

## Risk Mitigation

### Technical Risks
- Email deliverability issues → Implement proper authentication and monitoring
- Database performance → Proper indexing and query optimization
- Content editing complexity → Start with simple editor, enhance iteratively

### Business Risks
- Low adoption → Ensure integration with existing workflows
- Complex permissions → Start with simple role-based access
- Email compliance → Implement unsubscribe and preference management

## Next Steps

1. **Immediate Actions**
   - Create marketing feature directory structure
   - Implement database models and enums
   - Set up basic permissions

2. **Week 1-2: MVP Implementation**
   - Campaign creation and basic email sending
   - Email template management
   - Update sidebar menu to enable marketing

3. **Week 3-4: Core Features**
   - Event microsite content management
   - Sponsor material tracking
   - Public microsite display

4. **Week 5-6: Advanced Features**
   - Bulk email campaigns
   - Analytics and reporting
   - Advanced microsite customization

This plan provides a comprehensive roadmap for implementing marketing functionality that aligns with the MADE (OS) project requirements while leveraging existing infrastructure and following established patterns.</content>
<parameter name="filePath">/Users/nguyenpham/Source Code/madeapp/docs/marketing-implementation-plan.md