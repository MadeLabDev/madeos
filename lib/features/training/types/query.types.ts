/**
 * Query parameters and filter types for the training feature
 */

import { AssessmentType, CompetencyLevel, ProcessStatus, ProjectStatus, PublishStatus, ReportType, TicketSource, TrainingPhase, TrainingStatus } from "@/generated/prisma/enums";

// Legacy type aliases for backward compatibility
// export type TrainingStatus = ProjectStatus;
export type SessionStatus = ProjectStatus;
export type AssessmentStatus = ProcessStatus;
export type ReportStatus = PublishStatus;
export type PlanStatus = ProjectStatus;
export type SOPStatus = PublishStatus;
export type RegistrationStatus = ProcessStatus;

// Re-export TrainingStatus
export { TrainingStatus };

// ============================================================================
// QUERY & LIST PARAMETERS
// ============================================================================

/**
 * Parameters for listing training engagements
 */
export interface TrainingEngagementListParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: ProjectStatus;
	phase?: TrainingPhase;
	customerId?: string;
	instructorId?: string;
	startDate?: Date;
	endDate?: Date;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Parameters for listing training sessions
 */
export interface TrainingSessionListParams {
	page?: number;
	limit?: number;
	search?: string;
	trainingEngagementId?: string;
	status?: SessionStatus;
	instructorId?: string;
	startDate?: Date;
	endDate?: Date;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Parameters for listing assessments
 */
export interface AssessmentListParams {
	page?: number;
	limit?: number;
	search?: string;
	trainingEngagementId?: string;
	trainingSessionId?: string;
	assessmentType?: AssessmentType;
	status?: AssessmentStatus;
	competencyLevel?: CompetencyLevel;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Parameters for listing implementation plans
 */
export interface ImplementationPlanListParams {
	page?: number;
	limit?: number;
	search?: string;
	trainingEngagementId?: string;
	status?: PlanStatus;
	ownerUserId?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Parameters for listing SOP libraries
 */
export interface SOPLibraryListParams {
	page?: number;
	limit?: number;
	search?: string;
	category?: string;
	status?: SOPStatus;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for training engagements
 */
export interface TrainingEngagementFilters {
	engagementId?: string;
	customerId?: string;
	status?: TrainingStatus;
	phase?: TrainingPhase;
	trainingType?: import("@/generated/prisma/enums").TrainingType;
	instructorId?: string;
	coordinatorId?: string;
	contactId?: string;
	startDateFrom?: Date;
	startDateTo?: Date;
	endDateFrom?: Date;
	endDateTo?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
}

/**
 * Filters for training sessions
 */
export interface TrainingSessionFilters {
	trainingEngagementId?: string;
	status?: SessionStatus | "ALL";
	instructorId?: string;
	startDateFrom?: Date;
	startDateTo?: Date;
	endDateFrom?: Date;
	endDateTo?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
}

/**
 * Filters for assessments
 */
export interface AssessmentFilters {
	trainingEngagementId?: string;
	trainingSessionId?: string;
	trainingAttendeeId?: string;
	assessmentType?: AssessmentType;
	administrationTiming?: import("@/generated/prisma/enums").TimingType;
	status?: AssessmentStatus;
	competencyLevel?: CompetencyLevel;
	dueDateFrom?: Date;
	dueDateTo?: Date;
	takenAtFrom?: Date;
	takenAtTo?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
}

/**
 * Filters for training reports
 */
export interface TrainingReportFilters {
	trainingEngagementId?: string;
	reportType?: ReportType;
	status?: ReportStatus;
	publishedBy?: string;
	reportDateFrom?: Date;
	reportDateTo?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
}

/**
 * Filters for implementation plans
 */
export interface ImplementationPlanFilters {
	trainingEngagementId?: string;
	status?: PlanStatus;
	ownerUserId?: string;
	supportContactId?: string;
	startDateFrom?: Date;
	startDateTo?: Date;
	endDateFrom?: Date;
	endDateTo?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
}

/**
 * Filters for SOP libraries
 */
export interface SOPLibraryFilters {
	category?: string;
	status?: SOPStatus;
	effectiveDateFrom?: Date;
	effectiveDateTo?: Date;
	sunsetDateFrom?: Date;
	sunsetDateTo?: Date;
	lastReviewedAtFrom?: Date;
	lastReviewedAtTo?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
}

/**
 * Parameters for listing training registrations
 */
export interface TrainingRegistrationListParams {
	page?: number;
	limit?: number;
	search?: string;
	trainingEngagementId?: string;
	userId?: string;
	contactId?: string;
	status?: RegistrationStatus;
	registrationSource?: TicketSource;
	checkedIn?: boolean;
	registeredAfter?: Date;
	registeredBefore?: Date;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Filters for training registrations
 */
export interface TrainingRegistrationFilters {
	trainingEngagementId?: string;
	userId?: string;
	contactId?: string;
	status?: RegistrationStatus;
	registrationSource?: TicketSource;
	checkedIn?: boolean;
	registeredAfter?: Date;
	registeredBefore?: Date;
	search?: string;
}

/**
 * Parameters for listing training check-ins
 */
export interface TrainingCheckInListParams {
	page?: number;
	limit?: number;
	search?: string;
	trainingRegistrationId?: string;
	trainingSessionId?: string;
	checkedInById?: string;
	checkedInAfter?: Date;
	checkedInBefore?: Date;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}
