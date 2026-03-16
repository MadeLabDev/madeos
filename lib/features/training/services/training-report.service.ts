/**
 * TrainingReport Service
 * Business logic for TrainingReports
 */

import type { ActionResult } from "@/lib/types";

import { TrainingReportRepository } from "../repositories";
import type { CreateTrainingReportInput, TrainingReportWithRelations, UpdateTrainingReportInput } from "../types";

export class TrainingReportService {
	/**
	 * Get training reports with filters
	 */
	static async getTrainingReports(filters: { trainingEngagementId?: string } = {}): Promise<TrainingReportWithRelations[]> {
		try {
			return await TrainingReportRepository.findMany(filters);
		} catch (error) {
			throw new Error(`Failed to fetch training reports: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get training report by training engagement ID
	 */
	static async getTrainingReportByEngagementId(engagementId: string): Promise<TrainingReportWithRelations | null> {
		try {
			return await TrainingReportRepository.findByEngagementId(engagementId);
		} catch (error) {
			throw new Error(`Failed to fetch training report: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single training report by ID
	 */
	static async getTrainingReportById(id: string): Promise<TrainingReportWithRelations | null> {
		try {
			return await TrainingReportRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch training report: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new training report
	 */
	static async createTrainingReport(input: CreateTrainingReportInput & { createdBy: string }): Promise<ActionResult<TrainingReportWithRelations>> {
		try {
			// Check if report already exists for this engagement
			const existing = await TrainingReportRepository.findByEngagementId(input.trainingEngagementId);
			if (existing) {
				return {
					success: false,
					message: "Training report already exists for this engagement",
				};
			}

			const trainingReport = await TrainingReportRepository.create({
				...input,
				createdBy: input.createdBy,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Training report created successfully",
				data: trainingReport,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create training report",
			};
		}
	}

	/**
	 * Update training report
	 */
	static async updateTrainingReport(id: string, input: UpdateTrainingReportInput & { updatedBy: string }): Promise<ActionResult<TrainingReportWithRelations>> {
		try {
			const trainingReport = await TrainingReportRepository.update(id, {
				...input,
				updatedBy: input.updatedBy,
			});

			if (!trainingReport) {
				return {
					success: false,
					message: "Training report not found",
				};
			}

			return {
				success: true,
				message: "Training report updated successfully",
				data: trainingReport,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update training report",
			};
		}
	}

	/**
	 * Delete training report
	 */
	static async deleteTrainingReport(id: string): Promise<ActionResult<void>> {
		try {
			const deleted = await TrainingReportRepository.delete(id);

			if (!deleted) {
				return {
					success: false,
					message: "Training report not found",
				};
			}

			return {
				success: true,
				message: "Training report deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete training report",
			};
		}
	}

	/**
	 * Publish training report
	 */
	static async publishTrainingReport(id: string, publishedBy: string): Promise<ActionResult<TrainingReportWithRelations>> {
		try {
			const trainingReport = await TrainingReportRepository.update(id, {
				status: "PUBLISHED",
				publishedAt: new Date(),
				publishedBy,
				updatedBy: publishedBy,
			});

			if (!trainingReport) {
				return {
					success: false,
					message: "Training report not found",
				};
			}

			return {
				success: true,
				message: "Training report published successfully",
				data: trainingReport,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to publish training report",
			};
		}
	}
}
