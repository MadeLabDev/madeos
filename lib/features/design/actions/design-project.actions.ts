/**
 * DesignProject Actions
 * Server actions for DesignProjects
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { DesignProjectService } from "../services";
import { CreateDesignProjectInput, UpdateDesignProjectInput } from "../types";

/**
 * Get design projects for selection
 */
export async function getDesignProjects(filters: Parameters<typeof DesignProjectService.getDesignProjects>[0] = {}, options: Parameters<typeof DesignProjectService.getDesignProjects>[1] = {}) {
	try {
		const projects = await DesignProjectService.getDesignProjects(filters, options);
		return {
			success: true,
			data: projects,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch projects: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single design project by ID
 */
export async function getDesignProjectById(id: string) {
	try {
		const project = await DesignProjectService.getDesignProjectById(id);
		return {
			success: true,
			data: project,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch project: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new design project
 */
export async function createDesignProject(data: CreateDesignProjectInput) {
	try {
		const user = await requirePermission("design", "create");

		const result = await DesignProjectService.createDesignProject({
			...data,
			createdBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_project_update", {
				action: "design_project_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update design project
 */
export async function updateDesignProject(id: string, data: UpdateDesignProjectInput) {
	try {
		const user = await requirePermission("design", "update");

		const result = await DesignProjectService.updateDesignProject(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_project_update", {
				action: "design_project_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update project: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete design project
 */
export async function deleteDesignProject(id: string) {
	try {
		await requirePermission("design", "delete");

		const existingProjectResult = await getDesignProjectById(id);
		const result = await DesignProjectService.deleteDesignProject(id);

		if (result.success && existingProjectResult.success && existingProjectResult.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_project_update", {
				action: "design_project_deleted",
				entity: existingProjectResult.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete project: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Bulk delete design projects
 */
export async function bulkDeleteDesignProjects(ids: string[]) {
	try {
		await requirePermission("design", "delete");

		const result = await DesignProjectService.bulkDeleteDesignProjects(ids);

		if (result.success) {
			revalidatePath("/design-projects");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to bulk delete projects: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
