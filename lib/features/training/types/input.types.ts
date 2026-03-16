/**
 * Input types for forms and API operations
 */

import { AssessmentStatus, AssessmentType, CertificationLevel, CompetencyLevel, DeliveryMethod, PlanStatus, RegistrationStatus, ReportStatus, ReportType, SessionStatus, SOPStatus, TicketSource, TimingType, TrainingPhase, TrainingStatus, TrainingType } from "@/generated/prisma/enums";

// ============================================================================
// INPUT TYPES (for forms and API)
// ============================================================================

/**
 * Input for creating a training engagement
 */
export interface CreateTrainingEngagementInput {
	engagementId: string;
	customerId: string;
	title: string;
	description?: string;
	trainingType?: TrainingType;
	deliveryMethod?: DeliveryMethod;
	startDate?: Date;
	endDate?: Date;
	totalDurationHours?: number;
	targetAudience?: string;
	maxParticipants?: number;
	minParticipants?: number;
	certificationLevel?: CertificationLevel;
	requestedBy: string;
	requestedByUserId?: string;
	instructorId?: string;
	coordinatorId?: string;
	contactId?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating a training engagement (without engagementId - created automatically)
 */
export interface CreateTrainingEngagementFormInput {
	customerId: string;
	title: string;
	description?: string;
	trainingType?: TrainingType;
	deliveryMethod?: DeliveryMethod;
	startDate?: Date;
	endDate?: Date;
	totalDurationHours?: number;
	targetAudience?: string;
	maxParticipants?: number;
	minParticipants?: number;
	certificationLevel?: CertificationLevel;
	requestedBy: string;
	requestedByUserId?: string;
	instructorId?: string;
	coordinatorId?: string;
	contactId?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating a training engagement
 */
export interface UpdateTrainingEngagementInput {
	title?: string;
	description?: string;
	trainingType?: TrainingType;
	deliveryMethod?: DeliveryMethod;
	startDate?: Date;
	endDate?: Date;
	totalDurationHours?: number;
	targetAudience?: string;
	maxParticipants?: number;
	minParticipants?: number;
	status?: TrainingStatus;
	phase?: TrainingPhase;
	certificationLevel?: CertificationLevel;
	requestedBy?: string;
	requestedByUserId?: string;
	instructorId?: string;
	coordinatorId?: string;
	contactId?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating a training session
 */
export interface CreateTrainingSessionInput {
	trainingEngagementId: string;
	title: string;
	description?: string;
	sessionNumber: number;
	deliveryMethod?: DeliveryMethod;
	duration: number;
	contentUrl?: string;
	location?: string;
	startDate: Date;
	endDate: Date;
	instructorId?: string;
	maxCapacity?: number;
	status?: SessionStatus;
	sopLibraryIds?: string;
	hasPreAssessment?: boolean;
	hasPostAssessment?: boolean;
	preRequisiteLevel?: CompetencyLevel;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating a training session
 */
export interface UpdateTrainingSessionInput {
	title?: string;
	description?: string;
	sessionNumber?: number;
	deliveryMethod?: DeliveryMethod;
	duration?: number;
	contentUrl?: string;
	location?: string;
	startDate?: Date;
	endDate?: Date;
	instructorId?: string;
	maxCapacity?: number;
	status?: SessionStatus;
	sopLibraryIds?: string;
	hasPreAssessment?: boolean;
	hasPostAssessment?: boolean;
	preRequisiteLevel?: CompetencyLevel;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating an assessment
 */
export interface CreateAssessmentInput {
	trainingEngagementId: string;
	trainingSessionId?: string;
	title: string;
	description?: string;
	assessmentType?: AssessmentType;
	administrationTiming?: TimingType;
	dueDate?: Date;
	questions?: string;
	passingScore?: number;
	status?: AssessmentStatus;
	score?: number;
	competencyLevel?: CompetencyLevel;
	feedback?: string;
	reviewedAt?: Date;
	reviewedBy?: string;
	attachmentIds?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating an assessment
 */
export interface UpdateAssessmentInput {
	title?: string;
	description?: string;
	assessmentType?: AssessmentType;
	administrationTiming?: TimingType;
	dueDate?: Date;
	questions?: string;
	passingScore?: number;
	status?: AssessmentStatus;
	score?: number;
	competencyLevel?: CompetencyLevel;
	feedback?: string;
	reviewedAt?: Date;
	reviewedBy?: string;
	attachmentIds?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating an implementation plan
 */
export interface CreateImplementationPlanInput {
	trainingEngagementId: string;
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	estimatedDurationDays?: number;
	goals?: string;
	successCriteria?: string;
	applicableDepartments?: string;
	applicableRoles?: string;
	status?: PlanStatus;
	ownerUserId?: string;
	supportContactId?: string;
	totalTasks?: number;
	completedTasks?: number;
	progressPercentage?: number;
	reviewedAt?: Date;
	reviewedBy?: string;
	approvedAt?: Date;
	approvedBy?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating an implementation plan
 */
export interface UpdateImplementationPlanInput {
	id: string;
	title?: string;
	description?: string;
	startDate?: Date;
	endDate?: Date;
	estimatedDurationDays?: number;
	goals?: string;
	successCriteria?: string;
	applicableDepartments?: string;
	applicableRoles?: string;
	status?: PlanStatus;
	ownerUserId?: string;
	supportContactId?: string;
	totalTasks?: number;
	completedTasks?: number;
	progressPercentage?: number;
	reviewedAt?: Date;
	reviewedBy?: string;
	approvedAt?: Date;
	approvedBy?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating an SOP library entry
 */
export interface CreateSOPLibraryInput {
	title: string;
	slug: string;
	description?: string;
	category?: string;
	content: string;
	version?: number;
	versionNotes?: string;
	applicableDepartments?: string;
	applicableRoles?: string;
	requiredCertifications?: string;
	status?: SOPStatus;
	effectiveDate?: Date;
	sunsetDate?: Date;
	attachmentIds?: string;
	coverImageId?: string;
	lastReviewedAt?: Date;
	lastReviewedBy?: string;
	reviewCycleMonths?: number;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating an SOP library entry
 */
export interface UpdateSOPLibraryInput {
	id: string;
	title?: string;
	slug?: string;
	description?: string;
	category?: string;
	content?: string;
	version?: number;
	versionNotes?: string;
	applicableDepartments?: string;
	applicableRoles?: string;
	requiredCertifications?: string;
	status?: SOPStatus;
	effectiveDate?: Date;
	sunsetDate?: Date;
	attachmentIds?: string;
	coverImageId?: string;
	lastReviewedAt?: Date;
	lastReviewedBy?: string;
	reviewCycleMonths?: number;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating a training report
 */
export interface CreateTrainingReportInput {
	trainingEngagementId: string;
	title: string;
	description?: string;
	reportType?: ReportType;
	totalParticipants?: number;
	totalAttended?: number;
	completionRate?: number;
	averageScore?: number;
	overallCompetency?: CompetencyLevel;
	passedCount?: number;
	failedCount?: number;
	averageAttendance?: number;
	certificationsIssued?: number;
	certificationTemplate?: string;
	keyFindings?: string;
	recommendations?: string;
	successMetrics?: any; // Prisma JsonValue
	status?: ReportStatus;
	reportFileId?: string;
	certificatesFileId?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating a training report
 */
export interface UpdateTrainingReportInput {
	title?: string;
	description?: string;
	reportType?: ReportType;
	totalParticipants?: number;
	totalAttended?: number;
	completionRate?: number;
	averageScore?: number;
	overallCompetency?: CompetencyLevel;
	passedCount?: number;
	failedCount?: number;
	averageAttendance?: number;
	certificationsIssued?: number;
	certificationTemplate?: string;
	keyFindings?: string;
	recommendations?: string;
	successMetrics?: any; // Prisma JsonValue
	status?: ReportStatus;
	publishedAt?: Date;
	publishedBy?: string;
	reportFileId?: string;
	certificatesFileId?: string;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating a training registration
 */
export interface CreateTrainingRegistrationInput {
	trainingEngagementId: string;
	userId?: string;
	contactId?: string;
	registrationSource?: TicketSource;
	externalRegistrationId?: string;
	customData?: any; // Prisma JsonValue
}

/**
 * Input for updating a training registration
 */
export interface UpdateTrainingRegistrationInput {
	id: string;
	status?: RegistrationStatus;
	registrationSource?: TicketSource;
	externalRegistrationId?: string;
	customData?: any; // Prisma JsonValue
	checkedInAt?: Date;
	checkedInById?: string;
}

/**
 * Input for creating a training report
 */
export interface CreateTrainingReportInput {
	trainingEngagementId: string;
	title: string;
	description?: string;
	reportType?: ReportType;
	totalParticipants?: number;
	totalAttended?: number;
	completionRate?: number;
	averageScore?: number;
	overallCompetency?: CompetencyLevel;
	passedCount?: number;
	failedCount?: number;
	averageAttendance?: number;
	certificationsIssued?: number;
	certificationTemplate?: string;
	keyFindings?: string;
	recommendations?: string;
	successMetrics?: any; // Prisma JsonValue
	reportFileId?: string;
	certificatesFileId?: string;
	reportDate?: Date;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for updating a training report
 */
export interface UpdateTrainingReportInput {
	title?: string;
	description?: string;
	reportType?: ReportType;
	totalParticipants?: number;
	totalAttended?: number;
	completionRate?: number;
	averageScore?: number;
	overallCompetency?: CompetencyLevel;
	passedCount?: number;
	failedCount?: number;
	averageAttendance?: number;
	certificationsIssued?: number;
	certificationTemplate?: string;
	keyFindings?: string;
	recommendations?: string;
	successMetrics?: any; // Prisma JsonValue
	status?: ReportStatus;
	reportFileId?: string;
	certificatesFileId?: string;
	reportDate?: Date;
	metaData?: any; // Prisma JsonValue
}

/**
 * Input for creating a training check-in
 */
export interface CreateTrainingCheckInInput {
	trainingRegistrationId: string;
	trainingSessionId?: string;
	location?: string;
	deviceInfo?: any; // Prisma JsonValue
}
