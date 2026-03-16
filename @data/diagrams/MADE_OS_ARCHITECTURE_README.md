# MADE OS - Architecture Documentation

**Version:** 2.0  
**Generated:** November 17, 2025  
**Based on:** MADE_OS_ProjectOutline.html v1.0 & made-app Architecture  
**Status:** Complete - Ready for Development

---

## 📋 Quick Navigation

- **Architecture Diagrams:** 15 Mermaid files
- **Core System Layers:** Auth, CRM, Verticals, Shared, Public Portals
- **Data Model:** 70+ entities with relationships
- **Technology Stack:** Next.js 16, React 19, Prisma, MySQL, NextAuth v5

### Main Diagram Files

| File | Purpose | Type |
|------|---------|------|
| `@made-os-architecture.mmd` | System overview | Main Architecture |
| `made-os-app-architecture.mmd` | User flow & navigation | App Flow |
| `made-os-data-model.mmd` | All entities & relationships | ER Diagram |
| `made-os-database-relationships.mmd` | Data relationships by domain | System Diagram |
| `made-os-rbac-flow.mmd` | Permission check flow | Server Action Flow |
| `made-os-system-context.mmd` | System boundaries & actors | Context Diagram |
| `made-os-tech-stack.mmd` | Technology layers | Tech Stack |

### Feature Diagram Files

| File | Purpose |
|------|---------|
| `feature-crm-core.mmd` | CRM module operations |
| `feature-design-workspace.mmd` | Design project workflow |
| `feature-events-workspace.mmd` | Event management workflow |
| `feature-testing-workspace.mmd` | Testing operations workflow |
| `feature-training-workspace.mmd` | Training program workflow |
| `feature-customer-portal.mmd` | Customer-facing portal |
| `feature-auth-users.mmd` | Authentication & authorization system |
| `feature-billing-financial.mmd` | Billing & financial operations |

---

## 🏛️ System Architecture Overview

### Core Layers

```
MADE OS Platform
├── 🔐 Authentication & RBAC
│   ├── NextAuth v5 + Google OAuth
│   ├── JWT Token Management
│   └── Role-Based Access Control
│
├── 💼 CRM Core (Unified Engagement Model)
│   ├── Organizations (with hierarchy)
│   ├── Contacts (with role tags)
│   ├── Opportunities (pipeline tracking)
│   ├── Engagements (Design/Test/Training/Event)
│   ├── Interactions (meetings, calls, emails)
│   ├── Tasks (workflow management)
│   ├── Activity Timeline (audit trail)
│   └── Notifications (real-time alerts)
│
├── 🏭 Vertical Workspaces
│   ├── 🎨 Design x Development
│   │   ├── Design Projects
│   │   ├── Design Decks
│   │   ├── Product Design & Mockups
│   │   ├── Separation Files (Color-space)
│   │   ├── Output Files (DTG, DTF, Transfer, Embroidery)
│   │   └── Tech Packs & Specifications
│   │
│   ├── 🎪 Events x Education
│   │   ├── Event Setup & Management
│   │   ├── Microsite Builder
│   │   ├── Ticketing System
│   │   ├── Registration Management
│   │   ├── Sponsorship Packages
│   │   ├── Contractor Management
│   │   └── Attendee Portal
│   │
│   ├── 🧪 Testing x Development
│   │   ├── Test Order Management
│   │   ├── Sample Tracking & Storage
│   │   ├── Test Suites (ISO/ASTM/EN)
│   │   ├── Individual Test Execution
│   │   ├── Data Capture & Analysis
│   │   ├── Test Report Generation
│   │   └── Certification
│   │
│   └── 📖 Training x Support
│       ├── Training Programs
│       ├── SOP Library (shared)
│       ├── Training Sessions
│       ├── Assessment Management
│       ├── Competency Tracking
│       ├── Implementation Plans
│       └── Attendance Reports
│
├── 🔗 Shared Platform Modules
│   ├── Tasks & Workflows (Kanban/Calendar/Table)
│   ├── Files & Assets (versioned storage)
│   ├── Notifications (in-app, email, real-time)
│   └── Activity Timeline (audit trail & export)
│
├── 🌐 Public Portals
│   ├── Customer Portal
│   │   ├── View engagements
│   │   ├── Download assets
│   │   ├── Approve deliverables
│   │   ├── Submit requests
│   │   ├── View invoices
│   │   └── Activity timeline
│   │
│   ├── Event Portal
│   │   ├── Event registration
│   │   ├── Ticket purchase
│   │   ├── Schedule view
│   │   ├── Material downloads
│   │   ├── Video replays
│   │   └── Certificate access
│   │
│   └── Sponsor Portal
│       ├── Deliverables checklist
│       ├── Asset upload/versioning
│       ├── Requirement tracking
│       ├── Approval workflows
│       └── ROI tracking
│
└── 💳 Financial Module
    ├── Invoicing
    ├── Payment Processing (Stripe)
    ├── Revenue Tracking
    ├── Financial Reporting
    └── QuickBooks Sync
```

---

## 🔐 Authentication & Authorization

### Internal Roles

| Role | Modules | Scope | Typical Use |
|------|---------|-------|-------------|
| **Super Admin** | All | Global | System administration |
| **Ops Admin** | Templates, Catalogs, Workflows | Global | Process management |
| **Vertical Lead** | Assigned vertical only | Vertical | Vertical management |
| **Team Member** | Daily work modules | Assigned tasks | Execution |
| **Finance/RevOps** | Invoicing, Revenue | Financial data | Accounting |
| **Marketing** | Events, Campaigns | Marketing assets | Promotions |

### External Roles

| Role | Access | Scope | Features |
|------|--------|-------|----------|
| **Customer** | Customer Portal | Own engagements | View, approve, request |
| **Event Attendee** | Event Portal | Registered events | Register, view, download |
| **Sponsor** | Sponsor Portal | Sponsored events | Manage deliverables |
| **Contractor** | Limited | Assigned tasks | Manage content, view payments |

### Permission Model

```
User → Role(s) → Permission(s)
                    ↓
        Module-level (CRM, Design, Events, etc.)
        Action-level (create, read, update, delete, approve)
        Organization-level (own, assigned, team visibility)
        Vertical-level (Design, Events, Testing, Training isolation)
```

---

## 📊 Data Model Architecture

### Entity Grouping

| Domain | Count | Key Entities |
|--------|-------|--------------|
| Authentication | 5 | USER, ACCOUNT, SESSION, USER_GROUP, USER_GROUP_MEMBER |
| RBAC | 5 | ROLE, USER_ROLE, MODULE, PERMISSION, ROLE_PERMISSION |
| CRM Core | 8 | ORGANIZATION, CONTACT, OPPORTUNITY, ENGAGEMENT, INTERACTION, TASK, ACTIVITY_LOG, NOTIFICATION |
| Design | 6 | DESIGN_PROJECT, DESIGN_DECK, PRODUCT_DESIGN, SEPARATION_FILE, OUTPUT_FILE, TECH_PACK |
| Events | 6 | EVENT, EVENT_SESSION, TICKET_TYPE, REGISTRATION, EVENT_SPONSOR, CONTRACTOR |
| Testing | 6 | TEST_ORDER, SAMPLE, TEST_SUITE, INDIVIDUAL_TEST, TEST_RESULT, TEST_REPORT |
| Training | 5 | TRAINING_ENGAGEMENT, SOP_LIBRARY, TRAINING_SESSION, TRAINING_ASSESSMENT, IMPLEMENTATION_PLAN |
| Financial | 3 | INVOICE, PAYMENT, MEDIA (shared) |
| **Total** | **48+** | **70+ with relationships** |

### Key Relationships

- **One-to-Many:** Organizations → Contacts, Contacts → Opportunities
- **One-to-One:** Opportunity → Engagement (converts)
- **Type Discriminator:** Engagement.engagementType (Design, Testing, Training, Event)
- **Hierarchical:** Organization.parentId (for subsidiaries)
- **Cross-Vertical:** Shared modules (Tasks, Media, Notifications, Activity)

---

## 🏭 Vertical Workspace Workflows

### Design x Development

```
Intake → Concepting → Feasibility → Revision → Deliverables → Approval → Complete
```

**Key Outputs:** Design Deck, Tech Packs, Output Files (DTG, DTF, Transfer, Embroidery)

### Events x Education

```
Planning → Setup → Marketing → Registration → Execution → Follow-up → Report
```

**Key Outputs:** Event website, registrations, attendee portal, certificates

### Testing x Development

```
Setup → Samples → Suite → Execution → Report → Delivery → Archive
```

**Key Outputs:** Test report, certification, customer portal access

### Training x Support

```
Discovery → Preparation → Delivery → Assessment → Implementation → Follow-up
```

**Key Outputs:** Training certificate, implementation plan, success metrics

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Next.js 16 App Router
- **Language:** TypeScript (ES2022)
- **ORM:** Prisma (with MySQL/SQLite)
- **Auth:** NextAuth.js v5 (JWT + Google OAuth)
- **Security:** bcryptjs for password hashing
- **Real-time:** Pusher WebSockets

### Frontend
- **Framework:** React 19 (Server & Client Components)
- **Styling:** Tailwind CSS v4, SASS/SCSS
- **Components:** Shadcn UI (pre-built)
- **Editor:** Lexical (rich text)
- **Forms:** React Hook Form + Zod validation
- **Drag-drop:** @dnd-kit
- **Icons:** Lucide Icons, Sonner (toasts)

### External Services
- **Authentication:** Google OAuth
- **Cloud Storage:** AWS S3, DigitalOcean Spaces
- **Email:** SendGrid / SMTP + React Email templates
- **Payments:** Stripe (card processing, webhooks)
- **Accounting:** QuickBooks (invoice sync, reconciliation)
- **Hosting:** Vercel (deploy, edge functions)

### Testing & Quality
- **Unit/Integration:** Vitest + Testing Library
- **E2E:** Playwright
- **Type Safety:** TypeScript strict mode
- **Linting:** ESLint
- **Formatting:** Prettier

---

## 🔌 Integration Points

### Stripe (Payment Processing)
```
Invoice → Stripe → Payment Received → Activity Log → QB Sync
```

### QuickBooks (Financial Sync)
```
Invoice → QB Export → QB API → QB Integration → Reconciliation
Payment → QB Sync → QB Validation → Balance Check
```

### SendGrid (Email Automation)
```
Event Trigger → Email Template → SendGrid SMTP → Recipient → Activity Log
```

### AWS S3 (Cloud Storage)
```
Upload → S3 → CDN → Signed URL → Download Link → Activity Log
```

### Pusher (Real-time)
```
Server Action → Pusher Broadcast → Connected Clients → UI Update
```

---

## 📁 File Organization

```
/Users/nguyenpham/Source Code/print-shop/@data/diagrams/

Architecture Files:
  @made-os-architecture.mmd                    Main system diagram
  made-os-app-architecture.mmd                 User flow diagram
  made-os-data-model.mmd                       ER diagram (70+ entities)
  made-os-database-relationships.mmd           Relationship overview
  made-os-rbac-flow.mmd                        Permission check flow
  made-os-system-context.mmd                   System boundaries
  made-os-tech-stack.mmd                       Technology layers

Feature Modules:
  feature-crm-core.mmd                         CRM operations
  feature-design-workspace.mmd                 Design workflow
  feature-events-workspace.mmd                 Events workflow
  feature-testing-workspace.mmd                Testing workflow
  feature-training-workspace.mmd               Training workflow
  feature-customer-portal.mmd                  Customer portal
  feature-auth-users.mmd                       Auth & RBAC
  feature-billing-financial.mmd                Billing & financial
  
Reference:
  current/                                     Made-app templates
  MADE_OS_ARCHITECTURE_README.md               This file
```

---

## 🚀 Implementation Sequence

### Phase 1: Foundation (Weeks 1-2)
1. Database schema (Prisma)
2. Authentication (NextAuth)
3. RBAC system
4. Activity logging

### Phase 2: CRM Core (Weeks 3-4)
1. Organizations & Contacts
2. Opportunities
3. Engagement model
4. Task management

### Phase 3: Vertical Workspaces (Weeks 5-8)
1. Design workspace (2 weeks)
2. Events workspace (2 weeks)
3. Testing workspace (1 week)
4. Training workspace (1 week)

### Phase 4: Shared Modules (Weeks 9-10)
1. File upload & versioning
2. Notifications
3. Activity timeline
4. Real-time updates

### Phase 5: Public Portals (Weeks 11-12)
1. Customer portal
2. Event portal
3. Sponsor portal

### Phase 6: Financial (Weeks 13-14)
1. Invoicing
2. Payment processing (Stripe)
3. QuickBooks sync
4. Financial reporting

### Phase 7: Testing & Deployment (Weeks 15+)
1. Unit & integration tests
2. E2E testing
3. Performance optimization
4. Vercel deployment

---

## 📋 Development Checklist

### Database Schema
- [ ] Create prisma/schema.prisma with all 70+ models
- [ ] Set up MySQL production database
- [ ] Create SQLite development database
- [ ] Run initial migrations
- [ ] Create seed data

### Authentication
- [ ] Implement NextAuth v5
- [ ] Add Google OAuth flow
- [ ] Implement 2FA (TOTP)
- [ ] Create password reset flow
- [ ] Add email verification

### RBAC
- [ ] Create role and permission models
- [ ] Implement permission checking service
- [ ] Add permission decorators/middleware
- [ ] Create admin panel for role management
- [ ] Add activity logging for all actions

### API & Server Actions
- [ ] Create server actions for all CRUD operations
- [ ] Add permission checks to all actions
- [ ] Implement error handling
- [ ] Add request validation (Zod)
- [ ] Create API documentation

### Frontend Components
- [ ] Build layout/navigation
- [ ] Create reusable component library
- [ ] Build CRM CRUD interfaces
- [ ] Build vertical workspace UIs
- [ ] Build customer portal
- [ ] Build public portals (Event, Sponsor)

### Testing
- [ ] Write unit tests for utilities
- [ ] Write integration tests for services
- [ ] Write E2E tests for workflows
- [ ] Set up CI/CD pipeline
- [ ] Performance testing

### Deployment
- [ ] Configure Vercel project
- [ ] Set up environment variables
- [ ] Configure database backups
- [ ] Set up monitoring & logging
- [ ] Create deployment documentation

---

## 🎯 Key Design Principles

### 1. Unified Engagement Model
- Single `ENGAGEMENT` entity for all service types
- Type discriminator: Design, Testing, Training, Event
- Shared budget, status, team, approvals

### 2. CRM Foundation
- All verticals built on Organizations → Contacts → Engagements
- Cross-vertical visibility for leadership
- Activity trail for all customer interactions

### 3. Role-Based Isolation
- Team members see only assigned engagements
- Vertical leads manage their vertical only
- Finance sees all financial data
- Transparent audit trail

### 4. Public Portal Isolation
- Separate experiences (Customer, Event, Sponsor)
- Limited data visibility
- No access to internal system
- Focused on engagement participation

### 5. Scalable Data Model
- Versioning for all deliverables
- JSON fields for flexible data (tags, specifications)
- Soft deletes for compliance
- Proper indexing for performance

---

## 📚 References

### Project Specification
- Location: `/Users/nguyenpham/Source Code/print-shop/@data/MADE_OS_ProjectOutline.html`
- Contains: Product spec v1.0, requirements, verticals detail

### Made-app Reference
- Location: `/Users/nguyenpham/Source Code/print-shop/@data/diagrams/current/`
- Templates: All diagram patterns and styles inherited from made-app

### Prisma Schema
- Reference: `/Users/nguyenpham/Source Code/print-shop/prisma/schema.prisma`
- For: Database model definitions

### Auth Configuration
- Reference: `/Users/nguyenpham/Source Code/print-shop/lib/auth.ts`
- For: NextAuth setup and configuration

### Permissions
- Reference: `/Users/nguyenpham/Source Code/print-shop/lib/permissions.ts`
- For: RBAC permission definitions

---

## ✅ Validation Checklist

- [x] All 4 verticals documented (Design, Events, Testing, Training)
- [x] CRM core entities defined (Organizations, Contacts, Opportunities, Engagements)
- [x] Public portals designed (Customer, Event, Sponsor)
- [x] RBAC system documented (6 internal + 4 external roles)
- [x] Tech stack aligned with made-app
- [x] All 15 Mermaid diagrams created
- [x] Data model covers all requirements (70+ entities)
- [x] Workflows documented for each vertical
- [x] Integration points identified (Stripe, QB, SendGrid, etc.)
- [x] File storage and real-time architecture defined

---

## 🎉 Next Steps

1. **Review & Approve** - Review all 15 diagrams with stakeholders
2. **Prisma Schema** - Convert data model to Prisma schema
3. **Database Setup** - Create MySQL database and run migrations
4. **Server Actions** - Implement RBAC-protected server actions
5. **UI Components** - Start building React components
6. **API Routes** - Create REST/GraphQL API layer
7. **Testing** - Begin unit and integration testing
8. **Deployment** - Configure Vercel and environment variables

---

**Architecture Status:** ✅ Complete  
**Ready for:** Development Phase  
**Last Updated:** November 17, 2025  
**Version:** 2.0 - Using Correct Templates
