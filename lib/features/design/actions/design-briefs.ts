"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";

import { createDesignBriefService, deleteDesignBriefService, getDesignBriefByIdService, getDesignBriefsService, updateDesignBriefService } from "../services/design-brief-service";
import { ActionResult } from "../types";

export async function getDesignBriefsAction(projectId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getDesignBriefsService(projectId);
		return {
			success: true,
			message: "Design briefs fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch design briefs",
			data: [],
		};
	}
}

export async function getDesignBriefAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getDesignBriefByIdService(id);
		return {
			success: true,
			message: "Design brief fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch design brief",
		};
	}
}

export async function createDesignBriefAction(input: Parameters<typeof createDesignBriefService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await createDesignBriefService({
			...input,
			requestedBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "design_brief_created",
			data,
		});

		revalidatePath(`/design-projects/${input.designProjectId}/briefs`);

		return {
			success: true,
			message: "Design brief created successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create design brief",
		};
	}
}

export async function updateDesignBriefAction(id: string, input: Parameters<typeof updateDesignBriefService>[1]): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await updateDesignBriefService(id, {
			...input,
			updatedBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "design_brief_updated",
			data,
		});

		revalidatePath(`/design-projects/${data.designProjectId}/briefs`);
		revalidatePath(`/design-projects/${data.designProjectId}/briefs/${id}`);

		return {
			success: true,
			message: "Design brief updated successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update design brief",
		};
	}
}

export async function deleteDesignBriefAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const brief = await getDesignBriefByIdService(id);

		await deleteDesignBriefService(id);

		await getPusher().trigger("private-global", "design_update", {
			action: "design_brief_deleted",
			briefId: id,
		});

		revalidatePath(`/design-projects/${brief.designProjectId}/briefs`);

		return {
			success: true,
			message: "Design brief deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete design brief",
		};
	}
}
