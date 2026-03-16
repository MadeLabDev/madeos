/**
 * TrainingCheckIn Service
 * Business logic for TrainingCheckIns
 */

import type { ActionResult } from "@/lib/types";

import { TrainingCheckInRepository } from "../repositories";
import type { CreateTrainingCheckInInput, TrainingCheckInWithRelations } from "../types";

export class TrainingCheckInService {
	/**
	 * Get all training check-ins with pagination and filtering
	 */
	static async getTrainingCheckIns(
		filters: {
			trainingRegistrationId?: string;
			trainingSessionId?: string;
			checkedInById?: string;
			checkedInAfter?: Date;
			checkedInBefore?: Date;
			search?: string;
		} = {},
		options: { skip?: number; take?: number } = {},
	): Promise<TrainingCheckInWithRelations[]> {
		try {
			return await TrainingCheckInRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch training check-ins: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single training check-in by ID
	 */
	static async getTrainingCheckInById(id: string): Promise<TrainingCheckInWithRelations | null> {
		try {
			return await TrainingCheckInRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch training check-in: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new training check-in
	 */
	static async createTrainingCheckIn(input: CreateTrainingCheckInInput & { checkedInById: string }): Promise<ActionResult<TrainingCheckInWithRelations>> {
		try {
			const checkIn = await TrainingCheckInRepository.create({
				...input,
			});

			return {
				success: true,
				message: "Training check-in created successfully",
				data: checkIn,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create training check-in",
			};
		}
	}

	/**
	 * Delete training check-in
	 */
	static async deleteTrainingCheckIn(id: string): Promise<ActionResult<TrainingCheckInWithRelations>> {
		try {
			const checkIn = await TrainingCheckInRepository.delete(id);

			return {
				success: true,
				message: "Training check-in deleted successfully",
				data: checkIn,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete training check-in",
			};
		}
	}
}
