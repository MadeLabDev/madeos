/**
 * SOPLibrary Actions
 * Server actions for SOPLibraries
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { SOPLibraryService } from "../services";
import { CreateSOPLibraryInput, UpdateSOPLibraryInput } from "../types";

/**
 * Get SOP libraries for selection
 */
export async function getSOPLibraries(filters: Parameters<typeof SOPLibraryService.getSOPLibraries>[0] = {}, options: Parameters<typeof SOPLibraryService.getSOPLibraries>[1] = {}) {
	try {
		const sopLibraries = await SOPLibraryService.getSOPLibraries(filters, options);

		return {
			success: true,
			data: sopLibraries,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch SOP libraries: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single SOP library by ID
 */
export async function getSOPLibraryById(id: string) {
	try {
		const sopLibrary = await SOPLibraryService.getSOPLibraryById(id);

		return {
			success: true,
			data: sopLibrary,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch SOP library: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new SOP library
 */
export async function createSOPLibrary(data: CreateSOPLibraryInput) {
	try {
		const user = await requirePermission("training", "create");

		const result = await SOPLibraryService.createSOPLibrary({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			if (result.data) {
				await broadcastToAll("sop_library_update", {
					action: "sop_library_created",
					sopLibrary: result.data,
					timestamp: new Date().toISOString(),
				});
			}
			revalidatePath("/training-support");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create SOP library: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update SOP library
 */
export async function updateSOPLibrary(id: string, data: UpdateSOPLibraryInput) {
	try {
		const user = await requirePermission("training", "update");

		const result = await SOPLibraryService.updateSOPLibrary(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			if (result.data) {
				await broadcastToAll("sop_library_update", {
					action: "sop_library_updated",
					sopLibrary: result.data,
					timestamp: new Date().toISOString(),
				});
			}
			revalidatePath("/training-support");
			revalidatePath(`/training/sops/${id}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update SOP library: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete SOP library
 */
export async function deleteSOPLibrary(id: string) {
	try {
		await requirePermission("training", "delete");

		const result = await SOPLibraryService.deleteSOPLibrary(id);

		if (result.success) {
			await broadcastToAll("sop_library_update", {
				action: "sop_library_deleted",
				sopLibrary: { id },
				timestamp: new Date().toISOString(),
			});
			revalidatePath("/training-support");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete SOP library: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
