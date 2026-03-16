/**
 * ImplementationPlan Repository
 * Database operations for ImplementationPlans
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateImplementationPlanInput, ImplementationPlanFilters, ImplementationPlanWithRelations, UpdateImplementationPlanInput } from "../types";

export class ImplementationPlanRepository {
	/**
	 * Find implementation plan by ID with relations
	 */
	static async findById(id: string): Promise<ImplementationPlanWithRelations | null> {
		return prisma.implementationPlan.findUnique({
			where: { id },
			include: {
				trainingEngagement: true,
			},
		});
	}

	/**
	 * Find implementation plan by training engagement ID
	 */
	static async findByTrainingEngagementId(trainingEngagementId: string): Promise<ImplementationPlanWithRelations | null> {
		return prisma.implementationPlan.findUnique({
			where: { trainingEngagementId },
			include: {
				trainingEngagement: true,
			},
		});
	}

	/**
	 * Find multiple implementation plans with pagination and filters
	 */
	static async findMany(filters: ImplementationPlanFilters = {}, options: { skip?: number; take?: number } = {}): Promise<ImplementationPlanWithRelations[]> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.status) where.status = filters.status;
		if (filters.ownerUserId) where.ownerUserId = filters.ownerUserId;
		if (filters.supportContactId) where.supportContactId = filters.supportContactId;

		if (filters.startDateFrom || filters.startDateTo) {
			where.startDate = {};
			if (filters.startDateFrom) where.startDate.gte = filters.startDateFrom;
			if (filters.startDateTo) where.startDate.lte = filters.startDateTo;
		}

		if (filters.endDateFrom || filters.endDateTo) {
			where.endDate = {};
			if (filters.endDateFrom) where.endDate.gte = filters.endDateFrom;
			if (filters.endDateTo) where.endDate.lte = filters.endDateTo;
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { goals: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { successCriteria: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.implementationPlan.findMany({
			where,
			include: {
				trainingEngagement: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count implementation plans with filters
	 */
	static async count(filters: ImplementationPlanFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.status) where.status = filters.status;
		if (filters.ownerUserId) where.ownerUserId = filters.ownerUserId;
		if (filters.supportContactId) where.supportContactId = filters.supportContactId;

		if (filters.startDateFrom || filters.startDateTo) {
			where.startDate = {};
			if (filters.startDateFrom) where.startDate.gte = filters.startDateFrom;
			if (filters.startDateTo) where.startDate.lte = filters.startDateTo;
		}

		if (filters.endDateFrom || filters.endDateTo) {
			where.endDate = {};
			if (filters.endDateFrom) where.endDate.gte = filters.endDateFrom;
			if (filters.endDateTo) where.endDate.lte = filters.endDateTo;
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { goals: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { successCriteria: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.implementationPlan.count({ where });
	}

	/**
	 * Create new implementation plan
	 */
	static async create(data: CreateImplementationPlanInput & { createdBy: string; updatedBy: string }): Promise<ImplementationPlanWithRelations> {
		return prisma.implementationPlan.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				trainingEngagement: true,
			},
		});
	}

	/**
	 * Update implementation plan
	 */
	static async update(id: string, data: UpdateImplementationPlanInput & { updatedBy: string }): Promise<ImplementationPlanWithRelations> {
		return prisma.implementationPlan.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				trainingEngagement: true,
			},
		});
	}

	/**
	 * Delete implementation plan
	 */
	static async delete(id: string): Promise<void> {
		await prisma.implementationPlan.delete({
			where: { id },
		});
	}
}
