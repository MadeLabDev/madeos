/**
 * TrainingEngagement Service
 * Business logic for TrainingEngagements
 */

import type { ActionResult } from "@/lib/types";

import { TrainingEngagementRepository } from "../repositories";
import type { CreateTrainingEngagementInput, TrainingEngagementFilters, TrainingEngagementWithRelations, UpdateTrainingEngagementInput } from "../types";

export class TrainingEngagementService {
	/**
	 * Get all training engagements with pagination and filtering
	 */
	static async getTrainingEngagements(filters: TrainingEngagementFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TrainingEngagementWithRelations[]> {
		try {
			return await TrainingEngagementRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch training engagements: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single training engagement by ID
	 */
	static async getTrainingEngagementById(id: string): Promise<TrainingEngagementWithRelations | null> {
		try {
			return await TrainingEngagementRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch training engagement: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new training engagement
	 */
	static async createTrainingEngagement(input: CreateTrainingEngagementInput & { createdBy: string }): Promise<ActionResult<TrainingEngagementWithRelations>> {
		try {
			const trainingEngagement = await TrainingEngagementRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Training engagement created successfully",
				data: trainingEngagement,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create training engagement",
			};
		}
	}

	/**
	 * Update training engagement
	 */
	static async updateTrainingEngagement(id: string, input: UpdateTrainingEngagementInput & { updatedBy: string }): Promise<ActionResult<TrainingEngagementWithRelations>> {
		try {
			// Check if training engagement exists
			const existingTrainingEngagement = await TrainingEngagementRepository.findById(id);
			if (!existingTrainingEngagement) {
				return {
					success: false,
					message: "Training engagement not found",
				};
			}

			const trainingEngagement = await TrainingEngagementRepository.update(id, input);

			return {
				success: true,
				message: "Training engagement updated successfully",
				data: trainingEngagement,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update training engagement",
			};
		}
	}

	/**
	 * Delete training engagement
	 */
	static async deleteTrainingEngagement(id: string): Promise<ActionResult<void>> {
		try {
			// Check if training engagement exists
			const existingTrainingEngagement = await TrainingEngagementRepository.findById(id);
			if (!existingTrainingEngagement) {
				return {
					success: false,
					message: "Training engagement not found",
				};
			}

			await TrainingEngagementRepository.delete(id);

			return {
				success: true,
				message: "Training engagement deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete training engagement",
			};
		}
	}
}
