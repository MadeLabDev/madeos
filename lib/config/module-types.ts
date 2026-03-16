/**
 * Configuration for Module Types
 */

// Available system types for module types
export const SYSTEM_TYPES = [
	{ value: "blog", label: "Blog" },
	{ value: "knowledge", label: "Knowledge Base" },
	{ value: "product", label: "Product" },
	{ value: "order", label: "Order" },
	{ value: "meta", label: "Meta" },
	{ value: "profile", label: "Profile" },
	{ value: "sponsor", label: "Sponsor" },
	{ value: "speaker", label: "Speaker" },
	{ value: "customer", label: "Customer" },
	{ value: "partner", label: "Partner" },
	{ value: "vendor", label: "Vendor" },
] as const;

export type SystemType = (typeof SYSTEM_TYPES)[number]["value"];

// Knowledge article visibility options
export const KNOWLEDGE_VISIBILITY_OPTIONS = [
	{ value: "public", label: "Public", badgeVariant: "default" },
	{ value: "private", label: "Private", badgeVariant: "secondary" },
] as const;

export type KnowledgeVisibility = (typeof KNOWLEDGE_VISIBILITY_OPTIONS)[number]["value"];

// Knowledge article type options with badge variants
export const KNOWLEDGE_TYPE_OPTIONS = [
	{ value: "knowledge", label: "Knowledge", badgeVariant: "outline" },
	{ value: "course", label: "Course", badgeVariant: "outline" },
] as const;

export type KnowledgeType = (typeof KNOWLEDGE_TYPE_OPTIONS)[number]["value"];
export type ArticleType = KnowledgeType; // Alias for backward compatibility

// Knowledge article status options
export const KNOWLEDGE_STATUS_OPTIONS = [
	{ value: "draft", label: "Draft", badgeVariant: "secondary" },
	{ value: "published", label: "Published", badgeVariant: "default" },
] as const;

export type KnowledgeStatus = (typeof KNOWLEDGE_STATUS_OPTIONS)[number]["value"];

// ============================================================================
// UNIVERSAL STATUS ENUMS (Simplified for easy management)
// ============================================================================

// ProjectStatus - For projects, engagements, design projects, test orders, training, etc.
export const PROJECT_STATUS_OPTIONS = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "INTAKE", label: "Intake", badgeVariant: "outline" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "REVIEW", label: "Review", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
	{ value: "ARCHIVED", label: "Archived", badgeVariant: "outline" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_OPTIONS)[number]["value"];

// ApprovalStatus - For briefs, reviews, assessments requiring approval
export const APPROVAL_STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "APPROVED", label: "Approved", badgeVariant: "default" },
	{ value: "REJECTED", label: "Rejected", badgeVariant: "destructive" },
	{ value: "REVISION_REQUESTED", label: "Revision Requested", badgeVariant: "outline" },
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUS_OPTIONS)[number]["value"];

// PublishStatus - For content (articles, decks, reports, SOPs)
export const PUBLISH_STATUS_OPTIONS = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "PUBLISHED", label: "Published", badgeVariant: "default" },
	{ value: "ARCHIVED", label: "Archived", badgeVariant: "outline" },
] as const;

export type PublishStatus = (typeof PUBLISH_STATUS_OPTIONS)[number]["value"];

// ProcessStatus - For tests, registrations, assessments, backups
export const PROCESS_STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "FAILED", label: "Failed", badgeVariant: "destructive" },
] as const;

export type ProcessStatus = (typeof PROCESS_STATUS_OPTIONS)[number]["value"];

// TransactionStatus - For payments, refunds
export const TRANSACTION_STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending", badgeVariant: "secondary" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "default" },
	{ value: "FAILED", label: "Failed", badgeVariant: "destructive" },
	{ value: "REFUNDED", label: "Refunded", badgeVariant: "outline" },
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUS_OPTIONS)[number]["value"];

// ============================================================================
// DOMAIN-SPECIFIC ENUMS (Keep distinct for business logic clarity)
// ============================================================================

// Priority levels for tasks and orders
export const PRIORITY_LEVELS = [
	{ value: "LOW", label: "Low" },
	{ value: "MEDIUM", label: "Medium" },
	{ value: "HIGH", label: "High" },
] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]["value"];

// Engagement types for projects
export const ENGAGEMENT_TYPES = [
	{ value: "DESIGN", label: "Design" },
	{ value: "TESTING", label: "Testing" },
	{ value: "TRAINING", label: "Training" },
	{ value: "EVENT", label: "Event" },
] as const;

export type EngagementType = (typeof ENGAGEMENT_TYPES)[number]["value"];

// Event specific types
export const EVENT_TYPES = [
	{ value: "WITH_SESSIONS", label: "With Sessions (Agenda)", badgeVariant: "outline" },
	{ value: "LANDING_ONLY", label: "Landing Only (No public content)", badgeVariant: "outline" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

// Ticketing modes for events
export const TICKETING_MODES = [
	{ value: "INTERNAL", label: "Internal (Manage tickets here)", badgeVariant: "default" },
	{ value: "EXTERNAL", label: "External (External provider)", badgeVariant: "secondary" },
	{ value: "HYBRID", label: "Hybrid (Both internal and external)", badgeVariant: "outline" },
] as const;

export type TicketingMode = (typeof TICKETING_MODES)[number]["value"];

// Ticket/Registration sources
export const TICKET_SOURCE_OPTIONS = [
	{ value: "INTERNAL", label: "Internal" },
	{ value: "EXTERNAL", label: "External" },
	{ value: "MANUAL", label: "Manual" },
] as const;

export type TicketSource = (typeof TICKET_SOURCE_OPTIONS)[number]["value"];

// Opportunity stages (CRM pipeline)
export const OPPORTUNITY_STAGES = [
	{ value: "PROSPECTING", label: "Prospecting" },
	{ value: "QUALIFIED", label: "Qualified" },
	{ value: "PROPOSAL", label: "Proposal" },
	{ value: "NEGOTIATION", label: "Negotiation" },
	{ value: "CLOSED_WON", label: "Closed Won" },
	{ value: "CLOSED_LOST", label: "Closed Lost" },
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number]["value"];

// Interaction types (CRM communications)
export const INTERACTION_TYPES = [
	{ value: "MEETING", label: "Meeting" },
	{ value: "CALL", label: "Call" },
	{ value: "EMAIL", label: "Email" },
	{ value: "NOTE", label: "Note" },
] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number]["value"];

// Sample types (Testing)
export const SAMPLE_TYPES = [
	{ value: "PHYSICAL", label: "Physical" },
	{ value: "DIGITAL", label: "Digital" },
] as const;

export type SampleType = (typeof SAMPLE_TYPES)[number]["value"];

// Sample processing status
export const SAMPLE_STATUS_OPTIONS = [
	{ value: "RECEIVED", label: "Received", badgeVariant: "default" },
	{ value: "IN_PROCESSING", label: "In Processing", badgeVariant: "default" },
	{ value: "PROCESSED", label: "Processed", badgeVariant: "outline" },
	{ value: "RETURNED", label: "Returned", badgeVariant: "outline" },
	{ value: "DISPOSED", label: "Disposed", badgeVariant: "destructive" },
] as const;

export type SampleStatus = (typeof SAMPLE_STATUS_OPTIONS)[number]["value"];

// Training types
export const TRAINING_TYPES = [
	{ value: "INSTRUCTOR_LED", label: "Instructor-Led" },
	{ value: "SELF_PACED", label: "Self-Paced" },
	{ value: "BLENDED", label: "Blended" },
	{ value: "WORKSHOP", label: "Workshop" },
	{ value: "MENTORING", label: "Mentoring" },
	{ value: "CERTIFICATION_PREP", label: "Certification Prep" },
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number]["value"];

// Training delivery methods
export const DELIVERY_METHODS = [
	{ value: "IN_PERSON", label: "In-Person" },
	{ value: "ONLINE", label: "Online" },
	{ value: "HYBRID", label: "Hybrid" },
	{ value: "ASYNCHRONOUS", label: "Asynchronous" },
	{ value: "RECORDED", label: "Recorded" },
] as const;

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]["value"];

// Training phases
export const TRAINING_PHASES = [
	{ value: "DISCOVERY", label: "Discovery" },
	{ value: "DESIGN", label: "Design" },
	{ value: "DEVELOPMENT", label: "Development" },
	{ value: "DELIVERY", label: "Delivery" },
	{ value: "ASSESSMENT", label: "Assessment" },
	{ value: "SUPPORT", label: "Support" },
] as const;

export type TrainingPhase = (typeof TRAINING_PHASES)[number]["value"];

// Certification levels
export const CERTIFICATION_LEVELS = [
	{ value: "NONE", label: "None" },
	{ value: "COMPLETION", label: "Completion" },
	{ value: "COMPETENCY", label: "Competency" },
	{ value: "EXTERNAL_ALIGNED", label: "External Aligned" },
] as const;

export type CertificationLevel = (typeof CERTIFICATION_LEVELS)[number]["value"];

// Competency levels (for learner proficiency)
export const COMPETENCY_LEVELS = [
	{ value: "NOVICE", label: "Novice" },
	{ value: "BEGINNER", label: "Beginner" },
	{ value: "INTERMEDIATE", label: "Intermediate" },
	{ value: "ADVANCED", label: "Advanced" },
	{ value: "EXPERT", label: "Expert" },
] as const;

export type CompetencyLevel = (typeof COMPETENCY_LEVELS)[number]["value"];

// Assessment types
export const ASSESSMENT_TYPES = [
	{ value: "QUIZ", label: "Quiz" },
	{ value: "PRACTICAL", label: "Practical" },
	{ value: "CERTIFICATION", label: "Certification" },
	{ value: "SURVEY", label: "Survey" },
	{ value: "SELF_ASSESSMENT", label: "Self-Assessment" },
] as const;

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number]["value"];

// Assessment timing
export const TIMING_TYPES = [
	{ value: "PRE", label: "Pre-Training" },
	{ value: "MID", label: "Mid-Training" },
	{ value: "POST", label: "Post-Training" },
] as const;

export type TimingType = (typeof TIMING_TYPES)[number]["value"];

// Participant roles
export const PARTICIPANT_ROLES = [
	{ value: "LEARNER", label: "Learner" },
	{ value: "FACILITATOR", label: "Facilitator" },
	{ value: "OBSERVER", label: "Observer" },
	{ value: "GUEST_LECTURER", label: "Guest Lecturer" },
] as const;

// Report types
export const REPORT_TYPES = [
	{ value: "COMPLETION", label: "Completion" },
	{ value: "COMPETENCY", label: "Competency" },
	{ value: "CERTIFICATION", label: "Certification" },
	{ value: "EVALUATION", label: "Evaluation" },
] as const;

// Backup types
export const BACKUP_TYPES = [
	{ value: "MANUAL", label: "Manual" },
	{ value: "SCHEDULED", label: "Scheduled" },
] as const;

export type BackupType = (typeof BACKUP_TYPES)[number]["value"];

// ============================================================================
// FILE TYPE AND STORAGE OPTIONS
// ============================================================================

// File types for media settings
export const FILE_TYPE_OPTIONS = [
	{ id: "images", label: "Images (jpg, png, gif, webp, svg)" },
	{ id: "documents", label: "Documents (pdf, doc, xls, ppt, txt)" },
	{ id: "videos", label: "Videos (mp4, mov, avi, mkv)" },
	{ id: "archives", label: "Archives (zip, rar, 7z)" },
] as const;

export type FileTypeOption = (typeof FILE_TYPE_OPTIONS)[number];

// Storage types for media settings
export const STORAGE_TYPES = [
	{ value: "local", label: "Local Server Storage", description: "Files will be stored on the local server filesystem" },
	{ value: "r2", label: "Cloudflare R2 Object Storage", description: "Files will be stored in Cloudflare R2 cloud storage" },
] as const;

export type StorageType = (typeof STORAGE_TYPES)[number]["value"];

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES FOR STATUS OPTIONS
// These maintain compatibility with components that reference old enum names
// ============================================================================

// Event status options (alias for PublishStatus)
export const EVENT_STATUSES = PUBLISH_STATUS_OPTIONS;
export type EventStatus = PublishStatus;

// Registration status options (alias for ProcessStatus with custom values)
export const REGISTRATION_STATUSES = [
	{ value: "PENDING", label: "Pending", badgeVariant: "secondary" },
	{ value: "CONFIRMED", label: "Confirmed", badgeVariant: "default" },
	{ value: "CHECKED_IN", label: "Checked In", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
	{ value: "NO_SHOW", label: "No Show", badgeVariant: "destructive" },
	{ value: "REFUNDED", label: "Refunded", badgeVariant: "destructive" },
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]["value"];

// Engagement status options (alias for ProjectStatus)
export const ENGAGEMENT_STATUSES = PROJECT_STATUS_OPTIONS;
export type EngagementStatus = ProjectStatus;

// Task status options
export const TASK_STATUSES = [
	{ value: "TODO", label: "To Do", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "REVIEW", label: "Review", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

// Design project status options
export const DESIGN_PROJECT_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "INTAKE", label: "Intake", badgeVariant: "outline" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "REVIEW", label: "Review", badgeVariant: "default" },
	{ value: "APPROVED", label: "Approved", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
	{ value: "ARCHIVED", label: "Archived", badgeVariant: "outline" },
] as const;
export type DesignProjectStatus = (typeof DESIGN_PROJECT_STATUSES)[number]["value"];

// Design brief status options
export const DESIGN_BRIEF_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "SUBMITTED", label: "Submitted", badgeVariant: "outline" },
	{ value: "IN_REVIEW", label: "In Review", badgeVariant: "default" },
	{ value: "APPROVED", label: "Approved", badgeVariant: "default" },
	{ value: "REVISION_REQUESTED", label: "Revision Requested", badgeVariant: "outline" },
	{ value: "REJECTED", label: "Rejected", badgeVariant: "destructive" },
] as const;
export type DesignBriefStatus = (typeof DESIGN_BRIEF_STATUSES)[number]["value"];

// Product design status options
export const PRODUCT_DESIGN_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "REVIEW", label: "Review", badgeVariant: "default" },
	{ value: "APPROVED", label: "Approved", badgeVariant: "default" },
	{ value: "FINALIZED", label: "Finalized", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type ProductDesignStatus = (typeof PRODUCT_DESIGN_STATUSES)[number]["value"];

// Tech pack status options
export const TECH_PACK_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "REVIEW", label: "Review", badgeVariant: "default" },
	{ value: "APPROVED", label: "Approved", badgeVariant: "default" },
	{ value: "FINALIZED", label: "Finalized", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type TechPackStatus = (typeof TECH_PACK_STATUSES)[number]["value"];

// Design deck status options
export const DESIGN_DECK_STATUSES = PUBLISH_STATUS_OPTIONS;
export type DesignDeckStatus = PublishStatus;

// Design review status options
export const DESIGN_REVIEW_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "SUBMITTED", label: "Submitted", badgeVariant: "outline" },
	{ value: "IN_REVIEW", label: "In Review", badgeVariant: "default" },
	{ value: "APPROVED", label: "Approved", badgeVariant: "default" },
	{ value: "REVISION_REQUESTED", label: "Revision Requested", badgeVariant: "outline" },
	{ value: "REJECTED", label: "Rejected", badgeVariant: "destructive" },
] as const;
export type DesignReviewStatus = (typeof DESIGN_REVIEW_STATUSES)[number]["value"];

// Test order status options
export const TEST_ORDER_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "INTAKE", label: "Intake", badgeVariant: "outline" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "REVIEW", label: "Review", badgeVariant: "default" },
	{ value: "ACTIVE", label: "Active", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type TestOrderStatus = (typeof TEST_ORDER_STATUSES)[number]["value"];

// Test status options
export const TEST_STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "FAILED", label: "Failed", badgeVariant: "destructive" },
	{ value: "ON_HOLD", label: "On Hold", badgeVariant: "secondary" },
] as const;
export type TestStatus = (typeof TEST_STATUS_OPTIONS)[number]["value"];

// Report status options
export const REPORT_STATUSES = PUBLISH_STATUS_OPTIONS;
export type ReportStatus = PublishStatus;

// Training engagement status options
export const TRAINING_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "INTAKE", label: "Intake", badgeVariant: "outline" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "ACTIVE", label: "Active", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type TrainingStatus = (typeof TRAINING_STATUSES)[number]["value"];

// Training session status options
export const SESSION_STATUSES = [
	{ value: "PLANNED", label: "Planned", badgeVariant: "secondary" },
	{ value: "SCHEDULED", label: "Scheduled", badgeVariant: "outline" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number]["value"];

// Assessment status options
export const ASSESSMENT_STATUSES = [
	{ value: "PENDING", label: "Pending", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "FAILED", label: "Failed", badgeVariant: "destructive" },
	{ value: "PASSED", label: "Passed", badgeVariant: "default" },
] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number]["value"];

// Implementation plan status options
export const PLAN_STATUSES = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "TODO", label: "To Do", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number]["value"];

// SOP/Knowledge library status options
export const SOP_STATUSES = PUBLISH_STATUS_OPTIONS;
export type SOPStatus = PublishStatus;

// Backup record status options
export const BACKUP_STATUSES = PROCESS_STATUS_OPTIONS;
export type BackupStatus = ProcessStatus;

// Common status options for filters (generic project/task-like statuses)
export const COMMON_STATUS_OPTIONS = [
	{ value: "DRAFT", label: "Draft", badgeVariant: "secondary" },
	{ value: "IN_PROGRESS", label: "In Progress", badgeVariant: "default" },
	{ value: "COMPLETED", label: "Completed", badgeVariant: "outline" },
	{ value: "CANCELLED", label: "Cancelled", badgeVariant: "destructive" },
] as const;
export type CommonStatus = (typeof COMMON_STATUS_OPTIONS)[number]["value"];

// Test suite status options
export const TEST_SUITE_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
] as const;

export type TestSuiteStatus = (typeof TEST_SUITE_STATUS_OPTIONS)[number]["value"];

// Assignee options for test orders
export const ASSIGNEE_OPTIONS = [{ value: "unassigned", label: "Unassigned" }] as const;

export type AssigneeOption = (typeof ASSIGNEE_OPTIONS)[number]["value"];

// Bulk action options for event registrations
export const BULK_ACTION_OPTIONS = [
	{ value: "check_in", label: "Check In" },
	{ value: "cancel", label: "Cancel Registration" },
] as const;

export type BulkActionOption = (typeof BULK_ACTION_OPTIONS)[number]["value"];

// Check-in status options for event attendees
export const CHECK_IN_STATUS_OPTIONS = [
	{ value: "checked_in", label: "Checked In", badgeVariant: "default" },
	{ value: "not_checked_in", label: "Not Checked In", badgeVariant: "secondary" },
] as const;

export type CheckInStatusOption = (typeof CHECK_IN_STATUS_OPTIONS)[number]["value"];
