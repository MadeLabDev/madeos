/**
 * Base entity types for the training feature
 */

import { AssessmentStatus, AssessmentType, CertificationLevel, CompetencyLevel, DeliveryMethod, PlanStatus, RegistrationStatus, ReportStatus, ReportType, SessionStatus, SOPStatus, TicketSource, TimingType, TrainingPhase, TrainingStatus, TrainingType } from "@/generated/prisma/enums";

// Define local types
// ReportType is now an enum from Prisma

// Re-export enums for convenience
export { TrainingPhase };

// ============================================================================
// BASE ENTITY TYPES
// ============================================================================

/**
 * Core training engagement entity
 */
export interface TrainingEngagementType {
	id: string;
	engagementId: string;
	customerId: string;
	title: string;
	description?: string | null;
	trainingType: TrainingType;
	deliveryMethod: DeliveryMethod;
	startDate?: Date | null;
	endDate?: Date | null;
	totalDurationHours?: number | null;
	targetAudience?: string | null;
	maxParticipants?: number | null;
	minParticipants?: number | null;
	status: TrainingStatus;
	phase: TrainingPhase;
	certificationLevel: CertificationLevel;
	requestedBy: string;
	requestedByUserId?: string | null;
	instructorId?: string | null;
	coordinatorId?: string | null;
	contactId?: string | null;
	createdAt: Date;
	updatedAt: Date;
	startedAt?: Date | null;
	completedAt?: Date | null;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * Training session entity
 */
export interface TrainingSessionType {
	id: string;
	trainingEngagementId: string;
	title: string;
	description?: string | null;
	sessionNumber: number;
	deliveryMethod: DeliveryMethod;
	duration: number;
	contentUrl?: string | null;
	location?: string | null;
	startDate: Date;
	endDate: Date;
	instructorId?: string | null;
	maxCapacity?: number | null;
	status: SessionStatus;
	sopLibraryIds?: string | null;
	hasPreAssessment: boolean;
	hasPostAssessment: boolean;
	preRequisiteLevel?: CompetencyLevel | null;
	createdAt: Date;
	updatedAt: Date;
	recordedUrl?: string | null;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * Assessment record entity
 */
export interface AssessmentRecordType {
	id: string;
	trainingEngagementId: string;
	trainingSessionId?: string | null;
	title: string;
	description?: string | null;
	assessmentType: AssessmentType;
	administrationTiming: TimingType;
	dueDate?: Date | null;
	questions?: string | null;
	passingScore?: number | null;
	status: AssessmentStatus;
	score?: number | null;
	competencyLevel?: CompetencyLevel | null;
	feedback?: string | null;
	reviewedAt?: Date | null;
	reviewedBy?: string | null;
	attachmentIds?: string | null;
	createdAt: Date;
	updatedAt: Date;
	takenAt?: Date | null;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * Training report entity
 */
export interface TrainingReportType {
	id: string;
	trainingEngagementId: string;
	title: string;
	description?: string | null;
	reportType: ReportType;
	totalParticipants?: number | null;
	totalAttended?: number | null;
	completionRate?: number | null;
	averageScore?: number | null;
	overallCompetency?: CompetencyLevel | null;
	passedCount: number;
	failedCount: number;
	averageAttendance?: number | null;
	certificationsIssued: number;
	certificationTemplate?: string | null;
	keyFindings?: string | null;
	recommendations?: string | null;
	successMetrics?: any | null; // Prisma JsonValue
	status: ReportStatus;
	publishedAt?: Date | null;
	publishedBy?: string | null;
	reportFileId?: string | null;
	certificatesFileId?: string | null;
	createdAt: Date;
	updatedAt: Date;
	reportDate: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * Implementation plan entity
 */
export interface ImplementationPlanType {
	id: string;
	trainingEngagementId: string;
	title: string;
	description?: string | null;
	startDate: Date;
	endDate: Date;
	estimatedDurationDays?: number | null;
	goals?: string | null;
	successCriteria?: string | null;
	applicableDepartments?: string | null;
	applicableRoles?: string | null;
	status: PlanStatus;
	ownerUserId?: string | null;
	supportContactId?: string | null;
	totalTasks: number;
	completedTasks: number;
	progressPercentage?: number | null;
	reviewedAt?: Date | null;
	reviewedBy?: string | null;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * Training report entity
 */
export interface TrainingReportType {
	id: string;
	trainingEngagementId: string;
	title: string;
	description?: string | null;
	reportType: ReportType;
	totalParticipants?: number | null;
	totalAttended?: number | null;
	completionRate?: number | null;
	averageScore?: number | null;
	overallCompetency?: CompetencyLevel | null;
	passedCount: number;
	failedCount: number;
	averageAttendance?: number | null;
	certificationsIssued: number;
	certificationTemplate?: string | null;
	keyFindings?: string | null;
	recommendations?: string | null;
	successMetrics?: any | null; // Prisma JsonValue
	status: ReportStatus;
	publishedAt?: Date | null;
	publishedBy?: string | null;
	reportFileId?: string | null;
	certificatesFileId?: string | null;
	createdAt: Date;
	updatedAt: Date;
	reportDate: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * SOP Library entity
 */
export interface SOPLibraryType {
	id: string;
	title: string;
	slug: string;
	description?: string | null;
	category?: string | null;
	content: string;
	version: number;
	versionNotes?: string | null;
	applicableDepartments?: string | null;
	applicableRoles?: string | null;
	requiredCertifications?: string | null;
	status: SOPStatus;
	effectiveDate?: Date | null;
	sunsetDate?: Date | null;
	attachmentIds?: string | null;
	coverImageId?: string | null;
	lastReviewedAt?: Date | null;
	lastReviewedBy?: string | null;
	reviewCycleMonths: number;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	metaData?: any | null; // Prisma JsonValue
}

/**
 * Training registration entity
 */
export interface TrainingRegistrationType {
	id: string;
	trainingEngagementId: string;
	userId?: string | null;
	contactId?: string | null;
	status: RegistrationStatus;
	registrationSource: TicketSource;
	externalRegistrationId?: string | null;
	customData?: any | null; // Prisma JsonValue
	registeredAt: Date;
	checkedInAt?: Date | null;
	checkedInById?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Training check-in entity
 */
export interface TrainingCheckInType {
	id: string;
	trainingRegistrationId: string;
	trainingSessionId?: string | null;
	checkedInAt: Date;
	checkedInById: string;
	location?: string | null;
	deviceInfo?: any | null; // Prisma JsonValue
	createdAt: Date;
}
