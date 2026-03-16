/**
 * TrainingSession Repository
 * Database operations for TrainingSessions
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateTrainingSessionInput, TrainingSessionFilters, TrainingSessionWithRelations, UpdateTrainingSessionInput } from "../types";

export class TrainingSessionRepository {
	/**
	 * Find training session by ID with relations
	 */
	static async findById(id: string): Promise<TrainingSessionWithRelations | null> {
		return prisma.trainingSession.findUnique({
			where: { id },
			include: {
				trainingEngagement: true,
				assessments: true,
			},
		});
	}

	/**
	 * Find multiple training sessions with pagination and filters
	 */
	static async findMany(filters: TrainingSessionFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TrainingSessionWithRelations[]> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.status && filters.status !== "ALL") where.status = filters.status;
		if (filters.instructorId) where.instructorId = filters.instructorId;

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
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { location: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.trainingSession.findMany({
			where,
			include: {
				trainingEngagement: true,
				assessments: true,
			},
			orderBy: { sessionNumber: "asc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count training sessions with filters
	 */
	static async count(filters: TrainingSessionFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.status) where.status = filters.status;
		if (filters.instructorId) where.instructorId = filters.instructorId;

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
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { location: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.trainingSession.count({ where });
	}

	/**
	 * Create new training session
	 */
	static async create(data: CreateTrainingSessionInput & { createdBy: string; updatedBy: string }): Promise<TrainingSessionWithRelations> {
		return prisma.trainingSession.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				trainingEngagement: true,
				assessments: true,
			},
		});
	}

	/**
	 * Update training session
	 */
	static async update(id: string, data: UpdateTrainingSessionInput & { updatedBy: string }): Promise<TrainingSessionWithRelations> {
		return prisma.trainingSession.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				trainingEngagement: true,
				assessments: true,
			},
		});
	}

	/**
	 * Delete training session
	 */
	static async delete(id: string): Promise<void> {
		await prisma.trainingSession.delete({
			where: { id },
		});
	}
}
