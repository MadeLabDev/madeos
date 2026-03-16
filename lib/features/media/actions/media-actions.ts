"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { mediaService } from "@/lib/features/media/services/media-service";
import { uploadFile } from "@/lib/features/upload/services";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

export interface MediaListResult {
	items: any[];
	total: number;
	pageCount: number;
	currentPage: number;
}

/**
 * Get authenticated session or throw error
 */
async function getSession() {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Not authenticated");
	}
	return session;
}

/**
 * Get paginated list of media
 */
export async function getMediaList(page: number = 1, search?: string, pageSize?: number): Promise<ActionResult<MediaListResult>> {
	try {
		const session = await getSession();

		// Check permission
		await requirePermission("media", "read");

		// Get user roles for permission checking
		const userRoles = session.user.roles?.map((r: any) => r.name) || [];

		const result = await mediaService.getAll(session.user.id!, userRoles, page, search, pageSize);

		return { success: true, data: result, message: "Media list fetched" };
	} catch (error) {
		console.error("[getMediaList] Error:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch media",
		};
	}
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string): Promise<ActionResult> {
	try {
		const session = await getSession();

		// Check permission
		await requirePermission("media", "read");

		const userRoles = session.user.roles?.map((r: any) => r.name) || [];

		const media = await mediaService.getById(id, session.user.id!, userRoles);

		return { success: true, data: media, message: "Media fetched" };
	} catch (error) {
		console.error("Error fetching media:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch media",
		};
	}
}

/**
 * Create new media file
 */
export async function createMedia(data: { name: string; url: string; type: string; size: number; visibility: "PUBLIC" | "PRIVATE" }): Promise<ActionResult> {
	try {
		const session = await getSession();

		// Check permission
		await requirePermission("media", "create");

		// Validate file
		const validation = mediaService.validateFile({
			name: data.name,
			type: data.type,
			size: data.size,
		});

		if (!validation.valid) {
			return { success: false, message: validation.error || "File validation failed" };
		}

		const media = await mediaService.create({
			...data,
			uploadedById: session.user.id!,
		});

		revalidatePath("/medias");

		return { success: true, data: media, message: "Media uploaded successfully" };
	} catch (error) {
		console.error("Error creating media:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create media",
		};
	}
}

/**
 * Update media visibility
 */
export async function updateMediaVisibility(id: string, visibility: "PUBLIC" | "PRIVATE"): Promise<ActionResult> {
	try {
		const session = await getSession();

		// Check permission
		await requirePermission("media", "update");

		const userRoles = session.user.roles?.map((r: any) => r.name) || [];

		const media = await mediaService.updateVisibility(id, visibility, session.user.id!, userRoles);

		// Broadcast Pusher event for real-time update
		try {
			await broadcastToAll("media:updated", {
				action: "media_visibility_updated",
				mediaId: id,
				media: {
					id: media.id,
					name: media.name,
					visibility: media.visibility,
					url: media.url,
					type: media.type,
					size: media.size,
				},
				timestamp: new Date().toISOString(),
			});
			console.log("📢 [Media] Broadcasted visibility update:", id);
		} catch (error) {
			console.error("Failed to broadcast media update:", error);
			// Don't fail the action if broadcast fails
		}

		revalidatePath("/medias");

		return { success: true, data: media, message: "Visibility updated" };
	} catch (error) {
		console.error("Error updating media visibility:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update visibility",
		};
	}
}

/**
 * Delete media file
 */
export async function deleteMedia(id: string): Promise<ActionResult> {
	try {
		const session = await getSession();

		// Check permission
		await requirePermission("media", "delete");

		const userRoles = session.user.roles?.map((r: any) => r.name) || [];

		await mediaService.delete(id, session.user.id!, userRoles);

		// Broadcast Pusher event for real-time update
		try {
			await broadcastToAll("media:updated", {
				action: "media_deleted",
				mediaId: id,
				timestamp: new Date().toISOString(),
			});
			console.log("📢 [Media] Broadcasted deletion:", id);
		} catch (error) {
			console.error("Failed to broadcast media deletion:", error);
			// Don't fail the action if broadcast fails
		}

		revalidatePath("/medias");

		return { success: true, message: "Media deleted successfully" };
	} catch (error) {
		console.error("Error deleting media:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete media",
		};
	}
}

/**
 * Delete multiple media files at once
 */
export async function deleteMediaBulk(ids: string[]): Promise<ActionResult> {
	try {
		if (!ids || ids.length === 0) {
			return { success: false, message: "No files selected" };
		}

		const session = await getSession();

		// Check permission
		await requirePermission("media", "delete");

		const userRoles = session.user.roles?.map((r: any) => r.name) || [];

		let successCount = 0;
		let failureCount = 0;
		const errors: string[] = [];

		// Delete each media file
		for (const id of ids) {
			try {
				await mediaService.delete(id, session.user.id!, userRoles);
				successCount++;

				// Broadcast individual delete event
				try {
					await broadcastToAll("media:updated", {
						action: "media_deleted",
						mediaId: id,
						timestamp: new Date().toISOString(),
					});
				} catch (broadcastError) {
					console.error("Failed to broadcast deletion for:", id, broadcastError);
				}
			} catch (error) {
				failureCount++;
				errors.push(`${id}: ${error instanceof Error ? error.message : "Failed to delete"}`);
			}
		}

		revalidatePath("/medias");

		if (failureCount === 0) {
			return {
				success: true,
				message: `Successfully deleted ${successCount} file(s)`,
			};
		} else if (successCount === 0) {
			return {
				success: false,
				message: `Failed to delete all files. ${errors.join("; ")}`,
			};
		} else {
			return {
				success: true,
				message: `Deleted ${successCount} file(s). ${failureCount} failed.`,
			};
		}
	} catch (error) {
		console.error("Error bulk deleting media:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete files",
		};
	}
}

/**
 * Upload media files
 */
export async function uploadMedia(formData: FormData): Promise<ActionResult<any[]>> {
	try {
		const session = await getSession();

		// Check permission to upload media
		await requirePermission("media", "create");

		const files = formData.getAll("files") as File[];
		const visibility = (formData.get("visibility") as string) || "PRIVATE";

		if (!files || files.length === 0) {
			throw new Error("No files provided");
		}

		const uploadedFiles = [];
		const errors = [];

		for (const file of files) {
			try {
				// Validate file
				const validation = mediaService.validateFile(file);
				if (!validation.valid) {
					errors.push({ filename: file.name, error: validation.error });
					continue;
				}

				// Upload using storage service (routes to R2 or local based on settings)
				const uploadResult = await uploadFile(file, "media");

				if (!uploadResult.success) {
					errors.push({
						filename: file.name,
						error: uploadResult.error || "Upload failed",
					});
					continue;
				}

				// Create media record in database with URL from storage service
				const media = await mediaService.create({
					name: file.name,
					url: uploadResult.url!,
					type: file.type,
					size: file.size,
					visibility: visibility as "PUBLIC" | "PRIVATE",
					uploadedById: session.user.id!,
				});

				uploadedFiles.push(media);
			} catch (error) {
				errors.push({
					filename: file.name,
					error: error instanceof Error ? error.message : "Upload failed",
				});
			}
		}

		if (uploadedFiles.length === 0 && errors.length > 0) {
			// All files failed - return detailed error
			const errorMessages = errors.map((e) => `${e.filename}: ${e.error}`).join("; ");
			throw new Error(`All uploads failed: ${errorMessages}`);
		}

		// Revalidate path to refresh the media grid
		revalidatePath("/medias");

		const message = uploadedFiles.length === files.length ? `Successfully uploaded ${uploadedFiles.length} file(s)` : `Uploaded ${uploadedFiles.length}/${files.length} file(s). ${errors.length} failed: ${errors.map((e) => `${e.filename}: ${e.error}`).join("; ")}`;

		return {
			success: uploadedFiles.length > 0,
			data: uploadedFiles,
			message,
		};
	} catch (error) {
		console.error("Error uploading media:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Upload failed",
		};
	}
}
