/**
 * ImplementationPlan Actions
 * Server actions for ImplementationPlans
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";

import { ImplementationPlanService } from "../services";
import { CreateImplementationPlanInput, UpdateImplementationPlanInput } from "../types";

/**
 * Get implementation plans for selection
 */
export async function getImplementationPlans(filters: Parameters<typeof ImplementationPlanService.getImplementationPlans>[0] = {}, options: Parameters<typeof ImplementationPlanService.getImplementationPlans>[1] = {}) {
	try {
		const implementationPlans = await ImplementationPlanService.getImplementationPlans(filters, options);

		return {
			success: true,
			data: implementationPlans,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch implementation plans: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single implementation plan by ID
 */
export async function getImplementationPlanById(id: string) {
	try {
		const implementationPlan = await ImplementationPlanService.getImplementationPlanById(id);

		return {
			success: true,
			data: implementationPlan,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch implementation plan: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new implementation plan
 */
export async function createImplementationPlan(data: CreateImplementationPlanInput) {
	try {
		const user = await requirePermission("training", "create");

		const result = await ImplementationPlanService.createImplementationPlan({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/training-support");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create implementation plan: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update implementation plan
 */
export async function updateImplementationPlan(id: string, data: UpdateImplementationPlanInput) {
	try {
		const user = await requirePermission("training", "update");

		const result = await ImplementationPlanService.updateImplementationPlan(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/training-support");
			revalidatePath(`/training/plans/${id}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update implementation plan: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete implementation plan
 */
export async function deleteImplementationPlan(id: string) {
	try {
		await requirePermission("training", "delete");

		const result = await ImplementationPlanService.deleteImplementationPlan(id);

		if (result.success) {
			revalidatePath("/training-support");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete implementation plan: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
