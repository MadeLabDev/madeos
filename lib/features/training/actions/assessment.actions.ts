/**
 * Assessment Actions
 * Server actions for Assessments
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { AssessmentService } from "../services";
import { CreateAssessmentInput, UpdateAssessmentInput } from "../types";

/**
 * Get assessments for selection
 */
export async function getAssessments(filters: Parameters<typeof AssessmentService.getAssessments>[0] = {}, options: Parameters<typeof AssessmentService.getAssessments>[1] = {}) {
	try {
		const assessments = await AssessmentService.getAssessments(filters, options);

		return {
			success: true,
			data: assessments,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch assessments: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single assessment by ID
 */
export async function getAssessmentById(id: string) {
	try {
		const assessment = await AssessmentService.getAssessmentById(id);

		return {
			success: true,
			data: assessment,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch assessment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new assessment
 */
export async function createAssessment(data: CreateAssessmentInput) {
	try {
		const user = await requirePermission("training", "create");

		const result = await AssessmentService.createAssessment({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/training-support");
			await broadcastToAll("assessment_update", {
				action: "assessment_created",
				assessment: result,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create assessment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update assessment
 */
export async function updateAssessment(id: string, data: UpdateAssessmentInput) {
	try {
		const user = await requirePermission("training", "update");

		const result = await AssessmentService.updateAssessment(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/training-support");
			revalidatePath(`/training/assessments/${id}`);
			await broadcastToAll("assessment_update", {
				action: "assessment_updated",
				assessment: result,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update assessment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete assessment
 */
export async function deleteAssessment(id: string) {
	try {
		await requirePermission("training", "delete");

		const result = await AssessmentService.deleteAssessment(id);

		if (result.success) {
			revalidatePath("/training-support");
			await broadcastToAll("assessment_update", {
				action: "assessment_deleted",
				assessmentId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete assessment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
