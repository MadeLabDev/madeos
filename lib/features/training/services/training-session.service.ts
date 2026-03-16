/**
 * TrainingSession Service
 * Business logic for TrainingSessions
 */

import type { ActionResult } from "@/lib/types";

import { TrainingSessionRepository } from "../repositories";
import type { CreateTrainingSessionInput, TrainingSessionFilters, TrainingSessionWithRelations, UpdateTrainingSessionInput } from "../types";

export class TrainingSessionService {
	/**
	 * Get all training sessions with pagination and filtering
	 */
	static async getTrainingSessions(filters: TrainingSessionFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TrainingSessionWithRelations[]> {
		try {
			return await TrainingSessionRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch training sessions: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single training session by ID
	 */
	static async getTrainingSessionById(id: string): Promise<TrainingSessionWithRelations | null> {
		try {
			return await TrainingSessionRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch training session: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new training session
	 */
	static async createTrainingSession(input: CreateTrainingSessionInput & { createdBy: string }): Promise<ActionResult<TrainingSessionWithRelations>> {
		try {
			const trainingSession = await TrainingSessionRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Training session created successfully",
				data: trainingSession,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create training session",
			};
		}
	}

	/**
	 * Update training session
	 */
	static async updateTrainingSession(id: string, input: UpdateTrainingSessionInput & { updatedBy: string }): Promise<ActionResult<TrainingSessionWithRelations>> {
		try {
			// Check if training session exists
			const existingTrainingSession = await TrainingSessionRepository.findById(id);
			if (!existingTrainingSession) {
				return {
					success: false,
					message: "Training session not found",
				};
			}

			const trainingSession = await TrainingSessionRepository.update(id, input);

			return {
				success: true,
				message: "Training session updated successfully",
				data: trainingSession,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update training session",
			};
		}
	}

	/**
	 * Delete training session
	 */
	static async deleteTrainingSession(id: string): Promise<ActionResult<void>> {
		try {
			// Check if training session exists
			const existingTrainingSession = await TrainingSessionRepository.findById(id);
			if (!existingTrainingSession) {
				return {
					success: false,
					message: "Training session not found",
				};
			}

			await TrainingSessionRepository.delete(id);

			return {
				success: true,
				message: "Training session deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete training session",
			};
		}
	}
}
