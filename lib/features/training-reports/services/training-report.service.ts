import { TrainingReportRepository } from "../repositories/training-report.repository";
import type { CreateTrainingReportInput, GetTrainingReportsOptions, UpdateTrainingReportInput } from "../types/training-report.types";

/**
 * TrainingReport Service
 * Business logic and validation for training reports
 */

export class TrainingReportService {
	/**
	 * Get all training reports with filters
	 */
	static async getAllTrainingReports(options: GetTrainingReportsOptions = {}) {
		return TrainingReportRepository.getAllTrainingReports(options);
	}

	/**
	 * Get training report by ID
	 */
	static async getTrainingReportById(id: string) {
		return TrainingReportRepository.getTrainingReportById(id);
	}

	/**
	 * Get training report by engagement ID
	 */
	static async getTrainingReportByEngagement(trainingEngagementId: string) {
		return TrainingReportRepository.getTrainingReportByEngagement(trainingEngagementId);
	}

	/**
	 * Create a new training report
	 */
	static async createTrainingReport(data: CreateTrainingReportInput, userId?: string) {
		// Validation
		if (!data.title?.trim()) {
			throw new Error("Title is required");
		}

		if (!data.trainingEngagementId) {
			throw new Error("Training engagement is required");
		}

		// Check if report already exists for this engagement
		const existing = await TrainingReportRepository.getTrainingReportByEngagement(data.trainingEngagementId);
		if (existing) {
			throw new Error("A report already exists for this training engagement");
		}

		// Validate metrics
		if (data.totalParticipants !== undefined && data.totalParticipants < 0) {
			throw new Error("Total participants cannot be negative");
		}

		if (data.totalAttended !== undefined && data.totalAttended < 0) {
			throw new Error("Total attended cannot be negative");
		}

		if (data.totalAttended !== undefined && data.totalParticipants !== undefined && data.totalAttended > data.totalParticipants) {
			throw new Error("Total attended cannot exceed total participants");
		}

		if (data.completionRate !== undefined && (data.completionRate < 0 || data.completionRate > 100)) {
			throw new Error("Completion rate must be between 0 and 100");
		}

		if (data.averageScore !== undefined && (data.averageScore < 0 || data.averageScore > 100)) {
			throw new Error("Average score must be between 0 and 100");
		}

		return TrainingReportRepository.createTrainingReport(data, userId);
	}

	/**
	 * Update an existing training report
	 */
	static async updateTrainingReport(id: string, data: UpdateTrainingReportInput, userId?: string) {
		// Validation
		if (data.title !== undefined && !data.title.trim()) {
			throw new Error("Title cannot be empty");
		}

		// Validate metrics
		if (data.totalParticipants !== undefined && data.totalParticipants < 0) {
			throw new Error("Total participants cannot be negative");
		}

		if (data.totalAttended !== undefined && data.totalAttended < 0) {
			throw new Error("Total attended cannot be negative");
		}

		if (data.completionRate !== undefined && (data.completionRate < 0 || data.completionRate > 100)) {
			throw new Error("Completion rate must be between 0 and 100");
		}

		if (data.averageScore !== undefined && (data.averageScore < 0 || data.averageScore > 100)) {
			throw new Error("Average score must be between 0 and 100");
		}

		return TrainingReportRepository.updateTrainingReport(id, data, userId);
	}

	/**
	 * Delete a training report
	 */
	static async deleteTrainingReport(id: string) {
		return TrainingReportRepository.deleteTrainingReport(id);
	}

	/**
	 * Publish a training report
	 */
	static async publishTrainingReport(id: string, userId: string) {
		// Get report to verify it exists
		const report = await TrainingReportRepository.getTrainingReportById(id);
		if (!report) {
			throw new Error("Training report not found");
		}

		if (report.status === "PUBLISHED") {
			throw new Error("Report is already published");
		}

		return TrainingReportRepository.publishTrainingReport(id, userId);
	}

	/**
	 * Get training report statistics
	 */
	static async getTrainingReportStatistics() {
		const [countByStatus, countByType] = await Promise.all([TrainingReportRepository.getTrainingReportCountByStatus(), TrainingReportRepository.getTrainingReportCountByType()]);

		return {
			byStatus: countByStatus,
			byType: countByType,
		};
	}
}
