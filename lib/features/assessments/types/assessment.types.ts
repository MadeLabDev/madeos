import type { Assessment, AssessmentStatus, AssessmentType, TimingType } from "@/generated/prisma/client";

// Re-export shared types

/**
 * Assessment Types
 * Training assessment and evaluation system
 */

export type AssessmentWithRelations = Assessment & {
	trainingEngagement?: {
		id: string;
		title: string;
	} | null;
	trainingSession?: {
		id: string;
		title: string;
	} | null;
};

export interface CreateAssessmentInput {
	title: string;
	description?: string;
	assessmentType?: AssessmentType;
	administrationTiming?: TimingType;
	trainingEngagementId: string;
	trainingSessionId?: string;
	dueDate?: Date;
	passingScore?: number;
	questions?: string;
	status?: AssessmentStatus;
	createdBy?: string;
	metaData?: any;
}

export interface UpdateAssessmentInput extends Partial<CreateAssessmentInput> {
	id?: string;
	score?: number;
	feedback?: string;
	reviewedAt?: Date;
	reviewedBy?: string;
	takenAt?: Date;
	attachmentIds?: string;
	updatedBy?: string;
}

export interface GetAssessmentsOptions {
	page?: number;
	limit?: number;
	search?: string;
	assessmentType?: AssessmentType;
	status?: AssessmentStatus;
	trainingEngagementId?: string;
}

export interface AssessmentListResult {
	assessments: AssessmentWithRelations[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ActionResult is now imported from @/lib/types
