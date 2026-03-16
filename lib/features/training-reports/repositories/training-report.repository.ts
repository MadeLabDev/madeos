import { prisma } from "@/lib/prisma";

import type { CreateTrainingReportInput, GetTrainingReportsOptions, ReportStatus, ReportType, TrainingReportWithRelations, UpdateTrainingReportInput } from "../types/training-report.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * TrainingReport Repository
 * Direct database operations for training reports
 */

export class TrainingReportRepository {
	/**
	 * Get all training reports with filters and pagination
	 */
	static async getAllTrainingReports(options: GetTrainingReportsOptions = {}) {
		const { page = 1, pageSize = 10, reportType, status, trainingEngagementId, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (reportType) {
			where.reportType = reportType;
		}

		if (status) {
			where.status = status;
		}

		if (trainingEngagementId) {
			where.trainingEngagementId = trainingEngagementId;
		}

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { keyFindings: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [trainingReports, total] = await Promise.all([
			prisma.trainingReport.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					trainingEngagement: {
						select: {
							id: true,
							title: true,
							status: true,
						},
					},
				},
				orderBy: { reportDate: "desc" },
			}),
			prisma.trainingReport.count({ where }),
		]);

		return {
			trainingReports,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get training report by ID
	 */
	static async getTrainingReportById(id: string): Promise<TrainingReportWithRelations | null> {
		return prisma.trainingReport.findUnique({
			where: { id },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get training report by engagement ID
	 */
	static async getTrainingReportByEngagement(trainingEngagementId: string): Promise<TrainingReportWithRelations | null> {
		return prisma.trainingReport.findUnique({
			where: { trainingEngagementId },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new training report
	 */
	static async createTrainingReport(data: CreateTrainingReportInput, userId?: string): Promise<TrainingReportWithRelations> {
		return prisma.trainingReport.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing training report
	 */
	static async updateTrainingReport(id: string, data: UpdateTrainingReportInput, userId?: string): Promise<TrainingReportWithRelations> {
		return prisma.trainingReport.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a training report
	 */
	static async deleteTrainingReport(id: string): Promise<TrainingReportWithRelations> {
		return prisma.trainingReport.delete({
			where: { id },
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of reports by status
	 */
	static async getTrainingReportCountByStatus(): Promise<Record<ReportStatus, number>> {
		const counts = await prisma.trainingReport.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<ReportStatus, number>;
	}

	/**
	 * Get count of reports by type
	 */
	static async getTrainingReportCountByType(): Promise<Record<ReportType, number>> {
		const counts = await prisma.trainingReport.groupBy({
			by: ["reportType"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.reportType] = item._count.id;
		});

		return result as Record<ReportType, number>;
	}

	/**
	 * Publish a training report
	 */
	static async publishTrainingReport(id: string, userId: string): Promise<TrainingReportWithRelations> {
		return prisma.trainingReport.update({
			where: { id },
			data: {
				status: "PUBLISHED",
				publishedAt: new Date(),
				publishedBy: userId,
				updatedBy: userId,
			},
			include: {
				trainingEngagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}
}
