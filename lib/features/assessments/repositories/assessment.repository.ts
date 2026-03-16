import { prisma } from "@/lib/prisma";

import type { AssessmentWithRelations, CreateAssessmentInput, GetAssessmentsOptions, UpdateAssessmentInput } from "../types/assessment.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Assessment Repository
 * Direct database operations for assessments
 */

export class AssessmentRepository {
	/**
	 * Get all assessments with filters and pagination
	 */
	static async getAllAssessments(options: GetAssessmentsOptions = {}): Promise<{ assessments: AssessmentWithRelations[]; total: number }> {
		const { page = 1, limit = 10, search, assessmentType, status, trainingEngagementId } = options;

		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		if (assessmentType) {
			where.assessmentType = assessmentType;
		}

		if (status) {
			where.status = status;
		}

		if (trainingEngagementId) {
			where.trainingEngagementId = trainingEngagementId;
		}

		const [assessments, total] = await Promise.all([
			prisma.assessment.findMany({
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
					trainingSession: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			}),
			prisma.assessment.count({ where }),
		]);

		return { assessments, total };
	}

	/**
	 * Get assessment by ID
	 */
	static async getAssessmentById(id: string): Promise<AssessmentWithRelations | null> {
		return prisma.assessment.findUnique({
			where: { id },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
				trainingSession: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Create new assessment
	 */
	static async createAssessment(data: CreateAssessmentInput): Promise<AssessmentWithRelations> {
		return prisma.assessment.create({
			data: {
				title: data.title,
				description: data.description,
				assessmentType: data.assessmentType,
				administrationTiming: data.administrationTiming,
				trainingEngagementId: data.trainingEngagementId,
				trainingSessionId: data.trainingSessionId,
				dueDate: data.dueDate,
				passingScore: data.passingScore,
				questions: data.questions,
				status: data.status,
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
				trainingSession: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Update assessment
	 */
	static async updateAssessment(id: string, data: UpdateAssessmentInput): Promise<AssessmentWithRelations> {
		const updateData: any = {};

		if (data.title !== undefined) updateData.title = data.title;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.assessmentType !== undefined) updateData.assessmentType = data.assessmentType;
		if (data.administrationTiming !== undefined) updateData.administrationTiming = data.administrationTiming;
		if (data.trainingEngagementId !== undefined) updateData.trainingEngagementId = data.trainingEngagementId;
		if (data.trainingSessionId !== undefined) updateData.trainingSessionId = data.trainingSessionId;
		if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
		if (data.passingScore !== undefined) updateData.passingScore = data.passingScore;
		if (data.questions !== undefined) updateData.questions = data.questions;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.score !== undefined) updateData.score = data.score;
		if (data.feedback !== undefined) updateData.feedback = data.feedback;
		if (data.reviewedAt !== undefined) updateData.reviewedAt = data.reviewedAt;
		if (data.reviewedBy !== undefined) updateData.reviewedBy = data.reviewedBy;
		if (data.takenAt !== undefined) updateData.takenAt = data.takenAt;
		if (data.attachmentIds !== undefined) updateData.attachmentIds = data.attachmentIds;
		if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;
		if (data.metaData !== undefined) updateData.metaData = data.metaData;

		return prisma.assessment.update({
			where: { id },
			data: updateData,
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
				trainingSession: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Delete assessment
	 */
	static async deleteAssessment(id: string): Promise<AssessmentWithRelations> {
		return prisma.assessment.delete({
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
	 * Get assessments by training engagement
	 */
	static async getAssessmentsByTrainingEngagement(trainingEngagementId: string): Promise<AssessmentWithRelations[]> {
		return prisma.assessment.findMany({
			where: { trainingEngagementId },
			orderBy: { createdAt: "desc" },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
					},
				},
				trainingSession: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	}

	/**
	 * Get assessment count by type
	 */
	static async getAssessmentCountByType(): Promise<Record<string, number>> {
		const result = await prisma.assessment.groupBy({
			by: ["assessmentType"],
			_count: true,
		});

		return result.reduce(
			(acc, item) => {
				acc[item.assessmentType] = item._count;
				return acc;
			},
			{} as Record<string, number>,
		);
	}
}
