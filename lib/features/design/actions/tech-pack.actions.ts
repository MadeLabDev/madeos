/**
 * TechPack Actions
 * Server actions for TechPacks
 */

"use server";

import { revalidatePath } from "next/cache";

import { uploadFile } from "@/lib/features/upload/services/upload-storage.service";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { TechPackService } from "../services";
import { CreateTechPackInput, UpdateTechPackInput } from "../types";

/**
 * Get tech packs
 */
export async function getTechPacks(filters: Parameters<typeof TechPackService.getTechPacks>[0] = {}, options: Parameters<typeof TechPackService.getTechPacks>[1] = {}) {
	try {
		const packs = await TechPackService.getTechPacks(filters, options);
		return {
			success: true,
			data: packs,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch tech packs: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get tech pack by ID
 */
export async function getTechPackById(id: string) {
	try {
		const pack = await TechPackService.getTechPackById(id);
		return {
			success: true,
			data: pack,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch tech pack: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get tech pack by ID (alias for getTechPackById)
 */
export async function getTechPack(id: string) {
	return getTechPackById(id);
}

/**
 * Create new tech pack
 */
export async function createTechPack(data: CreateTechPackInput) {
	try {
		const user = await requirePermission("design", "create");

		const result = await TechPackService.createTechPack({
			...data,
			createdBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("tech_pack_update", {
				action: "tech_pack_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create tech pack: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update tech pack
 */
export async function updateTechPack(id: string, data: UpdateTechPackInput) {
	try {
		const user = await requirePermission("design", "update");

		const result = await TechPackService.updateTechPack(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("tech_pack_update", {
				action: "tech_pack_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update tech pack: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete tech pack
 */
export async function deleteTechPack(id: string) {
	try {
		await requirePermission("design", "delete");

		const existingTechPackResult = await getTechPackById(id);
		const result = await TechPackService.deleteTechPack(id);

		if (result.success && existingTechPackResult.success && existingTechPackResult.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("tech_pack_update", {
				action: "tech_pack_deleted",
				entity: existingTechPackResult.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete tech pack: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Bulk delete tech packs
 */
export async function bulkDeleteTechPacks(ids: string[]) {
	try {
		await requirePermission("design", "delete");

		const result = await TechPackService.bulkDeleteTechPacks(ids);

		if (result.success) {
			revalidatePath("/design-projects");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to bulk delete tech packs: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Upload files for tech pack
 */
export async function uploadTechPackFiles(formData: FormData) {
	try {
		await requirePermission("design", "create");

		const files = formData.getAll("files") as File[];

		if (!files || files.length === 0) {
			throw new Error("No files provided");
		}

		const uploadedUrls: string[] = [];
		const errors: string[] = [];

		for (const file of files) {
			try {
				// Upload using storage service (routes to R2 or local based on settings)
				const uploadResult = await uploadFile(file, "techpacks");

				if (!uploadResult.success) {
					errors.push(`${file.name}: ${uploadResult.error || "Upload failed"}`);
					continue;
				}

				uploadedUrls.push(uploadResult.url!);
			} catch (error) {
				errors.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`);
			}
		}

		if (uploadedUrls.length === 0 && errors.length > 0) {
			// All files failed - return detailed error
			throw new Error(`All uploads failed: ${errors.join("; ")}`);
		}

		const message = uploadedUrls.length === files.length ? `Successfully uploaded ${uploadedUrls.length} file(s)` : `Uploaded ${uploadedUrls.length}/${files.length} file(s). ${errors.length} failed: ${errors.join("; ")}`;

		return {
			success: uploadedUrls.length > 0,
			data: uploadedUrls,
			message,
		};
	} catch (error) {
		console.error("Error uploading tech pack files:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Upload failed",
		};
	}
}
