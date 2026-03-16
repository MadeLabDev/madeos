/**
 * TrainingEngagement Repository
 * Database operations for TrainingEngagements
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateTrainingEngagementInput, TrainingEngagementFilters, TrainingEngagementWithRelations, UpdateTrainingEngagementInput } from "../types";

export class TrainingEngagementRepository {
	/**
	 * Find training engagement by ID with relations
	 */
	static async findById(id: string): Promise<TrainingEngagementWithRelations | null> {
		return prisma.trainingEngagement.findUnique({
			where: { id },
			include: {
				engagement: true,
				customer: true,
				contact: true,
				sessions: true,
				assessments: true,
				implementationPlan: true,
				reports: true,
				registrations: {
					include: {
						user: true,
						contact: true,
						checkIns: true,
					},
				},
				instructor: true,
				coordinator: true,
				requestedByUser: true,
			},
		});
	}

	/**
	 * Find multiple training engagements with pagination and filters
	 */
	static async findMany(filters: TrainingEngagementFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TrainingEngagementWithRelations[]> {
		const where: any = {};

		if (filters.engagementId) where.engagementId = filters.engagementId;
		if (filters.customerId) where.customerId = filters.customerId;
		if (filters.status) where.status = filters.status;
		if (filters.phase) where.phase = filters.phase;
		if (filters.trainingType) where.trainingType = filters.trainingType;
		if (filters.instructorId) where.instructorId = filters.instructorId;
		if (filters.coordinatorId) where.coordinatorId = filters.coordinatorId;
		if (filters.contactId) where.contactId = filters.contactId;

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
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { engagement: { title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }, { customer: { name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }];
		}

		return prisma.trainingEngagement.findMany({
			where,
			include: {
				engagement: true,
				customer: true,
				contact: true,
				sessions: true,
				assessments: true,
				implementationPlan: true,
				reports: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count training engagements with filters
	 */
	static async count(filters: TrainingEngagementFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.engagementId) where.engagementId = filters.engagementId;
		if (filters.customerId) where.customerId = filters.customerId;
		if (filters.status) where.status = filters.status;
		if (filters.phase) where.phase = filters.phase;
		if (filters.trainingType) where.trainingType = filters.trainingType;
		if (filters.instructorId) where.instructorId = filters.instructorId;
		if (filters.coordinatorId) where.coordinatorId = filters.coordinatorId;
		if (filters.contactId) where.contactId = filters.contactId;

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
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { engagement: { title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }, { customer: { name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }];
		}

		return prisma.trainingEngagement.count({ where });
	}

	/**
	 * Create new training engagement
	 */
	static async create(data: CreateTrainingEngagementInput & { createdBy: string; updatedBy: string }): Promise<TrainingEngagementWithRelations> {
		return prisma.trainingEngagement.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				engagement: true,
				customer: true,
				contact: true,
				sessions: true,
				assessments: true,
				implementationPlan: true,
			},
		});
	}

	/**
	 * Update training engagement
	 */
	static async update(id: string, data: UpdateTrainingEngagementInput & { updatedBy: string }): Promise<TrainingEngagementWithRelations> {
		return prisma.trainingEngagement.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				engagement: true,
				customer: true,
				contact: true,
				sessions: true,
				assessments: true,
				implementationPlan: true,
			},
		});
	}

	/**
	 * Delete training engagement
	 */
	static async delete(id: string): Promise<void> {
		await prisma.trainingEngagement.delete({
			where: { id },
		});
	}
}
