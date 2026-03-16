import { prisma } from "@/lib/prisma";

import type { CreateImplementationPlanInput, GetImplementationPlansOptions, ImplementationPlanWithRelations, UpdateImplementationPlanInput } from "../types/implementation-plan.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Implementation Plan Repository
 * Direct database operations for implementation plans
 */

export class ImplementationPlanRepository {
	/**
	 * Get all implementation plans with filters and pagination
	 */
	static async getAllPlans(options: GetImplementationPlansOptions = {}): Promise<{ plans: ImplementationPlanWithRelations[]; total: number }> {
		const { page = 1, limit = 10, search, status, trainingEngagementId } = options;

		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		if (status) {
			where.status = status;
		}

		if (trainingEngagementId) {
			where.trainingEngagementId = trainingEngagementId;
		}

		const [plans, total] = await Promise.all([
			prisma.implementationPlan.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					trainingEngagement: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			}),
			prisma.implementationPlan.count({ where }),
		]);

		return { plans, total };
	}

	/**
	 * Get implementation plan by ID
	 */
	static async getPlanById(id: string): Promise<ImplementationPlanWithRelations | null> {
		return prisma.implementationPlan.findUnique({
			where: { id },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Get implementation plan by training engagement
	 */
	static async getPlanByTrainingEngagement(trainingEngagementId: string): Promise<ImplementationPlanWithRelations | null> {
		return prisma.implementationPlan.findUnique({
			where: { trainingEngagementId },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Create new implementation plan
	 */
	static async createPlan(data: CreateImplementationPlanInput): Promise<ImplementationPlanWithRelations> {
		return prisma.implementationPlan.create({
			data: {
				trainingEngagementId: data.trainingEngagementId,
				title: data.title,
				description: data.description,
				startDate: data.startDate,
				endDate: data.endDate,
				estimatedDurationDays: data.estimatedDurationDays,
				goals: data.goals,
				successCriteria: data.successCriteria,
				applicableDepartments: data.applicableDepartments,
				applicableRoles: data.applicableRoles,
				status: data.status,
				ownerUserId: data.ownerUserId,
				supportContactId: data.supportContactId,
				createdBy: data.createdBy,
				metaData: data.metaData,
			},
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Update implementation plan
	 */
	static async updatePlan(id: string, data: UpdateImplementationPlanInput): Promise<ImplementationPlanWithRelations> {
		const updateData: any = {};

		if (data.trainingEngagementId !== undefined) updateData.trainingEngagementId = data.trainingEngagementId;
		if (data.title !== undefined) updateData.title = data.title;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.startDate !== undefined) updateData.startDate = data.startDate;
		if (data.endDate !== undefined) updateData.endDate = data.endDate;
		if (data.estimatedDurationDays !== undefined) updateData.estimatedDurationDays = data.estimatedDurationDays;
		if (data.goals !== undefined) updateData.goals = data.goals;
		if (data.successCriteria !== undefined) updateData.successCriteria = data.successCriteria;
		if (data.applicableDepartments !== undefined) updateData.applicableDepartments = data.applicableDepartments;
		if (data.applicableRoles !== undefined) updateData.applicableRoles = data.applicableRoles;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.ownerUserId !== undefined) updateData.ownerUserId = data.ownerUserId;
		if (data.supportContactId !== undefined) updateData.supportContactId = data.supportContactId;
		if (data.totalTasks !== undefined) updateData.totalTasks = data.totalTasks;
		if (data.completedTasks !== undefined) updateData.completedTasks = data.completedTasks;
		if (data.progressPercentage !== undefined) updateData.progressPercentage = data.progressPercentage;
		if (data.reviewedAt !== undefined) updateData.reviewedAt = data.reviewedAt;
		if (data.reviewedBy !== undefined) updateData.reviewedBy = data.reviewedBy;
		if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt;
		if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy;
		if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;
		if (data.metaData !== undefined) updateData.metaData = data.metaData;

		return prisma.implementationPlan.update({
			where: { id },
			data: updateData,
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Delete implementation plan
	 */
	static async deletePlan(id: string): Promise<ImplementationPlanWithRelations> {
		return prisma.implementationPlan.delete({
			where: { id },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Update plan progress
	 */
	static async updateProgress(id: string, totalTasks: number, completedTasks: number): Promise<ImplementationPlanWithRelations> {
		const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

		return prisma.implementationPlan.update({
			where: { id },
			data: {
				totalTasks,
				completedTasks,
				progressPercentage,
			},
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Get plan count by status
	 */
	static async getPlanCountByStatus(): Promise<Record<string, number>> {
		const result = await prisma.implementationPlan.groupBy({
			by: ["status"],
			_count: true,
		});

		return result.reduce(
			(acc, item) => {
				acc[item.status] = item._count;
				return acc;
			},
			{} as Record<string, number>,
		);
	}
}
