/**
 * Upload Storage Service
 * Handles file uploads to either local server or R2 object storage
 */

import * as settingsRepository from "@/lib/features/settings/repositories/settings-repository";
import type { StorageProvider, UploadResult } from "@/lib/features/upload/types";
import { deleteFromLocal, uploadToLocal } from "@/lib/storage/local-client";
import { deleteFromR2, uploadToR2 } from "@/lib/storage/r2-client";

/**
 * Get configured storage provider
 */
export async function getStorageProvider(): Promise<StorageProvider> {
	try {
		const setting = await settingsRepository.findSettingByKey("upload_storage_provider");
		if (!setting || !setting.value) {
			return "local"; // Default to local
		}
		const provider = setting.value as StorageProvider;
		return ["local", "r2"].includes(provider) ? provider : "local";
	} catch (error) {
		console.error("Error getting storage provider:", error);
		return "local";
	}
}

/**
 * Set storage provider
 */
export async function setStorageProvider(provider: StorageProvider): Promise<void> {
	if (!["local", "r2"].includes(provider)) {
		throw new Error('Invalid storage provider. Must be "local" or "r2"');
	}

	await settingsRepository.updateSetting("upload_storage_provider", {
		value: provider,
		description: "File upload storage provider (local or R2)",
	});
}

/**
 * Upload file to configured storage
 * Supports both local server and R2 object storage
 */
export async function uploadFile(file: File, folder?: string): Promise<UploadResult> {
	try {
		// Validate file
		if (!file) {
			return {
				success: false,
				provider: "local",
				error: "No file provided",
			};
		}

		// Get configured provider
		const provider = await getStorageProvider();

		// Upload based on provider
		if (provider === "r2") {
			return await uploadToR2(file, folder);
		} else {
			return await uploadToLocal(file, folder);
		}
	} catch (error) {
		console.error("Upload error:", error);
		return {
			success: false,
			provider: "local",
			error: error instanceof Error ? error.message : "Upload failed",
		};
	}
}

/**
 * Get storage provider info
 */
export async function getStorageProviderInfo(): Promise<{
	provider: StorageProvider;
	name: string;
	description: string;
}> {
	const provider = await getStorageProvider();

	if (provider === "r2") {
		return {
			provider: "r2",
			name: "Cloudflare R2",
			description: "R2 Object Storage - Scalable, S3-compatible storage",
		};
	}

	return {
		provider: "local",
		name: "Local Server",
		description: "Server local storage (development)",
	};
}

/**
 * Delete file from configured storage
 * Supports both local server and R2 object storage
 */
export async function deleteFile(fileUrl: string): Promise<UploadResult> {
	try {
		// Validate URL
		if (!fileUrl) {
			return {
				success: false,
				provider: "local",
				error: "No file URL provided",
			};
		}

		// Get configured provider
		const provider = await getStorageProvider();

		// Delete based on provider
		if (provider === "r2") {
			return await deleteFromR2(fileUrl);
		} else {
			return await deleteFromLocal(fileUrl);
		}
	} catch (error) {
		console.error("Delete error:", error);
		return {
			success: false,
			provider: "local",
			error: error instanceof Error ? error.message : "Delete failed",
		};
	}
}
