/**
 * Training Registration Actions
 * Server actions for Training Registrations
 */

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

import { TrainingRegistrationRepository } from "../repositories";
import { TrainingCheckInService, TrainingRegistrationService } from "../services";
import type { CreateTrainingCheckInInput, CreateTrainingRegistrationInput, TrainingCheckInActionResult, TrainingRegistrationActionResult, TrainingRegistrationWithRelations, UpdateTrainingRegistrationInput } from "../types";

/**
 * Create training registration
 */
export async function createTrainingRegistrationAction(input: CreateTrainingRegistrationInput): Promise<TrainingRegistrationActionResult> {
	await requirePermission("training", "create");

	const session = await auth();
	const userId = session?.user?.id || "system";

	const result = await TrainingRegistrationService.createTrainingRegistration({
		...input,
		createdBy: userId,
	});

	if (result.success) {
		revalidatePath("/training-support/attendees");
		revalidatePath("/training-support/my-registrations");
		if (input.trainingEngagementId) {
			revalidatePath(`/training-support/${input.trainingEngagementId}/registrations`);
		}
	}

	return result;
}

/**
 * Update training registration
 */
export async function updateTrainingRegistrationAction(input: UpdateTrainingRegistrationInput): Promise<TrainingRegistrationActionResult> {
	await requirePermission("training", "update");

	const session = await auth();
	const userId = session?.user?.id || "system";

	const result = await TrainingRegistrationService.updateTrainingRegistration({
		...input,
		updatedBy: userId,
	});

	if (result.success) {
		revalidatePath("/training-support/attendees");
		revalidatePath("/training-support/my-registrations");
		if (result.data?.trainingEngagementId) {
			revalidatePath(`/training-support/${result.data.trainingEngagementId}/registrations`);
		}
	}

	return result;
}

/**
 * Delete training registration
 */
export async function deleteTrainingRegistrationAction(id: string): Promise<TrainingRegistrationActionResult> {
	await requirePermission("training", "delete");

	const result = await TrainingRegistrationService.deleteTrainingRegistration(id);

	if (result.success) {
		revalidatePath("/training-support/attendees");
		revalidatePath("/training-support/my-registrations");
		if (result.data?.trainingEngagementId) {
			revalidatePath(`/training-support/${result.data.trainingEngagementId}/registrations`);
		}
	}

	return result;
}

/**
 * Get training registrations for check-in
 */
export async function getTrainingRegistrations(
	trainingEngagementId: string,
	pagination?: { skip?: number; take?: number },
	filters?: { search?: string; status?: string },
): Promise<{
	success: boolean;
	data?: TrainingRegistrationWithRelations[] | { registrations: TrainingRegistrationWithRelations[]; total: number };
	message: string;
}> {
	try {
		await requirePermission("training", "read");

		const result = pagination
			? await TrainingRegistrationService.getTrainingRegistrationsPaginated({
					trainingEngagementId,
					page: Math.floor((pagination.skip || 0) / (pagination.take || 10)) + 1,
					limit: pagination.take || 10,
					search: filters?.search,
					status: filters?.status as any,
				})
			: await TrainingRegistrationService.getTrainingRegistrations(
					{
						trainingEngagementId,
						search: filters?.search,
						status: filters?.status as any,
					},
					pagination,
				);

		if (pagination) {
			return {
				success: true,
				data: result,
				message: "Training registrations retrieved successfully",
			};
		} else {
			return {
				success: true,
				data: result,
				message: "Training registrations retrieved successfully",
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to get training registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Search training registrations by user name or email for a specific training engagement
 */
export async function searchTrainingRegistration(trainingEngagementId: string, searchTerm: string) {
	try {
		await requirePermission("training", "read");

		const result = await TrainingRegistrationService.getTrainingRegistrations({
			trainingEngagementId,
			search: searchTerm,
		});

		if (result && result.length > 0) {
			return {
				success: true,
				data: result[0], // Return the first match
				message: "Training registration found successfully",
			};
		} else {
			return {
				success: false,
				message: "No training registration found",
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to search training registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Check in training registration
 */
export async function checkInTrainingRegistrationAction(id: string): Promise<TrainingRegistrationActionResult> {
	await requirePermission("training", "update");

	const session = await auth();
	const userId = session?.user?.id || "system";

	const result = await TrainingRegistrationService.checkInTrainingRegistration(id, userId);

	if (result.success) {
		revalidatePath("/training-support/attendees");
		revalidatePath("/training-support/check-in");
		if (result.data?.trainingEngagementId) {
			revalidatePath(`/training-support/${result.data.trainingEngagementId}/registrations`);
		}
	}

	return result;
}

/**
 * Create training check-in
 */
export async function createTrainingCheckInAction(input: CreateTrainingCheckInInput): Promise<TrainingCheckInActionResult> {
	await requirePermission("training", "create");

	const session = await auth();
	const userId = session?.user?.id || "system";

	const result = await TrainingCheckInService.createTrainingCheckIn({
		...input,
		checkedInById: userId,
	});

	if (result.success) {
		revalidatePath("/training-support/check-in");
	}

	return result;
}

/**
 * Delete training check-in
 */
export async function deleteTrainingCheckInAction(id: string): Promise<TrainingCheckInActionResult> {
	await requirePermission("training", "delete");

	const result = await TrainingCheckInService.deleteTrainingCheckIn(id);

	if (result.success) {
		revalidatePath("/training-support/check-in");
	}

	return result;
}

/**
 * Get recent training check-ins
 */
export async function getRecentTrainingCheckIns(pagination?: { page?: number; pageSize?: number }) {
	try {
		await requirePermission("training", "read");

		const page = pagination?.page || 1;
		const pageSize = pagination?.pageSize || 10;
		const skip = (page - 1) * pageSize;

		// Get registrations that have been checked in, ordered by check-in time
		const registrations = await TrainingRegistrationService.getTrainingRegistrations(
			{
				checkedIn: true,
			},
			{ skip, take: pageSize },
		);

		// Sort by check-in time (most recent first)
		const sortedRegistrations = registrations.sort((a, b) => {
			if (!a.checkedInAt || !b.checkedInAt) return 0;
			return new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime();
		});

		// Get total count of checked-in registrations
		const total = await TrainingRegistrationRepository.count({ checkedIn: true });

		return {
			success: true,
			data: sortedRegistrations,
			total,
			message: "Recent training check-ins retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get recent training check-ins: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get user training registrations
 */
export async function getUserTrainingRegistrations(userId: string) {
	try {
		await requirePermission("training", "read");

		const result = await TrainingRegistrationService.getUserTrainingRegistrations(userId);

		return {
			success: true,
			data: result,
			message: "User training registrations retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get user training registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
