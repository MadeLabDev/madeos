# MADE (OS) Project Outline

## Product Overview

**Name**: MADE (OS)

**Company**: MADE Laboratory

**Type**: Internal web application ("operating system") with integrated CRM and public-facing portal features.

**Vision**: Create a unified, visually consistent operating system that centralizes all MADE Laboratory workflows across all business verticals.

- Eliminate app fragmentation and simplify team workflows.
- Enable seamless communication and collaboration with customers, partners, sponsors, and attendees.
- Provide a foundation that scales with future business units and service offerings.

**Primary Goals**:

- Replace numerous disconnected tools with one unified hub.
- Establish shared concepts across verticals (Customers, Contacts, Projects, Events, Training, Testing).
- Streamline the creation, organization, versioning, and delivery of outputs (design assets, reports, SOPs, decks).
- Improve internal collaboration and external communication.
- Maintain a built-in CRM for managing customer relationships, sales pipelines, and sponsorships.

## Users & Roles

### Internal Roles

- **Super Admin**: Full system access, manages permissions and configuration, handles integrations and global settings.
- **Ops Admin**: Manages templates, catalogs, testing protocols, SOPs, service offerings and pricing, oversees workflow configurations.
- **Vertical Lead**: One per vertical (Design, Events, Testing, Training), oversees pipelines and engagements, sets up projects, orders, and events, approves key milestones.
- **Team Member**: Executes day-to-day work, uploads deliverables and updates, logs activity and tasks, collaborates with internal team and customers.
- **Finance / RevOps**: Manages invoicing and payment status, reviews revenue, margins, and basic P&L per engagement, handles reconciliation.
- **Marketing**: Manages event microsite content, sends communications and campaigns, manages sponsor-related materials.

### External Roles (Public-Facing)

- **Customer (Organization)**: Views active and past engagements, reviews and approves deliverables, submits new requests, views invoices and payment statuses.
- **Event Attendee**: Registers and manages tickets, accesses event materials, schedules, and virtual content.
- **Sponsor / Partner**: Manages sponsorship deliverables, uploads assets, views requirements and approvals.

## Core Domains & Modules

MADE (OS) consists of shared platform modules, CRM functionality, and vertical-specific workspaces.

### Shared Platform Modules

#### Accounts & Authentication

- Single login for internal users
- Public login for customers and attendees
- Role-based access control

#### CRM (Customer Relationship Management)

**CRM Core Objects:**

- Organizations
- Contacts
- Opportunities
- Engagements
- Interactions
- Tasks
- Files
- Activity Timeline

**Organizations:**

- Customer profile
- Industry, location, website
- Relationship stage
- Linked contacts
- Engagement history
- Financial overview (payments, invoices)
- Activity logs

**Contacts:**

- Contact roles (primary, billing, technical, etc.)
- Tags (VIP, Sponsor, Technical Lead)
- Interaction history
- Related engagements, events, and tickets

**Opportunities:**

- Supports multiple pipelines: Design Services, Testing Services, Training & Consulting, Events & Sponsorships
- Opportunity metadata: Value, Stage, Owner, Close probability and date, Linked documents and tasks
- Converting an opportunity creates a new engagement

**Interactions & Notes:**

- Meetings, calls, notes
- Deliverable approvals
- System-triggered events

**CRM Tasks:**

- Follow-up reminders
- Customer action tracking
- Renewal reminders
- Linked to opportunities, organizations, contacts, or engagements

#### Organizations & Contacts

- Shared repository across all verticals and workflows
- Consolidated into CRM

#### Projects & Engagements

- Unified engagement object for all services: Design Project, Test Order, Training Engagement, Consulting Engagement, Event Production
- Engagement fields: Customer, Status & stage, Timeline & due dates, Linked opportunity, Assigned team, Deliverables, Approvals, Financial status, Activity logs

#### Tasks & Workflows

- Task assignment and ownership
- Kanban, table, and calendar views
- Workflow templates per vertical
- Automated stage progression

#### Assets & Files

- Centralized file library for: Brand kits, Design files, Testing reports, SOPs and training outputs
- Versioning for key deliverables
- Customer-facing sharing and downloads

#### Notifications & Activity Feed

- In-app notifications
- Email notifications for external users
- Activity feeds at the level of: Engagement, Contact, Organization, Opportunity

#### Billing & Financials (Light)

- Integrates with Stripe / QuickBooks
- Tracks invoices and payment statuses
- Financial summaries per engagement and customer
- Revenue roll-ups per vertical

## Vertical Workspaces (v1 Scope)

Each workspace depends on shared CRM data but introduces unique workflows.

### Design x Development Workspace

**Key Objects:**

- Design Project
- Design Deck
- Product Design
- Mockups
- Graphic Specs
- Separation Files
- Output Files (DTG/DTF/Transfer)
- Embroidery Files
- Engineering Specifications
- Tech Packs
- Optional product configurator

**Core Workflows:**

- **Intake**: Create project from CRM opportunity, intake form (brand assets, goals, constraints)
- **Concepting**: Upload assets, select blank products, add decoration details, run compatibility logic
- **Feasibility / Engineering**: Validate product compatibility, status: Draft → Feasibility → Approved
- **Deliverables**: Design deck, Tech Packs, asset files, versioning, customer approvals

### Events x Education Workspace

**Key Objects:**

- Event
- Sessions
- Ticket Types
- Registrations
- Sponsors
- Presenters / Contractors

**Core Workflows:**

- **Event Setup**: Event details, pricing, ticketing
- **Event Microsite**: Public-facing marketing page, speakers, agenda, ticketing
- **Registration & Attendees**: Registration tracking, check-in, automated confirmation emails
- **Sponsorship**: Sponsor packages, sponsor deliverables, asset uploads
- **Contractor / Presenter Management**: Agreements, payments, session assignment
- **Attendee Portal**: Materials, schedules, replays, certificates

### Testing x Development Workspace

**Key Objects:**

- Test Order
- Samples
- Test Suites
- Individual Tests
- Test Reports

**Core Workflows:**

- Create test order
- Track samples
- Conduct structured testing
- Capture measured data
- Generate standardized reports
- Publish to customer portal

### Training x Support Workspace

**Key Objects:**

- Training Engagement
- SOP Library
- Training Sessions
- Assessments
- Implementation Plans

**Core Workflows:**

- Engagement setup
- Discovery data capture
- Training execution
- Attendance tracking
- SOP coverage tracking
- Reporting
- Follow-up implementation actions

## Public-Facing Features (v1)

### Customer Portal

- View all engagements
- Download assets and reports
- Approve deliverables
- Submit requests
- View invoices
- Upload files

### Event Microsites & Attendee Portal

- Event landing pages
- Ticketing
- Schedule
- Materials
- Replays
- Sponsor logos

## Non-Functional Requirements

- Web-based, responsive
- Desktop-first for internal users
- Tablet/mobile friendly externally
- Role and organization-level permissions
- Unified design system
- PDF/CSV exportability
- Audit trails for key actions

## Design & UX Principles

- Consistent visual and interaction patterns
- Clean, minimalist UI
- Dashboard-first navigation
- Contextual metadata on every engagement
- A cohesive "single operating system" feel
