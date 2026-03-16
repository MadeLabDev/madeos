/**
 * TrainingEngagement Actions
 * Server actions for TrainingEngagements
 */

"use server";

import { revalidatePath } from "next/cache";

import { EngagementType } from "@/generated/prisma/enums";
import { createEngagementAction } from "@/lib/features/customers/actions";
import type { EngagementResponse } from "@/lib/features/customers/types";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { TrainingEngagementService } from "../services";
import { CreateTrainingEngagementFormInput, CreateTrainingEngagementInput, UpdateTrainingEngagementInput } from "../types";

/**
 * Get training engagements for selection (no permission required for basic listing)
 */
export async function getTrainingEngagements(filters: Parameters<typeof TrainingEngagementService.getTrainingEngagements>[0] = {}, options: Parameters<typeof TrainingEngagementService.getTrainingEngagements>[1] = {}) {
	try {
		const trainingEngagements = await TrainingEngagementService.getTrainingEngagements(filters, options);

		return {
			success: true,
			data: trainingEngagements,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch training engagements: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get training engagements list with filters for admin interface
 */
export async function getTrainingEngagementsList(filters: Parameters<typeof TrainingEngagementService.getTrainingEngagements>[0] = {}, options: Parameters<typeof TrainingEngagementService.getTrainingEngagements>[1] = {}) {
	try {
		const trainingEngagements = await TrainingEngagementService.getTrainingEngagements(filters, options);

		return {
			success: true,
			data: trainingEngagements,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch training engagements: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single training engagement by ID
 */
export async function getTrainingEngagementById(id: string) {
	try {
		const trainingEngagement = await TrainingEngagementService.getTrainingEngagementById(id);

		return {
			success: true,
			data: trainingEngagement,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch training engagement: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new training engagement
 */
export async function createTrainingEngagement(data: CreateTrainingEngagementFormInput) {
	try {
		const user = await requirePermission("training", "create");

		// First create the base engagement
		const engagementResult = await createEngagementAction({
			customerId: data.customerId,
			title: data.title,
			type: EngagementType.TRAINING,
			description: data.description,
			startDate: data.startDate,
			dueDate: data.endDate,
			assignedTo: data.instructorId,
		});

		if (!engagementResult.success) {
			return {
				success: false,
				message: `Failed to create engagement: ${engagementResult.message}`,
			};
		}

		const engagement = engagementResult.data as EngagementResponse;

		// Then create the training engagement
		const trainingInput: CreateTrainingEngagementInput = {
			engagementId: engagement.id,
			...data,
		};

		const result = await TrainingEngagementService.createTrainingEngagement({
			...trainingInput,
			createdBy: user.id,
		});

		if (result.success) {
			if (result.data) {
				await broadcastToAll("training_engagement_update", {
					action: "training_engagement_created",
					engagement: result.data,
					timestamp: new Date().toISOString(),
				});
			}
			revalidatePath("/training-support");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create training engagement: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update training engagement
 */
export async function updateTrainingEngagement(id: string, data: UpdateTrainingEngagementInput) {
	try {
		const user = await requirePermission("training", "update");

		const result = await TrainingEngagementService.updateTrainingEngagement(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			if (result.data) {
				await broadcastToAll("training_engagement_update", {
					action: "training_engagement_updated",
					engagement: result.data,
					timestamp: new Date().toISOString(),
				});
			}
			revalidatePath("/training-support");
			revalidatePath(`/training/${id}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update training engagement: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete training engagement
 */
export async function deleteTrainingEngagement(id: string) {
	try {
		await requirePermission("training", "delete");

		const result = await TrainingEngagementService.deleteTrainingEngagement(id);

		if (result.success) {
			revalidatePath("/training-support");
			await broadcastToAll("training_engagement_update", {
				action: "training_engagement_deleted",
				engagement: { id },
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete training engagement: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
