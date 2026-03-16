"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { CampaignTemplateService } from "../services";
import { CampaignTemplate, CampaignTemplateFilters, CreateCampaignTemplateInput, UpdateCampaignTemplateInput } from "../types";

const templateService = new CampaignTemplateService();

// CREATE
export async function createCampaignTemplateAction(data: CreateCampaignTemplateInput): Promise<ActionResult<CampaignTemplate>> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "User not authenticated" };
		}

		// Check permission
		await requirePermission("marketing", "create");

		const result = await templateService.createTemplate(data, session.user.id);

		if (result.success) {
			// Pusher notification
			await getPusher().trigger("private-global", "template_update", {
				action: "template_created",
				template: result.data,
			});

			// Revalidate cache
			revalidatePath("/marketing/templates");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create template";
		return { success: false, message };
	}
}

// READ - By ID
export async function getCampaignTemplateByIdAction(id: string): Promise<ActionResult<CampaignTemplate | null>> {
	try {
		const result = await templateService.getTemplateById(id);
		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch template";
		return { success: false, message };
	}
}

// READ - List
export async function getCampaignTemplatesAction(filters: CampaignTemplateFilters = {}, page: number = 1, limit: number = 20): Promise<ActionResult<{ templates: CampaignTemplate[]; total: number }>> {
	try {
		const result = await templateService.getTemplates(filters, page, limit);
		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch templates";
		return { success: false, message };
	}
}

// READ - Active only
export async function getActiveCampaignTemplatesAction(): Promise<ActionResult<CampaignTemplate[]>> {
	try {
		const result = await templateService.getActiveTemplates();
		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch active templates";
		return { success: false, message };
	}
}

// UPDATE
export async function updateCampaignTemplateAction(id: string, data: UpdateCampaignTemplateInput): Promise<ActionResult<CampaignTemplate>> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "User not authenticated" };
		}

		// Check permission
		await requirePermission("marketing", "update");

		const result = await templateService.updateTemplate(id, data, session.user.id);

		if (result.success) {
			// Pusher notification
			await getPusher().trigger("private-global", "template_update", {
				action: "template_updated",
				template: result.data,
			});

			// Revalidate cache
			revalidatePath("/marketing/templates");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update template";
		return { success: false, message };
	}
}

// TOGGLE ACTIVE
export async function toggleCampaignTemplateActiveAction(id: string, isActive: boolean): Promise<ActionResult<CampaignTemplate>> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "User not authenticated" };
		}

		// Check permission
		await requirePermission("marketing", "update");

		const result = await templateService.toggleActive(id, isActive, session.user.id);

		if (result.success) {
			// Pusher notification
			await getPusher().trigger("private-global", "template_update", {
				action: "template_toggled",
				templateId: id,
				isActive,
			});

			// Revalidate cache
			revalidatePath("/marketing/templates");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to toggle template status";
		return { success: false, message };
	}
}

// DELETE
export async function deleteCampaignTemplateAction(id: string): Promise<ActionResult<CampaignTemplate>> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "User not authenticated" };
		}

		// Check permission
		await requirePermission("marketing", "delete");

		const result = await templateService.deleteTemplate(id);

		if (result.success) {
			// Pusher notification
			await getPusher().trigger("private-global", "template_update", {
				action: "template_deleted",
				templateId: id,
			});

			// Revalidate cache
			revalidatePath("/marketing/templates");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete template";
		return { success: false, message };
	}
}
