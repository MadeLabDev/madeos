/**
 * Local Server Storage Client
 * Handles file storage on the local server filesystem
 */

import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

import type { UploadResult } from "@/lib/features/upload/types";

/**
 * Generate unique file name
 */
function generateFileName(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const ext = originalName.split(".").pop() || "";
	return `${timestamp}-${random}.${ext}`;
}

/**
 * Upload file to local server storage
 *
 * Writes file to public/uploads directory
 */
export async function uploadToLocal(file: File, folder?: string): Promise<UploadResult> {
	try {
		// Generate unique file name
		const fileName = generateFileName(file.name);
		const filePath = folder ? `${folder}/${fileName}` : fileName;

		// Get upload directory from environment or use default
		const uploadDir = process.env.UPLOAD_DIR || "/public/uploads";
		const baseUploadPath = join(process.cwd(), uploadDir);

		// Create full file path
		const fullFolderPath = folder ? join(baseUploadPath, folder) : baseUploadPath;
		const fullFilePath = join(fullFolderPath, fileName);

		// Create directory if it doesn't exist
		if (!existsSync(fullFolderPath)) {
			await mkdir(fullFolderPath, { recursive: true });
		}

		// Convert File to Buffer and write to filesystem
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await writeFile(fullFilePath, buffer);

		// Generate URL for serving the file
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const fileUrl = `${baseUrl}/uploads/${filePath}`;

		console.log(`✓ File uploaded to local storage: ${filePath}`);

		return {
			success: true,
			url: fileUrl,
			fileName: file.name,
			fileSize: file.size,
			provider: "local",
			message: "File stored in local server storage",
		};
	} catch (error) {
		console.error("Local storage error:", error);
		return {
			success: false,
			provider: "local",
			error: error instanceof Error ? error.message : "Local storage failed",
		};
	}
}

/**
 * Delete file from local server storage
 *
 * Removes file from filesystem
 */
export async function deleteFromLocal(fileUrl: string): Promise<UploadResult> {
	try {
		// Extract the relative path from the full URL
		// URL format: http://localhost:3000/uploads/folder/filename
		// We need: uploads/folder/filename
		let relativePath = fileUrl;

		// If URL contains the base URL, extract just the path portion
		if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
			try {
				const urlObj = new URL(fileUrl);
				relativePath = urlObj.pathname.replace(/^\//, ""); // Remove leading slash
			} catch {
				// If URL parsing fails, try extracting the path manually
				const parts = fileUrl.split("/");
				const uploadsIndex = parts.indexOf("uploads");
				if (uploadsIndex !== -1) {
					relativePath = parts.slice(uploadsIndex).join("/");
				}
			}
		}

		// Validate path
		if (!relativePath || !relativePath.includes("uploads")) {
			throw new Error(`Invalid file URL - cannot extract path from: ${fileUrl}`);
		}

		// Reconstruct full file path
		const fullFilePath = join(process.cwd(), "public", relativePath);

		console.log(`Attempting to delete file: ${fullFilePath}`);

		// Delete file if it exists
		if (existsSync(fullFilePath)) {
			await unlink(fullFilePath);
			console.log(`✓ File deleted from local storage: ${relativePath}`);

			return {
				success: true,
				provider: "local",
				message: `File deleted from local storage: ${relativePath}`,
			};
		} else {
			console.warn(`File not found for deletion: ${fullFilePath}`);
			// Still return success since file is effectively gone
			return {
				success: true,
				provider: "local",
				message: `File not found (already deleted): ${relativePath}`,
			};
		}
	} catch (error) {
		console.error("Local storage delete error:", error);
		return {
			success: false,
			provider: "local",
			error: error instanceof Error ? error.message : "Local storage delete failed",
		};
	}
}

/**
 * Get local storage info
 */
export function getLocalStorageInfo() {
	return {
		storageType: "local-filesystem",
		location: "Server storage directory",
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
		uploadDir: process.env.UPLOAD_DIR || "/public/uploads",
		maxFileSize: process.env.MAX_FILE_SIZE || "52428800", // 50MB default
	};
}

/**
 * Verify local storage is accessible
 */
export async function verifyLocalStorage(): Promise<boolean> {
	try {
		const uploadDir = process.env.UPLOAD_DIR || "/public/uploads";
		const baseUploadPath = join(process.cwd(), uploadDir);

		// Check if directory exists
		if (!existsSync(baseUploadPath)) {
			// Try to create it
			try {
				await mkdir(baseUploadPath, { recursive: true });
				console.log(`✓ Created upload directory: ${baseUploadPath}`);
			} catch (mkdirError) {
				console.error("Failed to create upload directory:", mkdirError);
				return false;
			}
		}

		// Verify directory is writable by attempting to create a test file
		const testFile = join(baseUploadPath, `.write-test-${Date.now()}`);
		try {
			await writeFile(testFile, "test");
			await unlink(testFile);
			return true;
		} catch (writeError) {
			console.error("Upload directory is not writable:", writeError);
			return false;
		}
	} catch (error) {
		console.error("Local storage verification failed:", error);
		return false;
	}
}
