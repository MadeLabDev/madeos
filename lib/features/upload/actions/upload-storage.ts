/**
 * Upload Storage Server Actions
 * Handle file uploads to configured storage provider
 */

"use server";

import { getStorageProvider, getStorageProviderInfo, setStorageProvider, uploadFile } from "@/lib/features/upload/services";
import type { StorageProvider, UploadResult } from "@/lib/features/upload/types";
import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

/**
 * Upload file to configured storage
 */
export async function uploadFileAction(file: File, folder?: string): Promise<ActionResult<UploadResult>> {
	try {
		// Check permission
		await requirePermission("settings", "update");

		if (!file) {
			return {
				success: false,
				message: "No file provided",
			};
		}

		// Upload file
		const result = await uploadFile(file, folder);

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Upload failed",
			};
		}

		return {
			success: true,
			data: result,
			message: "File uploaded successfully",
		};
	} catch (error) {
		console.error("Upload file action error:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Upload failed",
		};
	}
}

/**
 * Get current storage provider
 */
export async function getStorageProviderAction(): Promise<ActionResult<StorageProvider>> {
	try {
		// Check permission
		await requirePermission("settings", "read");

		const provider = await getStorageProvider();

		return {
			success: true,
			message: "Storage provider retrieved",
			data: provider,
		};
	} catch (error) {
		console.error("Get storage provider action error:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get storage provider",
		};
	}
}

/**
 * Get storage provider info
 */
export async function getStorageProviderInfoAction(): Promise<
	ActionResult<{
		provider: StorageProvider;
		name: string;
		description: string;
	}>
> {
	try {
		// Check permission
		await requirePermission("settings", "read");

		const info = await getStorageProviderInfo();

		return {
			success: true,
			message: "Storage info retrieved",
			data: info,
		};
	} catch (error) {
		console.error("Get storage provider info action error:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get storage info",
		};
	}
}

/**
 * Set storage provider
 */
export async function setStorageProviderAction(provider: StorageProvider): Promise<ActionResult<{ provider: StorageProvider }>> {
	try {
		// Check permission - only admin can change storage
		await requirePermission("settings", "update");

		// Validate provider
		if (!["local", "r2"].includes(provider)) {
			return {
				success: false,
				message: 'Invalid storage provider. Must be "local" or "r2"',
			};
		}

		// Set provider
		await setStorageProvider(provider);

		return {
			success: true,
			data: { provider },
			message: `Storage provider changed to ${provider}`,
		};
	} catch (error) {
		console.error("Set storage provider action error:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to set storage provider",
		};
	}
}
