/**
 * Assessment Repository
 * Database operations for Assessments
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { AssessmentFilters, AssessmentWithRelations, CreateAssessmentInput, UpdateAssessmentInput } from "../types";

export class AssessmentRepository {
	/**
	 * Find assessment by ID with relations
	 */
	static async findById(id: string): Promise<AssessmentWithRelations | null> {
		return prisma.assessment.findUnique({
			where: { id },
			include: {
				trainingEngagement: true,
				trainingSession: true,
			},
		});
	}

	/**
	 * Find multiple assessments with pagination and filters
	 */
	static async findMany(filters: AssessmentFilters = {}, options: { skip?: number; take?: number } = {}): Promise<AssessmentWithRelations[]> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.trainingSessionId) where.trainingSessionId = filters.trainingSessionId;
		if (filters.assessmentType) where.assessmentType = filters.assessmentType;
		if (filters.administrationTiming) where.administrationTiming = filters.administrationTiming;
		if (filters.status) where.status = filters.status;
		if (filters.competencyLevel) where.competencyLevel = filters.competencyLevel;

		if (filters.dueDateFrom || filters.dueDateTo) {
			where.dueDate = {};
			if (filters.dueDateFrom) where.dueDate.gte = filters.dueDateFrom;
			if (filters.dueDateTo) where.dueDate.lte = filters.dueDateTo;
		}

		if (filters.takenAtFrom || filters.takenAtTo) {
			where.takenAt = {};
			if (filters.takenAtFrom) where.takenAt.gte = filters.takenAtFrom;
			if (filters.takenAtTo) where.takenAt.lte = filters.takenAtTo;
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { feedback: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.assessment.findMany({
			where,
			include: {
				trainingEngagement: true,
				trainingSession: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count assessments with filters
	 */
	static async count(filters: AssessmentFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.trainingSessionId) where.trainingSessionId = filters.trainingSessionId;
		if (filters.assessmentType) where.assessmentType = filters.assessmentType;
		if (filters.administrationTiming) where.administrationTiming = filters.administrationTiming;
		if (filters.status) where.status = filters.status;
		if (filters.competencyLevel) where.competencyLevel = filters.competencyLevel;

		if (filters.dueDateFrom || filters.dueDateTo) {
			where.dueDate = {};
			if (filters.dueDateFrom) where.dueDate.gte = filters.dueDateFrom;
			if (filters.dueDateTo) where.dueDate.lte = filters.dueDateTo;
		}

		if (filters.takenAtFrom || filters.takenAtTo) {
			where.takenAt = {};
			if (filters.takenAtFrom) where.takenAt.gte = filters.takenAtFrom;
			if (filters.takenAtTo) where.takenAt.lte = filters.takenAtTo;
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { feedback: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.assessment.count({ where });
	}

	/**
	 * Create new assessment
	 */
	static async create(data: CreateAssessmentInput & { createdBy: string; updatedBy: string }): Promise<AssessmentWithRelations> {
		return prisma.assessment.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				trainingEngagement: true,
				trainingSession: true,
			},
		});
	}

	/**
	 * Update assessment
	 */
	static async update(id: string, data: UpdateAssessmentInput & { updatedBy: string }): Promise<AssessmentWithRelations> {
		return prisma.assessment.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				trainingEngagement: true,
				trainingSession: true,
			},
		});
	}

	/**
	 * Delete assessment
	 */
	static async delete(id: string): Promise<void> {
		await prisma.assessment.delete({
			where: { id },
		});
	}
}
