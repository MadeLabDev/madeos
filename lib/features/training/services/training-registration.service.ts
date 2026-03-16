/**
 * TrainingRegistration Service
 * Business logic for TrainingRegistrations
 */

import type { ActionResult } from "@/lib/types";

import { TrainingRegistrationRepository } from "../repositories";
import type { CreateTrainingRegistrationInput, TrainingRegistrationFilters, TrainingRegistrationListParams, TrainingRegistrationWithRelations, UpdateTrainingRegistrationInput } from "../types";

export class TrainingRegistrationService {
	/**
	 * Get all training registrations with pagination and filtering
	 */
	static async getTrainingRegistrations(filters: TrainingRegistrationFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TrainingRegistrationWithRelations[]> {
		try {
			return await TrainingRegistrationRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch training registrations: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get paginated training registrations
	 */
	static async getTrainingRegistrationsPaginated(params: TrainingRegistrationListParams): Promise<{
		registrations: TrainingRegistrationWithRelations[];
		total: number;
		page: number;
		pageSize: number;
		hasMore: boolean;
	}> {
		try {
			const page = params.page || 1;
			const pageSize = params.limit || 10;
			const skip = (page - 1) * pageSize;

			const filters: TrainingRegistrationFilters = {
				trainingEngagementId: params.trainingEngagementId,
				userId: params.userId,
				contactId: params.contactId,
				status: params.status,
				registrationSource: params.registrationSource,
				checkedIn: params.checkedIn,
				registeredAfter: params.registeredAfter,
				registeredBefore: params.registeredBefore,
				search: params.search,
			};

			const [registrations, total] = await Promise.all([TrainingRegistrationRepository.findMany(filters, { skip, take: pageSize }), TrainingRegistrationRepository.count(filters)]);

			return {
				registrations,
				total,
				page,
				pageSize,
				hasMore: page * pageSize < total,
			};
		} catch (error) {
			throw new Error(`Failed to fetch paginated training registrations: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single training registration by ID
	 */
	static async getTrainingRegistrationById(id: string): Promise<TrainingRegistrationWithRelations | null> {
		try {
			return await TrainingRegistrationRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch training registration: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new training registration
	 */
	static async createTrainingRegistration(input: CreateTrainingRegistrationInput & { createdBy: string }): Promise<ActionResult<TrainingRegistrationWithRelations>> {
		try {
			// Validate that either userId or contactId is provided
			if (!input.userId && !input.contactId) {
				return {
					success: false,
					message: "Either userId or contactId must be provided",
				};
			}

			// Check if user/contact is already registered for this training
			const existing = await TrainingRegistrationRepository.findMany({
				trainingEngagementId: input.trainingEngagementId,
				userId: input.userId,
				contactId: input.contactId,
			});

			if (existing.length > 0) {
				return {
					success: false,
					message: "User/Contact is already registered for this training",
				};
			}

			const registration = await TrainingRegistrationRepository.create({
				...input,
			});

			return {
				success: true,
				message: "Training registration created successfully",
				data: registration,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create training registration",
			};
		}
	}

	/**
	 * Update training registration
	 */
	static async updateTrainingRegistration(input: UpdateTrainingRegistrationInput & { updatedBy: string }): Promise<ActionResult<TrainingRegistrationWithRelations>> {
		try {
			const registration = await TrainingRegistrationRepository.update(input.id, {
				...input,
			});

			return {
				success: true,
				message: "Training registration updated successfully",
				data: registration,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update training registration",
			};
		}
	}

	/**
	 * Delete training registration
	 */
	static async deleteTrainingRegistration(id: string): Promise<ActionResult<TrainingRegistrationWithRelations>> {
		try {
			const registration = await TrainingRegistrationRepository.delete(id);

			return {
				success: true,
				message: "Training registration deleted successfully",
				data: registration,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete training registration",
			};
		}
	}

	/**
	 * Check in a training registration
	 */
	static async checkInTrainingRegistration(id: string, checkedInById: string): Promise<ActionResult<TrainingRegistrationWithRelations>> {
		try {
			const registration = await TrainingRegistrationRepository.checkIn(id, checkedInById);

			return {
				success: true,
				message: "Training registration checked in successfully",
				data: registration,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to check in training registration",
			};
		}
	}

	/**
	 * Get user training registrations
	 */
	static async getUserTrainingRegistrations(userId: string): Promise<TrainingRegistrationWithRelations[]> {
		try {
			return await TrainingRegistrationRepository.findMany({ userId });
		} catch (error) {
			throw new Error(`Failed to fetch user training registrations: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
