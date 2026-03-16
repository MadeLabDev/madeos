/**
 * TrainingReport Repository
 * Database operations for TrainingReports
 */

import { prisma } from "@/lib/prisma";

import "server-only";

import { CreateTrainingReportInput, TrainingReportWithRelations, UpdateTrainingReportInput } from "../types";

export class TrainingReportRepository {
	/**
	 * Find multiple training reports with filters
	 */
	static async findMany(filters: { trainingEngagementId?: string } = {}): Promise<TrainingReportWithRelations[]> {
		const where: any = {};
		if (filters.trainingEngagementId) {
			where.trainingEngagementId = filters.trainingEngagementId;
		}

		return prisma.trainingReport.findMany({
			where,
			include: {
				trainingEngagement: {
					include: {
						customer: true,
						contact: true,
						sessions: true,
						registrations: {
							include: {
								user: true,
								contact: true,
								checkIns: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Find training report by ID with relations
	 */
	static async findById(id: string): Promise<TrainingReportWithRelations | null> {
		return prisma.trainingReport.findUnique({
			where: { id },
			include: {
				trainingEngagement: {
					include: {
						customer: true,
						contact: true,
						sessions: true,
						registrations: {
							include: {
								user: true,
								contact: true,
								checkIns: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Find training report by engagement ID
	 */
	static async findByEngagementId(engagementId: string): Promise<TrainingReportWithRelations | null> {
		return prisma.trainingReport.findUnique({
			where: { trainingEngagementId: engagementId },
			include: {
				trainingEngagement: {
					include: {
						customer: true,
						contact: true,
						sessions: true,
						registrations: {
							include: {
								user: true,
								contact: true,
								checkIns: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Create new training report
	 */
	static async create(input: CreateTrainingReportInput & { createdBy: string; updatedBy: string }): Promise<TrainingReportWithRelations> {
		return prisma.trainingReport.create({
			data: input,
			include: {
				trainingEngagement: {
					include: {
						customer: true,
						contact: true,
						sessions: true,
						registrations: {
							include: {
								user: true,
								contact: true,
								checkIns: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Update training report
	 */
	static async update(id: string, input: UpdateTrainingReportInput & { updatedBy: string }): Promise<TrainingReportWithRelations | null> {
		try {
			return await prisma.trainingReport.update({
				where: { id },
				data: input,
				include: {
					trainingEngagement: {
						include: {
							customer: true,
							contact: true,
							sessions: true,
							registrations: {
								include: {
									user: true,
									contact: true,
									checkIns: true,
								},
							},
						},
					},
				},
			});
		} catch (error) {
			return null;
		}
	}

	/**
	 * Delete training report
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await prisma.trainingReport.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			return false;
		}
	}
}
