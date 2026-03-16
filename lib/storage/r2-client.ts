/**
 * R2 Object Storage Client
 * Handles file uploads to Cloudflare R2
 */

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { UploadResult } from "@/lib/features/upload/types";

/**
 * Initialize S3 client for R2
 */
function getR2Client(): S3Client {
	const accountId = process.env.R2_ACCOUNT_ID;
	const accessKeyId = process.env.S3_COMPATIBLE_ACCESS_ID;
	const accessKeySecret = process.env.S3_COMPATIBLE_SECRET_KEY;

	if (!accountId || !accessKeyId || !accessKeySecret) {
		throw new Error("R2 credentials not configured in environment");
	}

	return new S3Client({
		region: "auto",
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId,
			secretAccessKey: accessKeySecret,
		},
	});
}

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
 * Upload file to R2
 */
export async function uploadToR2(file: File, folder?: string): Promise<UploadResult> {
	try {
		const bucketName = process.env.R2_BUCKET_DEV || "madelab-r2";
		const publicUrl = process.env.R2_BUCKET_PUBLIC;

		if (!publicUrl) {
			throw new Error("R2_BUCKET_PUBLIC not configured");
		}

		// Generate unique file name
		const fileName = generateFileName(file.name);
		const key = folder ? `${folder}/${fileName}` : fileName;

		// Convert File to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();
		const body = new Uint8Array(arrayBuffer);

		// Create S3 client
		const client = getR2Client();

		// Upload to R2
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
			Body: body,
			ContentType: file.type,
		});

		const response = await client.send(command);

		if (!response.ETag) {
			throw new Error("Failed to upload file to R2");
		}

		// Return success with public URL
		const fileUrl = `${publicUrl}/${key}`;

		return {
			success: true,
			url: fileUrl,
			fileName: file.name,
			fileSize: file.size,
			provider: "r2",
			message: "File uploaded successfully to R2",
		};
	} catch (error) {
		console.error("R2 upload error:", error);
		return {
			success: false,
			provider: "r2",
			error: error instanceof Error ? error.message : "R2 upload failed",
		};
	}
}

/**
 * Get R2 bucket info
 */
export function getR2BucketInfo() {
	return {
		accountId: process.env.R2_ACCOUNT_ID || "",
		bucketName: process.env.R2_BUCKET_DEV || "madelab-r2",
		publicUrl: process.env.R2_BUCKET_PUBLIC || "",
		region: "auto",
	};
}

/**
 * Delete file from R2
 * Extracts the key from the file URL and deletes it from R2
 */
export async function deleteFromR2(fileUrl: string): Promise<UploadResult> {
	try {
		const publicUrl = process.env.R2_BUCKET_PUBLIC;

		if (!publicUrl) {
			throw new Error("R2_BUCKET_PUBLIC not configured");
		}

		// Extract the key from the full URL
		// URL format: https://.../.../folder/filename
		// We need to extract: folder/filename
		const key = fileUrl.replace(publicUrl + "/", "");

		if (!key || key === fileUrl) {
			throw new Error("Invalid R2 file URL - cannot extract key");
		}

		// Create S3 client
		const client = getR2Client();

		// Delete from R2
		const command = new DeleteObjectCommand({
			Bucket: process.env.R2_BUCKET_DEV || "madelab-r2",
			Key: key,
		});

		await client.send(command);

		return {
			success: true,
			provider: "r2",
			message: `File deleted successfully from R2: ${key}`,
		};
	} catch (error) {
		console.error("R2 delete error:", error);
		// Return success=false but don't throw - allow caller to decide how to handle
		return {
			success: false,
			provider: "r2",
			error: error instanceof Error ? error.message : "R2 delete failed",
		};
	}
}

/**
 * Verify R2 credentials
 */
export async function verifyR2Credentials(): Promise<boolean> {
	try {
		getR2Client();
		// If we can create the client, credentials are valid
		return true;
	} catch (error) {
		console.error("R2 credential verification failed:", error);
		return false;
	}
}
