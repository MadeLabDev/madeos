/**
 * Relation types with populated relationships for the training feature
 */

import { AssessmentRecordType, ImplementationPlanType, SOPLibraryType, TrainingCheckInType, TrainingEngagementType, TrainingRegistrationType, TrainingReportType, TrainingSessionType } from "./base.types";

// ============================================================================
// RELATION TYPES (with populated relationships)
// ============================================================================

/**
 * Training engagement with related data
 */
export interface TrainingEngagementWithRelations extends TrainingEngagementType {
	engagement?: any; // Engagement relation
	customer?: any; // Customer relation
	contact?: any; // Contact relation
	instructor?: any; // Instructor user relation
	coordinator?: any; // Coordinator user relation
	requestedByUser?: any; // Requested by user relation
	sessions?: TrainingSessionType[];
	assessments?: AssessmentRecordType[];
	implementationPlan?: ImplementationPlanType | null;
	reports?: TrainingReportType[];
	registrations?: TrainingRegistrationWithRelations[]; // Training registrations/attendees
}

/**
 * Training session with related data
 */
export interface TrainingSessionWithRelations extends TrainingSessionType {
	trainingEngagement?: TrainingEngagementType;
	assessments?: AssessmentRecordType[];
}

/**
 * Assessment with related data
 */
export interface AssessmentWithRelations extends AssessmentRecordType {
	trainingEngagement?: TrainingEngagementType;
	trainingSession?: TrainingSessionType | null;
}

/**
 * Training report with related data
 */
export interface TrainingReportWithRelations extends TrainingReportType {
	trainingEngagement?: TrainingEngagementWithRelations;
}

/**
 * Implementation plan with related data
 */
export interface ImplementationPlanWithRelations extends ImplementationPlanType {
	trainingEngagement?: TrainingEngagementType;
}

/**
 * Training registration with related data
 */
export interface TrainingRegistrationWithRelations extends TrainingRegistrationType {
	trainingEngagement?: TrainingEngagementType;
	user?: any; // User relation
	contact?: any; // Contact relation
	checkedInBy?: any; // User who checked them in
	checkIns?: TrainingCheckInType[];
}

/**
 * Training check-in with related data
 */
export interface TrainingCheckInWithRelations extends TrainingCheckInType {
	trainingRegistration?: TrainingRegistrationType;
	trainingSession?: TrainingSessionType | null;
	checkedInBy?: any; // User who performed check-in
}

/**
 * SOP Library with related data
 */
export interface SOPLibraryWithRelations extends SOPLibraryType {
	createdByUser?: any; // User who created the SOP
	updatedByUser?: any; // User who last updated the SOP
	lastReviewedByUser?: any; // User who last reviewed the SOP
	attachments?: any[]; // Media attachments
	coverImage?: any; // Cover image media
}
