"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";

import { createDesignProjectService, deleteDesignProjectService, getDesignProjectByIdService, getDesignProjectsService, updateDesignProjectService } from "../services/design-project-service";
import { ActionResult } from "../types";

export async function getDesignProjectsAction(params: Parameters<typeof getDesignProjectsService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getDesignProjectsService(params);
		return {
			success: true,
			message: "Design projects fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch design projects",
			data: [],
		};
	}
}

export async function getDesignProjectAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getDesignProjectByIdService(id);
		return {
			success: true,
			message: "Design project fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch design project",
			data: null,
		};
	}
}

export async function createDesignProjectAction(input: Parameters<typeof createDesignProjectService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await createDesignProjectService({
			...input,
			createdBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "design_project_created",
			data,
		});

		revalidatePath("/design-projects");

		return {
			success: true,
			message: "Design project created successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create design project",
			data: null,
		};
	}
}

export async function updateDesignProjectAction(id: string, input: Parameters<typeof updateDesignProjectService>[1]): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await updateDesignProjectService(id, {
			...input,
			updatedBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "design_project_updated",
			data,
		});

		revalidatePath("/design-projects");
		revalidatePath(`/design-projects/${id}`);

		return {
			success: true,
			message: "Design project updated successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update design project",
			data: null,
		};
	}
}

export async function deleteDesignProjectAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		await deleteDesignProjectService(id);

		await getPusher().trigger("private-global", "design_update", {
			action: "design_project_deleted",
			projectId: id,
		});

		revalidatePath("/design-projects");

		return {
			success: true,
			message: "Design project deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete design project",
		};
	}
}
