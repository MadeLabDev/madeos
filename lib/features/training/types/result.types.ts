/**
 * Action result types and utility types for the training feature
 */

import type { ActionResult } from "@/lib/types";

import { AssessmentRecordType, ImplementationPlanType, SOPLibraryType, TrainingCheckInType, TrainingEngagementType, TrainingRegistrationType, TrainingReportType, TrainingSessionType } from "./base.types";
import { AssessmentWithRelations, ImplementationPlanWithRelations, TrainingEngagementWithRelations, TrainingSessionWithRelations } from "./relation.types";

// ============================================================================
// ACTION RESULT TYPES
// ============================================================================

// ActionResult is now imported from @/lib/types

/**
 * Action result types for each entity
 */
export type TrainingEngagementActionResult = ActionResult<TrainingEngagementType>;
export type TrainingSessionActionResult = ActionResult<TrainingSessionType>;
export type AssessmentActionResult = ActionResult<AssessmentRecordType>;
export type TrainingReportActionResult = ActionResult<TrainingReportType>;
export type ImplementationPlanActionResult = ActionResult<ImplementationPlanType>;
export type SOPLibraryActionResult = ActionResult<SOPLibraryType>;
export type TrainingRegistrationActionResult = ActionResult<TrainingRegistrationType>;
export type TrainingCheckInActionResult = ActionResult<TrainingCheckInType>;

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

/**
 * Training dashboard statistics
 */
export interface TrainingDashboardStats {
	totalEngagements: number;
	activeEngagements: number;
	completedEngagements: number;
	totalSessions: number;
	upcomingSessions: number;
	totalAssessments: number;
	pendingAssessments: number;
	totalSOPs: number;
	activeSOPs: number;
}

/**
 * Training engagement statistics
 */
export interface TrainingEngagementStats {
	engagementId: string;
	totalSessions: number;
	completedSessions: number;
	totalAssessments: number;
	completedAssessments: number;
	averageScore?: number;
	progressPercentage: number;
}

/**
 * Training report data for generation
 */
export interface TrainingReportData {
	engagement: TrainingEngagementWithRelations;
	sessions: TrainingSessionWithRelations[];
	assessments: AssessmentWithRelations[];
	implementationPlan?: ImplementationPlanWithRelations;
	generatedAt: Date;
	generatedBy: string;
}
