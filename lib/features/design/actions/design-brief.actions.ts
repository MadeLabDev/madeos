/**
 * DesignBrief Actions
 * Server actions for DesignBriefs
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { DesignBriefService } from "../services";
import { CreateDesignBriefInput, UpdateDesignBriefInput } from "../types";

/**
 * Get design briefs
 */
export async function getDesignBriefs(filters: Parameters<typeof DesignBriefService.getDesignBriefs>[0] = {}, options: Parameters<typeof DesignBriefService.getDesignBriefs>[1] = {}) {
	try {
		const briefs = await DesignBriefService.getDesignBriefs(filters, options);
		return {
			success: true,
			data: briefs,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch briefs: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get design brief by ID
 */
export async function getDesignBriefById(id: string) {
	try {
		const brief = await DesignBriefService.getDesignBriefById(id);
		return {
			success: true,
			data: brief,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch brief: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get brief by project ID
 */
export async function getDesignBriefByProjectId(projectId: string) {
	try {
		const brief = await DesignBriefService.getDesignBriefByProjectId(projectId);
		return {
			success: true,
			data: brief,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch brief: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new design brief
 */
export async function createDesignBrief(data: CreateDesignBriefInput) {
	try {
		const user = await requirePermission("design", "create");

		const result = await DesignBriefService.createDesignBrief({
			...data,
			createdBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_brief_update", {
				action: "design_brief_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create brief: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update design brief
 */
export async function updateDesignBrief(id: string, data: UpdateDesignBriefInput) {
	try {
		const user = await requirePermission("design", "update");

		const result = await DesignBriefService.updateDesignBrief(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_brief_update", {
				action: "design_brief_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update brief: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete design brief
 */
export async function deleteDesignBrief(id: string) {
	try {
		await requirePermission("design", "delete");

		const existingBriefResult = await getDesignBriefById(id);
		const result = await DesignBriefService.deleteDesignBrief(id);

		if (result.success && existingBriefResult.success && existingBriefResult.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_brief_update", {
				action: "design_brief_deleted",
				entity: existingBriefResult.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete brief: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Bulk delete design briefs
 */
export async function bulkDeleteDesignBriefs(ids: string[]) {
	try {
		await requirePermission("design", "delete");

		const result = await DesignBriefService.bulkDeleteDesignBriefs(ids);

		if (result.success) {
			revalidatePath("/design-projects");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to bulk delete briefs: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
