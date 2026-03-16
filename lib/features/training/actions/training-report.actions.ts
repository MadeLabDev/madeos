/**
 * TrainingReport Actions
 * Server actions for TrainingReports
 */

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { TrainingReportService } from "../services";
import type { CreateTrainingReportInput, TrainingReportWithRelations, UpdateTrainingReportInput } from "../types";

/**
 * Get training reports by engagement ID
 */
export async function getTrainingReportsAction(filters: { trainingEngagementId?: string } = {}): Promise<ActionResult<TrainingReportWithRelations[]>> {
	try {
		await requirePermission("training", "read");

		const reports = await TrainingReportService.getTrainingReports(filters);

		return {
			success: true,
			message: "Training reports retrieved successfully",
			data: reports,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve training reports",
		};
	}
}

/**
 * Get training report by ID
 */
export async function getTrainingReportById(id: string): Promise<ActionResult<TrainingReportWithRelations | null>> {
	try {
		await requirePermission("training", "read");

		const report = await TrainingReportService.getTrainingReportById(id);

		return {
			success: true,
			message: "Training report retrieved successfully",
			data: report,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve training report",
		};
	}
}

/**
 * Create training report
 */
export async function createTrainingReportAction(input: CreateTrainingReportInput): Promise<ActionResult<TrainingReportWithRelations>> {
	try {
		await requirePermission("training", "create");

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
			};
		}

		const result = await TrainingReportService.createTrainingReport({
			...input,
			createdBy: session.user.id,
		});

		if (result.success) {
			revalidatePath(`/training-support/${input.trainingEngagementId}`);
			await broadcastToAll("training_report_update", {
				action: "training_report_created",
				trainingReport: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create training report",
		};
	}
}

/**
 * Update training report
 */
export async function updateTrainingReportAction(id: string, input: UpdateTrainingReportInput): Promise<ActionResult<TrainingReportWithRelations>> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
			};
		}

		const result = await TrainingReportService.updateTrainingReport(id, {
			...input,
			updatedBy: session.user.id,
		});

		if (result.success) {
			revalidatePath(`/training-support/${result.data?.trainingEngagementId}`);
			await broadcastToAll("training_report_update", {
				action: "training_report_updated",
				trainingReport: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update training report",
		};
	}
}

/**
 * Delete training report
 */
export async function deleteTrainingReportAction(id: string): Promise<ActionResult<void>> {
	try {
		await requirePermission("training", "delete");

		const result = await TrainingReportService.deleteTrainingReport(id);

		if (result.success) {
			// Note: We can't get engagementId here, so revalidate broadly
			revalidatePath("/training-support");
			await broadcastToAll("training_report_update", {
				action: "training_report_deleted",
				trainingReportId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete training report",
		};
	}
}

/**
 * Publish training report
 */
export async function publishTrainingReportAction(id: string): Promise<ActionResult<TrainingReportWithRelations>> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
			};
		}

		const result = await TrainingReportService.publishTrainingReport(id, session.user.id);

		if (result.success) {
			revalidatePath(`/training-support/${result.data?.trainingEngagementId}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to publish training report",
		};
	}
}
