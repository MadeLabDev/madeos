# Events System Design Notes

## Overview
Thiết kế hệ thống Events linh hoạt để hỗ trợ bán vé nội bộ (internal ticketing) và chỉ quản lý attendees (external ticket sales). Theo hướng tương tự Knowledge (modular, RBAC, dynamic forms), nhưng tạo hệ thống mới với bảng mới. Event có thể tích hợp với Knowledge (private) sau này (1 event có nhiều Knowledge), tạm thời không cần EventMaterial.

## Key Principles
- **Modular & Flexible**: Sử dụng ModuleType (system='event') cho dynamic forms.
- **Modes**: ticketingMode ('internal', 'external', 'hybrid') để bật/tắt tính năng.
- **Reusability**: Tái sử dụng Sponsors, Presenters đã có.
- **Integration**: Với Knowledge (sau này), User, Media, ActivityLog, etc.
- **Security**: RBAC, permission checks, audit logs.

## Data Models (New Tables)
Thêm vào Prisma schema:

### Event
- id (String, PK)
- title (String)
- slug (String, unique)
- description (String)
- startDate (DateTime)
- endDate (DateTime)
- location (String)
- capacity (Int, optional)
- status (Enum: draft/published/cancelled/completed)
- eventType (Enum: with_sessions/landing_only) - Dạng 1: with_sessions (sử dụng EventSession), Dạng 2: landing_only (không quan tâm public content, dùng landing page riêng)
- ticketingMode (Enum: internal/external/hybrid)
- externalTicketUrl (String, optional)
- externalTicketProvider (String, optional)
- thumbnailId (String, FK to Media, optional)
- enableCheckIn (Boolean, default true)
- metaData (Json, optional - for dynamic fields via ModuleType)
- createdById (String, FK to User)
- updatedById (String, FK to User)
- createdAt (DateTime)
- updatedAt (DateTime)

### EventSession (Only for eventType: with_sessions)
- id (String, PK)
- eventId (String, FK to Event)
- title (String)
- description (String)
- startTime (DateTime)
- endTime (DateTime)
- speaker (String, optional - or link to Presenter)
- capacity (Int, optional)
- room (String, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### TicketType (Only for internal/hybrid)
- id (String, PK)
- eventId (String, FK to Event)
- name (String)
- description (String)
- price (Float)
- quantity (Int)
- maxPerUser (Int, default 1)
- saleStart (DateTime, optional)
- saleEnd (DateTime, optional)
- isActive (Boolean, default true)
- isExternal (Boolean, default false - for hybrid mode)
- createdAt (DateTime)
- updatedAt (DateTime)

### Payment (For tracking user payment history)
- id (String, PK)
- userId (String, FK to User)
- amount (Float)
- currency (String, default 'USD')
- status (Enum: pending/completed/failed/refunded)
- paymentMethod (String, e.g., 'stripe', 'paypal')
- paymentId (String, external payment provider ID)
- description (String, e.g., 'Ticket purchase for Event X')
- metadata (Json, optional - for additional data like eventId, ticketIds)
- createdAt (DateTime)
- updatedAt (DateTime)

### Ticket (Only for internal/hybrid)
- id (String, PK)
- ticketTypeId (String, FK to TicketType)
- userId (String, FK to User)
- qrCode (String, unique)
- status (Enum: sold/used/refunded/cancelled)
- purchasedAt (DateTime)
- usedAt (DateTime, optional)
- paymentId (String, FK to Payment, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Registration (Core for all modes)
- id (String, PK)
- eventId (String, FK to Event)
- userId (String, FK to User, optional - for standalone attendees)
- status (Enum: pending/confirmed/cancelled/checked_in)
- ticketSource (Enum: internal/external/manual)
- externalTicketId (String, optional)
- customData (Json - dynamic fields from ModuleInstance)
- registeredAt (DateTime)
- checkedInAt (DateTime, optional)
- checkedInById (String, FK to User, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### CheckIn (Optional based on enableCheckIn)
- id (String, PK)
- registrationId (String, FK to Registration)
- checkedInAt (DateTime)
- checkedInById (String, FK to User)
- location (String, optional - GPS or venue)
- deviceInfo (Json, optional)
- createdAt (DateTime)

### Sponsor (Extend existing, add eventId)
- Add eventId (String, FK to Event) to existing Sponsor table.

### Presenter (Extend existing, add eventId)
- Add eventId (String, FK to Event) to existing Presenter table.

## Features
- **Admin Dashboard**: CRUD Events with type selector (with_sessions/landing_only), mode selector, manage Sessions (if with_sessions)/Sponsors/Presenters, analytics (attendance, sources).
- **Public Microsite**: For with_sessions: Event details, agenda, ticketing (internal), external links (external). For landing_only: Skip public content, use separate landing pages.
- **Attendee Management**: Import CSV, manual add, check-in (QR/manual).
- **Event Portal**: For with_sessions: Schedule, materials (via Knowledge later), certificates. For landing_only: Minimal or none.
- **Integrations**: Stripe, external APIs, emails, real-time (Pusher).
- **Reporting**: Metrics, exports.

## Workflow
- Setup: Choose type (with_sessions/landing_only), mode, create Event/Sessions (if applicable).
- Pre-Event: Publish (if with_sessions), sell/import attendees.
- Event Day: Check-in.
- Post-Event: Materials (if with_sessions), analytics.

## Future Integrations
- **Knowledge Integration**: 1 Event has many Knowledge (private articles for attendees). Use KnowledgeAssignedUsers/Groups with eventId filter. No EventMaterial table initially.
- Add eventId to Knowledge for linking.

## Implementation Notes
- Develop in lib/features/events/ (actions, services, repositories, types) similar to knowledge.
- Use ModuleType system='event' for dynamic forms.
- Event types: with_sessions (use EventSession for agenda), landing_only (no public content, separate landing pages).
- Layout/agenda will be handled manually (hardcoded or static) for with_sessions.
- Test with Vitest/Playwright.
- Permissions: Add 'events' module to RolePermission.
- UI: Reuse components from knowledge, add to sidebar when ready.

## Next Steps (After This File)
- Update Prisma schema with new models.
- Create lib/features/events/ structure.
- Implement CRUD actions.
- Add UI components.
- Integrate with Knowledge later.</content>
<parameter name="filePath">/Users/nguyenpham/Source Code/print-shop/docs/events-design-notes.md