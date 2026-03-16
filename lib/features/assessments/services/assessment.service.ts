import type { ActionResult } from "@/lib/types";

import { AssessmentRepository } from "../repositories/assessment.repository";
import type { AssessmentListResult, AssessmentWithRelations, CreateAssessmentInput, GetAssessmentsOptions, UpdateAssessmentInput } from "../types/assessment.types";

/**
 * Assessment Service
 * Business logic and validation for assessment management
 */

export class AssessmentService {
	/**
	 * Get all assessments with pagination
	 */
	static async getAllAssessments(options: GetAssessmentsOptions = {}): Promise<AssessmentListResult> {
		const { page = 1, limit = 10 } = options;

		const { assessments, total } = await AssessmentRepository.getAllAssessments(options);

		const totalPages = Math.ceil(total / limit);

		return {
			assessments,
			total,
			page,
			limit,
			totalPages,
		};
	}

	/**
	 * Get assessment by ID
	 */
	static async getAssessmentById(id: string): Promise<ActionResult<AssessmentWithRelations>> {
		try {
			const assessment = await AssessmentRepository.getAssessmentById(id);

			if (!assessment) {
				return {
					success: false,
					message: "Assessment not found",
				};
			}

			return {
				success: true,
				message: "Assessment retrieved successfully",
				data: assessment,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve assessment";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Create new assessment
	 */
	static async createAssessment(data: CreateAssessmentInput): Promise<ActionResult<AssessmentWithRelations>> {
		try {
			// Validate required fields
			if (!data.title?.trim()) {
				return {
					success: false,
					message: "Title is required",
				};
			}

			if (!data.trainingEngagementId) {
				return {
					success: false,
					message: "Training engagement is required",
				};
			}

			const assessment = await AssessmentRepository.createAssessment(data);

			return {
				success: true,
				message: "Assessment created successfully",
				data: assessment,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create assessment";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Update assessment
	 */
	static async updateAssessment(id: string, data: UpdateAssessmentInput): Promise<ActionResult<AssessmentWithRelations>> {
		try {
			// Check if assessment exists
			const existing = await AssessmentRepository.getAssessmentById(id);
			if (!existing) {
				return {
					success: false,
					message: "Assessment not found",
				};
			}

			// Validate title if provided
			if (data.title !== undefined && !data.title?.trim()) {
				return {
					success: false,
					message: "Title cannot be empty",
				};
			}

			const assessment = await AssessmentRepository.updateAssessment(id, data);

			return {
				success: true,
				message: "Assessment updated successfully",
				data: assessment,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update assessment";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Delete assessment
	 */
	static async deleteAssessment(id: string): Promise<ActionResult<AssessmentWithRelations>> {
		try {
			// Check if assessment exists
			const existing = await AssessmentRepository.getAssessmentById(id);
			if (!existing) {
				return {
					success: false,
					message: "Assessment not found",
				};
			}

			const assessment = await AssessmentRepository.deleteAssessment(id);

			return {
				success: true,
				message: "Assessment deleted successfully",
				data: assessment,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete assessment";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Get assessments by training engagement
	 */
	static async getAssessmentsByTrainingEngagement(trainingEngagementId: string): Promise<ActionResult<AssessmentWithRelations[]>> {
		try {
			const assessments = await AssessmentRepository.getAssessmentsByTrainingEngagement(trainingEngagementId);

			return {
				success: true,
				message: "Assessments retrieved successfully",
				data: assessments,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve assessments";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Get assessment statistics
	 */
	static async getAssessmentStatistics(): Promise<ActionResult<any>> {
		try {
			const countsByType = await AssessmentRepository.getAssessmentCountByType();

			return {
				success: true,
				message: "Statistics retrieved successfully",
				data: {
					countsByType,
				},
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve statistics";
			return {
				success: false,
				message,
			};
		}
	}
}
