/**
 * TrainingSession Actions
 * Server actions for TrainingSessions
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { TrainingSessionService } from "../services";
import { TrainingEngagementService } from "../services";
import { CreateTrainingSessionInput, UpdateTrainingSessionInput } from "../types";

/**
 * Get training sessions for selection
 */
export async function getTrainingSessions(filters: Parameters<typeof TrainingSessionService.getTrainingSessions>[0] = {}, options: Parameters<typeof TrainingSessionService.getTrainingSessions>[1] = {}) {
	try {
		const trainingSessions = await TrainingSessionService.getTrainingSessions(filters, options);

		return {
			success: true,
			data: trainingSessions,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch training sessions: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get training engagements for session creation selection
 */
export async function getTrainingEngagementsForSelection() {
	try {
		const trainingEngagements = await TrainingEngagementService.getTrainingEngagements({}, { take: 100 });

		return {
			success: true,
			data: trainingEngagements.map((engagement) => ({
				value: engagement.id,
				label: `${engagement.title} (${engagement.customer?.name || "No Customer"})`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch training engagements: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single training session by ID
 */
export async function getTrainingSessionById(id: string) {
	try {
		const trainingSession = await TrainingSessionService.getTrainingSessionById(id);

		return {
			success: true,
			data: trainingSession,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch training session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new training session
 */
export async function createTrainingSession(data: CreateTrainingSessionInput) {
	try {
		const user = await requirePermission("training", "create");

		const result = await TrainingSessionService.createTrainingSession({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/training");
			await broadcastToAll("training_session_update", {
				action: "training_session_created",
				session: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create training session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update training session
 */
export async function updateTrainingSession(id: string, data: UpdateTrainingSessionInput) {
	try {
		const user = await requirePermission("training", "update");

		const result = await TrainingSessionService.updateTrainingSession(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/training");
			revalidatePath(`/training/sessions/${id}`);
			await broadcastToAll("training_session_update", {
				action: "training_session_updated",
				session: result.data,
				sessionId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update training session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete training session
 */
export async function deleteTrainingSession(id: string) {
	try {
		await requirePermission("training", "delete");

		const result = await TrainingSessionService.deleteTrainingSession(id);

		if (result.success) {
			revalidatePath("/training");
			await broadcastToAll("training_session_update", {
				action: "training_session_deleted",
				sessionId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete training session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
