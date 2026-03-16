/**
 * Assessment Service
 * Business logic for Assessments
 */

import type { ActionResult } from "@/lib/types";

import { AssessmentRepository } from "../repositories";
import type { AssessmentFilters, AssessmentWithRelations, CreateAssessmentInput, UpdateAssessmentInput } from "../types";

export class AssessmentService {
	/**
	 * Get all assessments with pagination and filtering
	 */
	static async getAssessments(filters: AssessmentFilters = {}, options: { skip?: number; take?: number } = {}): Promise<AssessmentWithRelations[]> {
		try {
			return await AssessmentRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch assessments: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single assessment by ID
	 */
	static async getAssessmentById(id: string): Promise<AssessmentWithRelations | null> {
		try {
			return await AssessmentRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch assessment: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new assessment
	 */
	static async createAssessment(input: CreateAssessmentInput & { createdBy: string }): Promise<ActionResult<AssessmentWithRelations>> {
		try {
			const assessment = await AssessmentRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Assessment created successfully",
				data: assessment,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create assessment",
			};
		}
	}

	/**
	 * Update assessment
	 */
	static async updateAssessment(id: string, input: UpdateAssessmentInput & { updatedBy: string }): Promise<ActionResult<AssessmentWithRelations>> {
		try {
			// Check if assessment exists
			const existingAssessment = await AssessmentRepository.findById(id);
			if (!existingAssessment) {
				return {
					success: false,
					message: "Assessment not found",
				};
			}

			const assessment = await AssessmentRepository.update(id, input);

			return {
				success: true,
				message: "Assessment updated successfully",
				data: assessment,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update assessment",
			};
		}
	}

	/**
	 * Delete assessment
	 */
	static async deleteAssessment(id: string): Promise<ActionResult<void>> {
		try {
			// Check if assessment exists
			const existingAssessment = await AssessmentRepository.findById(id);
			if (!existingAssessment) {
				return {
					success: false,
					message: "Assessment not found",
				};
			}

			await AssessmentRepository.delete(id);

			return {
				success: true,
				message: "Assessment deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete assessment",
			};
		}
	}
}
