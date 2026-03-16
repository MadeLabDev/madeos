import type { ImplementationPlan, PlanStatus } from "@/generated/prisma/client";

/**
 * Implementation Plan Types
 * Training implementation planning and tracking
 */

export type ImplementationPlanWithRelations = ImplementationPlan & {
	trainingEngagement?: {
		id: string;
		title: string;
	} | null;
};

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
	createdBy?: string;
	metaData?: any;
}

export interface UpdateImplementationPlanInput extends Partial<CreateImplementationPlanInput> {
	id?: string;
	totalTasks?: number;
	completedTasks?: number;
	progressPercentage?: number;
	reviewedAt?: Date;
	reviewedBy?: string;
	approvedAt?: Date;
	approvedBy?: string;
	updatedBy?: string;
}

export interface GetImplementationPlansOptions {
	page?: number;
	limit?: number;
	search?: string;
	status?: PlanStatus;
	trainingEngagementId?: string;
}

export interface ImplementationPlanListResult {
	plans: ImplementationPlanWithRelations[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ActionResult is now imported from @/lib/types
