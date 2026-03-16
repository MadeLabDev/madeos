"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { SOPLibraryService } from "../services/sop-library.service";
import type { CreateSOPInput, GetSOPsOptions, UpdateSOPInput } from "../types/sop-library.types";

/**
 * Get all SOPs with filters and pagination
 */
export async function listSOPsAction(options?: GetSOPsOptions): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		const result = await SOPLibraryService.getAllSOPs(options);

		return {
			success: true,
			data: result,
			message: "SOPs retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve SOPs";
		console.error("[listSOPsAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get SOP by ID
 */
export async function getSOPAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await SOPLibraryService.getSOPById(id);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve SOP";
		console.error("[getSOPAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Create new SOP
 */
export async function createSOPAction(data: CreateSOPInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "create");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await SOPLibraryService.createSOP({
			...data,
			createdBy: userId,
		});

		if (result.success && result.data) {
			// Emit Pusher event (don't fail if Pusher fails)
			try {
				await getPusher().trigger("private-global", "sop_update", {
					action: "sop_created",
					sop: result.data,
				});
			} catch (pusherError) {
				console.warn("[createSOPAction] Pusher event failed:", pusherError);
			}

			// Revalidate paths
			revalidatePath("/training-support/sop-library");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create SOP";
		console.error("[createSOPAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Update SOP
 */
export async function updateSOPAction(id: string, data: UpdateSOPInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await SOPLibraryService.updateSOP(id, {
			...data,
			id,
			updatedBy: userId,
		});

		if (result.success && result.data) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "sop_update", {
				action: "sop_updated",
				sop: result.data,
			});

			// Revalidate paths
			revalidatePath("/training-support/sop-library");
			revalidatePath(`/training-support/sop-library/${id}`);
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update SOP";
		console.error("[updateSOPAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Delete SOP
 */
export async function deleteSOPAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "delete");

		const result = await SOPLibraryService.deleteSOP(id);

		if (result.success) {
			// Emit Pusher event
			await getPusher().trigger("private-global", "sop_update", {
				action: "sop_deleted",
				sopId: id,
			});

			// Revalidate paths
			revalidatePath("/training-support/sop-library");
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete SOP";
		console.error("[deleteSOPAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get all categories
 */
export async function getAllCategoriesAction(): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		const categories = await SOPLibraryService.getAllCategories();

		return {
			success: true,
			data: categories,
			message: "Categories retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve categories";
		console.error("[getAllCategoriesAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Publish SOP
 */
export async function publishSOPAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await SOPLibraryService.publishSOP(id, userId);

		if (result.success && result.data) {
			await getPusher().trigger("private-global", "sop_update", {
				action: "sop_published",
				sop: result.data,
			});

			revalidatePath("/training-support/sop-library");
			revalidatePath(`/training-support/sop-library/${id}`);
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to publish SOP";
		console.error("[publishSOPAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Archive SOP
 */
export async function archiveSOPAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");

		const session = await auth();
		const userId = session?.user?.id || "system";

		const result = await SOPLibraryService.archiveSOP(id, userId);

		if (result.success && result.data) {
			await getPusher().trigger("private-global", "sop_update", {
				action: "sop_archived",
				sop: result.data,
			});

			revalidatePath("/training-support/sop-library");
			revalidatePath(`/training-support/sop-library/${id}`);
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to archive SOP";
		console.error("[archiveSOPAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get SOP statistics
 */
export async function getSOPStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");

		return await SOPLibraryService.getSOPStatistics();
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve statistics";
		console.error("[getSOPStatisticsAction]", message);
		return {
			success: false,
			message,
		};
	}
}
