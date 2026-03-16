"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { ImplementationPlanService } from "../services/implementation-plan.service";
import type { CreateImplementationPlanInput, GetImplementationPlansOptions, UpdateImplementationPlanInput } from "../types/implementation-plan.types";

/**
 * Get all implementation plans with filters and pagination
 */
export async function listImplementationPlansAction(options?: GetImplementationPlansOptions): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		const result = await ImplementationPlanService.getAllPlans(options);

		return {
			success: true,
			data: result,
			message: "Implementation plans retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve implementation plans";
		console.error("[listImplementationPlansAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get single implementation plan
 */
export async function getImplementationPlanAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await ImplementationPlanService.getPlanById(id);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve implementation plan";
		console.error("[getImplementationPlanAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get implementation plan by training engagement
 */
export async function getImplementationPlanByEngagementAction(trainingEngagementId: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await ImplementationPlanService.getPlanByTrainingEngagement(trainingEngagementId);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve implementation plan";
		console.error("[getImplementationPlanByEngagementAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Create new implementation plan
 */
export async function createImplementationPlanAction(data: CreateImplementationPlanInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "create");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await ImplementationPlanService.createPlan({
			...data,
			createdBy: userId,
		});

		if (result.success && result.data) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "implementation_plan_update", {
				action: "plan_created",
				plan: result.data,
			});

			// Revalidate paths
			revalidatePath("/training-support/implementation-plans");
			revalidatePath(`/training-support/${data.trainingEngagementId}`);
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create implementation plan";
		console.error("[createImplementationPlanAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Update implementation plan
 */
export async function updateImplementationPlanAction(id: string, data: UpdateImplementationPlanInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await ImplementationPlanService.updatePlan(id, {
			...data,
			updatedBy: userId,
		});

		if (result.success && result.data) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "implementation_plan_update", {
				action: "plan_updated",
				plan: result.data,
			});

			// Revalidate paths
			revalidatePath("/training-support/implementation-plans");
			revalidatePath(`/training-support/implementation-plans/${id}`);
			if (result.data.trainingEngagementId) {
				revalidatePath(`/training-support/${result.data.trainingEngagementId}`);
			}
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update implementation plan";
		console.error("[updateImplementationPlanAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Delete implementation plan
 */
export async function deleteImplementationPlanAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "delete");

		const result = await ImplementationPlanService.deletePlan(id);

		if (result.success) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "implementation_plan_update", {
				action: "plan_deleted",
				planId: id,
			});

			// Revalidate paths
			revalidatePath("/training-support/implementation-plans");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete implementation plan";
		console.error("[deleteImplementationPlanAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Update plan progress
 */
export async function updatePlanProgressAction(id: string, totalTasks: number, completedTasks: number): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");

		const result = await ImplementationPlanService.updateProgress(id, totalTasks, completedTasks);

		if (result.success && result.data) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "implementation_plan_update", {
				action: "progress_updated",
				plan: result.data,
			});

			// Revalidate paths
			revalidatePath("/training-support/implementation-plans");
			revalidatePath(`/training-support/implementation-plans/${id}`);
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update progress";
		console.error("[updatePlanProgressAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get implementation plan statistics
 */
export async function getImplementationPlanStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await ImplementationPlanService.getPlanStatistics();
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve statistics";
		console.error("[getImplementationPlanStatisticsAction]", message);
		return {
			success: false,
			message,
		};
	}
}
