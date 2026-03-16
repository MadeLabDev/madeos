"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { DesignBriefService } from "../services/design-brief.service";
import type { CreateDesignBriefInput, GetDesignBriefsOptions, UpdateDesignBriefInput } from "../types/design-brief.types";

/**
 * Get all design briefs with filters and pagination
 */
export async function listDesignBriefsAction(options: GetDesignBriefsOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const result = await DesignBriefService.getAllDesignBriefs(options);
		return { success: true, message: "Design briefs retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single design brief by ID
 */
export async function getDesignBriefAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const designBrief = await DesignBriefService.getDesignBriefById(id);

		if (!designBrief) {
			return { success: false, message: "Design brief not found" };
		}

		return { success: true, message: "Design brief retrieved", data: designBrief };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get design brief by design project
 */
export async function getDesignBriefByProjectAction(designProjectId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const designBrief = await DesignBriefService.getDesignBriefByProject(designProjectId);
		return { success: true, message: "Design brief retrieved", data: designBrief };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new design brief
 */
export async function createDesignBriefAction(data: CreateDesignBriefInput): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const designBrief = await DesignBriefService.createDesignBrief(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "design_brief_update", {
			action: "brief_created",
			designBrief,
		});

		// Revalidate paths
		revalidatePath("/design-development/design-briefs");
		revalidatePath(`/design-development/projects/${data.designProjectId}`);

		return { success: true, message: "Design brief created", data: designBrief };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing design brief
 */
export async function updateDesignBriefAction(id: string, data: UpdateDesignBriefInput): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const designBrief = await DesignBriefService.updateDesignBrief(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "design_brief_update", {
			action: "brief_updated",
			designBrief,
		});

		// Revalidate paths
		revalidatePath("/design-development/design-briefs");
		revalidatePath(`/design-development/design-briefs/${id}`);
		if (designBrief.designProjectId) {
			revalidatePath(`/design-development/projects/${designBrief.designProjectId}`);
		}

		return { success: true, message: "Design brief updated", data: designBrief };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a design brief
 */
export async function deleteDesignBriefAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const designBrief = await DesignBriefService.deleteDesignBrief(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "design_brief_update", {
			action: "brief_deleted",
			designBriefId: id,
		});

		// Revalidate paths
		revalidatePath("/design-development/design-briefs");
		if (designBrief.designProjectId) {
			revalidatePath(`/design-development/projects/${designBrief.designProjectId}`);
		}

		return { success: true, message: "Design brief deleted", data: designBrief };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Approve a design brief
 */
export async function approveDesignBriefAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const designBrief = await DesignBriefService.approveDesignBrief(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "design_brief_update", {
			action: "brief_approved",
			designBrief,
		});

		// Revalidate paths
		revalidatePath("/design-development/design-briefs");
		revalidatePath(`/design-development/design-briefs/${id}`);

		return { success: true, message: "Design brief approved", data: designBrief };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get design brief statistics
 */
export async function getDesignBriefStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const statistics = await DesignBriefService.getDesignBriefStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}
