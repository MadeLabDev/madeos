import { type MediaVisibility, SITE_CONFIG } from "@/lib";
import { mediaRepository } from "@/lib/features/media/repositories/media-repository";
import { deleteFile as deleteStorageFile } from "@/lib/features/upload/services/upload-storage.service";
import { generateUniqueFilename } from "@/lib/utils/filename-sanitizer";

export class MediaService {
	/**
	 * Validate file before upload
	 */
	validateFile(file: File | { name: string; type: string; size: number }): { valid: boolean; error?: string } {
		// Check file size
		if (file.size > SITE_CONFIG.media.getMaxFileSizeBytes()) {
			return {
				valid: false,
				error: `File size exceeds ${SITE_CONFIG.media.getMaxFileSizeMB()}MB limit`,
			};
		}

		// Check MIME type
		if (!SITE_CONFIG.media.isAllowedType(file.type)) {
			return {
				valid: false,
				error: `File type ${file.type} is not allowed`,
			};
		}

		// Check extension
		if (!SITE_CONFIG.media.isAllowedExtension(file.name)) {
			return {
				valid: false,
				error: `File extension is not allowed`,
			};
		}

		return { valid: true };
	}

	/**
	 * Generate unique filename with sanitization
	 */
	generateFilename(originalName: string): string {
		return generateUniqueFilename(originalName);
	}

	/**
	 * Get all media with permission checks
	 */
	async getAll(userId: string, userRoles: string[], page: number = 1, search?: string, pageSize?: number) {
		const actualPageSize = pageSize || SITE_CONFIG.pagination.getPageSize("media_pagesize");
		return mediaRepository.getAll(userId, userRoles, page, actualPageSize, search);
	}

	/**
	 * Get media by ID with permission check
	 */
	async getById(id: string, userId: string, userRoles: string[]) {
		const media = await mediaRepository.getById(id);

		if (!media) {
			throw new Error("Media not found");
		}

		// Check visibility: own media, public media, or admin/manager
		const isOwner = media.uploadedById === userId;
		const isPublic = media.visibility === "PUBLIC";
		const isAdmin = userRoles.includes("admin");
		const isManager = userRoles.includes("manager");

		if (!isOwner && !isPublic && !isAdmin && !isManager) {
			throw new Error("Access denied");
		}

		return media;
	}

	/**
	 * Create media record
	 */
	async create(data: { name: string; url: string; type: string; size: number; visibility: MediaVisibility; uploadedById: string }) {
		return mediaRepository.create(data);
	}

	/**
	 * Update media visibility
	 */
	async updateVisibility(id: string, visibility: MediaVisibility, userId: string, userRoles: string[]) {
		const media = await mediaRepository.getById(id);

		if (!media) {
			throw new Error("Media not found");
		}

		// Only owner, admin, or manager can change visibility
		const isOwner = media.uploadedById === userId;
		const isAdmin = userRoles.includes("admin");
		const isManager = userRoles.includes("manager");

		if (!isOwner && !isAdmin && !isManager) {
			throw new Error("Access denied");
		}

		return mediaRepository.updateVisibility(id, visibility);
	}

	/**
	 * Delete media
	 */
	async delete(id: string, userId: string, userRoles: string[]) {
		const media = await mediaRepository.getById(id);

		if (!media) {
			throw new Error("Media not found");
		}

		// Only owner, admin, or manager can delete
		const isOwner = media.uploadedById === userId;
		const isAdmin = userRoles.includes("admin");
		const isManager = userRoles.includes("manager");

		if (!isOwner && !isAdmin && !isManager) {
			throw new Error("Access denied");
		}

		// Delete file from storage (R2 or local)
		// Do this BEFORE database deletion to ensure file cleanup happens
		try {
			if (media.url) {
				const deleteResult = await deleteStorageFile(media.url);
				if (!deleteResult.success) {
					console.error(`Failed to delete file from storage (${deleteResult.provider}):`, deleteResult.error);
					// Log but don't fail - continue with database deletion
				} else {
					console.log(`File deleted from ${deleteResult.provider}:`, deleteResult.message);
				}
			}
		} catch (error) {
			console.error("Error deleting file from storage:", error);
			// Continue even if file deletion fails - we'll still delete the DB record
		}

		// Delete from database
		return mediaRepository.delete(id);
	}

	/**
	 * Get category from MIME type
	 */
	getCategory(mimeType: string) {
		return SITE_CONFIG.media.getCategory(mimeType);
	}
}

export const mediaService = new MediaService();
