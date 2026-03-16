"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { AssessmentService } from "../services/assessment.service";
import type { CreateAssessmentInput, GetAssessmentsOptions, UpdateAssessmentInput } from "../types/assessment.types";

/**
 * Get all assessments with filters and pagination
 */
export async function listAssessmentsAction(options?: GetAssessmentsOptions): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		const result = await AssessmentService.getAllAssessments(options);

		return {
			success: true,
			data: result,
			message: "Assessments retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve assessments";
		console.error("[listAssessmentsAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get single assessment
 */
export async function getAssessmentAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await AssessmentService.getAssessmentById(id);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve assessment";
		console.error("[getAssessmentAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Create new assessment
 */
export async function createAssessmentAction(data: CreateAssessmentInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "create");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await AssessmentService.createAssessment({
			...data,
			createdBy: userId,
		});

		if (result.success && result.data) {
			// Emit Pusher event (don't fail if Pusher fails)
			try {
				await getPusher().trigger("private-global", "assessment_update", {
					action: "assessment_created",
					assessment: result.data,
				});
			} catch (pusherError) {
				console.warn("[createAssessmentAction] Pusher event failed:", pusherError);
			}

			// Revalidate paths
			revalidatePath("/training-support/assessments");
			if (data.trainingEngagementId) {
				revalidatePath(`/training-support/${data.trainingEngagementId}`);
			}
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create assessment";
		console.error("[createAssessmentAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Update assessment
 */
export async function updateAssessmentAction(id: string, data: UpdateAssessmentInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await AssessmentService.updateAssessment(id, {
			...data,
			updatedBy: userId,
		});

		if (result.success && result.data) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "assessment_update", {
				action: "assessment_updated",
				assessment: result.data,
			});

			// Revalidate paths
			revalidatePath("/training-support/assessments");
			revalidatePath(`/training-support/assessments/${id}`);
			if (result.data.trainingEngagementId) {
				revalidatePath(`/training-support/${result.data.trainingEngagementId}`);
			}
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update assessment";
		console.error("[updateAssessmentAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Delete assessment
 */
export async function deleteAssessmentAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "delete");

		const result = await AssessmentService.deleteAssessment(id);

		if (result.success) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "assessment_update", {
				action: "assessment_deleted",
				assessmentId: id,
			});

			// Revalidate paths
			revalidatePath("/training-support/assessments");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete assessment";
		console.error("[deleteAssessmentAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get assessments by training engagement
 */
export async function getAssessmentsByTrainingEngagementAction(trainingEngagementId: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await AssessmentService.getAssessmentsByTrainingEngagement(trainingEngagementId);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve assessments";
		console.error("[getAssessmentsByTrainingEngagementAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get assessment statistics
 */
export async function getAssessmentStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await AssessmentService.getAssessmentStatistics();
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve statistics";
		console.error("[getAssessmentStatisticsAction]", message);
		return {
			success: false,
			message,
		};
	}
}
